import { useEffect, useRef } from 'react';

const EASING = 'cubic-bezier(0.2, 0.75, 0.2, 1)';

const STEPS = [
  { key: 'nav', from: { opacity: 0, transform: 'translateY(-14px)' }, delay: 0, duration: 900 },
  { key: 'line1', from: { opacity: 0, transform: 'translateY(105%)' }, delay: 250, duration: 1100 },
  { key: 'line2', from: { opacity: 0, transform: 'translateY(105%)' }, delay: 370, duration: 1100 },
  { key: 'subline', from: { opacity: 0, transform: 'translateY(12px)' }, delay: 620, duration: 900 },
  { key: 'buttons', from: { opacity: 0, transform: 'translateY(14px)' }, delay: 740, duration: 900 },
  { key: 'scrollCard', from: { opacity: 0, transform: 'translateY(40px) scale(0.96)' }, delay: 880, duration: 1100 },
];

export function useHeroEntrance(refs, reducedMotion) {
  const ranRef = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    const failsafeId = window.setTimeout(() => {
      root.classList.remove('anim');
    }, 3000);

    if (reducedMotion || ranRef.current) {
      root.classList.remove('anim');
      return () => window.clearTimeout(failsafeId);
    }

    ranRef.current = true;
    const animations = [];

    for (const step of STEPS) {
      const el = refs[step.key]?.current || (step.key === 'nav' ? document.querySelector('.site-nav') : null);
      if (!el || !el.animate) continue;
      const anim = el.animate(
        [step.from, { opacity: 1, transform: 'none' }],
        {
          delay: step.delay,
          duration: step.duration,
          easing: EASING,
          fill: 'backwards',
        },
      );
      animations.push(anim);
    }

    const rafId = window.requestAnimationFrame(() => {
      root.classList.remove('anim');
    });

    return () => {
      window.clearTimeout(failsafeId);
      window.cancelAnimationFrame(rafId);
      animations.forEach((a) => {
        try {
          a.cancel();
        } catch {
          // Ignore already-finished animations
        }
      });
    };
  }, [refs, reducedMotion]);
}
