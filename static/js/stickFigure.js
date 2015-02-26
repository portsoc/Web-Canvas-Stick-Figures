//
// these are the final functions for drawing a stick figure
//


  // draws a stick figure on the canvas
  // the stick figure will stand over the point X,Y
  // facing is a degree in which the stick figure is facing: 0 is to the right, 90 is towards us
  // distance is the distance walked; a new step starts every 40 pixels
  function drawStickFigure(c, x, y, facing, distance) {
    // because of the way the canvas works, it's best to draw lines at half-pixels
    x+=.5
    y+=.5

    // the arms and the legs look the same
    drawLimbs(c, x, y, distance)    // legs
    drawLimbs(c, x, y-40, distance) // arms

    // body is just a line
    line(c, x, y-40, x, y-80)       // body

    // head is a circle with eyes and a smile
    circle(c, x, y-100, 20)         // head
    drawFace(c, x, y-100, facing)   // face

    // draws the limbs; with the `distance` parameter, the limbs are drawn as an in-motion snapshot
    function drawLimbs(c, x, y, distance) {

      // at rest, the legs are spread by 2*20 pixels (the front leg is 20 pixels in front, the back leg is 20 pixels behind)
      var spread = 20;

      // if we have a distance parameter, we are moving (otherwise we are at rest)
      if (distance !== undefined) {
        // this is how we do walking: (we talk about legs, but arms behave the same)
        // when walking, the stick figure starts at distance 0 with legs spread, then the front leg stays put on the ground
        // every step is 40 pixels long
        // after traveling 5 pixels, the front leg is only 15 pixels in the front; and the back leg is catching up, also by 5 pixels
        // so after traveling 20 pixels, the front legs is right below you, and so is the back leg
        // and after traveling 20 pixels more, the formerly front leg is now the back leg, and vice versa
        // therefore, to spread the legs appropriately for the distance, we count 20 pixels minus our distance from the last full step

        // since we walk backwards the same as fowards, a negative distance is the same as positive, which makes the maths easier
        if (distance < 0) distance = -distance;

        // compute where in a step we are
        var thisStep = distance % 40;

        spread = 20-thisStep;
      }

      line(c, x-spread, y, x, y-40)
      line(c, x+spread, y, x, y-40)
    }

    // this function is the same as before
    function drawFace(c, x, y, facing) {
      // if the `facing` parameter is not given, the stick figure will face towards us
      if (facing === undefined) facing = 90;

      // make sure the `facing` parameter is between 0 and 360
      facing = facing % 360; // that's like the mathematical remainder after a division
      if (facing < 0) facing += 360;

      if (facing > 180) return;  // facing away from us, don't draw a face

      // we'll fake the turning of the face by shifting the eyes and the smile by an offset of up to 10 pixels
      var faceOffset = 0;
      if (facing <= 180) {
        faceOffset = (facing-90)/9;
      }

      circle(c, x-7-faceOffset, y-5, 1)  // 7 is distance from center, 5 is how high the eyes are from the head's center, 1 is eye size
      circle(c, x+7-faceOffset, y-5, 1)

      // decrease the smile size here
      var smileSize = 70; // size of smile in degrees of angle; 360 would be a full circle
      var startAngle = rad(90-smileSize/2-2*faceOffset)
      var endAngle   = rad(90+smileSize/2-2*faceOffset)
      arc(c, x-faceOffset, y, 12, startAngle, endAngle) // 12 is the radius of the smile circle
    }
  }
