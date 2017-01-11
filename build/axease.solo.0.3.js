// -- Polyfills

(function() {
  if (!window.requestAnimationFrame) { window.requestAnimationFrame = (function() { return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback, element ) { window.setTimeout( callback, 1000 / 60 ); }; })(); }

  if (!Date.now) { Date.now = function now(){ return new Date().getTime(); } }
})();

// -- Solo

(function(_scope, _solo, options) {

  var $ = function(query) {
    // Pass in an array to look for multiple elements
    // Pass in a string to get the first element

    if (typeof(query) === "string") {
      var el = document.querySelector(query);
      $._extendSingleNode(el);
      return el;
    } else if (typeof(query) === "object") {
      if (query.nodeName) {
        $._extendSingleNode(el);
        return el;
      } else if (query.length && typeof(query[0]) === "string") {
        var elArr = document.querySelectorAll(query);
        $._extendMultiNode(elArr);
        return elArr;
      }
    }
  }

  _scope[_solo] = $;
  window.___$solo = $;

  options = options || {};

  // -- Plugs

  $._ = {};

  $._.forEach = function(eachFunc) {
    var arr = this;
    if (arr.length > 0 && typeof(eachFunc) === "function") {
      for (var i = 0; i < arr.length; i++) {
        eachFunc(arr[i], i, arr);
      }
    }

    return this;
  }

  $._.getBounds = function() {
    var bounds = this._$bounds;

    if (($.time !== this._$accessed && ($._scrolled || $._resized)) || !bounds) {
      bounds = this.getBoundingClientRect();
    }

    this.getBounds._$bounds = bounds;
    this.getBounds._$accessed = $.time;

    return bounds;
  }

  $._.getTop = function() {
    return this.getBounds().top + $.scrollY;
  }

  $._.isVisible = function() {
    var top = this.getTop();
    var height = this.getBounds().height;
    var bottom = top + height;
    return $.scrollY + $.screenHeight >= top && $.scrollY < bottom;
  }

  $._.on = function(_events, callback) {
    var events = _events.split(" ");

    for (var i = 0; i < events.length; i++) {
      el.addEventListener(events[i], callback);
    }

    return this;
  }

  $._.off = function(_events, callback) {
    var events = _events.split(" ");

    for (var i = 0; i < events.length; i++) {
      el.removeEventListener(events[i], callback);
    }

    return this;
  }

  $._extendSingleNode = function(el) {
    if (el) {
      if (!el.hasOwnProperty("getBounds")) {
        el.getBounds = $._.getBounds;
      }

      if (!el.hasOwnProperty("getTop")) {
        el.getTop = $._.getTop;
      }

      if (!el.hasOwnProperty("isVisible")) {
        el.isVisible = $._.isVisible;
      }

      if (!el.hasOwnProperty("on")) {
        el.on = $._.on;
      }

      if (!el.hasOwnProperty("off")) {
        el.off = $._.off;
      }
    }
  }

  $._extendMultiNode = function(elArr) {
    if (elArr) {
      if (!elArr.hasOwnProperty("forEach")) {
        elArr.forEach = $._.forEach;
      }

      if (!elArr.hasOwnProperty("on")) {
        elArr.on = $._.on;
      }

      if (!elArr.hasOwnProperty("off")) {
        elArr.off = $._.off;
      }

      elArr.forEach(function(node) {
        $._extendSingleNode(node);
      });
    }
  }

  // -- Cache

  $.cache = { id: 0, img: {}, log: [] };

  // -- Debugging

  $.newID = function() {
    var newID = _solo + "_" + $.cache.id;
    $.cache.id++;
    return newID;
  }

  $.log = function(message, e) {
    var showTimestamp = true;

    if ($.cache.log.length > 0) {
      if ($.time < $.cache.log[$.cache.log.length - 1].datetime + 2000) {
        showTimestamp = false;
      }
    }

    if (showTimestamp) {
      console.info($.time + ":");
    }

    $.cache.log.push({
      message: message,
      e: e,
      datetime: $.time
    });

    if (e) {
      console.log(message, e);
    } else {
      console.log(message);
    }
  }

  // -- Communications

  $.rest = function(method, url, success, error) {
    success = typeof success == "function" ? success : function(){};
    error = typeof error == "function" ? error : function(){};

    var request = new XMLHttpRequest();
    request.open(method || 'GET', url, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(request.responseText);
        success(data, request);
      } else {
        error(request);
      }
    }

    request.onerror = function() {
      error(request);
    }

    request.send();
  }

  // -- Window

  $.scrollY = 0;
  $.screenWidth = 0;
  $.screenHeight = 0;

  $._scrolled = false;
  $._resized = false;

  $._updateScrollY = function() {
    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
  }

  // -- Updating

  $.time = Date.now();
  $.fps = !isNaN(options.fps) ? options.fps : 60;

  $._updates = [];
  $._accumulator = 0;
  $._interval = 0;

  $._prevTime = Date.now();
  $._passed = 0;

  $.addUpdate = function(updateData) {
    if (!updateData) {
      return;
    }

    var updateID = $.newID();
    var updateObject = {};

    updateObject.id = updateID;
    updateObject.dirty = true;
    updateObject.interval = updateData.interval || 0;
    updateObject.remaining = updateData.hasOwnProperty("numTimes") ? updateData.numTimes : -1;
    updateObject.time = 0;
    updateObject.events = {
      resized: true,
      scrolled: true
    };

    updateObject.preUpdate = function() {
      if ($._scrolled) {
        this.events.scrolled = true;
      }

      if ($._resized) {
        this.events.resized = true;
      }

      if (updateData.preUpdate) {
        updateData.preUpdate();
      }
    }

    updateObject.update = function() {
      var validUpdate = true;
      if (updateData.requirements) {
        if (updateData.requirements.visible) {
          if (!updateData.requirements.visible.isVisible()) {
            validUpdate = false;
          }
        }

        if (updateData.requirements.scrolled && !this.events.scrolled) {
          validUpdate = false;
        }

        if (updateData.requirements.resized && !this.events.resized) {
          validUpdate = false;
        }
      }

      if (this.remaining !== 0 &&
      $.time >= this.time + this.interval &&
      validUpdate) {
        if (updateData.update) {
          var output = updateData.update();
          if (typeof(output) === "boolean") {
            this.dirty = output;
          }
        } else {
          this.dirty = true;
        }

        this.events.scrolled = false;
        this.events.resized = false;
      }

      if (this.dirty) {
        this.time = $.time;

        if (this.remaining > 0) {
          this.remaining--;
        }
      }
    }

    updateObject.draw = function() {
      if (this.dirty && updateData.draw) {
        updateData.draw();
      }
      this.dirty = false;
    }

    if (updateObject.hasOwnProperty("priority")) {
      if (updateObject.priority === -1) {
        $._updates.unshift(updateObject);
      } else {
        $._updates.push(updateObject);
      }
    } else {
      $._updates.push(updateObject);
    }

    if (updateData.run !== false) {
      if (updateData.preUpdate) updateData.preUpdate();
      if (updateData.update) updateData.update();
      if (updateData.draw) updateData.draw();
    }

    return updateID;
  }

  $.redraw = function() {
    $._theUpdate(true);
  }

  $._update = function() {
    requestAnimationFrame(function() {
      $._theUpdate();
      $._update();
    });
  }

  $._theUpdate = function(redraw) {

    // Time

    var now = Date.now();
    $.time = now;
    $._passed = now - $._prevTime;

    // Dimensions

    $._resized = window.innerHeight !== $.screenHeight || window.innerWidth !== $.screenWidth;
    $.screenWidth = window.innerWidth;
    $.screenHeight = window.innerHeight;

    // Scroll

    var scrollY = $._updateScrollY();
    $._scrolled = $._resized || scrollY !== $.scrollY;
    $.scrollY = scrollY;

    // Updates

    $._interval = ((1 / $.fps) * 1000);

    $._updates.forEach(function(updateObject) {
      updateObject.preUpdate($._interval);
    });

    if (redraw !== true) {
      $._accumulator += $._passed;
      while ($._accumulator >= $._interval) {
        $._updates.forEach(function(updateObject) {
          updateObject.update($._interval);
        });

        $._accumulator -= $._interval;
      }
    } else {
      $._updates.forEach(function(updateObject) {
        updateObject.update($._passed);
      });
    }

    $._updates.forEach(function(updateObject) {
      if (redraw) {
        updateObject.dirty = true;
      }
      updateObject.draw($._passed);
    });

    // Clean up

    $._prevTime = now;
  }

  if (options.waitForLoad !== true) {
    $._update();
  } else {
    window.addEventListener("load", function() {
      $._update();
    });
  }

})( window, (!window.hasOwnProperty('$') ? '$' : '_$'));
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

    var preUpdate = (animation.onEnter || animation.onExit) ? function() {
      self._preUpdate(animation);
    } : false;

    var updateID = $.addUpdate({
      run: (animationData.hasOwnProperty("run") ? animationData.run : true),
      requirements: {
        scrolled: true,
        visible: animation.visibleEl
      },
      preUpdate: preUpdate,
      draw: function() {
        var relativeY = self._updateScrollAnimation(animation);

        if (typeof(animation.onScroll) === "function") {
          animation.onScroll(relativeY);
        }
      }
    });

    animation.updateID = updateID;

    self._scrollAnimations.push(animation);
  }

  self._preUpdate = function(a) {
    var visibleEl = a.visibleEl;
    var containerEl = a.containerEl;

    if (visibleEl) {
      var visibility = visibleEl.isVisible();

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
      var visibility = containerEl.isVisible();

      if (typeof(a.onEnter) === "function") {
        if (visibility && a.containerElVisibility !== visibility) {
          a.onEnter();
        }
      }

      if (typeof(a.onExit) === "function") {
        if (!visibility && a.containerElVisibility !== visibility) {
          a.onExit();
        }
      }

      a.containerElVisibility = visibility;
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

    return y;
  }

  return self;
})('ax');