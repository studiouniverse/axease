(function(scope, _ax) {
  var self = this;
  var $ = window.___$solo;
  $[_ax] = self;

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

      containerEl: animationData.containerEl,
      containerPosition: "",
      containerVisibility: null,

      onCenter: animationData.onCenter,
      onEnter: animationData.onEnter,
      onExit: animationData.onExit
    };

    var preUpdate = function() {
      var a = animationData;
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
      run: animationData.run || true,
      requirements: {
        scrolled: true,
        visible: animationData.visibleEl
      },
      preUpdate: (animationData.onEnter || animationData.onExit) ? preUpdate : false,
      draw: function() {
        var relativeY = self._updateScrollAnimation(animation);
        animationData.update(relativeY);
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