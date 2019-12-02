//
// these are the final functions for drawing a stick figure
//

/* global line, circle, rad, arc */


// draws a stick figure on the canvas
// the stick figure will stand over the point X,Y
// facing is a degree in which the stick figure is facing: 0 is to the right, 90 is towards us (default)
// distance is the distance walked; a new step starts every 40 pixels
function drawStickFigure(c, x, y, facing = 90, distance = 20) {
  drawBody(c, x, y);

  drawLegs(c, x, y, distance);

  // the arms look just like the legs, just higher on the body
  drawLegs(c, x, y-40, distance);

  // face drawn last so the body doesn't draw over it
  drawHead(c, x, y-100, facing);

  // body is just a line
  function drawBody(c, x, y) { // eslint-disable-line no-shadow
    line(c, x, y-40, x, y-80);
  }

  // draws the legs; with the `distance` parameter, the legs are drawn as an in-motion snapshot
  function drawLegs(c, x, y, distance) { // eslint-disable-line no-shadow
    // this is how we do walking: (we talk about legs, but arms behave the same)
    // when walking, the stick figure starts at distance 0 with legs together
    // then the back leg stays put on the ground and front leg moves forward
    // every step is 40 pixels long
    // after the stick figure travels 5 pixels, the front leg is 5 pixels ahead
    // and the back leg is 5 pixels behind the body, so there's a 10 pixel spread between the legs
    // after traveling 20 pixels, the legs as spread as far as they can be
    // then we put the front foot down, lift the back foot and the back leg starts moving forward
    // and after traveling 20 pixels more, the body is over the front leg and the back leg has caught up

    // since we walk backwards the same as fowards, a negative distance is the same as positive,
    // which makes the maths easier
    if (distance < 0) distance = -distance;

    // compute where in a step we are (every step is the same)
    const thisStep = distance % 40;

    // the spread is 0 at the beginning and the end of a step, 20 in the middle
    const spread = 20-Math.abs(thisStep-20);

    line(c, x-spread, y, x, y-40);
    line(c, x+spread, y, x, y-40);
  }

  // head is a circle with eyes and a smile
  function drawHead(c, x, y, facing) { // eslint-disable-line no-shadow
    // head
    circle(c, x, y, 20);

    // make sure the `facing` parameter is between 0 and 360
    facing %= 360; // that's the mathematical remainder after a division
    if (facing < 0) facing += 360;

    if (facing > 180) return; // facing away from us, don't draw a face

    // we'll fake the turning of the face by shifting the eyes and the smile by an offset of up to 10 pixels
    const faceOffset = (facing-90)/9;

    // eyes
    circle(c, x-7-faceOffset, y-5, 1); // 7 is distance from center, 5 is how high the eyes are from the head's center, 1 is eye size
    circle(c, x+7-faceOffset, y-5, 1);

    // an arc for a smile
    const smileSize = 70; // size of smile in degrees of angle; 360 would be a full circle
    let startAngle = rad(90-smileSize/2-2*faceOffset); // eslint-disable-line prefer-const
    let endAngle = rad(90+smileSize/2-2*faceOffset); // eslint-disable-line prefer-const
    arc(c, x-faceOffset, y, 12, startAngle, endAngle); // 12 is the radius of the smile circle

    // // now the moustache
    // const moSize = 70; // size of smile in degrees of angle; 360 would be a full circle
    // startAngle = rad(90-moSize/2);
    // endAngle = rad(90+moSize/2);
    // arc(c, x-faceOffset-7, y-1, 8, startAngle-0.17, endAngle-0.17);
    // arc(c, x-faceOffset+7, y-1, 8, startAngle+0.17, endAngle+0.17);

    // // and the pointy beard
    // c.save(); // we're changing fillStyle so we need to be able to restore it
    // c.beginPath();
    // c.moveTo(x-faceOffset-6, y+15);
    // c.lineTo(x-faceOffset, y+30);
    // c.lineTo(x-faceOffset+6, y+15);
    // c.fillStyle='#fff';
    // c.fill();
    // c.stroke();
    // c.restore(); // restore previous fill style
  }
}

window.drawStickFigure = drawStickFigure;
