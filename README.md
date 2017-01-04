# axease
Simple, performant library for creating parallax animations using Javascript.

Demo
------------

WORK IN PROGRESS

[Demo 1](http://studiouniver.se/github/axease/demo1.html)

Instructions
------------

WORK IN PROGRESS

The following are some basic instructions, which will most likely change as I improve things. Please refer to demo1.html for a fully coded example.

You need to include the Axease library:

    <script type="text/javascript" src="js/axease.solo.0.3.js"></script>

Instead of hard pixel values I use a (-1 -> 1) co-ordinate value. When adjusting the y values, -1 is the bottom, and 1 is the top.

      // Color lerp

      $(["section"]).forEach(function(el, i) {
        var startColor = tinycolor("rgb(124, 228, 247)");
        var endColor = tinycolor("rgb(118, 180, 183)");

        el.style["background-color"] = startColor.toRgbString();

        $.ax.addScrollAnimation({
          containerEl: el,
          visibleEl: el,

          relativeTo: 'center',
          clamp: true,
          anchor: 'bottom',

          update: function(relativeY) {
            var shift = (Math.min(1, (1 - relativeY)) * 100);
            var newColor = tinycolor.mix(startColor, endColor, shift);
            el.style["background-color"] = newColor.toRgbString();
          }
        });
      });

      ...

Axease also supports time based animations. Again, I think they are quite simple to setup because of the co-ordinate system. Instead of a .scroll property, use .time.

A time animation object has a duration (in seconds). This is how long it should take to transition between each frame, not how long to complete an animation cycle! Frames are an array of x,y values (using -1,1 co-ordinates). There is also a pingpong attribute - when true the animation will transition back to the first frame, rather than instantly snapping to it.

      _$.ax.addScreen({
        "screen": "#four",
        "sprites": [{
          spriteId: "bg",
          time: {
            pingpong: true,
            duration: 10, //s
            frames: [[2.0, 0], [-2.0, 0]]
          }
        }]
      });

Code/Performance
-----------

* No onScroll events

* Uses requestAnimationFrame (with polyfill)

* Scope options, with minimum interference

* Takes care of heavy lifting, leaving you to worry about a single generic update function

* Change target fps by modifying $.fps

Future
------

* Use Mouse position instead of scroll position (relative to containerEl or window)

* Further optimisations
