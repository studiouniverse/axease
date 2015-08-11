var Axease = function() {
  var self = this;

  self.elements = [];

  self.update = function() {
    self.elements.forEach(function(item) {
      if (_$.elOnScreen(item.screen.canvas)) {
        // Canvas visible
        item.screen.context.clearRect(0, 0, item.screen.canvas.width, item.screen.canvas.height);

        item.sprites.forEach(function(sprite) {
          var result = {};

          if (sprite.scroll) {
            result = self.scrollAnimation(sprite, item.screen.context);
          } else if (sprite.mouse) {

          } else if (sprite.time) {
            result = self.timeAnimation(sprite, item.screen.context);
          }

          item.screen.context.drawImage(
            self.currentFrame(sprite),
            result.x + (item.screen.canvas.width / 2) - (sprite.width / 2),
            result.y + (item.screen.canvas.height / 2) - (sprite.height / 2),
            sprite.width || sprite.img.naturalWidth,
            sprite.height || sprite.img.naturalHeight
          );
        });
      }
    });
  }

  self.currentFrame = function(sprite) {
    if (!sprite.animation) return sprite.img;

    if (!sprite.animation.canvas) {
      var tempCanvas = document.createElement("canvas");
      tempCanvas.width = sprite.width;
      tempCanvas.height = sprite.height;
      var tempContext = tempCanvas.getContext('2d');
      sprite.animation.canvas = tempCanvas;
      sprite.animation.context = tempContext;

      if (!sprite.animation.hasOwnProperty("animationIndex")) {
        sprite.animation.animationIndex = 0;
      }
    }

    var currAnimation = sprite.animation;
    if (currAnimation.length) {
      currAnimation = sprite.animation[currAnimation.animationIndex];
    }

    if (!currAnimation.hasOwnProperty("frame")) {
      currAnimation.frame = 0;
      currAnimation.lastDraw = Date.now();
    }

    if (_$.time > currAnimation.lastDraw + currAnimation.duration) {
      currAnimation.frame++;
      if (currAnimation.frame >= currAnimation.frames.length) {
        currAnimation.frame = 0;
      }
      currAnimation.lastDraw = _$.time;
    }

    sprite.animation.context.clearRect(0, 0, sprite.width, sprite.height);
    sprite.animation.context.drawImage(sprite.img,
      // Source
      currAnimation.frames[currAnimation.frame][0] * sprite.width,
      currAnimation.frames[currAnimation.frame][1] * sprite.height,
      sprite.width, sprite.height,
      // Destination
      0, 0, sprite.width, sprite.height
    );

    return sprite.animation.canvas;
  }

  self.timeAnimation = function(sprite, context) {
    // All time animations are ping pong
    var canvas = context.canvas;

    var halfCanvasWidth = canvas.width * 0.5;
    var halfCanvasHeight = canvas.height * 0.5;

    var currAnimation = sprite.time;

    var y = 0; x = 0;

    if (!currAnimation.hasOwnProperty("frame")) {
      currAnimation.frame = 0;

      currAnimation.currentX = currAnimation.frames[currAnimation.frame][0]
      * halfCanvasWidth;
      currAnimation.currentY = currAnimation.frames[currAnimation.frame][1]
      * halfCanvasHeight;

      currAnimation.targetX = currAnimation.currentX;
      currAnimation.targetY = currAnimation.currentY;
    }

    if (
      (currAnimation.travelledX >= currAnimation.distanceX &&
      currAnimation.travelledY >= currAnimation.distanceY) ||
      (currAnimation.currentX == currAnimation.targetX &&
      sprite.time.currentY >= currAnimation.targetY)
    ) {
      currAnimation.frame++;

      currAnimation.travelledX = 0;
      currAnimation.travelledY = 0;

      if (currAnimation.frame >= currAnimation.frames.length) {
        currAnimation.frame = 0;
        if (!currAnimation.pingpong) {
          // Snap current x/y to first frame
          currAnimation.currentX = currAnimation.frames[currAnimation.frame][0]
          * halfCanvasWidth;
          currAnimation.currentY = sprite.time.frames[currAnimation.frame][1]
          * halfCanvasHeight;
        }
      }

      if (currAnimation.frames[currAnimation.frame][2] !== undefined && sprite.animation) {
        sprite.animation.animationIndex = currAnimation.frames[currAnimation.frame][2];
      }

      var targetX = currAnimation.frames[currAnimation.frame][0]
        * halfCanvasWidth;
      var targetY = currAnimation.frames[currAnimation.frame][1]
        * halfCanvasHeight;

      var distanceX = targetX - currAnimation.currentX;
      var distanceY = targetY - currAnimation.currentY;

      currAnimation.distanceX = Math.abs(distanceX);
      currAnimation.distanceY = Math.abs(distanceY);

      currAnimation.dx = (distanceX / currAnimation.duration) * 0.001;
      currAnimation.dy = (distanceY / currAnimation.duration) * 0.001;
    }

    var velocityX = _$.dt * currAnimation.dx;
    var velocityY = _$.dt * currAnimation.dy;

    currAnimation.currentX += velocityX;
    currAnimation.currentY += velocityY;

    currAnimation.travelledX += Math.abs(velocityX);
    currAnimation.travelledY += Math.abs(velocityY);

    return { x: currAnimation.currentX, y: currAnimation.currentY }
  }

  self.mouseAnimation = function() {

  }

  self.scrollAnimation = function(sprite, context) {
    var canvas = context.canvas;

    var halfCanvasWidth = canvas.width * 0.5;
    var halfCanvasHeight = canvas.height * 0.5;

    var deltaY = (_$.scrollY + (_$.screenHeight * 0.5)) - (_$.elGetTop(canvas) + (canvas.offsetHeight * 0.5));

    var direction = deltaY < 0 ? "below" : (deltaY > 0) ? "above" : "center";

    var fromTarget, toTarget, mult;
    switch (direction) {
      case "below":
        fromTarget = sprite.scroll.center;
        toTarget = sprite.scroll.below;
        mult = -1;
        break;
      case "center":
        fromTarget = sprite.scroll.center;
        toTarget = sprite.scroll.center;
        mult = 0;
        break;
      case "above":
        fromTarget = sprite.scroll.center;
        toTarget = sprite.scroll.above;
        mult = 1;
        break;
    }

    var distanceScroll = _$.screenHeight / 2;
    var y = 0; x = 0;

    if (toTarget.hasOwnProperty("y")) {
      var distancePx = (toTarget.y - fromTarget.y) * halfCanvasHeight;
      var m = mult * (distancePx / distanceScroll);
      y = (m * deltaY) + (sprite.scroll.center.y * halfCanvasHeight);
    }

    if (toTarget.hasOwnProperty("x")) {
      var distancePx = (toTarget.x - fromTarget.x) * halfCanvasWidth;
      var m = mult * distancePx / distanceScroll;
      x = (m * deltaY) + (sprite.scroll.center.x * halfCanvasWidth);
    }

    return { x: x, y: y }
  }
  _$.updates.push(self.update);

  return self;
}