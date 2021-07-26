var gl
var vertexData, colorData, indices
var webglUtils = new WebGL_Utils()

var worldMatrix = new Float32Array(16)
var viewMatrix = new Float32Array(16)
var projMatrix = new Float32Array(16)

window.onload = function () {
  main()
}

function main() {
  // pega o contexto do WebGL usando jQuery
  var canvas = document.querySelector('#canvas')
  var gl = canvas.getContext('webgl')
  if (!gl) {
    return
  }
  // Cria os shaders

  var program = createShaders(gl)

  // verificar onde os dados do vértice precisam ir.
  var positionLocation = gl.getAttribLocation(program, 'position')
  var colorLocation = gl.getAttribLocation(program, 'color')

  // verifica os uniforms
  //var matrixLocation = gl.getUniformLocation(program, "matrix");

  // Cria o buffer e armazena as posições lá
  var positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  // Armazena a geometria no buffer
  setGeometry(gl)

  // Create o buffer e armazena as cores lá
  var colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  // Armazena as cores no buffer
  setColors(gl)
  var index_buffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer)
  setIndexes(gl)
  //   desenha a cena

  drawScene()
  var Tx_limits = gl.canvas.width / 8
  var Ty_limits = gl.canvas.width / 8

  function setGeometry(gl) {
    //vértices
    vertexData = [
      // X, Y, Z           R, G, B
      // Top
      -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

      // Left
      -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0,

      // Right
      1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,

      // Front
      1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0,

      // Back
      1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0,

      // Bottom
      -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0
    ]

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW)
  }
  function setIndexes(gl) {
    indices = [
      // Top
      0, 1, 2, 0, 2, 3,

      // Left
      5, 4, 6, 6, 4, 7,

      // Right
      8, 9, 10, 8, 10, 11,

      // Front
      13, 12, 14, 15, 14, 12,

      // Back
      16, 17, 18, 16, 18, 19,

      // Bottom
      21, 20, 22, 22, 20, 23
    ]
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW
    )
  }
  function setColors(gl) {
    const colorData = [
      1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,

      0.75, 0.25, 0.5, 0.75, 0.25, 0.5, 0.75, 0.25, 0.5, 0.75, 0.25, 0.5,

      0.25, 0.25, 0.75, 0.25, 0.25, 0.75, 0.25, 0.25, 0.75, 0.25, 0.25, 0.75,

      1.0, 0.0, 0.15, 1.0, 0.0, 0.15, 1.0, 0.0, 0.15, 1.0, 0.0, 0.15,

      0.0, 1.0, 0.15, 0.0, 1.0, 0.15, 0.0, 1.0, 0.15, 0.0, 1.0, 0.15,

      0.5, 0.5, 1.0, 0.5, 0.5, 1.0, 0.5, 0.5, 1.0, 0.5, 0.5, 1.0
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW)
  }
  // Desenha a cena
  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas)

    // // Diz ao WebGL como converter do espaço do clipe em pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    // // Limpa o canvas.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // Habilita o buffer de profundidade
    gl.enable(gl.DEPTH_TEST)

    gl.depthFunc(gl.LEQUAL)

    gl.clearDepth(1.0)

    // Usa os programas shaders
    gl.useProgram(program)

    // Ativa o atributo de posição
    gl.enableVertexAttribArray(positionLocation)

    // Vincula o buffer de posição
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    // Diz ao atributo position como obter dados de positionBuffer
    var size = 3 // 3 components per iteration
    var type = gl.FLOAT // the data is 32bit floats
    var normalize = true // don't normalize the data
    var stride = 3 * Float32Array.BYTES_PER_ELEMENT // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0 // start at the beginning of the buffer

    gl.vertexAttribPointer(
      positionLocation,
      size,
      type,
      normalize,
      stride,
      offset
    )

    // Habilita o atributo cor
    gl.enableVertexAttribArray(colorLocation)

    // Vincula ao buffer de cor.
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)

    // Diz ao atributo color como obter dados de colorBuffer

    var size = 3 // 3 components per iteration
    var type = gl.FLOAT // the data is 8bit unsigned values
    var normalize = false // normalize the data (convert from 0-255 to 0-1)
    var stride = 3 * Float32Array.BYTES_PER_ELEMENT // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 3 * Float32Array.BYTES_PER_ELEMENT // start at the beginning of the buffer
    gl.vertexAttribPointer(colorLocation, size, type, normalize, stride, offset)

    //
    // aplica as transformações

    var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld')
    var matViewUniformLocation = gl.getUniformLocation(program, 'mView')
    var matProjUniformLocation = gl.getUniformLocation(program, 'mProj')

    mat4.identity(worldMatrix)
    mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0])
    mat4.perspective(
      projMatrix,
      glMatrix.toRadian(45),
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000.0
    )

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix)
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix)
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix)

    var xRotationMatrix = new Float32Array(16)
    var yRotationMatrix = new Float32Array(16)

    var identityMatrix = new Float32Array(16)
    mat4.identity(identityMatrix)
    var angle = 0
    var loop = function () {
      angle = (performance.now() / 1000 / 6) * 2 * Math.PI
      mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0])
      mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [0, 1, 0])
      mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix)
      gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix)

      gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)

      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  }
}

function createVertexShader(gl) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(
    vertexShader,
    `
    precision mediump float;
    
    attribute vec3 position;
    attribute vec3 color;
    varying vec3 vColor;
    
    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;
    
    void main() {
        vColor = color;
        gl_Position = mProj * mView * mWorld * vec4(position, 1);
    }
    `
  )
  gl.compileShader(vertexShader)
  return vertexShader
}
function createFragmentShader(gl) {
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(
    fragmentShader,
    `
    precision mediump float;
    
    varying vec3 vColor;
    
    void main() {
        gl_FragColor = vec4(vColor, 1);
    }
    `
  )
  gl.compileShader(fragmentShader)
  return fragmentShader
}
function createShaders(gl) {
  vertexShader = createVertexShader(gl)
  fragmentShader = createFragmentShader(gl)
  //cria o programa principal e anexa os shaders
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)

  gl.linkProgram(program)
  return program
}
