//
// these are helpful drawing functions for the stick figures
//

// draw a line on canvas context `c`, from point x1,y1 to point x2,y2
function line(c, x1, y1, x2, y2) {
  c.beginPath();
  c.moveTo(x1,y1);
  c.lineTo(x2,y2);
  c.stroke();
}

// draw a circle on canvas context `c`, centered on x,y, with radius r
// also fill the circle with white (so it's not transparent)
function circle(c, x, y, r) {
  c.beginPath();
  c.fillStyle="#fff";
  c.arc(x, y, r, 0, 6.3, false); // 6.3 is bigger than 2π so the arc will be a whole circle
  c.fill();
  c.stroke();
}


// draw an arc on canvas context `c`, centered on x,y, with radius r, from angleStart to angleEnd
function arc(c, x, y, r, angleStart, angleEnd) {
  c.beginPath();
  c.arc(x, y, r, angleStart, angleEnd, false);
  c.stroke();
}

// fill an ellipse on canvas context `c`, centered on x,y, with horizontal radius rx, vertical radius ry
function ell(c, x, y, rx, ry) {
  const d=ry/rx; // draw the ellipse as a squashed circle
  c.beginPath();
  c.save();
  c.scale(1, d);
  c.arc(x, y/d, rx, 0, 6.3, false);
  c.restore();
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
