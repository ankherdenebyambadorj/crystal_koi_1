import { useEffect } from 'react';

function getCssPath(el) {
  const parts = [];
  let node = el;
  while (node && node.nodeType === 1 && node !== document.documentElement) {
    let seg = node.tagName.toLowerCase();
    if (node.id) {
      seg += `#${node.id}`;
      parts.unshift(seg);
      break;
    }
    if (node.className && typeof node.className === 'string') {
      const firstClass = node.className.trim().split(/\s+/)[0];
      if (firstClass) seg += `.${firstClass}`;
    }
    parts.unshift(seg);
    node = node.parentElement;
  }
  return parts.join(' > ');
}

export function useOverflowWatch(activeKey) {
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;

    const check = () => {
      const vw = document.documentElement.clientWidth;
      if (document.documentElement.scrollWidth <= vw) return;
      const nodes = document.body.querySelectorAll('*');
      for (const node of nodes) {
        const rect = node.getBoundingClientRect();
        if (rect.width > 0 && rect.right > vw + 1) {
          console.warn('[overflow-watch]', getCssPath(node), Math.round(rect.right), '>', vw);
        }
      }
    };

    const rafId = window.requestAnimationFrame(check);
    window.addEventListener('resize', check, { passive: true });
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', check);
    };
  }, [activeKey]);
}
