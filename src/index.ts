import { WebGLHelper } from './utils'
import EShaderType = WebGLHelper.EShaderType
import { math, pointer } from 'mng-easy-util'
import { flatten } from 'lodash'

export namespace ColorPicker {
  type Point = {
    x: number
    y: number
    z: number
    r: number
    g: number
    b: number
    a: number
    size: number
  }
  export type Color = { r: number; g: number; b: number; a: number }
  export type OnSelectedColor = (selectedColor: Color) => void
  const currColor = pointer.Pointer.empty<Color>()
  const parseColor = (color: string): Color => {
    const colorNumber = math.parseHexColorToNumber(color)
    if (isNaN(colorNumber)) {
      throw new Error(`color[${color}]的格式必须为0x...,如[0x7cb305]`)
    }
    const colorValues = math.convertColorToHexNumberArray(colorNumber)
    const r = (colorValues[0] * 16 + colorValues[1]) / 255
    const g = (colorValues[2] * 16 + colorValues[3]) / 255
    const b = (colorValues[4] * 16 + colorValues[5]) / 255
    const a = 1.0
    return { r, g, b, a }
  }
  const drawSelectedPoint = (gl: WebGL2RenderingContext, points: Point[]) => {
    const VSHADER_SOURCE = `
    attribute vec3 aPosition;
    attribute float aSize;
    attribute vec3 aColor;
    varying vec4 vColor;
    void main() {
      gl_Position = vec4(aPosition, 1.0);
      gl_PointSize = aSize;
      vColor = vec4(aColor, 1.0);
    }
  `
    const FSHADER_SOURCE = `
    #ifdef GL_ES
      precision highp float;
    #endif
    varying vec4 vColor;
    void main() {
      gl_FragColor = vColor;
    }
  `
    const vsShader = WebGLHelper.createShader(gl, EShaderType.VS_SHADER)
    WebGLHelper.compileShader(gl, VSHADER_SOURCE, vsShader)
    const fsShader = WebGLHelper.createShader(gl, EShaderType.FS_SHADER)
    WebGLHelper.compileShader(gl, FSHADER_SOURCE, fsShader)
    const program = WebGLHelper.createProgram(gl)
    WebGLHelper.linkProgram(gl, program, vsShader, fsShader)
    gl.useProgram(program)
    const glAttributeMap = new Map<string, WebGLHelper.GLAttributeInfo>()
    const glUniformMap = new Map<string, WebGLHelper.GLUniformInfo>()
    WebGLHelper.GLUniformInfo.getProgramActiveAttributes(
      gl,
      program,
      glAttributeMap
    )
    WebGLHelper.GLUniformInfo.getProgramActiveUniforms(
      gl,
      program,
      glUniformMap
    )
    const buffer = WebGLHelper.createBuffer(gl)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    const verts = new Float32Array(points.length * 8)
    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      verts[i * 8] = point.x
      verts[i * 8 + 1] = point.y
      verts[i * 8 + 2] = point.z
      verts[i * 8 + 3] = point.r
      verts[i * 8 + 4] = point.g
      verts[i * 8 + 5] = point.b
      verts[i * 8 + 6] = point.a
      verts[i * 8 + 7] = point.size
    }
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
    gl.vertexAttribPointer(
      glAttributeMap.get('aPosition')!.loc,
      3,
      gl.FLOAT,
      false,
      Float32Array.BYTES_PER_ELEMENT * 8,
      0
    )
    gl.vertexAttribPointer(
      glAttributeMap.get('aColor')!.loc,
      4,
      gl.FLOAT,
      false,
      Float32Array.BYTES_PER_ELEMENT * 8,
      3 * Float32Array.BYTES_PER_ELEMENT
    )
    gl.vertexAttribPointer(
      glAttributeMap.get('aSize')!.loc,
      1,
      gl.FLOAT,
      false,
      Float32Array.BYTES_PER_ELEMENT * 8,
      7 * Float32Array.BYTES_PER_ELEMENT
    )
    gl.enableVertexAttribArray(glAttributeMap.get('aPosition')!.loc)
    gl.enableVertexAttribArray(glAttributeMap.get('aColor')!.loc)
    gl.enableVertexAttribArray(glAttributeMap.get('aSize')!.loc)
    gl.drawArrays(gl.POINTS, 0, 2)
    gl.useProgram(null)
    gl.disableVertexAttribArray(glAttributeMap.get('aPosition')!.loc)
    gl.disableVertexAttribArray(glAttributeMap.get('aColor')!.loc)
    gl.disableVertexAttribArray(glAttributeMap.get('aSize')!.loc)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.deleteShader(vsShader)
    gl.deleteShader(fsShader)
    gl.deleteProgram(program)
    gl.deleteBuffer(buffer)
  }
  const drawBackground = (canvas: HTMLCanvasElement, initColor: Color) => {
    const gl = WebGLHelper.getWebglContext(canvas, {
      preserveDrawingBuffer: true,
    })!
    if (!gl) {
      throw new Error(`不支持webgl`)
    }
    const VSHADER_SOURCE = `
    attribute vec3 aPosition;
    attribute vec4 aColor;
    varying vec4 vColor;
    void main() {
      gl_Position = vec4(aPosition, 1.0);
      gl_PointSize = 5.0;
      vColor = aColor;
    }
  `
    const FSHADER_SOURCE = `
    #ifdef GL_ES
      precision highp float;
    #endif
    varying vec4 vColor;
    void main() {
      gl_FragColor = vColor;
    }
  `
    const vsShader = WebGLHelper.createShader(gl, EShaderType.VS_SHADER)
    WebGLHelper.compileShader(gl, VSHADER_SOURCE, vsShader)
    const fsShader = WebGLHelper.createShader(gl, EShaderType.FS_SHADER)
    WebGLHelper.compileShader(gl, FSHADER_SOURCE, fsShader)
    const program = WebGLHelper.createProgram(gl)
    WebGLHelper.linkProgram(gl, program, vsShader, fsShader)
    gl.useProgram(program)
    const glAttributeMap = new Map<string, WebGLHelper.GLAttributeInfo>()
    const glUniformMap = new Map<string, WebGLHelper.GLUniformInfo>()
    WebGLHelper.GLUniformInfo.getProgramActiveAttributes(
      gl,
      program,
      glAttributeMap
    )
    WebGLHelper.GLUniformInfo.getProgramActiveUniforms(
      gl,
      program,
      glUniformMap
    )
    gl.clearColor(0.0, 0.0, 1.0, 0.5)
    gl.clear(gl.COLOR_BUFFER_BIT)
    const buffer = WebGLHelper.createBuffer(gl)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    const verts: Float32Array = new Float32Array([
      // 右边的三角形
      -1.0,
      1.0,
      0,
      initColor.r,
      initColor.g,
      initColor.b,
      1, // 左上 xyzrgba initColor
      1.0,
      1.0,
      0,
      1,
      1,
      1,
      1, // 右上 xyzrgba 白
      1.0,
      -1.0,
      0,
      0,
      0,
      0,
      1, // 右下 xyzrgba 黑
      // // 左边的三角形
      -1.0,
      1.0,
      0,
      initColor.r,
      initColor.g,
      initColor.b,
      1, // 左上 xyzrgba initColor
      1.0,
      -1.0,
      0,
      0,
      0,
      0,
      1, // 右下 xyzrgba 黑
      -1.0,
      -1.0,
      0,
      0,
      0,
      0,
      1, // 左下 xyzrgba 黑
    ])
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
    // 指定attribute变量和buffer中的数据关联方式
    gl.vertexAttribPointer(
      glAttributeMap.get('aPosition')!.loc,
      3,
      gl.FLOAT,
      false,
      Float32Array.BYTES_PER_ELEMENT * 7,
      0
    )
    gl.vertexAttribPointer(
      glAttributeMap.get('aColor')!.loc,
      4,
      gl.FLOAT,
      false,
      Float32Array.BYTES_PER_ELEMENT * 7,
      3 * Float32Array.BYTES_PER_ELEMENT
    )
    gl.enableVertexAttribArray(glAttributeMap.get('aPosition')!.loc)
    gl.enableVertexAttribArray(glAttributeMap.get('aColor')!.loc)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    gl.useProgram(null)
    gl.disableVertexAttribArray(glAttributeMap.get('aPosition')!.loc)
    gl.disableVertexAttribArray(glAttributeMap.get('aColor')!.loc)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.deleteShader(vsShader)
    gl.deleteShader(fsShader)
    gl.deleteProgram(program)
    gl.deleteBuffer(buffer)
  }
  const bindClickToColorBar = ({
    gl,
    canvas,
    onSelectedColor,
  }: {
    gl: WebGL2RenderingContext
    canvas: HTMLCanvasElement
    onSelectedColor: (color: Color) => void
  }) => {
    const mouseDownEvent = (ev: MouseEvent) => {
      drawColorBar(canvas)
      const rect = canvas.getBoundingClientRect()
      const x = ev.clientX - rect.left
      const y = ev.clientY - rect.top
      const pixels = new Uint8Array(4)
      gl.readPixels(
        x,
        Math.ceil(rect.height / 2),
        1,
        1,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        pixels
      )
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
      ])
      onSelectedColor({
        r: pixels[0] / 255,
        g: pixels[1] / 255,
        b: pixels[2] / 255,
        a: pixels[3] / 255,
      })
    }
    canvas.addEventListener('mousedown', mouseDownEvent)
  }
  const bindClickToBg = ({
    gl,
    canvas,
    onSelectedColor,
  }: {
    gl: WebGL2RenderingContext
    canvas: HTMLCanvasElement
    onSelectedColor: (color: Color) => void
  }) => {
    const mouseDownEvent = (ev: MouseEvent) => {
      drawBackground(canvas, currColor.get())
      const rect = canvas.getBoundingClientRect()
      const x = ev.clientX - rect.left
      const y = ev.clientY - rect.top
      const pixels = new Uint8Array(4)
      gl.readPixels(
        x,
        canvas.height - y,
        1,
        1,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        pixels
      )
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
      ])
      onSelectedColor({
        r: pixels[0] / 255,
        g: pixels[1] / 255,
        b: pixels[2] / 255,
        a: pixels[3] / 255,
      })
    }
    canvas.addEventListener('mousedown', mouseDownEvent)
  }
  const drawColorBar = (canvas: HTMLCanvasElement) => {
    canvas.style['cursor'] = 'pointer'
    const gl = WebGLHelper.getWebglContext(canvas, {
      preserveDrawingBuffer: true,
    })!
    if (!gl) {
      throw new Error(`不支持webgl`)
    }
    const VSHADER_SOURCE = `
      attribute vec3 aPosition;
      attribute vec4 aColor;
      varying vec4 vColor;
      void main() {
        gl_Position = vec4(aPosition, 1.0);
        gl_PointSize = 10.0;
        vColor = aColor;
      }
    `
    const FSHADER_SOURCE = `
      #ifdef GL_ES
        precision highp float;
      #endif
      varying vec4 vColor;
      void main() {
        gl_FragColor = vColor;
      }
    `
    const vsShader = WebGLHelper.createShader(gl, EShaderType.VS_SHADER)
    WebGLHelper.compileShader(gl, VSHADER_SOURCE, vsShader)
    const fsShader = WebGLHelper.createShader(gl, EShaderType.FS_SHADER)
    WebGLHelper.compileShader(gl, FSHADER_SOURCE, fsShader)
    const program = WebGLHelper.createProgram(gl)
    WebGLHelper.linkProgram(gl, program, vsShader, fsShader)
    gl.useProgram(program)
    const glAttributeMap = new Map<string, WebGLHelper.GLAttributeInfo>()
    const glUniformMap = new Map<string, WebGLHelper.GLUniformInfo>()
    WebGLHelper.GLUniformInfo.getProgramActiveAttributes(
      gl,
      program,
      glAttributeMap
    )
    WebGLHelper.GLUniformInfo.getProgramActiveUniforms(
      gl,
      program,
      glUniformMap
    )
    gl.clearColor(1.0, 1.0, 1.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    const buffer = WebGLHelper.createBuffer(gl)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    const colors = [
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
    ].map((color: string) => `0x${color.replace('#', '')}`)
    const points = colors.map(
      (color: string, index: number): Point => {
        const colorValues = math.convertColorToHexNumberArray(
          math.parseHexColorToNumber(color)
        )
        const r = (colorValues[0] * 16 + colorValues[1]) / 255
        const g = (colorValues[2] * 16 + colorValues[3]) / 255
        const b = (colorValues[4] * 16 + colorValues[5]) / 255
        const a = 1
        const x =
          ((index / (colors.length - 1)) * canvas.width - canvas.width / 2) /
          (canvas.width / 2)
        const y = 0
        const z = 0
        const size = 1
        return {
          r,
          g,
          b,
          a,
          x,
          y,
          z,
          size,
        }
      }
    )
    // 将这些points组合成三角形
    const trianglePoints = [] as Point[]
    for (let i = 0; i < points.length - 1; i++) {
      const point1 = {
        ...points[i],
        y: 1,
      }
      const point2 = {
        ...points[i],
        y: -1,
      }
      const point3 = {
        ...points[i + 1],
        y: 1,
      }
      const point4 = {
        ...points[i + 1],
        y: -1,
      }
      trianglePoints.push(point1, point3, point4, point1, point4, point2)
    }
    const verts: Float32Array = new Float32Array(
      flatten(
        trianglePoints.map((point) => [
          point.x,
          point.y,
          point.z,
          point.r,
          point.g,
          point.b,
          point.a,
        ])
      )
    )
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
    gl.vertexAttribPointer(
      glAttributeMap.get('aPosition')!.loc,
      3,
      gl.FLOAT,
      false,
      Float32Array.BYTES_PER_ELEMENT * 7,
      0
    )
    gl.vertexAttribPointer(
      glAttributeMap.get('aColor')!.loc,
      4,
      gl.FLOAT,
      false,
      Float32Array.BYTES_PER_ELEMENT * 7,
      3 * Float32Array.BYTES_PER_ELEMENT
    )
    gl.enableVertexAttribArray(glAttributeMap.get('aPosition')!.loc)
    gl.enableVertexAttribArray(glAttributeMap.get('aColor')!.loc)
    gl.drawArrays(gl.TRIANGLES, 0, trianglePoints.length)
    gl.useProgram(null)
    gl.disableVertexAttribArray(glAttributeMap.get('aPosition')!.loc)
    gl.disableVertexAttribArray(glAttributeMap.get('aColor')!.loc)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.deleteShader(vsShader)
    gl.deleteShader(fsShader)
    gl.deleteProgram(program)
    gl.deleteBuffer(buffer)
  }
  export const init = ({
    rootElement,
    width = 200,
    initColor = '0xff0000',
    onSelectedColor = () => {},
    backgroundColor='#893533'
  }: {
    rootElement: HTMLElement
    width?: number
    initColor?: string
    onSelectedColor?: OnSelectedColor
    backgroundColor?: string
  }) => {
    const backgroundWidth = width - (2 * width) / 20
    const backgroundHeight = width - (2 * width) / 20
    const colorBarWidth = width - (2 * width) / 20
    const colorBarHeight = width / 10
    currColor.assign(parseColor(initColor))
    const container = document.createElement('div')
    container.style['width'] = `${width}px`
    container.style['display'] = 'flex'
    container.style['flexDirection'] = 'column'
    container.style['alignItems'] = 'center'
    container.style['background'] = backgroundColor
    container.style['borderRadius'] = `${backgroundWidth / 15}px`
    container.style['paddingTop'] = `${width / 20}px`
    container.style['paddingBottom'] = `${width / 20}px`
    const backgroundCanvas = document.createElement('canvas')
    backgroundCanvas.style['cursor'] = 'pointer'
    backgroundCanvas.width = backgroundWidth
    backgroundCanvas.height = backgroundHeight
    drawBackground(backgroundCanvas, currColor.get())
    bindClickToBg({
      gl: WebGLHelper.getWebglContext(backgroundCanvas, {preserveDrawingBuffer: true})!,
      canvas: backgroundCanvas,
      onSelectedColor: (color: Color) => {
        onSelectedColor(color)
      },
    })
    const colorBarCanvas = document.createElement('canvas')
    colorBarCanvas.width = colorBarWidth
    colorBarCanvas.height = colorBarHeight
    colorBarCanvas.style['marginTop'] = `${width / 20}px`
    drawColorBar(colorBarCanvas)
    bindClickToColorBar({
      gl: WebGLHelper.getWebglContext(colorBarCanvas, {
        preserveDrawingBuffer: true,
      })!,
      canvas: colorBarCanvas,
      onSelectedColor: (color: Color) => {
        currColor.assign(color)
        drawBackground(backgroundCanvas, color)
      },
    })
    rootElement.innerHTML = ''
    rootElement.appendChild(container)
    container.appendChild(backgroundCanvas)
    container.appendChild(colorBarCanvas)
  }
}
