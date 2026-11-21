import * as assets from '../src/content/assets.js';
import { isCrossSiteCookie } from './auth/session.js';

function collectAssetOrigins() {
  const origins = new Set();
  for (const val of Object.values(assets)) {
    if (typeof val !== 'string' || !val.startsWith('http')) continue;
    try {
      origins.add(new URL(val).origin);
    } catch {
      // ignore invalid URLs
    }
  }
  return origins;
}

export function buildCspHeader(isProd) {
  const assetOrigins = [...collectAssetOrigins()];
  const googleOrigin = 'https://accounts.google.com';
  const imgHosts = ['https://images.higgs.ai', ...assetOrigins.filter((o) => o.includes('higgs'))];
  const uniqueImg = [...new Set(imgHosts)].join(' ');
  const uniqueConnect = [...new Set([...assetOrigins, googleOrigin])].join(' ');
  const mediaHosts = assetOrigins.filter((o) => o.includes('cloudfront'));
  const uniqueMedia = [...new Set(mediaHosts)].join(' ');
  const scriptSrc = isProd
    ? `'self' ${googleOrigin}`
    : `'self' 'unsafe-inline' ${googleOrigin}`;

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com ${googleOrigin}`,
    "font-src 'self' https://fonts.gstatic.com",
    `img-src 'self' data: blob: ${uniqueImg}`.trim(),
    `media-src 'self' blob: ${uniqueMedia}`.trim(),
    `connect-src 'self' ${uniqueConnect}`,
    `frame-src ${googleOrigin}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    isProd && !isCrossSiteCookie() ? "frame-ancestors 'none'" : "frame-ancestors 'self' https://aistudio.google.com https://*.google.com",
  ];
  return directives.join('; ');
}

export function securityHeadersMiddleware(isProd) {
  const csp = buildCspHeader(isProd);
  return (_req, res, next) => {
    if (isProd) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Content-Security-Policy', csp);
    next();
  };
}

export function isAllowedOrigin({ origin, referer, host, protocol = 'https', appUrl = process.env.APP_URL }) {
  const allowed = new Set();
  if (appUrl) {
    try {
      allowed.add(new URL(appUrl).origin);
    } catch {
      // ignore malformed APP_URL
    }
  }
  if (host) {
    allowed.add(`${protocol}://${host}`);
    allowed.add(`https://${host}`);
    allowed.add(`http://${host}`);
  }

  if (origin) {
    return allowed.has(origin);
  }
  if (referer) {
    try {
      return allowed.has(new URL(referer).origin);
    } catch {
      return false;
    }
  }
  return true;
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function apiSecurityMiddleware(req, res, next) {
  if (!MUTATING_METHODS.has(req.method)) {
    return next();
  }

  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    return res.status(403).json({ ok: false, code: 'forbidden' });
  }

  const ok = isAllowedOrigin({
    origin: req.headers.origin,
    referer: req.headers.referer,
    host: req.get('host'),
    protocol: req.protocol,
  });

  if (!ok) {
    return res.status(403).json({ ok: false, code: 'forbidden' });
  }
  return next();
}
