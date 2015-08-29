if (!window.requestAnimationFrame) { window.requestAnimationFrame = (function() { return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
  function(callback, element ) { window.setTimeout( callback, 1000 / 60 ); }; })(); }

(function(scope){
  if (scope._$) return;
  scope._$ = {};
  var _$ = scope._$;

  _$.f = function(query) {
    return document.querySelectorAll(query);
  }

  _$.on = function(el, eventArray, callback) {
    for (var i = 0; i < eventArray.length; i++) {
      el.addEventListener(eventArray[i], callback);
    }
  }

  _$.log = function(message, e) {
    if (this.lastLog == message) return;
    console.log(message, e);
    this.lastLog = message;
  }

  _$.getScreen = function(query) {
    var canvas = _$.f(query)[0];
    var context = canvas.getContext("2d");
    return {
      canvas: canvas,
      context: context
    }
  }

  _$.img = {};
  _$.createImage = function(src, onload) {
    if (typeof(src) == "object") {
      var numImagesToLoad = src.length;

      function _$imageLoaded() {
        numImagesToLoad--;
        if (numImagesToLoad == 0) {
          if (onload) onload();
        }
      }

      src.forEach(function(imgData) {
        _$.img[imgData.id] = _$.createImage(imgData.url, _$imageLoaded);
      });
      return;
    }

    var img = document.createElement("img");
    img.onload = function() {
      if (onload) onload(img);
    }
    img.src = src;
    return img;
  }

  _$.getElTop = function(el) {
    return el.getBoundingClientRect().top + _$.scrollY;
  }

  _$.isElVisible = function(el) {
    var top = _$.getElTop(el);
    var height = el.offsetHeight;
    var bottom = top + height;
    return _$.scrollY + _$.screenHeight >= top && _$.scrollY < bottom;
  }

  // Time
  _$.prevTime = Date.now();
  _$.fps = 24;
  _$.dt = 1000 / _$.fps;

  //
  _$.updates = []; // Holds all the updates to run @fps
  _$.draws = []; // Holds all the draw updates to run once per tick
  _$.accumulator = 0;

  // Screen
  _$.scrollY = 0;
  _$.niceY = 0;
  _$.scrolled = false;
  _$.resize = false; // Has a resize happened ?
  _$.screenWidth = 0; // Screen width
  _$.screenHeight = 0; // Screen height
  _$.midpoint = Math.round(window.innerHeight /  2);

  _$.start = function() {
    if (_$._started) return;
    _$._started = true;
    _$.update();
  }

  _$.addUpdate = function(updateFunc, drawFunc) {
    if (updateFunc) _$.updates.push(updateFunc);
    if (drawFunc) _$.draws.push(drawFunc);
    _$.update(true);
  }

  _$._runUpdates = function() {
    _$.updates.forEach(function(func, index) {
      func(_$.dt);
    });
  }

  _$._runDraw = function() {
    _$.draws.forEach(function(func, index) {
      func(_$.dt);
    });
  }

  _$.update = function(force) {
    requestAnimationFrame(function() {
      if (_$.updating) return;

      // Time
      var now = Date.now();
      _$.time = now;
      _$.passed = now - _$.prevTime;

      // Resize
      _$.resize = window.innerHeight !== _$.screenHeight || window.innerWidth !== _$.screenWidth;
      _$.screenWidth = window.innerWidth;
      _$.screenHeight = window.innerHeight;

      // Scroll
      var scroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      _$.scrolled = scroll !== _$.scrollY;
      _$.scrollY = scroll;

      _$.niceY = _$.scrollY / (document.body.offsetHeight - _$.screenHeight);

      // Run updates
      if (!force) {
        _$.accumulator += _$.passed;
        while (_$.accumulator >= _$.dt) {
          _$._runUpdates();
          _$.accumulator -= _$.dt;
        }
      } else {
        _$.scrolled = true;
        _$._runUpdates();
      }

      _$._runDraw();

      // Prep next tick
      _$.prevTime = now;
      _$.update();
    });
  }
})(window);