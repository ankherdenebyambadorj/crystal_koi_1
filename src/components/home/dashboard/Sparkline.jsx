import { useId, useMemo } from 'react';
import { buildSmoothPath, normalise, seededSeries } from '../../../lib/chartMath.js';

export function Sparkline({ spec, color, index, drawn }) {
  const rawId = useId().replace(/:/g, '');
  const gradId = `ck-spark-${index}-${rawId}`;

  const { linePath, areaPath } = useMemo(() => {
    const raw = seededSeries(spec[0], spec[1], spec[2], spec[3], spec[4]);
    const norm = normalise(raw);
    const pts = norm.map((v, i) => ({
      x: (i * 200) / (raw.length - 1),
      y: 28 - v * 24,
    }));
    const line = buildSmoothPath(pts);
    return {
      linePath: line,
      areaPath: `${line} L 200 30 L 0 30 Z`,
    };
  }, [spec]);

  return (
    <svg
      viewBox="0 0 200 30"
      preserveAspectRatio="none"
      className={`dash-spark ${drawn ? 'is-drawn' : ''}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} className="dash-draw-fade" />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        vectorEffect="non-scaling-stroke"
        pathLength="1"
        className="dash-draw-line"
      />
    </svg>
  );
}
