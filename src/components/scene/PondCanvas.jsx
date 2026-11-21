import { useEffect, useRef, useState } from 'react';
import { POND_VIDEO_URL } from '../../content/assets.js';
import { getPointerState } from '../../lib/pointerStore.js';
import { initPondGl, VIDEO_ASPECT } from './pondShader.js';

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
      if (disposed || failedVideo || document.hidden || (dayVisibleRef.current !== undefined && !dayVisibleRef.current)) return;
      video.play()?.catch(() => {});
    };

    const onPlaying = () => { playedOnce = true; setHasPlayed(true); };
    const onVideoError = () => { failedVideo = true; setVideoFailed(true); setHasPlayed(false); };
    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onVideoError);
    tryPlay();

    let gl = null;
    try { gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' }); } catch { gl = null; }

    let glRes = gl ? initPondGl(gl) : null;
    if (!gl || !glRes) {
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
      if (!gl.isContextLost()) gl.viewport(0, 0, w, h);
      const aspect = w / h;
      scaleX = aspect > VIDEO_ASPECT ? 0.975 : (aspect / VIDEO_ASPECT) * 0.975;
      scaleY = aspect > VIDEO_ASPECT ? (VIDEO_ASPECT / aspect) * 0.975 : 0.975;
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

      if (document.hidden || !dayVisibleRef.current) {
        if (!video.paused) video.pause();
        return;
      }
      if (video.paused && !failedVideo) tryPlay();
      if (contextLost || failedVideo || !playedOnce || video.paused || video.readyState < 2 || !glRes) return;

      elapsed += dt;
      const pointer = getPointerState();
      presence += ((pointer.canHover && pointer.inside ? 1 : 0) - presence) * (1 - Math.exp(-6 * dt));
      if (pointer.canHover && pointer.inside) {
        lastMouseU = pointer.u;
        lastMouseV = pointer.v;
      }
      const tiltRate = 1 - Math.exp(-dt / 0.1);
      tiltX += ((pointer.canHover ? pointer.tx : 0) - tiltX) * tiltRate;
      tiltY += ((pointer.canHover ? pointer.ty : 0) - tiltY) * tiltRate;

      const { program, buffer, texture, locs } = glRes;
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video); } catch { return; }

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

    const onLost = (e) => { e.preventDefault(); contextLost = true; if (rafId) window.cancelAnimationFrame(rafId); rafId = 0; };
    const onRestored = () => {
      contextLost = false;
      glRes = initPondGl(gl);
      if (glRes) { resize(); lastNow = performance.now(); rafId = window.requestAnimationFrame(frame); }
      else setWebglFallback(true);
    };
    const onVisibility = () => (document.hidden ? !video.paused && video.pause() : dayVisibleRef.current && tryPlay());

    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    document.addEventListener('visibilitychange', onVisibility);
    rafId = window.requestAnimationFrame(frame);

    return () => {
      disposed = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', onVideoError);
      if (!gl.isContextLost() && glRes) {
        gl.deleteTexture(glRes.texture);
        gl.deleteBuffer(glRes.buffer);
        gl.deleteProgram(glRes.program);
      }
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [reducedMotion, dayVisibleRef]);

  return (
    <>
      <video
        ref={videoRef}
        className={!reducedMotion && webglFallback && !videoFailed && hasPlayed ? 'scene-video is-visible' : 'scene-video'}
        muted
        loop
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        aria-hidden="true"
      />
      <canvas
        ref={canvasRef}
        className={!reducedMotion && !webglFallback && !videoFailed && hasPlayed ? 'scene-pondfx is-visible' : 'scene-pondfx'}
        aria-hidden="true"
      />
    </>
  );
}
