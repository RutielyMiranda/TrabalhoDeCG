/**
 * Classe utilitária para operações de matrizes 4x4
 * 
 *
 */





"use strict";

/**
 * @construtor cria uma instancia de WebGL_Utils
 */
var WebGL_Utils = function () {

  var self = this;

  /** -----------------------------------------------------------------
   * @return Float32Array returns cria uma matriz não inicializada.
   */
  self.create = function () {
    return new Float32Array(16);
  };

  // Variáveis temporárias para cálculos. 
  // Essas variáveis são exitem para serem reutilizadas posteriormente e 
  // previnir a recriação de novos objetos 

  var T1, T2, V, v3, P, p4, axis_of_rotation, u, v, n, center, eye, up;

  T1 = self.create();
  T2 = self.create();
  V = new Learn_webgl_vector3();
  v3 = V.create();
  P = new Learn_webgl_point4();
  p4 = P.create();
  axis_of_rotation = V.create();
  u = V.create();
  v = V.create();
  n = V.create();
  center = V.create();
  eye = V.create();
  up = V.create();

  /** -----------------------------------------------------------------
   * Set a matriz identidade, M = I (matriz identidade)
   */
  self.setIdentity = function (M) {
    M[0] = 1;  M[4] = 0;  M[8] = 0;  M[12] = 0;
    M[1] = 0;  M[5] = 1;  M[9] = 0;  M[13] = 0;
    M[2] = 0;  M[6] = 0;  M[10] = 1; M[14] = 0;
    M[3] = 0;  M[7] = 0;  M[11] = 0; M[15] = 1;
  };

  /** -----------------------------------------------------------------
   * @return Converte angulos para radianos
   */
  self.toRadians = function (angleInDegrees) {
    return angleInDegrees * 0.017453292519943295;  // Math.PI / 180
  };

  /** -----------------------------------------------------------------
   * @return converte radianos para angulos
   */
  self.toDegrees = function (angleInRadians) {
    return angleInRadians * 57.29577951308232;  // 180 / Math.PI
  };

  /** -----------------------------------------------------------------
   * To = From (copia elemento por elemento)
   * @return To (a 16 element Float32Array)
   */
  self.copy = function (To, From) {
    var j;
    for (j = 0; j < 16; j += 1) {
      To[j] = From[j];
    }
    return To;
  };

  /** -----------------------------------------------------------------
   * Aplica a multiplicação de matrizes, o resultado é armazenado em R
   * (R = A * B) Obs: a ordem importa!
   */
  self.multiply = function (R, A, B) {

    
    
    // Se R é igual a A ou N, criar uma cópia de A e B
    // Para a comparação usamos ==, invés ===. O obejtivo é comparar
    // objetos e não os valores dentro dos objetos
    
    if (A == R) {
      A = self.copy(T1, A);
    }
    if (B == R) {
      B = self.copy(T2, B);
    }

    R[0]  = A[0] * B[0]  + A[4] * B[1]  + A[8]  * B[2]  + A[12] * B[3];
    R[1]  = A[1] * B[0]  + A[5] * B[1]  + A[9]  * B[2]  + A[13] * B[3];
    R[2]  = A[2] * B[0]  + A[6] * B[1]  + A[10] * B[2]  + A[14] * B[3];
    R[3]  = A[3] * B[0]  + A[7] * B[1]  + A[11] * B[2]  + A[15] * B[3];

    R[4]  = A[0] * B[4]  + A[4] * B[5]  + A[8]  * B[6]  + A[12] * B[7];
    R[5]  = A[1] * B[4]  + A[5] * B[5]  + A[9]  * B[6]  + A[13] * B[7];
    R[6]  = A[2] * B[4]  + A[6] * B[5]  + A[10] * B[6]  + A[14] * B[7];
    R[7]  = A[3] * B[4]  + A[7] * B[5]  + A[11] * B[6]  + A[15] * B[7];

    R[8]  = A[0] * B[8]  + A[4] * B[9]  + A[8]  * B[10] + A[12] * B[11];
    R[9]  = A[1] * B[8]  + A[5] * B[9]  + A[9]  * B[10] + A[13] * B[11];
    R[10] = A[2] * B[8]  + A[6] * B[9]  + A[10] * B[10] + A[14] * B[11];
    R[11] = A[3] * B[8]  + A[7] * B[9]  + A[11] * B[10] + A[15] * B[11];

    R[12] = A[0] * B[12] + A[4] * B[13] + A[8]  * B[14] + A[12] * B[15];
    R[13] = A[1] * B[12] + A[5] * B[13] + A[9]  * B[14] + A[13] * B[15];
    R[14] = A[2] * B[12] + A[6] * B[13] + A[10] * B[14] + A[14] * B[15];
    R[15] = A[3] * B[12] + A[7] * B[13] + A[11] * B[14] + A[15] * B[15];
  };

  /** -----------------------------------------------------------------
   * Multiplicação de uma série de matrizes. A ORDEM IMPORTA
   * R = A * B * C * D ...
   */
  self.multiplySeries = function () {
    if (arguments.length >= 3) {
      self.multiply(arguments[0], arguments[1], arguments[2]);
      var j;
      for (j = 3; j < arguments.length; j += 1) {
        self.multiply(arguments[0], arguments[0], arguments[j]);
      }
    }
  };

  
  /** -----------------------------------------------------------------
   * Cria a matriz de escala.
   * @param M a matriz de escala
   * @param sx Fator de escala no eixo x
   * @param sy Fator de escala no eixo y
   * @param sz Fator de escala no eixo z
   */
  self.scale = function (M, sx, sy, sz) {
    M[0] = sx;  M[4] = 0;   M[8] = 0;   M[12] = 0;
    M[1] = 0;   M[5] = sy;  M[9] = 0;   M[13] = 0;
    M[2] = 0;   M[6] = 0;   M[10] = sz; M[14] = 0;
    M[3] = 0;   M[7] = 0;   M[11] = 0;  M[15] = 1;
  };

  /** -----------------------------------------------------------------
   * Cria a matriz de translação
   * @param M A matriz da translação.
   * @param dx Deslocamento em x.
   * @param dy Deslocamento em x.
   * @param dz Deslocamento em x.
   */
  self.translate = function (M, dx, dy, dz) {
    M[0] = 1;  M[4] = 0;  M[8]  = 0;  M[12] = dx;
    M[1] = 0;  M[5] = 1;  M[9]  = 0;  M[13] = dy;
    M[2] = 0;  M[6] = 0;  M[10] = 1;  M[14] = dz;
    M[3] = 0;  M[7] = 0;  M[11] = 0;  M[15] = 1;
  };

  /** -----------------------------------------------------------------
   * Cria a matriz de rotação. O eixo de rotação pode não estar normalizado
   * 
   * @paraM angulo de rotação (em graus)
   * @paraM coordenada do eixo x na rotação
   * @paraM coordenada do eixo x na rotação
   * @paraM coordenada do eixo x na rotação
   */
  self.rotate = function (M, angle, x_axis, y_axis, z_axis) {
    var s, c, c1, xy, yz, zx, xs, ys, zs, ux, uy, uz;

    angle = self.toRadians(angle);

    s = Math.sin(angle);
    c = Math.cos(angle);

    if (x_axis !== 0 && y_axis === 0 && z_axis === 0) {
      // Rotação em torno de X
      if (x_axis < 0) {
        s = -s;
      }

      M[0] = 1;  M[4] = 0;  M[8]  = 0;  M[12] = 0;
      M[1] = 0;  M[5] = c;  M[9]  = -s; M[13] = 0;
      M[2] = 0;  M[6] = s;  M[10] = c;  M[14] = 0;
      M[3] = 0;  M[7] = 0;  M[11] = 0;  M[15] = 1;

    } else if (x_axis === 0 && y_axis !== 0 && z_axis === 0) {
      // Rotação em torno de Y
      if (y_axis < 0) {
        s = -s;
      }

      M[0] = c;  M[4] = 0;  M[8]  = s;  M[12] = 0;
      M[1] = 0;  M[5] = 1;  M[9]  = 0;  M[13] = 0;
      M[2] = -s; M[6] = 0;  M[10] = c;  M[14] = 0;
      M[3] = 0;  M[7] = 0;  M[11] = 0;  M[15] = 1;

    } else if (x_axis === 0 && y_axis === 0 && z_axis !== 0) {
      // Rotação em torno de Z
      if (z_axis < 0) {
        s = -s;
      }

      M[0] = c;  M[4] = -s;  M[8]  = 0;  M[12] = 0;
      M[1] = s;  M[5] = c;   M[9]  = 0;  M[13] = 0;
      M[2] = 0;  M[6] = 0;   M[10] = 1;  M[14] = 0;
      M[3] = 0;  M[7] = 0;   M[11] = 0;  M[15] = 1;

    } else {
      // Rotação em torno de um eixo arbitrário
      axis_of_rotation[0] = x_axis;
      axis_of_rotation[1] = y_axis;
      axis_of_rotation[2] = z_axis;
      V.normalize(axis_of_rotation);
      ux = axis_of_rotation[0];
      uy = axis_of_rotation[1];
      uz = axis_of_rotation[2];

      c1 = 1 - c;

      M[0] = c + ux * ux * c1;
      M[1] = uy * ux * c1 + uz * s;
      M[2] = uz * ux * c1 - uy * s;
      M[3] = 0;

      M[4] = ux * uy * c1 - uz * s;
      M[5] = c + uy * uy * c1;
      M[6] = uz * uy * c1 + ux * s;
      M[7] = 0;

      M[8] = ux * uz * c1 + uy * s;
      M[9] = uy * uz * c1 - ux * s;
      M[10] = c + uz * uz * c1;
      M[11] = 0;

      M[12] = 0;
      M[13] = 0;
      M[14] = 0;
      M[15] = 1;
    }
  };
  /** -----------------------------------------------------------------
     * Create an orthographic projection matrix.
     * @param left   Number Farthest left on the x-axis
     * @param right  Number Farthest right on the x-axis
     * @param bottom Number Farthest down on the y-axis
     * @param top    Number Farthest up on the y-axis
     * @param near   Number Distance to the near clipping plane along the -Z axis
     * @param far    Number Distance to the far clipping plane along the -Z axis
     * @return Float32Array The orthographic transformation matrix
     */
  self.createOrthographic = function (left, right, bottom, top, near, far) {

    var M = this.create();

    // Make sure there is no division by zero
    if (left === right || bottom === top || near === far) {
      console.log("Invalid createOrthographic parameters");
      self.setIdentity(M);
      return M;
    }

    var widthRatio  = 1.0 / (right - left);
    var heightRatio = 1.0 / (top - bottom);
    var depthRatio  = 1.0 / (far - near);

    var sx = 2 * widthRatio;
    var sy = 2 * heightRatio;
    var sz = -2 * depthRatio;

    var tx = -(right + left) * widthRatio;
    var ty = -(top + bottom) * heightRatio;
    var tz = -(far + near) * depthRatio;

    M[0] = sx;  M[4] = 0;   M[8] = 0;   M[12] = tx;
    M[1] = 0;   M[5] = sy;  M[9] = 0;   M[13] = ty;
    M[2] = 0;   M[6] = 0;   M[10] = sz; M[14] = tz;
    M[3] = 0;   M[7] = 0;   M[11] = 0;  M[15] = 1;

    return M;
  };
  self.createProjection = function (angle, a, zMin, zMax) {
    var M = this.create();
    
    var f = Math.tan(Math.PI * 0.5 - 0.5 * (angle*Math.PI/180));
    var rangeInv = 1.0 / (zMin - zMax);
    M[0] =f/a;       M[4] = 0;   M[8] = 0;   M[12] = 0;
    M[1] = 0;        M[5] =  f;  M[9] = 0;   M[13] = 0;
    M[2] = 0;        M[6] = 0;   M[10] =  (zMin + zMax) * rangeInv; M[14] = zMin * zMax * rangeInv*2;
    M[3] = 0;        M[7] = 0;   M[11] = -1;  M[15] = 0;
    return M;
 }
 self.createPerspective = function(width, height, depth) {
  var M = this.create();
    // Note: This matrix flips the Y axis so 0 is at the top.
    M[0] = 2 / width;  M[4] = 0;   M[8] = 0;   M[12] = -1;
    M[1] = 0;   M[5] = -2 / height;  M[9] = 0;   M[13] = 1;
    M[2] = 0;   M[6] = 0;   M[10] =  2 / depth; M[14] = 0;
    M[3] = 0;   M[7] = 0;   M[11] = 0;  M[15] = 1;
    return M;
 }
  /**
   * Resize a canvas to match the size its displayed.
   * @param {HTMLCanvasElement} canvas The canvas to resize.
   * @param {number} [multiplier] amount to multiply by.
   *    Pass in window.devicePixelRatio for native pixels.
   * @return {boolean} true if the canvas was resized.
   * @memberOf module:webgl-utils
   */
   self.resizeCanvasToDisplaySize = function (canvas, multiplier) {
    multiplier = multiplier || 1;
    const width  = canvas.clientWidth  * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width ||  canvas.height !== height) {
      canvas.width  = width;
      canvas.height = height;
      return true;
    }
    return false;
  }
  
};

//@formatter:on
