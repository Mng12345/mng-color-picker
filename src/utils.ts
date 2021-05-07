export namespace WebGLHelper {
  export enum EShaderType {
    VS_SHADER,
    FS_SHADER,
  }

  export function getWebglContext(
    canvas: HTMLCanvasElement,
    options?: { preserveDrawingBuffer?: true }
  ): WebGL2RenderingContext | null {
    if (!options) {
      return (canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')) as WebGL2RenderingContext
    } else {
      return (canvas.getContext('webgl', options) ||
        canvas.getContext(
          'experimental-webgl',
          options
        )) as WebGL2RenderingContext
    }
  }

  export function createShader(
    gl: WebGL2RenderingContext,
    type: EShaderType
  ): WebGLShader {
    let shader: WebGLShader | null = null
    if (type === EShaderType.VS_SHADER) {
      shader = gl.createShader(gl.VERTEX_SHADER)
    } else {
      shader = gl.createShader(gl.FRAGMENT_SHADER)
    }
    if (shader === null) {
      throw new Error(`创建WebGLShader失败`)
    }
    return shader
  }

  export function compileShader(
    gl: WebGL2RenderingContext,
    code: string,
    shader: WebGLShader
  ): boolean {
    gl.shaderSource(shader, code)
    gl.compileShader(shader)
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) === false) {
      console.log(`编译错误:`, gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return false
    }
    return true
  }

  export function createProgram(gl: WebGL2RenderingContext): WebGLProgram {
    let program: WebGLProgram | null = gl.createProgram()
    if (program === null) {
      throw new Error(`WebGLProgram创建失败`)
    }
    return program
  }

  export function linkProgram(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    vsShader: WebGLShader,
    fsShader: WebGLShader,
    beforeProgramLink:
      | ((gl: WebGL2RenderingContext, program: WebGLProgram) => void)
      | null = null,
    afterProgramLink:
      | ((gl: WebGL2RenderingContext, program: WebGLProgram) => void)
      | null = null
  ): boolean {
    gl.attachShader(program, vsShader)
    gl.attachShader(program, fsShader)
    if (beforeProgramLink) {
      beforeProgramLink(gl, program)
    }
    gl.linkProgram(program)
    if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
      console.log(`link program出錯：`, gl.getProgramInfoLog(program))
      gl.deleteShader(vsShader)
      gl.deleteShader(fsShader)
      gl.deleteProgram(program)
      return false
    }
    gl.validateProgram(program)
    if (gl.getProgramParameter(program, gl.VALIDATE_STATUS) === false) {
      console.log(`验证程序失败:`, gl.getProgramInfoLog(program))
      gl.deleteShader(vsShader)
      gl.deleteShader(fsShader)
      gl.deleteProgram(program)
      return false
    }
    if (afterProgramLink) {
      afterProgramLink(gl, program)
    }
    return true
  }

  export function createBuffer(gl: WebGL2RenderingContext): WebGLBuffer {
    let buffer: WebGLBuffer | null = gl.createBuffer()
    if (buffer === null) {
      throw new Error(`创建WebGLBuffer失败`)
    }
    return buffer
  }

  export class GLAttributeInfo {
    public constructor(
      public size: number,
      public type: number,
      public loc: number
    ) {}
  }

  export type GLAttributeMap = Map<string, GLAttributeInfo>
  export type GLUniformMap = Map<string, GLUniformInfo>

  export class GLUniformInfo {
    constructor(
      public size: number,
      public type: number,
      public loc: WebGLUniformLocation
    ) {}

    static getProgramActiveAttributes(
      gl: WebGL2RenderingContext,
      program: WebGLProgram,
      out: GLAttributeMap
    ): void {
      const attributesCount = gl.getProgramParameter(
        program,
        gl.ACTIVE_ATTRIBUTES
      )
      for (let i = 0; i < attributesCount; i++) {
        const info = gl.getActiveAttrib(program, i)
        if (info) {
          out.set(
            info.name,
            new GLAttributeInfo(
              info.size,
              info.type,
              gl.getAttribLocation(program, info.name)
            )
          )
        }
      }
    }

    static getProgramActiveUniforms(
      gl: WebGL2RenderingContext,
      program: WebGLProgram,
      out: GLUniformMap
    ): void {
      const uniformsCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
      for (let i = 0; i < uniformsCount; i++) {
        const info = gl.getActiveUniform(program, i)
        if (info) {
          const loc = gl.getUniformLocation(program, info.name)
          if (loc) {
            out.set(info.name, new GLUniformInfo(info.size, info.type, loc))
          }
        }
      }
    }
  }
}
