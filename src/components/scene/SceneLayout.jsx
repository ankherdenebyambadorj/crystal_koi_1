import { useEffect, useRef } from 'react';
import { DAY_PLATE_URL, NIGHT_PLATE_URL } from '../../content/assets.js';
import { getAnchors, subscribeAnchors } from '../../lib/measureAnchors.js';
import { initPointerStore } from '../../lib/pointerStore.js';
import { getScrollSnapshot, subscribeScroll } from '../../lib/scrollStore.js';
import { KoiScene } from './KoiScene.jsx';
import { PondCanvas } from './PondCanvas.jsx';
import { smoothstep } from './poseMath.js';

export function SceneLayout({ mode, reducedMotion }) {
  const dayRef = useRef(null);
  const violetRef = useRef(null);
  const nightRef = useRef(null);
  const dayVisibleRef = useRef(mode === 'home');
  const modeTargetRef = useRef(mode === 'home' ? 1 : 0);
  const modeMixRef = useRef(mode === 'home' ? 1 : 0);

  useEffect(() => {
    modeTargetRef.current = mode === 'home' ? 1 : 0;
    if (reducedMotion) {
      modeMixRef.current = modeTargetRef.current;
    }
  }, [mode, reducedMotion]);

  useEffect(() => {
    const cleanupPointer = initPointerStore();
    return cleanupPointer;
  }, []);

  useEffect(() => {
    let rafId = 0;
    let lastNow = performance.now();

    const applyCrossfade = () => {
      const snap = getScrollSnapshot();
      const anchors = getAnchors();
      const h = snap.viewportHeight || 900;
      const y = snap.scrollY;

      const toViolet = smoothstep(0.15 * h, 1.05 * h, y);
      const toVioletEff = toViolet + (1 - toViolet) * (1 - modeMixRef.current);

      const endTop = anchors.end ? anchors.end.top : Number.POSITIVE_INFINITY;
      const toNight = Number.isFinite(endTop)
        ? smoothstep(endTop - 1.1 * h, endTop - 0.1 * h, y)
        : 0;

      const dayOpacity = 1 - toVioletEff;
      const violetOpacity = toVioletEff * (1 - toNight);
      const nightOpacity = toNight;

      dayVisibleRef.current = dayOpacity > 0.001;

      if (dayRef.current) {
        dayRef.current.style.opacity = String(dayOpacity);
        dayRef.current.style.transform = `scale(${1 + 0.08 * toVioletEff}) translateY(${-0.06 * y}px)`;
      }
      if (violetRef.current) {
        violetRef.current.style.opacity = String(violetOpacity);
      }
      if (nightRef.current) {
        nightRef.current.style.opacity = String(nightOpacity);
      }

      const navEl = document.querySelector('.site-nav');
      if (navEl) {
        navEl.classList.toggle('scrolled', y > 0.5 * h || modeTargetRef.current === 0);
      }
    };

    const tick = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;
      const target = modeTargetRef.current;
      const diff = target - modeMixRef.current;

      if (Math.abs(diff) > 0.002 && !reducedMotion) {
        modeMixRef.current += diff * (1 - Math.exp(-6 * dt));
        applyCrossfade();
        rafId = window.requestAnimationFrame(tick);
      } else {
        modeMixRef.current = target;
        applyCrossfade();
        rafId = 0;
      }
    };

    const sync = () => {
      if (!rafId) {
        lastNow = performance.now();
        rafId = window.requestAnimationFrame(tick);
      }
    };

    applyCrossfade();
    const unsubScroll = subscribeScroll(applyCrossfade);
    const unsubAnchors = subscribeAnchors(applyCrossfade);
    if (Math.abs(modeTargetRef.current - modeMixRef.current) > 0.002) {
      sync();
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      unsubScroll();
      unsubAnchors();
    };
  }, [mode, reducedMotion]);

  return (
    <div className="scene-stack" aria-hidden="true">
      <div
        ref={dayRef}
        className="scene-layer scene-day"
        style={{ backgroundImage: `url("${DAY_PLATE_URL}")` }}
      >
        <PondCanvas reducedMotion={reducedMotion} dayVisibleRef={dayVisibleRef} />
      </div>
      <div ref={violetRef} className="scene-layer scene-violet" />
      <div
        ref={nightRef}
        className="scene-layer scene-night"
        style={{ backgroundImage: `url("${NIGHT_PLATE_URL}")` }}
      />
      <KoiScene mode={mode} reducedMotion={reducedMotion} />
    </div>
  );
}
