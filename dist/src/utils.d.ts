export declare namespace WebGLHelper {
    enum EShaderType {
        VS_SHADER = 0,
        FS_SHADER = 1
    }
    function getWebglContext(canvas: HTMLCanvasElement, options?: {
        preserveDrawingBuffer?: true;
    }): WebGL2RenderingContext | null;
    function createShader(gl: WebGL2RenderingContext, type: EShaderType): WebGLShader;
    function compileShader(gl: WebGL2RenderingContext, code: string, shader: WebGLShader): boolean;
    function createProgram(gl: WebGL2RenderingContext): WebGLProgram;
    function linkProgram(gl: WebGL2RenderingContext, program: WebGLProgram, vsShader: WebGLShader, fsShader: WebGLShader, beforeProgramLink?: ((gl: WebGL2RenderingContext, program: WebGLProgram) => void) | null, afterProgramLink?: ((gl: WebGL2RenderingContext, program: WebGLProgram) => void) | null): boolean;
    function createBuffer(gl: WebGL2RenderingContext): WebGLBuffer;
    class GLAttributeInfo {
        size: number;
        type: number;
        loc: number;
        constructor(size: number, type: number, loc: number);
    }
    type GLAttributeMap = Map<string, GLAttributeInfo>;
    type GLUniformMap = Map<string, GLUniformInfo>;
    class GLUniformInfo {
        size: number;
        type: number;
        loc: WebGLUniformLocation;
        constructor(size: number, type: number, loc: WebGLUniformLocation);
        static getProgramActiveAttributes(gl: WebGL2RenderingContext, program: WebGLProgram, out: GLAttributeMap): void;
        static getProgramActiveUniforms(gl: WebGL2RenderingContext, program: WebGLProgram, out: GLUniformMap): void;
    }
}
