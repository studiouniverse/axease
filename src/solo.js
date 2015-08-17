if (!window.requestAnimationFrame) { window.requestAnimationFrame = (function() { return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
  function(callback, element ) { window.setTimeout( callback, 1000 / 60 ); }; })(); }

(function(scope){
  if (scope._$) return;
  scope._$ = {};

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
  _$.updates = []; // Holds all the updates to run per tick
  _$.accumulator = 0;

  // Screen
  _$.scrollY = 0;
  _$.resize = false; // Has a resize happened ?
  _$.screenWidth = 0; // Screen width
  _$.screenHeight = 0; // Screen height
  _$.midpoint = Math.round(window.innerHeight /  2);

  _$.start = function() {
    if (_$._started) return;
    _$._started = true;
    _$.update();
  }

  _$.update = function() {
    requestAnimationFrame(function() {
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
      _$.scrollY = scroll;

      // Run updates
      _$.accumulator += _$.passed;
      while (_$.accumulator >= _$.dt) {
        _$.updates.forEach(function(func) {
          func(_$.dt);
        });
        _$.accumulator -= _$.dt;
      }

      // Prep next tick
      _$.prevTime = now;
      _$.update();
    });
  }
})(window);