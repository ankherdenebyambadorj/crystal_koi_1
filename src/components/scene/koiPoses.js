export const DESKTOP_POSES = {
  hero: { x: 0.02, y: 0.16, s: 0.72, yaw: 0.18, pitch: -0.92, roll: 0.05 },
  statement: { x: -0.66, y: -0.6, s: 0.42, yaw: 0.5, pitch: 0.2, roll: -0.1 },
  dash: { x: 0.5, y: -0.5, s: 0.46, yaw: -0.35, pitch: 0.32, roll: 0.1 },
  packs: { x: 0.4, y: -0.78, s: 0.5, yaw: 0.55, pitch: -0.05, roll: 0.08 },
  uses: { x: -0.42, y: -0.42, s: 0.6, yaw: 3.0, pitch: 0.12, roll: -0.06 },
  end: { x: -0.7, y: 0.56, s: 0.48, yaw: 0.3, pitch: -0.14, roll: 0.05 },
};

export const PHONE_POSE_OVERRIDES = {
  hero: { x: 0.12, y: 0.38, s: 0.46 },
  statement: { x: 0.42, y: -0.72, s: 0.3 },
  dash: { x: -0.35, y: -0.74, s: 0.3 },
  packs: { x: 0.38, y: -0.74, s: 0.3 },
  uses: { x: -0.3, y: -0.76, s: 0.32 },
  end: { x: 0.3, y: -0.74, s: 0.32 },
};

export function getPose(key, isStacked) {
  const base = DESKTOP_POSES[key] || DESKTOP_POSES.hero;
  if (!isStacked) return { ...base };
  const override = PHONE_POSE_OVERRIDES[key];
  return override ? { ...base, ...override } : { ...base };
}

export function buildHomePoseStops(anchors, viewportHeight, maxScroll, isStacked) {
  const h = viewportHeight || 900;
  const stops = [{ at: 0, pose: getPose('hero', isStacked) }];

  if (anchors.studio) {
    stops.push({ at: anchors.studio.top + 0.2 * h, pose: getPose('statement', isStacked) });
  }
  if (anchors.dash) {
    stops.push({
      at: anchors.dash.top + anchors.dash.height * 0.5 - 0.5 * h,
      pose: getPose('dash', isStacked),
    });
  }
  if (anchors.packs) {
    stops.push({ at: anchors.packs.top + 0.3 * h, pose: getPose('packs', isStacked) });
  }
  if (anchors.uses) {
    stops.push({ at: anchors.uses.top + 0.3 * h, pose: getPose('uses', isStacked) });
  }
  if (anchors.end) {
    stops.push({ at: Math.min(anchors.end.top, maxScroll), pose: getPose('end', isStacked) });
  }

  return stops.sort((a, b) => a.at - b.at);
}

export function buildInnerPoseStops(viewportHeight, maxScroll, isStacked) {
  const h = viewportHeight || 900;
  if (maxScroll < 0.35 * h) {
    return [{ at: 0, pose: getPose('dash', isStacked) }];
  }

  return [
    { at: 0, pose: getPose('dash', isStacked) },
    { at: maxScroll / 3, pose: getPose('packs', isStacked) },
    { at: (maxScroll * 2) / 3, pose: getPose('uses', isStacked) },
    { at: maxScroll, pose: getPose('end', isStacked) },
  ];
}
