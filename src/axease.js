(function(_ax) {
  var $ = window.___$solo;
  var self = {};
  $[_ax] = self;

  // -- Base

  self._createAnimation = function(animationData) {
    var pingpong = animationData.pingpong;
    var loop = (animationData.hasOwnProperty("loop") ? animationData.loop : true);

    var animationInterval = ( animationData.hasOwnProperty("duration") && animationData.duration ?
      ((animationData.duration * 1000) / animationData.frames) :
      (animationData.interval || 1000) );

    var animation = {
      preUpdate: animationData.preUpdate,
      update: animationData.update,
      draw: animationData.draw,

      onScroll: animationData.onScroll,
      onChange: animationData.onChange,

      visibleEl: animationData.visibleEl,

      onEnter: animationData.onEnter,
      onExit: animationData.onExit,
      onVisible: animationData.onVisible,
      onHidden: animationData.onHidden,

      // Animation vars

      loop: loop,
      pingpong: pingpong,

      frames: animationData.frames,
      frame: 0,
      direction: 1,
      interval: animationInterval,

      onStart: animationData.onStart,
      onFinish: animationData.onFinish,
      onRestart: animationData.onRestart,
      onPingPong: animationData.onPingPong,

      // Scrolling vars

      flip: animationData.flip || false,
      abs: animationData.abs || false,
      clamp: animationData.clamp || false,

      midpoint: animationData.anchor || animationData.midpoint || "center",

      relativeTo: animationData.relativeTo || "viewport",

      containerEl: animationData.containerEl,
      containerPosition: "",
      containerVisibility: null,

      onCenter: animationData.onCenter
    }

    return animation;
  }

  // -- Animation

  self._animations = [];

  self.addAnimation = function(animationData) {
    if (!animationData || !animationData.frames) {
      return;
    }

    var animation = self._createAnimation(animationData);

    var requirements = {};
    if (animation.visibleEl) {
      requirements.visible = animation.visibleEl;
    }

    var preUpdate = (animation.onEnter || animation.onExit) ? function() {
      self._preUpdate(animation);
    } : false;

    var updateID = $.addUpdate({
      numTimes: (animation.loop ? -1 : (animation.pingpong ? ((animation.frames * 2) - 1) : animation.frames)),
      interval: animation.interval,
      run: false,
      requirements: requirements,
      preUpdate: preUpdate,
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

    var animation = self._createAnimation(animationData);

    var preUpdate = (animation.onEnter || animation.onExit || animation.preUpdate) ? function() {
      self._preUpdate(animation);
    } : false;

    var updateID = $.addUpdate({
      run: (animationData.hasOwnProperty("run") ? animationData.run : true),
      requirements: {
        scrolled: true,
        visible: animation.visibleEl
      },
      preUpdate: preUpdate,
      update: function() {
        var relativeY = self._updateScrollAnimation(animation);

        if (typeof(animation.update) === "function") {
          animation.update(relativeY);
        }

        if (typeof(animation.onScroll) === "function") {
          animation.onScroll(relativeY);
        }

        return true;
      },
      draw: function() {
        if (typeof(animation.draw) === "function") {
          animation.draw(animation.relativeY);
        }
      }
    });

    animation.updateID = updateID;

    self._scrollAnimations.push(animation);
  }

  self._preUpdate = function(a) {
    var visibleEl = a.visibleEl;
    var containerEl = a.containerEl;

    var visibility = true;

    if (visibleEl) {
      var visibleElVisibility = visibleEl.isVisible();
      if (!visibleElVisibility) {
        visibility = false;
      }

      if (typeof(a.onVisible) === "function") {
        if (visibility && a.visibleElVisibility !== visibility) {
          a.onVisible();
        }
      }

      if (typeof(a.onHidden) === "function") {
        if (!visibility && a.visibleElVisibility !== visibility) {
          a.onHidden();
        }
      }

      a.visibleElVisibility = visibility;
    }

    if (containerEl) {
      var containerElVisibility = containerEl.isVisible();

      if (typeof(a.onEnter) === "function") {
        if (containerElVisibility && a.containerElVisibility !== containerElVisibility) {
          a.onEnter();
        }
      }

      if (typeof(a.onExit) === "function") {
        if (!containerElVisibility && a.containerElVisibility !== containerElVisibility) {
          a.onExit();
        }
      }

      a.containerElVisibility = visibility;
    }

    if (visibility && typeof(a.preUpdate) === "function") {
      a.preUpdate();
    }
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

    // TODO if (a.relativeTo === "center") { // allow custom midpoint }
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
    var mult = a.flip ? -1 : 1;
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

    if (a.abs) {
      y = Math.abs(y);
    }

    if (deltaY <= 5 && position !== a.containerPosition &&
    a.containerPosition && a.containerPosition !== "") {
      if (typeof(a.onCenter) === "function") {
        a.onCenter();
      }
    }

    a.containerPosition = position;
    a.relativeY = y;

    return y;
  }

  return self;
})('ax');