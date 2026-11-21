import { useEffect } from 'react';

export function useNoIndex() {
  useEffect(() => {
    let el = document.querySelector('meta[name="robots"]');
    const existed = Boolean(el);
    const prevContent = el ? el.getAttribute('content') : null;

    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', 'robots');
      document.head.appendChild(el);
    }
    el.setAttribute('content', 'noindex,follow');

    return () => {
      if (existed) {
        if (prevContent === null) {
          el.removeAttribute('content');
        } else {
          el.setAttribute('content', prevContent);
        }
      } else {
        el.remove();
      }
    };
  }, []);
}
