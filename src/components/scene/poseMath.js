export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function smoothstep(edge0, edge1, value) {
  if (edge1 === edge0) return value >= edge1 ? 1 : 0;
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function easeInOutCubic(t) {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function lerpPose(a, b, t) {
  const e = easeInOutCubic(t);
  return {
    x: a.x + (b.x - a.x) * e,
    y: a.y + (b.y - a.y) * e,
    s: a.s + (b.s - a.s) * e,
    yaw: a.yaw + (b.yaw - a.yaw) * e,
    pitch: a.pitch + (b.pitch - a.pitch) * e,
    roll: a.roll + (b.roll - a.roll) * e,
  };
}

export function evaluatePoseTrack(stops, scrollY) {
  if (!stops || stops.length === 0) {
    return null;
  }
  if (stops.length === 1 || scrollY <= stops[0].at) {
    return { ...stops[0].pose };
  }
  const lastIndex = stops.length - 1;
  if (scrollY >= stops[lastIndex].at) {
    return { ...stops[lastIndex].pose };
  }

  for (let i = 0; i < lastIndex; i += 1) {
    const start = stops[i];
    const end = stops[i + 1];
    if (scrollY >= start.at && scrollY <= end.at) {
      const span = end.at - start.at;
      const t = span <= 0 ? 1 : (scrollY - start.at) / span;
      return lerpPose(start.pose, end.pose, t);
    }
  }

  return { ...stops[lastIndex].pose };
}
