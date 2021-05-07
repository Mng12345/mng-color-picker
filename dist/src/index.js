"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorPicker = void 0;
var utils_1 = require("./utils");
var EShaderType = utils_1.WebGLHelper.EShaderType;
var mng_easy_util_1 = require("mng-easy-util");
var lodash_1 = require("lodash");
var ColorPicker;
(function (ColorPicker) {
    var currColor = mng_easy_util_1.pointer.Pointer.empty();
    var parseColor = function (color) {
        var colorNumber = mng_easy_util_1.math.parseHexColorToNumber(color);
        if (isNaN(colorNumber)) {
            throw new Error("color[" + color + "]\u7684\u683C\u5F0F\u5FC5\u987B\u4E3A0x...,\u5982[0x7cb305]");
        }
        var colorValues = mng_easy_util_1.math.convertColorToHexNumberArray(colorNumber);
        var r = (colorValues[0] * 16 + colorValues[1]) / 255;
        var g = (colorValues[2] * 16 + colorValues[3]) / 255;
        var b = (colorValues[4] * 16 + colorValues[5]) / 255;
        var a = 1.0;
        return { r: r, g: g, b: b, a: a };
    };
    var drawSelectedPoint = function (gl, points) {
        var VSHADER_SOURCE = "\n    attribute vec3 aPosition;\n    attribute float aSize;\n    attribute vec3 aColor;\n    varying vec4 vColor;\n    void main() {\n      gl_Position = vec4(aPosition, 1.0);\n      gl_PointSize = aSize;\n      vColor = vec4(aColor, 1.0);\n    }\n  ";
        var FSHADER_SOURCE = "\n    #ifdef GL_ES\n      precision highp float;\n    #endif\n    varying vec4 vColor;\n    void main() {\n      gl_FragColor = vColor;\n    }\n  ";
        var vsShader = utils_1.WebGLHelper.createShader(gl, EShaderType.VS_SHADER);
        utils_1.WebGLHelper.compileShader(gl, VSHADER_SOURCE, vsShader);
        var fsShader = utils_1.WebGLHelper.createShader(gl, EShaderType.FS_SHADER);
        utils_1.WebGLHelper.compileShader(gl, FSHADER_SOURCE, fsShader);
        var program = utils_1.WebGLHelper.createProgram(gl);
        utils_1.WebGLHelper.linkProgram(gl, program, vsShader, fsShader);
        gl.useProgram(program);
        var glAttributeMap = new Map();
        var glUniformMap = new Map();
        utils_1.WebGLHelper.GLUniformInfo.getProgramActiveAttributes(gl, program, glAttributeMap);
        utils_1.WebGLHelper.GLUniformInfo.getProgramActiveUniforms(gl, program, glUniformMap);
        var buffer = utils_1.WebGLHelper.createBuffer(gl);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        var verts = new Float32Array(points.length * 8);
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            verts[i * 8] = point.x;
            verts[i * 8 + 1] = point.y;
            verts[i * 8 + 2] = point.z;
            verts[i * 8 + 3] = point.r;
            verts[i * 8 + 4] = point.g;
            verts[i * 8 + 5] = point.b;
            verts[i * 8 + 6] = point.a;
            verts[i * 8 + 7] = point.size;
        }
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
        gl.vertexAttribPointer(glAttributeMap.get('aPosition').loc, 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 8, 0);
        gl.vertexAttribPointer(glAttributeMap.get('aColor').loc, 4, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 8, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.vertexAttribPointer(glAttributeMap.get('aSize').loc, 1, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 8, 7 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(glAttributeMap.get('aPosition').loc);
        gl.enableVertexAttribArray(glAttributeMap.get('aColor').loc);
        gl.enableVertexAttribArray(glAttributeMap.get('aSize').loc);
        gl.drawArrays(gl.POINTS, 0, 2);
        gl.useProgram(null);
        gl.disableVertexAttribArray(glAttributeMap.get('aPosition').loc);
        gl.disableVertexAttribArray(glAttributeMap.get('aColor').loc);
        gl.disableVertexAttribArray(glAttributeMap.get('aSize').loc);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.deleteShader(vsShader);
        gl.deleteShader(fsShader);
        gl.deleteProgram(program);
        gl.deleteBuffer(buffer);
    };
    var drawBackground = function (canvas, initColor) {
        var gl = utils_1.WebGLHelper.getWebglContext(canvas, {
            preserveDrawingBuffer: true,
        });
        if (!gl) {
            throw new Error("\u4E0D\u652F\u6301webgl");
        }
        var VSHADER_SOURCE = "\n    attribute vec3 aPosition;\n    attribute vec4 aColor;\n    varying vec4 vColor;\n    void main() {\n      gl_Position = vec4(aPosition, 1.0);\n      gl_PointSize = 5.0;\n      vColor = aColor;\n    }\n  ";
        var FSHADER_SOURCE = "\n    #ifdef GL_ES\n      precision highp float;\n    #endif\n    varying vec4 vColor;\n    void main() {\n      gl_FragColor = vColor;\n    }\n  ";
        var vsShader = utils_1.WebGLHelper.createShader(gl, EShaderType.VS_SHADER);
        utils_1.WebGLHelper.compileShader(gl, VSHADER_SOURCE, vsShader);
        var fsShader = utils_1.WebGLHelper.createShader(gl, EShaderType.FS_SHADER);
        utils_1.WebGLHelper.compileShader(gl, FSHADER_SOURCE, fsShader);
        var program = utils_1.WebGLHelper.createProgram(gl);
        utils_1.WebGLHelper.linkProgram(gl, program, vsShader, fsShader);
        gl.useProgram(program);
        var glAttributeMap = new Map();
        var glUniformMap = new Map();
        utils_1.WebGLHelper.GLUniformInfo.getProgramActiveAttributes(gl, program, glAttributeMap);
        utils_1.WebGLHelper.GLUniformInfo.getProgramActiveUniforms(gl, program, glUniformMap);
        gl.clearColor(0.0, 0.0, 1.0, 0.5);
        gl.clear(gl.COLOR_BUFFER_BIT);
        var buffer = utils_1.WebGLHelper.createBuffer(gl);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        var verts = new Float32Array([
            // 右边的三角形
            -1.0,
            1.0,
            0,
            initColor.r,
            initColor.g,
            initColor.b,
            1,
            1.0,
            1.0,
            0,
            1,
            1,
            1,
            1,
            1.0,
            -1.0,
            0,
            0,
            0,
            0,
            1,
            // // 左边的三角形
            -1.0,
            1.0,
            0,
            initColor.r,
            initColor.g,
            initColor.b,
            1,
            1.0,
            -1.0,
            0,
            0,
            0,
            0,
            1,
            -1.0,
            -1.0,
            0,
            0,
            0,
            0,
            1, // 左下 xyzrgba 黑
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
        // 指定attribute变量和buffer中的数据关联方式
        gl.vertexAttribPointer(glAttributeMap.get('aPosition').loc, 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 7, 0);
        gl.vertexAttribPointer(glAttributeMap.get('aColor').loc, 4, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 7, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(glAttributeMap.get('aPosition').loc);
        gl.enableVertexAttribArray(glAttributeMap.get('aColor').loc);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.useProgram(null);
        gl.disableVertexAttribArray(glAttributeMap.get('aPosition').loc);
        gl.disableVertexAttribArray(glAttributeMap.get('aColor').loc);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.deleteShader(vsShader);
        gl.deleteShader(fsShader);
        gl.deleteProgram(program);
        gl.deleteBuffer(buffer);
    };
    var bindClickToColorBar = function (_a) {
        var gl = _a.gl, canvas = _a.canvas, onSelectedColor = _a.onSelectedColor;
        var mouseDownEvent = function (ev) {
            drawColorBar(canvas);
            var rect = canvas.getBoundingClientRect();
            var x = ev.clientX - rect.left;
            var y = ev.clientY - rect.top;
            var pixels = new Uint8Array(4);
            gl.readPixels(x, Math.ceil(rect.height / 2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            drawSelectedPoint(gl, [
                {
                    x: (x - canvas.width / 2) / (canvas.width / 2),
                    y: 0,
                    z: 0.0,
                    r: 161 / 255,
                    g: 56 / 255,
                    b: 8 / 255,
                    a: 1.0,
                    size: canvas.height,
                },
                {
                    x: (x - canvas.width / 2) / (canvas.width / 2),
                    y: 0,
                    z: 0.0,
                    r: pixels[0] / 255,
                    g: pixels[1] / 255,
                    b: pixels[2] / 255,
                    a: pixels[3] / 255,
                    size: canvas.height - 3,
                },
            ]);
            onSelectedColor({
                r: pixels[0] / 255,
                g: pixels[1] / 255,
                b: pixels[2] / 255,
                a: pixels[3] / 255,
            });
        };
        canvas.addEventListener('mousedown', mouseDownEvent);
    };
    var bindClickToBg = function (_a) {
        var gl = _a.gl, canvas = _a.canvas, onSelectedColor = _a.onSelectedColor;
        var mouseDownEvent = function (ev) {
            drawBackground(canvas, currColor.get());
            var rect = canvas.getBoundingClientRect();
            var x = ev.clientX - rect.left;
            var y = ev.clientY - rect.top;
            var pixels = new Uint8Array(4);
            gl.readPixels(x, canvas.height - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            drawSelectedPoint(gl, [
                {
                    x: (x - canvas.width / 2) / (canvas.width / 2),
                    y: (canvas.height / 2 - y) / (canvas.height / 2),
                    z: 0.0,
                    r: 1.0,
                    g: 1.0,
                    b: 1.0,
                    a: 1.0,
                    size: 10,
                },
                {
                    x: (x - canvas.width / 2) / (canvas.width / 2),
                    y: (canvas.height / 2 - y) / (canvas.height / 2),
                    z: 0.0,
                    r: pixels[0] / 255,
                    g: pixels[1] / 255,
                    b: pixels[2] / 255,
                    a: pixels[3] / 255,
                    size: 6,
                },
            ]);
            onSelectedColor({
                r: pixels[0] / 255,
                g: pixels[1] / 255,
                b: pixels[2] / 255,
                a: pixels[3] / 255,
            });
        };
        canvas.addEventListener('mousedown', mouseDownEvent);
    };
    var drawColorBar = function (canvas) {
        canvas.style['cursor'] = 'pointer';
        var gl = utils_1.WebGLHelper.getWebglContext(canvas, {
            preserveDrawingBuffer: true,
        });
        if (!gl) {
            throw new Error("\u4E0D\u652F\u6301webgl");
        }
        var VSHADER_SOURCE = "\n      attribute vec3 aPosition;\n      attribute vec4 aColor;\n      varying vec4 vColor;\n      void main() {\n        gl_Position = vec4(aPosition, 1.0);\n        gl_PointSize = 10.0;\n        vColor = aColor;\n      }\n    ";
        var FSHADER_SOURCE = "\n      #ifdef GL_ES\n        precision highp float;\n      #endif\n      varying vec4 vColor;\n      void main() {\n        gl_FragColor = vColor;\n      }\n    ";
        var vsShader = utils_1.WebGLHelper.createShader(gl, EShaderType.VS_SHADER);
        utils_1.WebGLHelper.compileShader(gl, VSHADER_SOURCE, vsShader);
        var fsShader = utils_1.WebGLHelper.createShader(gl, EShaderType.FS_SHADER);
        utils_1.WebGLHelper.compileShader(gl, FSHADER_SOURCE, fsShader);
        var program = utils_1.WebGLHelper.createProgram(gl);
        utils_1.WebGLHelper.linkProgram(gl, program, vsShader, fsShader);
        gl.useProgram(program);
        var glAttributeMap = new Map();
        var glUniformMap = new Map();
        utils_1.WebGLHelper.GLUniformInfo.getProgramActiveAttributes(gl, program, glAttributeMap);
        utils_1.WebGLHelper.GLUniformInfo.getProgramActiveUniforms(gl, program, glUniformMap);
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        var buffer = utils_1.WebGLHelper.createBuffer(gl);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        var colors = [
            '#ff7875',
            '#ff9c6e',
            '#ffc069',
            '#ffd666',
            '#fff566',
            '#d3f261',
            '#95de64',
            '#5cdbd3',
            '#69c0ff',
            '#85a5ff',
            '#b37feb',
            '#ff85c0',
        ].map(function (color) { return "0x" + color.replace('#', ''); });
        var points = colors.map(function (color, index) {
            var colorValues = mng_easy_util_1.math.convertColorToHexNumberArray(mng_easy_util_1.math.parseHexColorToNumber(color));
            var r = (colorValues[0] * 16 + colorValues[1]) / 255;
            var g = (colorValues[2] * 16 + colorValues[3]) / 255;
            var b = (colorValues[4] * 16 + colorValues[5]) / 255;
            var a = 1;
            var x = ((index / (colors.length - 1)) * canvas.width - canvas.width / 2) /
                (canvas.width / 2);
            var y = 0;
            var z = 0;
            var size = 1;
            return {
                r: r,
                g: g,
                b: b,
                a: a,
                x: x,
                y: y,
                z: z,
                size: size,
            };
        });
        // 将这些points组合成三角形
        var trianglePoints = [];
        for (var i = 0; i < points.length - 1; i++) {
            var point1 = __assign(__assign({}, points[i]), { y: 1 });
            var point2 = __assign(__assign({}, points[i]), { y: -1 });
            var point3 = __assign(__assign({}, points[i + 1]), { y: 1 });
            var point4 = __assign(__assign({}, points[i + 1]), { y: -1 });
            trianglePoints.push(point1, point3, point4, point1, point4, point2);
        }
        var verts = new Float32Array(lodash_1.flatten(trianglePoints.map(function (point) { return [
            point.x,
            point.y,
            point.z,
            point.r,
            point.g,
            point.b,
            point.a,
        ]; })));
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
        gl.vertexAttribPointer(glAttributeMap.get('aPosition').loc, 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 7, 0);
        gl.vertexAttribPointer(glAttributeMap.get('aColor').loc, 4, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 7, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(glAttributeMap.get('aPosition').loc);
        gl.enableVertexAttribArray(glAttributeMap.get('aColor').loc);
        gl.drawArrays(gl.TRIANGLES, 0, trianglePoints.length);
        gl.useProgram(null);
        gl.disableVertexAttribArray(glAttributeMap.get('aPosition').loc);
        gl.disableVertexAttribArray(glAttributeMap.get('aColor').loc);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.deleteShader(vsShader);
        gl.deleteShader(fsShader);
        gl.deleteProgram(program);
        gl.deleteBuffer(buffer);
    };
    ColorPicker.init = function (_a) {
        var rootElement = _a.rootElement, _b = _a.width, width = _b === void 0 ? 200 : _b, _c = _a.initColor, initColor = _c === void 0 ? '0xff0000' : _c, _d = _a.onSelectedColor, onSelectedColor = _d === void 0 ? function () { } : _d, _e = _a.backgroundColor, backgroundColor = _e === void 0 ? '#893533' : _e;
        var backgroundWidth = width - (2 * width) / 20;
        var backgroundHeight = width - (2 * width) / 20;
        var colorBarWidth = width - (2 * width) / 20;
        var colorBarHeight = width / 10;
        currColor.assign(parseColor(initColor));
        var container = document.createElement('div');
        container.style['width'] = width + "px";
        container.style['display'] = 'flex';
        container.style['flexDirection'] = 'column';
        container.style['alignItems'] = 'center';
        container.style['background'] = backgroundColor;
        container.style['borderRadius'] = backgroundWidth / 15 + "px";
        container.style['paddingTop'] = width / 20 + "px";
        container.style['paddingBottom'] = width / 20 + "px";
        var backgroundCanvas = document.createElement('canvas');
        backgroundCanvas.style['cursor'] = 'pointer';
        backgroundCanvas.width = backgroundWidth;
        backgroundCanvas.height = backgroundHeight;
        drawBackground(backgroundCanvas, currColor.get());
        bindClickToBg({
            gl: utils_1.WebGLHelper.getWebglContext(backgroundCanvas, { preserveDrawingBuffer: true }),
            canvas: backgroundCanvas,
            onSelectedColor: function (color) {
                onSelectedColor(color);
            },
        });
        var colorBarCanvas = document.createElement('canvas');
        colorBarCanvas.width = colorBarWidth;
        colorBarCanvas.height = colorBarHeight;
        colorBarCanvas.style['marginTop'] = width / 20 + "px";
        drawColorBar(colorBarCanvas);
        bindClickToColorBar({
            gl: utils_1.WebGLHelper.getWebglContext(colorBarCanvas, {
                preserveDrawingBuffer: true,
            }),
            canvas: colorBarCanvas,
            onSelectedColor: function (color) {
                currColor.assign(color);
                drawBackground(backgroundCanvas, color);
            },
        });
        rootElement.innerHTML = '';
        rootElement.appendChild(container);
        container.appendChild(backgroundCanvas);
        container.appendChild(colorBarCanvas);
    };
})(ColorPicker = exports.ColorPicker || (exports.ColorPicker = {}));
