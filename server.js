/*
 *  this is a simple server for a diamond hunt
 *
 *  author: Jacek Kopecký, jacek@jacek.cz, http://github.com/jacekkopecky
 */

/*jslint node:true*/
'use strict';

/*
 *  general setup, loading libraries
 */
var bodyParser = require('body-parser'),
    assert = require('assert'),
    express = require('express'),
    config = require('./config.js'),
    app = express()



/*************************************************
 *
 *  set up server options and resources
 *
 *************************************************/

/*
 *  by default, express.js treats resource paths like "/foo" and "/foo/" as the same, we don't want that
 */
app.set('strict routing', true)

/*
 *  this will serve our static files
 */
app.use(express.static('static', config.expressStatic))

/*
 *  this will add support for JSON payloads in incoming data
 */
app.use(bodyParser.json(config.bodyParser_JSON))

/*
 *  redirect from /api/ to /api which is actually static/api.html - the API documentation
 */
app.get('/api/', function(req, res) { res.redirect('/api'); })

/*
 *  set up main application resources
 */
app.get('/api/diamonds/',        listDiamonds)
app.delete('/api/diamonds/:id',  claimDiamond)
app.get('/api/scores/',          listLeaderBoard)
app.get('/api/scores/reset',     resetLeaderBoard)
app.get('/api/scores/stop',      stopCreatingDiamonds)
app.get('/api/scores/start',     startCreatingDiamonds)

/*
 *  setup redirects to URIs with slash at the end so that relative URIs work better
 */
app.get('/api/diamonds',       redirectToSlash)
app.get('/api/scores',         redirectToSlash)

function redirectToSlash(req, res) { res.redirect(req.url + '/'); }

/*
 *  start server
 */
app.listen(config.port)
console.log("server started on port " + config.port)

console.log("creating diamonds");
setInterval(addDiamond, 1000)


/*************************************************
 *
 *  actual logic of the server
 *
 *************************************************/

/*
 *  clients waiting for a list of diamonds
 */
var waiting = []

/*
 *  a list of unclaimed diamonds
 */
var diamonds = []
var diamondNextId = 1;

/*
 *  status information
 */
var creatingDiamonds = true;
var leaderBoard = {}
var passwords = {}

/*
 *  list diamonds
 *  returns something like this:
 *  [ { x: 300,
 *      y: 400,
 *      isDiamond: true,
 *      color: "#0f0",
 *      id: 42
 *    },
 *    { x: 200,
 *      y: 173,
 *      isDiamond: true,
 *      color: "#f00",
 *      id: 57
 *    }
 *  ]
 */
function listDiamonds(req, res, next) {
  waiting.push(res)
}



// this function is also responsible for responding to listDiamonds requests
function addDiamond() {
  // diamond creation stopped, only send existing diamonds
  if (!creatingDiamonds || diamonds.length > 100) return notifyClients();

  // only add diamonds while there's somebody waiting for them
  if (!waiting.length) return;

  // add half as many diamonds as there are clients waiting for them
  for (var i=0; i<(waiting.length/2); i++) {
    diamonds.push({
      x: Math.floor(Math.random()*(config.canvasWidth-40)+20),
      y: Math.floor(Math.random()*(config.canvasHeight-170)+150),
      isDiamond: true,
      id: diamondNextId++,
      color: config.diamondColors[Math.floor(Math.random()*config.diamondColors.length)]
    })
  }
  notifyClients()
  console.log("diamonds  added: " + diamonds.length)
}

function notifyClients() {
  waiting.forEach(function (client) {
    client.send(diamonds)
  })
  waiting = []
}

