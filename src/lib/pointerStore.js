const pointer = {
  u: 0.5,
  v: 0.5,
  tx: 0,
  ty: 0,
  inside: false,
  canHover: false,
};

let bound = false;
let hoverQuery = null;

function updateCanHover() {
  pointer.canHover = Boolean(hoverQuery && hoverQuery.matches);
  if (!pointer.canHover) {
    pointer.inside = false;
    pointer.tx = 0;
    pointer.ty = 0;
  }
}

function onPointerMove(e) {
  if (!pointer.canHover) return;
  if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') {
    return;
  }
  const w = window.innerWidth || 1;
  const h = window.innerHeight || 1;
  const u = Math.min(1, Math.max(0, e.clientX / w));
  const v = Math.min(1, Math.max(0, 1 - e.clientY / h));
  pointer.u = u;
  pointer.v = v;
  pointer.tx = u * 2 - 1;
  pointer.ty = v * 2 - 1;
  pointer.inside = true;
}

function onPointerLeave() {
  pointer.inside = false;
  pointer.tx = 0;
  pointer.ty = 0;
}

export function initPointerStore() {
  if (bound || typeof window === 'undefined') return () => {};
  bound = true;

  hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  updateCanHover();

  if (hoverQuery.addEventListener) {
    hoverQuery.addEventListener('change', updateCanHover);
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onPointerLeave, { passive: true });

  return () => {
    bound = false;
    if (hoverQuery && hoverQuery.removeEventListener) {
      hoverQuery.removeEventListener('change', updateCanHover);
    }
    window.removeEventListener('pointermove', onPointerMove);
    document.documentElement.removeEventListener('pointerleave', onPointerLeave);
  };
}

export function getPointerState() {
  return pointer;
}
