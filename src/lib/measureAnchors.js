import { refreshScrollState } from './scrollStore.js';

const ANCHOR_IDS = ['hero', 'studio', 'dash', 'packs', 'uses', 'end'];

const anchors = {
  hero: null,
  studio: null,
  dash: null,
  packs: null,
  uses: null,
  end: null,
};

const listeners = new Set();

export function measureAnchors() {
  if (typeof window === 'undefined') return anchors;
  const scrollY = window.scrollY || window.pageYOffset || 0;

  for (const id of ANCHOR_IDS) {
    const el = document.getElementById(id);
    if (!el) {
      anchors[id] = null;
      continue;
    }
    const rect = el.getBoundingClientRect();
    anchors[id] = {
      top: rect.top + scrollY,
      height: rect.height,
    };
  }

  refreshScrollState();
  listeners.forEach((fn) => fn(anchors));
  return anchors;
}

export function getAnchors() {
  return anchors;
}

export function subscribeAnchors(fn) {
  listeners.add(fn);
  fn(anchors);
  return () => {
    listeners.delete(fn);
  };
}