function claimDiamond(req, res, next) {
  var diamondId = req.params.id;
  var claimedDiamond;
  var claimedDiamondIdx;

  var found = diamonds.some(function(diamond, idx) {
    if (diamond.id == diamondId) {
      claimedDiamondIdx = idx;
      claimedDiamond = diamonds[idx];
      return true;
    }
    return false;
  })

  if (found) {
    var playerID = req.query.user;
    var playerPwd = req.query.pwd;
    var playerScore = leaderBoard[playerID];
    if (!playerScore) {
      playerScore = leaderBoard[playerID] = { score: 0, x: claimedDiamond.x, y: claimedDiamond.y, t: Date.now() };
      passwords[playerID] = playerPwd;
    }
    if (playerPwd !== passwords[playerID]) {
      console.log("wrong password for player " + playerID);
      res.status(401).send({msg: "wrong player password"})
      return;
    }

    var playerName = req.query.name || playerID;

    // check that the player could be where the diamond is
    if (!playerScore.banned && config.cheatingPrevention) {
      var dx = claimedDiamond.x - playerScore.x;
      var dy = claimedDiamond.y - playerScore.y;
      var dist = Math.sqrt(dx*dx+dy*dy);
      if (dist > 1) {
        var dt = (Date.now() - playerScore.t) / 1000;
        if (dt === 0 || dist/dt > 125) {
          // the speed is more than 2.5 times the normal speed of 50 pixels per second
          playerScore.banned = true;
          playerScore.name = playerScore.name + " (cheated, banned)";
          console.log("user " + playerID + " banned for cheating (name: " + playerName + ")");
        }
      }
    }

    if (playerScore.banned) {
      res.status(403).send({msg: "don't cheat!", score: playerScore.score})
      return;
    }

    playerScore.x = claimedDiamond.x;
    playerScore.y = claimedDiamond.y;
    playerScore.t = Date.now();
    playerScore.name = playerName;

    // remove the diamond from the list
    diamonds[claimedDiamondIdx] = diamonds[diamonds.length - 1]
    diamonds.pop()

    playerScore.score += 1

    res.status(200).send({msg: "diamond " + diamondId + " is yours!", score: playerScore.score})
    // notifyClients()
    console.log("diamond claimed: " + diamonds.length + " (user: " + playerName + ")")
  } else {
    // if the diamond existed, say it's gone, otherwise say it's unknown
    var status  = diamondId < diamondNextId ? 410 : 404;
    var message = diamondId < diamondNextId ? "diamond gone: " : "diamond not found: ";
    res.status(status).send(message + diamondId)
  }
}

function resetLeaderBoard(req, res, next) {
  if (!isAllowedReferer(req, config.adminReferer)) return res.status(403).send("forbidden")
  creatingDiamonds = true;
  leaderBoard = {}
  diamonds = []
  console.log("reset and creating diamonds")
  res.send("reset and creating diamonds")
  notifyClients()
}

function stopCreatingDiamonds(req, res, next) {
  if (!isAllowedReferer(req, config.adminReferer)) return res.status(403).send("forbidden")
  creatingDiamonds = false;
  console.log("stopped creating diamonds")
  res.send("stopped creating diamonds")
}

function startCreatingDiamonds(req, res, next) {
  if (!isAllowedReferer(req, config.adminReferer)) return res.status(403).send("forbidden")
  creatingDiamonds = true;
  console.log("restarted creating diamonds")
  res.send("restarted creating diamonds")
}

function listLeaderBoard(req, res, next) {
  if (isEmpty(leaderBoard)) {
    res.send({none: { score: 0, name: "nobody is playing" }})
  } else {
    res.send(leaderBoard);
  }
}

function isAllowedReferer(req, referers) {
  if (referers === null) return false;
  if (referers == "*") {
    console.log("incoming referer: " + req.headers.referer);
    return true;
  }
  referers = [].concat(referers); // make sure referers is an array now
  return referers.indexOf(req.headers.referer) >= 0
}



/*************************************************
 *
 *  helpful functions
 *
 *************************************************/

function notImplemented(req, res) {
    res.status(501).send("this functionality is envisioned but not implemented yet\n");
}

function isEmpty(object) {
  return Object.getOwnPropertyNames(object).length === 0
}
