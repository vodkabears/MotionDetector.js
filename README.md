#MotionDetector.js

##Demos and examples

[Colormotion](http://vodkabears.github.com/colormotion/)<br />
[Sensitive particles(Refactored now)](http://vodkabears.github.com/sensitive-particles/)

##Important note!
Before calling the update function in the first time, set some delay, it prevents NS_ERROR_NOT_AVAILABLE in Firefox.
```js
var animate = function(){
	motionDetector.update();
	requestAnimFrame(animate);
};

setTimeout(function () {
	animate();
}, 3000);
```

##Using

###Creating an object
------------------
To start working you need to create a motion detector object:<br/>
```js
var md = new MotionDetector(document.getElementById('video'), document.getElementById('output'));
```
Here you are calling the constructor with 2 parameters: HTML5VideoObject for an input stream and HTML5 Canvas Object for drawing processed data.
Second parameter is not required.

###Update
---------
On each frame you need to update a motion detector, which captures current picture of a frame, compares with a last and draws a motion data into output canvas element.<br/>
```js
md.update();
```
By default picture of motions will be black and white. White pixel - motion was, black pixel - no motion.<br/>

###setColor method
---------------------------
You can easily add a color to a motion picture with a help of a setColor method, which takes 2 parameteres.
First parameter is a color of pixel, where motion was.
Second parameter is a color of pixel, where motion wasn't.<br/>
Example:
```js
//color of pixel where motion was
var differenceRGBA = {
	r: 255,
	g: 0,
	b: 0,
	a: 0.5
}

//color of pixel where motion wasn't
var similarityRGBA = {
	r: 0,
	g: 0,
	b: 0,
	a: 1
}

md.setColor(differenceRGBA, similarityRGBA);
```
If you want to set more than just a color, use onDifference and onSimilarity handlers, you can read about it below.

###onDifference handler
-----------------------------
Handle a motion in each pixel.
Motion detector calls this handler with two parameters: first - context of output canvas element, second - coordinates of the pixel.<br/>
Example:
```js
md.onDifference = function(blendedCtx, e){
	blendedCtx.save();
	blendedCtx.fillStyle = '#ff0000';
	blendedCtx.beginPath();
	blendedCtx.arc(e.x, e.y, 10, 2 * Math.PI, false);
	blendedCtx.closePath();
	blendedCtx.fill();
	blendedCtx.restore();
};
```

###onSimilarity handler
-----------------------------
Handle an inaction in each pixel.
Motion detector calls this handler with two parameters: first - context of output canvas element, second - coordinates of the pixel.<br/>
Example:
```js
md.onSimilarity = function(blendedCtx, e){
	blendedCtx.save();
	blendedCtx.fillStyle = '#000000';
	blendedCtx.fillRect(e.x, e.y, 1, 1);
	blendedCtx.restore();
};
```

###onUpdate handler
-----------------
By default motion detector on each update clears a canvas by calling a clearRect method.
You can set a motion detector behavior on each update to your notice.<br/>
Example:
```js
md.onUpdate = function(ctx){
	ctx.fillStyle = 'rgba(180, 180, 180, 0.1)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};
```

###checkArea method
----------------
Check a rectangle area for a motion.
```js
md.checkArea(x, y, width, height [, step of checking]);
```
Example:
```js
if(md.checkArea(0, 0, 50, 50)){
	alert('Motion!');
}
```

###getMotionAverage method
------------------------
Return a motion average of a rectangle area.<br/>
Example(same as example of a checkArea method):
```js
if(md.getMotionAverage(0, 0, 50, 50) > 100){
	alert('Motion!');
}
```

###getBlended method
-----------------
To get an image object of a non-colored motion data, call 'getBlended' method.
```js
md.getBlended();
```
