import crypto from 'node:crypto';
import { createSession as insertSession, deleteSession, getSessionWithUser } from '../db.js';

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const EPHEMERAL_DEV_SECRET = crypto.randomBytes(32).toString('hex');

export function isCrossSiteCookie() {
  const flag = String(process.env.COOKIE_CROSS_SITE || '').trim().toLowerCase();
  return flag === 'true' || flag === '1';
}

export function getSessionCookieName() {
  if (process.env.NODE_ENV === 'production' && !isCrossSiteCookie()) {
    return '__Host-ck_session';
  }
  return 'ck_session';
}

export function validateSessionConfig() {
  const isProd = process.env.NODE_ENV === 'production';
  const secret = process.env.SESSION_SECRET || '';
  if (isProd && secret.length < 32) {
    throw new Error('SESSION_SECRET must be set and at least 32 characters in production.');
  }
}

export function getSessionSecret() {
  const secret = process.env.SESSION_SECRET || '';
  if (process.env.NODE_ENV === 'production') {
    if (secret.length < 32) {
      throw new Error('SESSION_SECRET must be set and at least 32 characters in production.');
    }
    return secret;
  }
  return secret || EPHEMERAL_DEV_SECRET;
}

export function hashToken(token) {
  return crypto.createHmac('sha256', getSessionSecret()).update(token).digest('hex');
}

export function parseCookies(req) {
  const header = req?.headers?.cookie;
  if (typeof header !== 'string' || !header || header.length > 8192) return {};
  const result = {};
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq <= 0) continue;
    const key = part.slice(0, eq).trim();
    const rawVal = part.slice(eq + 1).trim();
    if (!key) continue;
    try {
      result[key] = decodeURIComponent(rawVal);
    } catch {
      // Ignore malformed percent-encoding instead of throwing
    }
  }
  return result;
}

function cookieOptions(includeMaxAge) {
  const crossSite = isCrossSiteCookie();
  const opts = {
    httpOnly: true,
    secure: true,
    sameSite: crossSite ? 'none' : 'lax',
    path: '/',
  };
  if (crossSite) opts.partitioned = true;
  if (includeMaxAge) opts.maxAge = SESSION_MAX_AGE_MS;
  return opts;
}

export function setSessionCookie(res, rawToken) {
  res.cookie(getSessionCookieName(), rawToken, cookieOptions(true));
}

export function clearSessionCookie(res) {
  res.clearCookie(getSessionCookieName(), cookieOptions(false));
}

export async function issueSession(res, userId) {
  const rawToken = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashToken(rawToken);
  const nowIso = new Date().toISOString();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString();

  await insertSession({ id: tokenHash, user_id: userId, expires_at: expiresAt, created_at: nowIso });
  setSessionCookie(res, rawToken);
}

export async function getSessionUser(req) {
  const cookies = parseCookies(req);
  const rawToken = cookies[getSessionCookieName()] || cookies.ck_session;
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);
  const row = await getSessionWithUser(tokenHash);
  const nowIso = new Date().toISOString();

  if (!row || row.expires_at <= nowIso) {
    if (row) await deleteSession(tokenHash);
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    role: row.role,
    email_verified: Boolean(row.email_verified),
  };
}

export async function revokeRequestSession(req, res) {
  const cookies = parseCookies(req);
  const rawToken = cookies[getSessionCookieName()] || cookies.ck_session;
  if (rawToken) {
    await deleteSession(hashToken(rawToken));
  }
  clearSessionCookie(res);
}
