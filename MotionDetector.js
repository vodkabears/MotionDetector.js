/*!
 * MotionDetector.js v1.0
 * https://github.com/VodkaBears/motiondetector.js
 *
 * By VodkaBears(https://github.com/VodkaBears)
 *
 * Released under the MIT license
*/

/**
 * @constructor
 * @param {Object} video - video element
 * @param {Object} output - canvas element for output motion data
 */
function MotionDetector(video, output) {
    "use strict";
    var self = this;

    var sourceData, lastImageData,
        canvasSource, canvasBlended,
        contextSource, contextBlended,
        blended, coloredBlended,
        width, height;

    var color = {
        difference:{
            r: 255,
            g: 255,
            b: 255,
            a: 255
        },
        similarity:{
            r: 0,
            g: 0,
            b: 0,
            a: 255
        }
    };

    /**
     * Binary abs function.
     *
     * @private
     * @param {Number} value
     * @return {Number}
     */
    var abs = function (value) {
        return (value ^ (value >> 31)) - (value >> 31);
    };

    /**
     * Binary round function.
     * @private
     * @param {Number} value
     * @return {Number}
     */
    var round = function(value){
        return (0.5 + value) << 0;
    };

    /**
     * Calculate difference between 2 images and create blended data.
     *
     * @private
     */
    var difference = function () {
        var target = blended.data,
            data1 = sourceData.data,
            data2 = lastImageData.data,
            e;

        if (data1.length != data2.length)
            return;
        for (var i = 0, len = data1.length * 0.25, average1, average2, diff; i < len; i++) {
            average1 = (data1[4 * i] + data1[4 * i + 1] + data1[4 * i + 2]) / 3;
            average2 = (data2[4 * i] + data2[4 * i + 1] + data2[4 * i + 2]) / 3;
            diff = abs(average1 - average2) > 0x30 ? 0xFF : 0;
            target[4 * i] = diff;
            target[4 * i + 1] = diff;
            target[4 * i + 2] = diff;
            target[4 * i + 3] = 0xFF;

            if(contextBlended){
                var colored = coloredBlended.data;

                if(diff === 0xFF){
                    colored[4 * i] = color.difference.r;
                    colored[4 * i + 1] = color.difference.g;
                    colored[4 * i + 2] = color.difference.b;
                    colored[4 * i + 3] = color.difference.a;

                    if(self.onDifference){
                        e = {};
                        e.i = i;
                        e.y = ~~(i / width);
                        e.x = i - e.y * width;
                        self.onDifference(contextBlended, e);
                    }
                } else {
                    colored[4 * i] = color.similarity.r;
                    colored[4 * i + 1] = color.similarity.g;
                    colored[4 * i + 2] = color.similarity.b;
                    colored[4 * i + 3] = color.similarity.a;

                    if(self.onSimilarity){
                        e = {};
                        e.i = i;
                        e.y = ~~(i / width);
                        e.x = i - e.y * width;
                        self.onSimilarity(contextBlended, e);
                    }
                }
            }
        }
    };

    /**
     * Blend previous and new frame.
     *
     * @private
     */
    var blend = function () {
        sourceData = contextSource.getImageData(0, 0, width, height);
        if (!lastImageData) {
            lastImageData = contextSource.getImageData(0, 0, width, height);
        }
        blended = contextSource.createImageData(width, height);
        if(contextBlended){
            coloredBlended = contextBlended.createImageData(width, height);
        }

        difference();

        if(contextBlended && !(self.onDifference || self.onSimilarity)){
            contextBlended.putImageData(coloredBlended, 0, 0);
        }

        lastImageData = sourceData;
    };

    /**
     * DOM initialization
     *
     * @private
     */
    var initDOM = function () {
        if (video.width * video.height === 0) {
            video.width = 640;
            video.height = 480;
        }
        width = video.width;
        height = video.height;

        canvasSource = document.createElement('canvas');
        contextSource = canvasSource.getContext('2d');
        canvasSource.width = width;
        canvasSource.height = height;

        if (output) {
            canvasBlended = output;
            contextBlended = canvasBlended.getContext('2d');
            canvasBlended.width = width;
            canvasBlended.height = height;
        }
    };

    /**
     * Local constructor.
     *
     * @private
     */
    var constructor = function () {
        initDOM();

        contextSource.translate(canvasSource.width, 0);
        contextSource.scale(-1, 1);
    };

    //public

    /**
     * Update data.
     *
     * @public
     */
    self.update = function () {
        contextSource.drawImage(video, 0, 0, video.width, video.height);
        if(contextBlended){
            if(!self.onUpdate){
                contextBlended.clearRect(0, 0, canvasBlended.width, canvasBlended.height);
            } else {
                self.onUpdate(contextBlended);
            }
        }
        blend();
    };

    /**
     * Get blended data.
     *
     * @public
     * @return {Array}
     */
    self.getBlended = function () {
        return blended;
    };

    /**
     * Get average of blended data in rectangle area.
     *
     * @public
     * @param {Number} x - x coordinate of top-left corner of a rectangle
     * @param {Number} y - y coordinate of top-left corner of a rectangle
     * @param {Number} w - width of a rectangle
     * @param {Number} h - height of a rectangle
     * @param {Number} step - step of checking. Default is 1.
     * @return {Number} Average
     */
    self.getMotionAverage = function(x, y, w, h, step){
        var average = 0;
        var blendedData = blended.data;
        step = step || 1;

        for (var i = ~~y, yk = ~~(y + h); i < yk; i += step) {
            for (var j = ~~x, xk = ~~(x + w), b; j < xk; j += step) {
                b = ~~(j * 4 + i * width * 4);
                average += (blendedData[b] + blendedData[b + 1] + blendedData[b + 2]) / 3;
            }
        }

        return round(average / ( (w / step) * (h / step) ));
    };

    /**
     * Chech rectangle area for motion.
     *
     * @public
     * @param {Number} x - x coordinate of top-left corner of a rectangle
     * @param {Number} y - y coordinate of top-left corner of a rectangle
     * @param {Number} w - width of a rectangle
     * @param {Number} h - height of a rectangle
     * @param {Number} step - step of checking. Default is 1.
     * @return {Boolean}
     */
    self.checkArea = function (x, y, w, h, step) {
        return self.getMotionAverage(x, y, w, h, step) > 100;
    };

    /**
     * Set color of blended data.
     *
     * @public
     * @param {Object} differenceRGBA - r,g,b,a values for difference
     * @param {Object} similarityRGBA - r,g,b,a values for similarity
     */
    self.setColor = function(differenceRGBA, similarityRGBA){
        color.difference.r = differenceRGBA.r;
        color.difference.g = differenceRGBA.g;
        color.difference.b = differenceRGBA.b;
        color.difference.a = differenceRGBA.a;

        color.similarity.r = similarityRGBA.r;
        color.similarity.g = similarityRGBA.g;
        color.similarity.b = similarityRGBA.b;
        color.similarity.a = similarityRGBA.a;

        return this;
    };

    /**
     * Event handler of a difference for each pixel.
     *
     * Using:
     * motionDetector.onDifference = function(blendedCtx, e){
     *      blendedCtx.save();
     *      blendedCtx.fillStyle = '#ff0000';
     *      blendedCtx.beginPath();
     *      blendedCtx.arc(e.x, e.y, 10, 2 * Math.PI, false);
     *      blendedCtx.closePath();
     *      blendedCtx.fill();
     *      blendedCtx.restore();
     * };
     */
    self.onDifference = null;

    /**
     * Event handler of similarity for each pixel.
     *
     * Using:
     * motionDetector.onSimilarity = function(blendedCtx, e){
     *      blendedCtx.save();
     *      blendedCtx.fillStyle = '#000000';
     *      blendedCtx.fillRect(e.x, e.y, 1, 1);
     *      blendedCtx.restore();
     * };
     */
    self.onSimilarity = null;

    /**
     * Event handler on update of motion detector.
     *
     * Using:
     * motionDetector.onUpdate = function(blendedCtx){     *
     *      blendedCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
     *      blendedCtx.fillRect(0, 0, blendedCtx.canvas.width, blendedCtx.canvas.height);
     * };
     */
    self.onUpdate = null;

    //calling local constructor
    constructor();
}
