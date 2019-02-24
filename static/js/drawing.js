//
// these are helpful drawing functions for the stick figures
//

// draw a line on canvas context `c`, from point x1,y1 to point x2,y2
function line(c, x1, y1, x2, y2) {
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();
}

// draw a circle on canvas context `c`, centered on x,y, with radius r
// also fill the circle with white (so it's not transparent)
function circle(c, x, y, r) {
  c.save(); // we're changing fillStyle so we need to be able to restore it
  c.beginPath();
  c.fillStyle='#fff';
  c.arc(x, y, r, 0, 2 * Math.PI, false);
  c.fill();
  c.stroke();
  c.restore(); // restore previous fill style
}


// draw an arc on canvas context `c`, centered on x,y, with radius r, from angleStart to angleEnd
function arc(c, x, y, r, angleStart, angleEnd) {
  c.beginPath();
  c.arc(x, y, r, angleStart, angleEnd, false);
  c.stroke();
}

// fill an ellipse on canvas context `c`, centered on x,y, with horizontal radius rx, vertical radius ry
function fillEll(c, x, y, rx, ry) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI, false);
  c.fill();
}


// convert from degrees to radians
function rad(x) {
  return x * Math.PI / 180;
}

// convert from radians to degrees
function deg(x) {
  return x / Math.PI * 180;
}


// scales the canvas so it matches the window pixel density
// returns a drawing context that is scaled too so the new canvas dimensions can be ignored
function scaleCanvas(canvasEl) {
  const dpr = window.devicePixelRatio || 1;
  canvasEl.style.width = `${canvasEl.width}px`;
  canvasEl.style.height = `${canvasEl.height}px`;
  canvasEl.width *= dpr;
  canvasEl.height *= dpr;

  const c = canvasEl.getContext('2d');
  c.scale(dpr, dpr);
  return c;
}


// this function computes the coordinates of a given mouse event in the element
// it returns an object like {left: 100, top: 312}
function getClickCoordinates(event, element) {
  const rect = element.getBoundingClientRect();

  return {
    left: event.clientX - rect.left,
    top: event.clientY - rect.top,
  };
}


// this function measures time elapsed between subsequent invocations, in seconds (or fractions of a second)
// this is useful for smooth animations
let lastTime = null;
function elapsedTime() {
  if (!lastTime) lastTime = Date.now();
  const currentTime = Date.now();
  const timeElapsed = currentTime - lastTime;
  lastTime = currentTime;
  return timeElapsed/1000;
}

window.line = line;
window.circle = circle;
window.arc = arc;
window.fillEll = fillEll;
window.rad = rad;
window.deg = deg;
window.scaleCanvas = scaleCanvas;
window.getClickCoordinates = getClickCoordinates;
window.elapsedTime = elapsedTime;
