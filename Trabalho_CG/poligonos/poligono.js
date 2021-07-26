const input = document.querySelector('input')
const form = document.querySelector('form')

form.addEventListener('submit', e => {
  e.preventDefault()

  const valor = Number(input.value)

  if (valor < 3 || valor > 10 || isNaN(valor)) {
    return false
  }

  draw(valor)
})

function draw(lados) {
  const canvas = document.querySelector('canvas')
  const gl = canvas.getContext('webgl')

  if (!gl) {
    throw new Error('WebGl not supported')
  }

  //define o vetor de vértices
  const vertex = {
    3: {
      indices: [2, 1, 0],
      data: [-0.5, 0.5, 0, 0.5, 0.5, 0, 0, -0.5, 0]
    },
    4: {
      indices: [3, 2, 1, 3, 1, 0],
      data: [-0.5, 0.5, 0, 0.5, 0.5, 0, 0.5, -0.5, 0, -0.5, -0.5, 0]
    },
    5: {
      indices: [3, 2, 1, 3, 1, 0, 4, 0, 3],
      data: [
        -0.6, 0.24, 0, 0.0, 0.8, 0, 0.6, 0.24, 0, 0.34, -0.67, 0, -0.34, -0.67,
        0
      ]
    },
    6: {
      indices: [3, 2, 1, 3, 1, 0, 4, 0, 3, 0, 4, 5],
      data: [
        -0.25, 0.5, 0, 0.25, 0.5, 0, 0.5, 0.0, 0, 0.25, -0.5, 0, -0.25, -0.5, 0,
        -0.5, 0.0, 0
      ]
    },
    7: {
      indices: [3, 2, 1, 3, 1, 0, 4, 0, 3, 0, 4, 5, 0, 6, 5],
      data: [
        0.0, 0.9, 0, 0.4, 0.63, 0, 0.53, 0.05, 0, 0.25, -0.58, 0, -0.25, -0.58,
        0, -0.53, 0.05, 0, -0.4, 0.63, 0
      ]
    },
    8: {
      indices: [3, 2, 1, 3, 1, 0, 4, 0, 3, 0, 4, 5, 0, 6, 5, 0, 7, 6],
      data: [
        -0.18, 0.83, 0, 0.18, 0.83, 0, 0.48, 0.35, 0, 0.48, -0.38, 0, 0.18,
        -0.83, 0, -0.18, -0.83, 0, -0.48, -0.38, 0, -0.48, 0.35, 0
      ]
    },
    9: {
      indices: [3, 2, 1, 3, 1, 0, 4, 0, 3, 0, 4, 5, 0, 6, 5, 0, 7, 6, 0, 7, 8],
      data: [
        0.0, 0.8, 0, 0.34, 0.58, 0, 0.53, 0.15, 0, 0.48, -0.35, 0, 0.2, -0.75,
        0, -0.2, -0.75, 0, -0.48, -0.35, 0, -0.53, 0.15, 0, -0.34, 0.58, 0
      ]
    },
    10: {
      indices: [
        3, 2, 1, 3, 1, 0, 4, 0, 3, 0, 4, 5, 0, 6, 5, 0, 7, 6, 0, 7, 8, 0, 8, 9
      ],
      data: [
        -0.15, 0.6, 0, -0.4, 0.4, 0, -0.5, 0.0, 0, -0.4, -0.4, 0, -0.15, -0.6,
        0, 0.15, -0.6, 0, 0.4, -0.4, 0, 0.5, 0.0, 0, 0.4, 0.4, 0, 0.15, 0.6, 0
      ]
    }
  }

  //cria o buffer
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  //carrega o vetor de dados no buffer
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertex[lados].data),
    gl.STATIC_DRAW
  )

  var Index_Buffer = gl.createBuffer()

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer)

  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(vertex[lados].indices),
    gl.STATIC_DRAW
  )

  //cria o vertex shader
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(
    vertexShader,
    `attribute vec3 position; 
  void main() {
  gl_Position = vec4(position, 1);
}`
  )
  gl.compileShader(vertexShader)

  gl.compileShader(vertexShader)
  //cria o fragmento shader
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(
    fragmentShader,
    `void main() {
    gl_FragColor = vec4(1, 0, 0.2, 4);
  }`
  )

  gl.compileShader(fragmentShader)
  //cria o programa

  const program = gl.createProgram()
  //anexa os shaders ao programa

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  const positionLocation = gl.getAttribLocation(program, 'position')
  //ativa os atributos do vertice

  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0)

  gl.useProgram(program)

  //gl.drawArrays(gl.TRIANGLES, 0, 3)
  //GL.POLYGON - Não tem no webgl

  gl.drawElements(
    gl.TRIANGLES,
    vertex[lados].indices.length,
    gl.UNSIGNED_SHORT,
    0
  )
}
