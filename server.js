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

setInterval(addDiamond, 1000)


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
  var found = diamonds.some(function(diamond, idx) {
    if (diamond.id == diamondId) {
      diamonds[idx] = diamonds[diamonds.length - 1]
      diamonds.pop()
      return true;
    }
    return false;
  })

  if (found) {
    var playerID = req.query.user;
    var playerName = req.query.name || playerID;

    var playerScore = leaderBoard[playerID] || (leaderBoard[playerID] = { score: 0 });
    playerScore.score += 1
    playerScore.name = playerName

    res.status(200).send({msg: "diamond " + diamondId + " is yours!", score: playerScore.score})
    notifyClients()
    console.log("diamond claimed: " + diamonds.length + " (user: " + playerName + ")")
  } else {
    res.status(404).send("diamond not found: " + diamondId)
  }
}

var creatingDiamonds = true;
console.log("creating diamonds");

function resetLeaderBoard(req, res, next) {
  if (!isAllowedReferer(req, config.adminReferer)) return res.status(403).send("forbidden")
  creatingDiamonds = true;
  leaderBoard = {}
  diamonds = []
  res.send("reset and creating diamonds")
  notifyClients()
}

function stopCreatingDiamonds(req, res, next) {
  if (!isAllowedReferer(req, config.adminReferer)) return res.status(403).send("forbidden")
  creatingDiamonds = false;
  res.send("stopped creating diamonds")
}

function startCreatingDiamonds(req, res, next) {
  if (!isAllowedReferer(req, config.adminReferer)) return res.status(403).send("forbidden")
  creatingDiamonds = true;
  res.send("restarted creating diamonds")
}

var leaderBoard = {}

function listLeaderBoard(req, res, next) {
  if (isEmpty(leaderBoard)) {
    res.send({none: { score: 0, name: "nobody is playing" }})
  } else {
    res.send(leaderBoard);
  }
}

function isAllowedReferer(req, referers) {
  if (referers == null) return false;
  if (referers == "*") return true;
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
