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
var angle = 15
var vertexData, colorData, indices
var webglUtils = new WebGL_Utils()
var currentMatrix = webglUtils.create()
var interval = null
var rotating = false
var rotateY = 0

var translateMatrix = webglUtils.create()
var scaleMatrix = webglUtils.create()
var rotateMatrix = webglUtils.create()
var projectionMatrix = webglUtils.create()
var viewMatrix = webglUtils.create()
var currentTransform = webglUtils.create()

webglUtils.setIdentity(translateMatrix)
webglUtils.setIdentity(scaleMatrix)
webglUtils.setIdentity(rotateMatrix)
webglUtils.setIdentity(projectionMatrix)
webglUtils.setIdentity(viewMatrix)
webglUtils.setIdentity(currentMatrix)
webglUtils.setIdentity(currentTransform)

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
  var index_buffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer)
  setIndexes(gl)
  //   desenha a cena

  drawScene()
  var Tx_limits = gl.canvas.width / 8
  var Ty_limits = gl.canvas.width / 8
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
  webglUI.setupSlider('#z', {
    name: 'Translação em z',
    value: Tz,
    slide: updatePosition(2),
    min: -Ty_limits,
    max: Ty_limits
  })
  webglUI.setupSlider('#angleX', {
    name: 'Rotação em x',
    value: theta_x,
    slide: updateRotation(0),
    max: 360
  })
  webglUI.setupSlider('#angleY', {
    name: 'Rotação em y',
    value: theta_x,
    slide: updateRotation(1),
    max: 360
  })
  webglUI.setupSlider('#angleZ', {
    name: 'Rotação em z',
    value: theta_x,
    slide: updateRotation(2),
    max: 360
  })
  webglUI.setupSlider('#scaleX', {
    name: 'Escala em x',
    value: Sx,
    slide: updateScale(0),
    min: 0.01,
    max: 5,
    step: 0.01,
    precision: 2
  })
  webglUI.setupSlider('#scaleY', {
    name: 'Escala em y',
    value: Sy,
    slide: updateScale(1),
    min: 0.01,
    max: 5,
    step: 0.01,
    precision: 2
  })
  webglUI.setupSlider('#scaleZ', {
    name: 'Escala em z',
    value: Sz,
    slide: updateScale(2),
    min: 0.01,
    max: 5,
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
      drawScene(translateMatrix)
    }
  }

  function updateRotation(index) {
    return function (event, ui) {
      rotating = false

      clearInterval(interval)

      switch (index) {
        case 0:
          theta_x = ui.value
          webglUtils.rotate(rotateMatrix, theta_x, 1, 0, 0)
          break
        case 1:
          theta_y = ui.value
          webglUtils.rotate(rotateMatrix, theta_y, 0, 1, 0)
          break
        case 2:
          theta_z = ui.value
          webglUtils.rotate(rotateMatrix, theta_z, 0, 0, 1)
          break
      }

      drawScene()
      setTimeout(() => {
        rotateCircle()
      }, 1000)
    }
  }

  function rotateCircle() {
    if (rotating) return false

    rotating = true

    interval = setInterval(() => {
      rotateY += 2
      webglUtils.rotate(rotateMatrix, rotateY, 0, 1, 0)

      if (rotateY >= 360) {
        rotateY = 0
      }

      console.log(rotateY)

      drawScene()
    }, 100)
  }

  rotateCircle()

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
    var vertices = []
    var SPHERE_DIV = 12
    var i, ai, si, ci
    var j, aj, sj, cj

    for (j = 0; j <= SPHERE_DIV; j++) {
      aj = (j * Math.PI) / SPHERE_DIV
      sj = Math.sin(aj)
      cj = Math.cos(aj)
      for (i = 0; i <= SPHERE_DIV; i++) {
        ai = (i * 2 * Math.PI) / SPHERE_DIV
        si = Math.sin(ai)
        ci = Math.cos(ai)

        vertices.push(si * sj) // X
        vertices.push(cj) // Y
        vertices.push(ci * sj) // Z
      }
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  }

  function setIndexes(gl) {
    var SPHERE_DIV = 12
    var i
    var j
    var p1, p2

    // Vertices
    indices = []

    for (j = 0; j < SPHERE_DIV; j++) {
      for (i = 0; i < SPHERE_DIV; i++) {
        p1 = j * (SPHERE_DIV + 1) + i
        p2 = p1 + (SPHERE_DIV + 1)

        indices.push(p1)
        indices.push(p2)
        indices.push(p1 + 1)

        indices.push(p1 + 1)
        indices.push(p2)
        indices.push(p2 + 1)
      }
    }

    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW
    )
  }
  function setColors(gl) {
    var SPHERE_DIV = 12
    var i
    var j

    const colorsDaRuty = [
      [1, 0, 1, 1],
      [1, 0, 1, 1]
    ]

    var indexAtual = 0
    var selColor = []
    for (j = 0; j <= SPHERE_DIV; j++) {
      for (i = 0; i <= SPHERE_DIV; i++) {
        if (j % 10 === 0) {
          indexAtual += 1

          if (indexAtual > colorsDaRuty.length - 1) {
            indexAtual = 0
          }
        }

        const selectedColor = colorsDaRuty[indexAtual]

        selColor.push(selectedColor[0])
        selColor.push(selectedColor[1])
        selColor.push(selectedColor[2])
        selColor.push(selectedColor[3])
      }
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(selColor), gl.STATIC_DRAW)
  }

  // Desenha a cena
  function drawScene(transformMatrix) {
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

    //
    // aplica as transformações

    projectionMatrix = webglUtils.createProjection(
      40,
      canvas.width / canvas.height,
      1,
      2000
    )
    viewMatrix[14] = viewMatrix[14] - 5
    webglUtils.multiplySeries(
      currentTransform,
      projectionMatrix,
      viewMatrix,
      translateMatrix,
      rotateMatrix,
      scaleMatrix
    )

    // Configura a matriz
    gl.uniformMatrix4fv(matrixLocation, false, currentTransform)

    // Desenha a geometria
    var primitiveType = gl.TRIANGLES
    var offset = 0
    var count = 18
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
    // gl.drawArrays(primitiveType, offset, count);
    webglUtils.setIdentity(projectionMatrix)
    webglUtils.setIdentity(viewMatrix)
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
