import { ROUTES } from '../src/content/routes.js';

const KNOWN_ROUTES = new Set(Object.values(ROUTES));

export function isKnownRoute(pathname) {
  if (typeof pathname !== 'string' || !pathname.startsWith('/')) {
    return false;
  }
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return KNOWN_ROUTES.has(normalized);
}
