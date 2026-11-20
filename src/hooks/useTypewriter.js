import { useEffect, useRef, useState } from 'react';

export function useTypewriter(targetRef, text, reducedMotion) {
  const [typed, setTyped] = useState(reducedMotion ? text : '');
  const startedRef = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      setTyped(text);
      return undefined;
    }

    let cancelled = false;
    let timerId = 0;
    let observer = null;

    const runLoop = (index) => {
      if (cancelled) return;
      if (index > text.length) {
        timerId = window.setTimeout(() => {
          if (cancelled) return;
          setTyped('');
          runLoop(1);
        }, 3200);
        return;
      }

      setTyped(text.slice(0, index));
      const prevChar = index > 0 ? text[index - 1] : '';
      const delay = prevChar === '\n' ? 120 : 22;
      timerId = window.setTimeout(() => runLoop(index + 1), delay);
    };

    const start = () => {
      if (startedRef.current || cancelled) return;
      startedRef.current = true;
      setTyped('');
      runLoop(1);
    };

    const el = targetRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      start();
      return () => {
        cancelled = true;
        window.clearTimeout(timerId);
      };
    }

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
            observer.disconnect();
            start();
            break;
          }
        }
      },
      { threshold: [0.3] },
    );

    observer.observe(el);

    return () => {
      cancelled = true;
      startedRef.current = false;
      window.clearTimeout(timerId);
      if (observer) observer.disconnect();
    };
  }, [targetRef, text, reducedMotion]);

  return typed;
}
