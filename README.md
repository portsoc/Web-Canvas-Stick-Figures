# Web-Canvas-Stick-Figures

An example for showing scripting on the Web. It is a series of files that
progressively do more with canvas, and finally a Node.js server for a simple
multi-player stick figure diamond hunt game.

### Installation:

Most of the files are static files happily working off of a local drive or any server.

The multiplayer game needs a server; it's a typical Node.js server, so `npm install` and `node server.js` should help there.

`admin.html` gives you links to reset the scores, start and stop generating diamonds.  `config.js` can be set up to only allow these links to work from a certain _referer_, as a simple authentication mechanism.

### Notes and TODOs:

  -	object model, stick figure should be an object, with behavior
    - figure.walkTo(x,y)
    - figure.walkTo(x,y,cb) -- callback when we're there
    - figure.draw(c,time)
  - stick figures dancing harlem shake?
  - admin security should be done with username/password, not with referer
