export const VIDEO_ASPECT = 1276 / 720;

const VERT_SRC = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG_SRC = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uScale;
uniform vec2 uMouse;
uniform vec2 uTilt;
uniform float uTime;
uniform float uPresence;
varying vec2 vUv;

void main() {
  float dist = distance(vUv, uMouse);
  float ripple = sin(dist * 20.0 - uTime * 5.0) * 0.006;
  float strength = smoothstep(0.2, 0.0, dist) * uPresence;
  vec2 offset = normalize(vUv - uMouse + 1e-5) * ripple * strength;

  vec2 uvR = (vUv + offset + vec2(0.005, 0.0) * strength - 0.5) * uScale + 0.5 + uTilt;
  vec2 uvG = (vUv + offset - 0.5) * uScale + 0.5 + uTilt;
  vec2 uvB = (vUv + offset - vec2(0.005, 0.0) * strength - 0.5) * uScale + 0.5 + uTilt;

  float r = texture2D(uTex, clamp(uvR, 0.0, 1.0)).r;
  float g = texture2D(uTex, clamp(uvG, 0.0, 1.0)).g;
  float b = texture2D(uTex, clamp(uvB, 0.0, 1.0)).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}
`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function initPondGl(gl) {
  if (!gl || gl.isContextLost()) return null;
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    return null;
  }

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return {
    program,
    buffer,
    texture,
    locs: {
      aPos: gl.getAttribLocation(program, 'aPos'),
      uTex: gl.getUniformLocation(program, 'uTex'),
      uScale: gl.getUniformLocation(program, 'uScale'),
      uMouse: gl.getUniformLocation(program, 'uMouse'),
      uTilt: gl.getUniformLocation(program, 'uTilt'),
      uTime: gl.getUniformLocation(program, 'uTime'),
      uPresence: gl.getUniformLocation(program, 'uPresence'),
    },
  };
}
