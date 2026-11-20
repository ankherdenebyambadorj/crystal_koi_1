const listeners = new Set();

const state = {
  scrollY: 0,
  viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 900,
  maxScroll: 0,
};

let rafId = 0;

function readMetrics() {
  state.scrollY = window.scrollY || window.pageYOffset || 0;
  state.viewportHeight = window.innerHeight || 900;
  const docHeight = document.documentElement.scrollHeight || 0;
  state.maxScroll = Math.max(0, docHeight - state.viewportHeight);
}

function notify() {
  rafId = 0;
  readMetrics();
  listeners.forEach((fn) => fn(state));
}

function schedule() {
  if (!rafId) {
    rafId = window.requestAnimationFrame(notify);
  }
}

let bound = false;

function ensureBound() {
  if (bound || typeof window === 'undefined') return;
  bound = true;
  readMetrics();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
}

export function subscribeScroll(listener) {
  ensureBound();
  listeners.add(listener);
  listener(state);
  return () => {
    listeners.delete(listener);
  };
}

export function refreshScrollState() {
  if (typeof window === 'undefined') return;
  readMetrics();
  listeners.forEach((fn) => fn(state));
}

export function getScrollSnapshot() {
  return state;
}
