(function(scope, _ax) {
  var self = this;
  var $ = window.___$solo;
  $[_ax] = self;

  // -- Animation
  self._animations = [];

  self.addAnimation = function(animationData) {
    if (!animationData || !animationData.frames) {
      return;
    }

    var pingpong = animationData.pingpong;
    var loop = (animationData.hasOwnProperty("loop") ? animationData.loop : true);

    var animationInterval = ( animationData.hasOwnProperty("duration") && animationData.duration ?
      ((animationData.duration * 1000) / animationData.frames) :
      (animationData.interval || 1000) );

    var animation = {
      loop: loop,
      pingpong: pingpong,

      frames: animationData.frames,
      frame: 0,
      direction: 1,
      interval: animationInterval,

      visibleEl: animationData.visibleEl,

      update: animationData.update,
      draw: animationData.draw,

      onEnter: animationData.onEnter,
      onExit: animationData.onExit,

      onStart: animationData.onStart,
      onFinish: animationData.onFinish,
      onRestart: animationData.onRestart,
      onPingPong: animationData.onPingPong
    }

    var preUpdate = function() {
      var a = animation;
      var el = a.visibleEl;

      if (el) {
        var visibility = el.isVisible();

        if (typeof(a.onEnter) === "function") {
          if (visibility && a.visibleElVisibility !== visibility) {
            a.onEnter();
          }
        }

        if (typeof(a.onExit) === "function") {
          if (!visibility && a.visibleElVisibility !== visibility) {
            a.onExit();
          }
        }

        a.visibleElVisibility = visibility;
      }
    }

    var requirements = {};
    if (animation.visibleEl) {
      requirements.visible = animation.visibleEl;
    }

    var updateID = $.addUpdate({
      remaining: (animation.loop ? -1 : 0),
      interval: animationInterval,
      run: false,
      requirements: requirements,
      preUpdate: (animation.visibleEl && (animation.onEnter || animation.onExit)) ? preUpdate : false,
      update: function() {
        if (animation.started) {
          if (animation.pingpong) {
            if (animation.frame <= 0) {
              animation.direction = 1;

              if (typeof(animation.onRestart) === "function") {
                animation.onRestart();
              }
            }
          }

          animation.frame += animation.direction;

          if (animation.frame >= animation.frames) {
            if (animation.pingpong) {
              animation.frame = animation.frames - 2;
              animation.direction = -1;

              if (typeof(animation.onPingPong) === "function") {
                animation.onPingPong();
              }
            } else {
              animation.frame = 0;

              if (typeof(animation.onRestart) === "function") {
                animation.onRestart();
              }
            }
          }
        }

        animation.started = true;
        if (typeof(animation.update) === "function") {
          animation.update(animation.frame);
        }
        return true;
      },
      draw: function() {
        if (typeof(animation.draw) === "function") {
          animation.draw(animation.frame);
        }
      }
    });

    animation.updateID = updateID;

    self._animations.push(animation);
  }

  // -- Scrolling

  self._scrollAnimations = [];

  self.addScrollAnimation = function(animationData) {
    if (!animationData || !animationData.containerEl) {
      return;
    }

    var animation = {
      clamp: animationData.clamp || false,

      midpoint: animationData.anchor || animationData.midpoint || "center",

      relativeTo: animationData.relativeTo || "viewport",

      visibleEl: animationData.visibleEl,
      containerEl: animationData.containerEl,
      containerPosition: "",
      containerVisibility: null,

      update: animationData.update,
      draw: animationData.draw,

      onCenter: animationData.onCenter,
      onEnter: animationData.onEnter,
      onExit: animationData.onExit
    };

    var preUpdate = function() {
      var a = animation;
      var el = a.containerEl;
      var visibility = el.isVisible();

      if (typeof(a.onEnter) === "function") {
        if (visibility && a.containerVisibility !== visibility) {
          a.onEnter();
        }
      }

      if (typeof(a.onExit) === "function") {
        if (!visibility && a.containerVisibility !== visibility) {
          a.onExit();
        }
      }

      a.containerVisibility = visibility;
    }

    var updateID = $.addUpdate({
      run: (animationData.hasOwnProperty("run") ? animationData.run : true),
      requirements: {
        scrolled: true,
        visible: animation.visibleEl
      },
      preUpdate: (animation.onEnter || animation.onExit) ? preUpdate : false,
      draw: function() {
        var relativeY = self._updateScrollAnimation(animation);

        if (typeof(animation.update) === "function") {
          animation.update(relativeY);
        }

        if (typeof(animation.draw) === "function") {
          animation.draw(relativeY);
        }
      }
    });

    animation.updateID = updateID;

    self._scrollAnimations.push(animation);
  }

  self._updateScrollAnimation = function(a) {
    var el = a.containerEl;

    var top = el.getTop();
    var bounds = el.getBounds();

    var elWidth = bounds.width;
    var elHeight = bounds.height;

    var halfElWidth = elWidth * 0.5;
    var halfElHeight = elHeight * 0.5;
    var elMid = top + halfElHeight;

    var halfScreenHeight = $.screenHeight * 0.5;

    var midpointY = $.scrollY; // default to half of viewport
    switch (a.midpoint) {
      case "top":
        break;
      case "center":
        midpointY += halfScreenHeight;
        break;
      case "bottom":
        midpointY += $.screenHeight;
        break;
    }

    var deltaY = midpointY - elMid;
    var position = deltaY <= 0 ? "below" : "above";

    var y = 0;
    var mult = 1;
    var offsetY = 0;

    if (a.relativeTo === "viewport") {
      offsetY = halfScreenHeight;
    }

    var startY = elMid + offsetY;
    var targetY = elMid;

    var sfY = (targetY - midpointY) / (offsetY + halfElHeight);
    y = sfY * mult;

    if (a.clamp) {
      y = Math.max( -1, Math.min(1, y) );
    }

    if (deltaY <= 5 && position !== a.containerPosition &&
    a.containerPosition && a.containerPosition !== "") {
      if (typeof(a.onCenter) === "function") {
        a.onCenter();
      }
    }

    a.containerPosition = position;

    return y;
  }

  return self;
})( window, 'ax', '$', {} );