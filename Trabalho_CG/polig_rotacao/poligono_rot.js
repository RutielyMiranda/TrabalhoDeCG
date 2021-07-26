var gl

var Tx = 0.0,
  Ty = 0.0,
  Tz = 0.0
var Sx = 1.0,
  Sy = 1.0,
  Sz = 1.0
var theta_x = 0.0,
  theta_y = 0.0,
  theta_z = 0.0

var vertexData, colorData

var webglUtils = new WebGL_Utils()

//var currentMatrix = mat4.create()

var currentMatrix = webglUtils.create()

var translateMatrix = webglUtils.create()
var scaleMatrix = webglUtils.create()
var rotateMatrix = webglUtils.create()

webglUtils.setIdentity(translateMatrix)
webglUtils.setIdentity(scaleMatrix)
webglUtils.setIdentity(rotateMatrix)

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
  var matrixLocation = gl.getUniformLocation(program, 'matrix')

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

  //   desenha a cena
  drawScene()
  var Tx_limits = gl.canvas.width / 9
  var Ty_limits = gl.canvas.width / 9
  // configura a UI.
  webglUI.setupSlider('#x', {
    name: 'Translação em x',
    value: Tx,
    slide: updatePosition(0),
    min: -Tx_limits,
    max: Tx_limits
  })
  webglUI.setupSlider('#y', {
    name: 'Translação em y',
    value: Ty,
    slide: updatePosition(1),
    min: -Ty_limits,
    max: Ty_limits
  })
  webglUI.setupSlider('#angleZ', {
    name: 'Rotação em z',
    value: theta_z,
    slide: updateRotation(0),
    max: 360
  })
  webglUI.setupSlider('#scaleX', {
    name: 'Escala em x',
    value: Sx,
    slide: updateScale(0),
    min: 0.5,
    max: 2,
    step: 0.01,
    precision: 2
  })
  webglUI.setupSlider('#scaleY', {
    name: 'Escala em y',
    value: Sy,
    slide: updateScale(1),
    min: 0.5,
    max: 2,
    step: 0.01,
    precision: 2
  })

  function updatePosition(index) {
    return function (event, ui) {
      switch (index) {
        case 0:
          Tx = ui.value * 0.01
          break
        case 1:
          Ty = ui.value * 0.01
          break
        case 2:
          Tz = ui.value * 0.01
          break
      }
      webglUtils.translate(translateMatrix, Tx, Ty, Tz)
      drawScene()
    }
  }

  function updateRotation() {
    return function (event, ui) {
      if (ui.value == theta_z) {
        drawScene()
      } else if (ui.value == 360) {
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
        var normalize = false // don't normalize the data
        var stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
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
        var stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0 // start at the beginning of the buffer
        gl.vertexAttribPointer(
          colorLocation,
          size,
          type,
          normalize,
          stride,
          offset
        )

        // aplica as transformações

        webglUtils.multiplySeries(
          currentMatrix,
          translateMatrix,
          rotateMatrix,
          scaleMatrix
        )

        const uniformLocations = {
          matrixLocation: gl.getUniformLocation(program, 'matrix')
        }

        var time_old = 0
        var animate = function (time) {
          var dt = time - time_old //fator que controla a animação

          time_old = time
          requestAnimationFrame(animate)

          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
          mat4.rotateZ(
            currentMatrix,
            currentMatrix,
            (dt * 0.001 * -Math.PI) / 3
          )
          //mat4.translate(matrix, matrix, [dt * 0.002, 0, 0])
          //mat4.scale(matrix, matrix, [0.9, 0.9, 0.25])

          gl.uniformMatrix4fv(
            uniformLocations.matrixLocation,
            false,
            currentMatrix
          )
          gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
        }

        animate(0)
      } else if (ui.value == 0) {
        console.log('Posiçao 0')
      }
    }
  }

  function updateScale(index) {
    return function (event, ui) {
      switch (index) {
        case 0:
          Sx = ui.value
          break
        case 1:
          Sy = ui.value
          break
        case 2:
          Sz = ui.value
          break
      }
      webglUtils.scale(scaleMatrix, Sx, Sy, Sz)
      drawScene()
    }
  }

  function setGeometry(gl) {
    //vértices
    vertexData = [-0.4, 0.4, 0, 0.4, 0.4, 0, 0.4, -0.7, 0, -0.4, -0.7, 0]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW)
  }

  function setColors(gl) {
    const colorData = [
      1,
      0,
      1, // azul
      1,
      0,
      1, // azul
      0,
      1,
      1, // verde
      0,
      1,
      1, // verde
      0,
      1,
      1, // verde
      1,
      0,
      1 // azul
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
    var normalize = false // don't normalize the data
    var stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
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
    var stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0 // start at the beginning of the buffer
    gl.vertexAttribPointer(colorLocation, size, type, normalize, stride, offset)

    // aplica as transformações

    webglUtils.multiplySeries(
      currentMatrix,
      translateMatrix,
      rotateMatrix,
      scaleMatrix
    )

    const uniformLocations = {
      matrixLocation: gl.getUniformLocation(program, 'matrix')
    }

    var time_old = 0
    var animate = function (time) {
      var dt = time - time_old //fator que controla a animação

      time_old = time
      requestAnimationFrame(animate)

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      mat4.rotateZ(currentMatrix, currentMatrix, (dt * 0.001 * Math.PI) / 3)

      gl.uniformMatrix4fv(uniformLocations.matrixLocation, false, currentMatrix)
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
    }

    animate(0)
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
    
    uniform mat4 matrix;
    
    void main() {
        vColor = color;
        gl_Position = matrix * vec4(position, 1);
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
