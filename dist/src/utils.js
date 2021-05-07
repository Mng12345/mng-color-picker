"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGLHelper = void 0;
var WebGLHelper;
(function (WebGLHelper) {
    var EShaderType;
    (function (EShaderType) {
        EShaderType[EShaderType["VS_SHADER"] = 0] = "VS_SHADER";
        EShaderType[EShaderType["FS_SHADER"] = 1] = "FS_SHADER";
    })(EShaderType = WebGLHelper.EShaderType || (WebGLHelper.EShaderType = {}));
    function getWebglContext(canvas, options) {
        if (!options) {
            return (canvas.getContext('webgl') ||
                canvas.getContext('experimental-webgl'));
        }
        else {
            return (canvas.getContext('webgl', options) ||
                canvas.getContext('experimental-webgl', options));
        }
    }
    WebGLHelper.getWebglContext = getWebglContext;
    function createShader(gl, type) {
        var shader = null;
        if (type === EShaderType.VS_SHADER) {
            shader = gl.createShader(gl.VERTEX_SHADER);
        }
        else {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        }
        if (shader === null) {
            throw new Error("\u521B\u5EFAWebGLShader\u5931\u8D25");
        }
        return shader;
    }
    WebGLHelper.createShader = createShader;
    function compileShader(gl, code, shader) {
        gl.shaderSource(shader, code);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) === false) {
            console.log("\u7F16\u8BD1\u9519\u8BEF:", gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return false;
        }
        return true;
    }
    WebGLHelper.compileShader = compileShader;
    function createProgram(gl) {
        var program = gl.createProgram();
        if (program === null) {
            throw new Error("WebGLProgram\u521B\u5EFA\u5931\u8D25");
        }
        return program;
    }
    WebGLHelper.createProgram = createProgram;
    function linkProgram(gl, program, vsShader, fsShader, beforeProgramLink, afterProgramLink) {
        if (beforeProgramLink === void 0) { beforeProgramLink = null; }
        if (afterProgramLink === void 0) { afterProgramLink = null; }
        gl.attachShader(program, vsShader);
        gl.attachShader(program, fsShader);
        if (beforeProgramLink) {
            beforeProgramLink(gl, program);
        }
        gl.linkProgram(program);
        if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
            console.log("link program\u51FA\u932F\uFF1A", gl.getProgramInfoLog(program));
            gl.deleteShader(vsShader);
            gl.deleteShader(fsShader);
            gl.deleteProgram(program);
            return false;
        }
        gl.validateProgram(program);
        if (gl.getProgramParameter(program, gl.VALIDATE_STATUS) === false) {
            console.log("\u9A8C\u8BC1\u7A0B\u5E8F\u5931\u8D25:", gl.getProgramInfoLog(program));
            gl.deleteShader(vsShader);
            gl.deleteShader(fsShader);
            gl.deleteProgram(program);
            return false;
        }
        if (afterProgramLink) {
            afterProgramLink(gl, program);
        }
        return true;
    }
    WebGLHelper.linkProgram = linkProgram;
    function createBuffer(gl) {
        var buffer = gl.createBuffer();
        if (buffer === null) {
            throw new Error("\u521B\u5EFAWebGLBuffer\u5931\u8D25");
        }
        return buffer;
    }
    WebGLHelper.createBuffer = createBuffer;
    var GLAttributeInfo = /** @class */ (function () {
        function GLAttributeInfo(size, type, loc) {
            this.size = size;
            this.type = type;
            this.loc = loc;
        }
        return GLAttributeInfo;
    }());
    WebGLHelper.GLAttributeInfo = GLAttributeInfo;
    var GLUniformInfo = /** @class */ (function () {
        function GLUniformInfo(size, type, loc) {
            this.size = size;
            this.type = type;
            this.loc = loc;
        }
        GLUniformInfo.getProgramActiveAttributes = function (gl, program, out) {
            var attributesCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
            for (var i = 0; i < attributesCount; i++) {
                var info = gl.getActiveAttrib(program, i);
                if (info) {
                    out.set(info.name, new GLAttributeInfo(info.size, info.type, gl.getAttribLocation(program, info.name)));
                }
            }
        };
        GLUniformInfo.getProgramActiveUniforms = function (gl, program, out) {
            var uniformsCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
            for (var i = 0; i < uniformsCount; i++) {
                var info = gl.getActiveUniform(program, i);
                if (info) {
                    var loc = gl.getUniformLocation(program, info.name);
                    if (loc) {
                        out.set(info.name, new GLUniformInfo(info.size, info.type, loc));
                    }
                }
            }
        };
        return GLUniformInfo;
    }());
    WebGLHelper.GLUniformInfo = GLUniformInfo;
})(WebGLHelper = exports.WebGLHelper || (exports.WebGLHelper = {}));
