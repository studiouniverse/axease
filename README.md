# axease
Simple library for creating canvas parallax animations in Javascript.

Demo
------------

[Demo1](http://studiouniver.se/github/axease/demo1.html)

Instructions
------------

The following are some basic instructions, which may very well change in the future when I have time to improve things. Please refer to demo1.html.

You need to include both solo.js and axease.js:

    <script type="text/javascript" src="solo.0.1.js"></script>
    <script type="text/javascript" src="axease.0.1.js"></script>

You need to have a <canvas> element in the page. A number of my functions will refer to these as "screens".

    <canvas id="one"></canvas>

I'm not sure if this is essential, but I would fully recommend including this CSS (the browser should treat the sizing the same way it does images):

    canvas {
      width: 100%;
      height: auto;
      display: inline-block;
    }

You need to create an instance of Axease and preload your assets. Assets get added to the _$.img object with the id supplied:

    // Create Axease
    var ax = new Axease();

    // Preload our content
    _$.createImage([{
      id: "bg",
      url: "bokeh-bg.png"
    }, {
      id: "fg",
      url: "bokeh-fg.png"
    }], onload);


The magic should happen in your onload function. First select your screen (canvas). Then build up and push your screen animation object. A screen animation object consists of; the screen; the sprites (images) to draw.

For scroll animations each of your sprite objects should have a 'scroll' object. This has three attributes: "below", "center", "above". Below refers to the location sprites should be when the screen is below the center of the window (window.innerHeight / 2), and above defines the location of the sprites as the screen gets closer to the top of the window.

Instead of hard pixel values I use a (-1 -> 1) co-ordinate value. When adjusting the y values, -1 is the top of your screen and 1 is the bottom. I don't really have any plans to change this, I really like the simplicity!

Finally, make sure you start solo's update function _$.update(). Ideally, do this when you are happy all your screen animation objects have been pushed, and your assets have loaded.

    function onload() {
      // Get "screen"s (canvas)
      var screenOne = _$.getScreen("canvas#one");

      var spriteHeight = (screenOne.canvas.width / _$.img["bg"].naturalWidth) * _$.img["bg"].naturalHeight;

      // Push the screens (canvas) to Axease
      ax.elements.push({
        "screen": screenOne,
        "sprites": [{
          img: _$.img["bg"],
          width: screenOne.canvas.width,
          height: spriteHeight,
          scroll: {
            below: { y: 0.2 }, // 1 - bottom of canvas
            center: { y: 0 }, // 0 - middle of canvas
            above: { y: -0.2 } // -1 top of canvas
          }
        }, {
          img: _$.img["fg"],
          width: screenOne.canvas.width,
          height: spriteHeight,
          scroll: {
            below: { x: -0.8, y: 0.8 }, // 1 - right/bottom of canvas
            center: { x: -0.4, y: 0.4 }, // 0 - middle of canvas
            above: { x: 0, y: 0 } // -1 left/top of canvas
          }
        }]
      });

      // Start the tick!
      _$.update();
    }


Code/Performance
-----------

* I do not use any onScroll events.

* The global scope should only be getting polluted by _$ and Axease.

* Screens are not updated when they are not visible on the screen.

* I am polyfilling requestAnimationFrame

* Performance is something I am keeping an eye on. It's definitely not perfect right now.

* In this version the target FPS is 60fps. Most likely this will be reduced to a more mobile friendly 30fps in my next version.

* There are still a number of optimisations to make, particularly with seperating the drawing and updating logic.

Future
------

* It also supports basic x -> y and x -> y -> x animations based on time, but I have not given this enough tidy nor testing.

* The library will also support mouse animations (when mouse is over canvas at x,y sprites should be at x,y). No real work has been done here yet.
