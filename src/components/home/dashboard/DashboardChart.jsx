import { useEffect, useId, useMemo, useState } from 'react';
import { buildSmoothPath, seededSeries } from '../../../lib/chartMath.js';

export function DashboardChart({ range, revealed, reducedMotion, title, legend }) {
  const rawId = useId().replace(/:/g, '');
  const spendGradId = `ck-spend-${rawId}`;
  const winGradId = `ck-win-${rawId}`;
  const [drawn, setDrawn] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setDrawn(true);
      return undefined;
    }
    if (!revealed) {
      setDrawn(false);
      return undefined;
    }

    setDrawn(false);
    const raf = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setDrawn(true);
      });
    });
    return () => window.cancelAnimationFrame(raf);
  }, [range, revealed, reducedMotion]);

  const { spendLine, spendArea, winLine, winArea, markerX, markerY } = useMemo(() => {
    const n = range;
    const spend = seededSeries(n, 2, 90, 26, 60);
    const win = seededSeries(n, 9, 70, 22, 30);
    const maxVal = Math.max(...spend, ...win) + 10;
    const denom = Math.max(1, n - 1);

    const toPoint = (v, i) => ({
      x: (i * 600) / denom,
      y: 190 - 12 - (v / maxVal) * 160,
    });

    const spendPts = spend.map(toPoint);
    const winPts = win.map(toPoint);

    const sLine = buildSmoothPath(spendPts);
    const wLine = buildSmoothPath(winPts);
    const sArea = `${sLine} L 600 178 L 0 178 Z`;
    const wArea = `${wLine} L 600 178 L 0 178 Z`;

    const markerIdx = Math.min(n - 1, Math.max(0, Math.round((22 / 29) * (n - 1))));
    const mp = spendPts[markerIdx] || { x: 0, y: 178 };

    return {
      spendLine: sLine,
      spendArea: sArea,
      winLine: wLine,
      winArea: wArea,
      markerX: mp.x,
      markerY: mp.y,
    };
  }, [range]);

  return (
    <div className={`dash-pane ${drawn ? 'is-drawn' : ''}`}>
      <div className="dash-pane-head">
        <span className="dash-pane-title">{title}</span>
        <div className="dash-legend">
          <span className="dash-legend-item">
            <span className="dash-legend-swatch" style={{ background: '#9b8cff' }} />
            <span>{legend[0]}</span>
          </span>
          <span className="dash-legend-item">
            <span className="dash-legend-swatch" style={{ background: '#ff8fd8' }} />
            <span>{legend[1]}</span>
          </span>
        </div>
      </div>

      <svg
        key={range}
        viewBox="0 0 600 190"
        preserveAspectRatio="none"
        className="dash-area-svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={spendGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9b8cff" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#9b8cff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={winGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff8fd8" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ff8fd8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="0"
            y1={12 + i * 41.5}
            x2="600"
            y2={12 + i * 41.5}
            stroke="rgba(190,170,255,0.08)"
            strokeWidth="1"
          />
        ))}

        <path d={spendArea} fill={`url(#${spendGradId})`} className="dash-draw-fade" />
        <path d={winArea} fill={`url(#${winGradId})`} className="dash-draw-fade" />

        <path
          d={spendLine}
          fill="none"
          stroke="#9b8cff"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          pathLength="1"
          className="dash-draw-line"
        />
        <path
          d={winLine}
          fill="none"
          stroke="#ff8fd8"
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
          pathLength="1"
          className="dash-draw-line dash-draw-line--delay"
        />

        <g className="dash-draw-fade">
          <line
            x1={markerX}
            y1="12"
            x2={markerX}
            y2="178"
            stroke="rgba(220,210,255,0.25)"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <circle cx={markerX} cy={markerY} r="4.5" fill="#1a1150" stroke="#b9adff" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}
