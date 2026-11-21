import { useEffect, useState } from 'react';
import { PHONE_UNIT_MAX_WIDTH, STACKED_MAX } from '../content/routes.js';

export function useViewportUnit() {
  const [isStacked, setIsStacked] = useState(() =>
    typeof window !== 'undefined' ? document.documentElement.clientWidth <= STACKED_MAX : false,
  );

  useEffect(() => {
    const update = () => {
      const width = document.documentElement.clientWidth || window.innerWidth || 1440;
      const stacked = width <= STACKED_MAX;
      const effectiveWidth = stacked ? Math.min(width, PHONE_UNIT_MAX_WIDTH) : width;
      const unit = effectiveWidth / (stacked ? 390 : 1440);
      document.documentElement.style.setProperty('--u', `${unit}px`);
      setIsStacked(stacked);
    };

    update();
    window.addEventListener('resize', update, { passive: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(update).catch(() => {});
    }

    return () => {
      window.removeEventListener('resize', update);
    };
  }, []);

  return isStacked;
}
