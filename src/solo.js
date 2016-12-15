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
    if (this.length > 0 && typeof(eachFunc) === "function") {
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
  $.fps = !isNaN(options.fps) ? fps : 60;

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
    updateObject.interval = updateData.interval || 0;
    updateObject.remaining = updateData.numTimes || -1;
    updateObject.time = 0;
    updateObject.events = {
      resized: true,
      scrolled: true,
      visible: false
    };

    updateObject.update = function() {
      if ($._scrolled) {
        this.events.scrolled = true;
      }

      if ($._resized) {
        this.events.resized = true;
      }

      if (updateData.preUpdate) {
        updateData.preUpdate();
      }

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
      }

      if (this.remaining > 0) {
        this.remaining--;
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

  window.addEventListener("load", function() {
    $._update();
  });

})( window, (!window.hasOwnProperty('$') ? '$' : '_$'), {} );