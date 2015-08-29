var Axease=function(){var e=this;return e.elements=[],e.addScreen=function(a){"string"==typeof a.screen&&(a.screen=_$.getScreen(a.screen)),a.sprites&&a.sprites.forEach(function(e){"string"==typeof e.spriteId&&(e.img=_$.img[e.spriteId]),e.width||(e.width=a.screen.canvas.width),e.height||(e.height=a.screen.canvas.width/e.img.naturalWidth*e.img.naturalHeight)}),e.elements.push(a),_$.update(!0)},e.draw=function(){e.elements.forEach(function(e){e.draw&&(e.screen.context.clearRect(0,0,e.screen.canvas.width,e.screen.canvas.height),e.draw.forEach(function(e){e()}))})},e.update=function(){e.elements.forEach(function(a){if(a.draw=!1,_$.isElVisible(a.screen.canvas)){var t={canvas:a.screen.canvas,context:a.screen.context,top:_$.getElTop(a.screen.canvas),halfWidth:.5*a.screen.canvas.width,halfHeight:.5*a.screen.canvas.height};a.sprites.forEach(function(r){var n;r.scroll&&_$.scrolled?n=e.scrollAnimation(r,t):r.mouse?n=e.mouseAnimation(r,t):r.time&&(n=e.timeAnimation(r,t)),n&&(a.draw||(a.draw=[]),a.draw.push(function(){a.screen.context.drawImage(e.currentFrame(r),n.x+t.halfWidth-r.width/2,n.y+t.halfHeight-r.height/2,r.width||r.img.naturalWidth,r.height||r.img.naturalHeight)}))})}})},e.currentFrame=function(e){if(!e.animation)return e.img;if(!e.animation.canvas){var a=document.createElement("canvas");a.width=e.width,a.height=e.height;var t=a.getContext("2d");e.animation.canvas=a,e.animation.context=t,e.animation.hasOwnProperty("animationIndex")||(e.animation.animationIndex=0)}var r=e.animation;return r.length&&(r=e.animation[r.animationIndex]),r.hasOwnProperty("frame")||(r.frame=0,r.lastDraw=Date.now()),_$.time>r.lastDraw+r.duration&&(r.frame++,r.frame>=r.frames.length&&(r.frame=0),r.lastDraw=_$.time),e.animation.context.clearRect(0,0,e.width,e.height),e.animation.context.drawImage(e.img,r.frames[r.frame][0]*e.width,r.frames[r.frame][1]*e.height,e.width,e.height,0,0,e.width,e.height),e.animation.canvas},e.timeAnimation=function(e,a){var t=(a.canvas,a.context,a.halfWidth),r=a.halfHeight,n=e.time;if(x=0,n.hasOwnProperty("frame")||(n.frame=0,n.currentX=n.frames[n.frame][0]*t,n.currentY=n.frames[n.frame][1]*r,n.targetX=n.currentX,n.targetY=n.currentY),n.travelledX>=n.distanceX&&n.travelledY>=n.distanceY||n.currentX==n.targetX&&e.time.currentY>=n.targetY){n.frame++,n.travelledX=0,n.travelledY=0,n.frame>=n.frames.length&&(n.frame=0,n.pingpong||(n.currentX=n.frames[n.frame][0]*t,n.currentY=e.time.frames[n.frame][1]*r)),void 0!==n.frames[n.frame][2]&&e.animation&&(e.animation.animationIndex=n.frames[n.frame][2]);var i=n.frames[n.frame][0]*t,c=n.frames[n.frame][1]*r,s=i-n.currentX,o=c-n.currentY;n.distanceX=Math.abs(s),n.distanceY=Math.abs(o),n.dx=s/n.duration*.001,n.dy=o/n.duration*.001}var m=_$.dt*n.dx,h=_$.dt*n.dy;return n.currentX+=m,n.currentY+=h,n.travelledX+=Math.abs(m),n.travelledY+=Math.abs(h),{x:n.currentX,y:n.currentY}},e.mouseAnimation=function(e,a){},e.scrollAnimation=function(e,a){var t,r,n,i=a.canvas,c=(a.context,a.halfWidth),s=a.halfHeight,o=_$.scrollY+.5*_$.screenHeight-(a.top+.5*i.offsetHeight),m=0>o?"below":o>0?"above":"center";switch(m){case"below":t=e.scroll.center,r=e.scroll.below,n=-1;break;case"center":t=e.scroll.center,r=e.scroll.center,n=0;break;case"above":t=e.scroll.center,r=e.scroll.above,n=1}var h=_$.screenHeight/2,f=0;if(x=0,r.hasOwnProperty("y")){var l=(r.y-t.y)*s,d=n*(l/h);f=d*o+e.scroll.center.y*s}if(r.hasOwnProperty("x")){var l=(r.x-t.x)*c,d=n*l/h;x=d*o+e.scroll.center.x*c}return{x:x,y:f}},_$.addUpdate(e.update,e.draw),e};