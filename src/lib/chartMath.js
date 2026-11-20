export function seededSeries(n, seed, base, amp, trend) {
  let s = seed;
  const out = [];
  const denom = Math.max(1, n - 1);

  for (let i = 0; i < n; i += 1) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    const val = base + trend * (i / denom) + Math.sin(i * 0.9 + seed) * amp * 0.5 + (r - 0.5) * amp;
    out.push(val);
  }

  return out;
}

export function normalise(values) {
  if (!values || values.length === 0) return [];
  let min = values[0];
  let max = values[0];
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] < min) min = values[i];
    if (values[i] > max) max = values[i];
  }
  const span = max - min;
  if (span === 0) return values.map(() => 0.5);
  return values.map((v) => (v - min) / span);
}

export function buildSmoothPath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length; i += 1) {
    const q = points[i - 1];
    const p = points[i];
    const midX = (q.x + p.x) / 2;
    d += ` C ${midX.toFixed(2)} ${q.y.toFixed(2)}, ${midX.toFixed(2)} ${p.y.toFixed(2)}, ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  }
  return d;
}
