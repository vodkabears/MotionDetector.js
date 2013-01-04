#MotionDetector.js

##Demos and examples

[Colormotion](http://vodkabears.github.com/colormotion/)<br />
[Sensitive particles](http://vodkabears.github.com/sensitive-particles/)

##Using

###Creating an object
------------------
To start working you need to create motion detector object:<br/>
```js
var md = new MotionDetector(document.getElementById('video'), document.getElementById('output'));
```
Here you are calling constructor with 2 parameters: HTML5VideoObject for input stream and HTML5 Canvas Object for drawing processed data.
Second parameter is not required.

###Update
---------
On each frame you need to update motion detector, which captures current picture of frame, compares with a last and draws motion data into output canvas element.<br/>
```js
md.update();
```
By default picture of motions will be black and white. White pixel - motion was, black pixel - no motion.<br/>

###setColor method
---------------------------
You can easily add color to a motion picture with a help of setColor method, which takes 2 parameteres.
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
Handle motion in each pixel.
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
Handle inaction in each pixel.
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
By default motion detector on each update clear canvas by calling clearRect method.
You can set motion detector behavior on each update to your notice.<br/>
Example:
```js
md.onUpdate = function(ctx){
	ctx.fillStyle = 'rgba(180, 180, 180, 0.1)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};
```

###checkArea method
----------------
Chech rectangle area for motion.
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
Return average of motion into rectangle area.<br/>
Example(same as example of checkArea method):
```js
if(md.getMotionAverage(0, 0, 50, 50) > 100){
	alert('Motion!');
}
```

###getBlended method
-----------------
To get an image object of black and white motion data, call getBlended method.
```js
md.getBlended();
```