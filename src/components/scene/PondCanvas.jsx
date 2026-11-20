import { useEffect, useRef, useState } from 'react';
import { POND_VIDEO_URL } from '../../content/assets.js';
import { getPointerState } from '../../lib/pointerStore.js';

const VIDEO_ASPECT = 1276 / 720;

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

function createProgram(gl) {
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
  return program;
}

export function PondCanvas({ reducedMotion, dayVisibleRef }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [webglFallback, setWebglFallback] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return undefined;

    if (reducedMotion) {
      video.pause();
      video.removeAttribute('src');
      video.load();
      setHasPlayed(false);
      return undefined;
    }

    setVideoFailed(false);
    video.crossOrigin = 'anonymous';
    video.src = POND_VIDEO_URL;
    video.load();

    let rafId = 0;
    let disposed = false;
    let contextLost = false;
    let playedOnce = false;
    let failedVideo = false;

    const tryPlay = () => {
      if (
        disposed ||
        failedVideo ||
        document.hidden ||
        (dayVisibleRef.current !== undefined && !dayVisibleRef.current)
      ) {
        return;
      }
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {});
      }
    };

    const onPlaying = () => {
      playedOnce = true;
      setHasPlayed(true);
    };

    const onVideoError = () => {
      failedVideo = true;
      setVideoFailed(true);
      setHasPlayed(false);
    };

    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onVideoError);
    tryPlay();

    let gl = null;
    try {
      gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' });
    } catch {
      gl = null;
    }

    if (!gl) {
      setWebglFallback(true);
      const visInterval = window.setInterval(() => {
        if (disposed) return;
        const shouldPlay = !document.hidden && dayVisibleRef.current;
        if (shouldPlay && video.paused) tryPlay();
        else if (!shouldPlay && !video.paused) video.pause();
      }, 250);
      return () => {
        disposed = true;
        window.clearInterval(visInterval);
        video.removeEventListener('playing', onPlaying);
        video.removeEventListener('error', onVideoError);
        video.pause();
        video.removeAttribute('src');
        video.load();
      };
    }

    setWebglFallback(false);

    let program = null;
    let buffer = null;
    let texture = null;
    let locs = null;

    const setupGl = () => {
      if (!gl || gl.isContextLost()) return false;
      program = createProgram(gl);
      if (!program) return false;

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      locs = {
        aPos: gl.getAttribLocation(program, 'aPos'),
        uTex: gl.getUniformLocation(program, 'uTex'),
        uScale: gl.getUniformLocation(program, 'uScale'),
        uMouse: gl.getUniformLocation(program, 'uMouse'),
        uTilt: gl.getUniformLocation(program, 'uTilt'),
        uTime: gl.getUniformLocation(program, 'uTime'),
        uPresence: gl.getUniformLocation(program, 'uPresence'),
      };
      return true;
    };

    if (!setupGl()) {
      setWebglFallback(true);
      return () => {
        disposed = true;
        video.removeEventListener('playing', onPlaying);
        video.removeEventListener('error', onVideoError);
        video.pause();
        video.removeAttribute('src');
        video.load();
      };
    }

    let scaleX = 1;
    let scaleY = 1;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(window.innerWidth * dpr));
      const h = Math.max(1, Math.round(window.innerHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      if (gl && !gl.isContextLost()) {
        gl.viewport(0, 0, w, h);
      }
      const canvasAspect = w / h;
      if (canvasAspect > VIDEO_ASPECT) {
        scaleX = 1 * 0.975;
        scaleY = (VIDEO_ASPECT / canvasAspect) * 0.975;
      } else {
        scaleX = (canvasAspect / VIDEO_ASPECT) * 0.975;
        scaleY = 1 * 0.975;
      }
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let lastNow = performance.now();
    let elapsed = 0;
    let presence = 0;
    let tiltX = 0;
    let tiltY = 0;
    let lastMouseU = 0.5;
    let lastMouseV = 0.5;

    const frame = (now) => {
      if (disposed) return;
      rafId = window.requestAnimationFrame(frame);

      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;

      const shouldDecode = !document.hidden && Boolean(dayVisibleRef.current);
      if (!shouldDecode) {
        if (!video.paused) video.pause();
        return;
      }
      if (video.paused && !failedVideo) {
        tryPlay();
      }

      if (contextLost || failedVideo || !playedOnce || video.paused || video.readyState < 2) {
        return;
      }

      elapsed += dt;
      const pointer = getPointerState();
      const targetPresence = pointer.canHover && pointer.inside ? 1 : 0;
      const presenceRate = 1 - Math.exp(-6 * dt);
      presence += (targetPresence - presence) * presenceRate;

      if (pointer.canHover && pointer.inside) {
        lastMouseU = pointer.u;
        lastMouseV = pointer.v;
      }

      const targetTx = pointer.canHover ? pointer.tx : 0;
      const targetTy = pointer.canHover ? pointer.ty : 0;
      const tiltRate = 1 - Math.exp(-dt / 0.1);
      tiltX += (targetTx - tiltX) * tiltRate;
      tiltY += (targetTy - tiltY) * tiltRate;

      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
      } catch {
        return;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(locs.aPos);
      gl.vertexAttribPointer(locs.aPos, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1i(locs.uTex, 0);
      gl.uniform2f(locs.uScale, scaleX, scaleY);
      gl.uniform2f(locs.uMouse, lastMouseU, lastMouseV);
      gl.uniform2f(locs.uTilt, tiltX * 0.009 * scaleX, tiltY * 0.009 * scaleY);
      gl.uniform1f(locs.uTime, elapsed);
      gl.uniform1f(locs.uPresence, presence);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const onContextLost = (e) => {
      e.preventDefault();
      contextLost = true;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const onContextRestored = () => {
      contextLost = false;
      if (setupGl()) {
        resize();
        lastNow = performance.now();
        rafId = window.requestAnimationFrame(frame);
      } else {
        setWebglFallback(true);
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (!video.paused) video.pause();
      } else if (dayVisibleRef.current) {
        tryPlay();
      }
    };

    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);
    document.addEventListener('visibilitychange', onVisibilityChange);

    rafId = window.requestAnimationFrame(frame);

    return () => {
      disposed = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', onVideoError);

      if (gl && !gl.isContextLost()) {
        if (texture) gl.deleteTexture(texture);
        if (buffer) gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
      }

      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [reducedMotion, dayVisibleRef]);

  const showFallbackVideo = !reducedMotion && webglFallback && !videoFailed && hasPlayed;
  const showCanvas = !reducedMotion && !webglFallback && !videoFailed && hasPlayed;

  return (
    <>
      <video
        ref={videoRef}
        className={showFallbackVideo ? 'scene-video is-visible' : 'scene-video'}
        muted
        loop
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        aria-hidden="true"
      />
      <canvas
        ref={canvasRef}
        className={showCanvas ? 'scene-pondfx is-visible' : 'scene-pondfx'}
        aria-hidden="true"
      />
    </>
  );
}
