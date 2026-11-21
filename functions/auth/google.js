import { z } from 'zod';
import {
  clearUnverifiedUserSecrets,
  createUser,
  deleteUnusedUserVerifications,
  deleteUserSessions,
  findUserByGoogleOrEmail,
  setGoogleVerifiedUser,
} from '../db.js';
import { issueSession } from './session.js';

const GOOGLE_ISSUERS = new Set(['https://accounts.google.com', 'accounts.google.com']);

const googleBodySchema = z.object({ credential: z.string().min(20).max(4096) }).strict();

export async function handleGoogleLogin(body, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return { status: 503, body: { ok: false, code: 'unavailable' } };
  }

  const parsed = googleBodySchema.safeParse(body);
  if (!parsed.success) {
    return { status: 400, body: { ok: false, code: 'invalid_credentials' } };
  }

  try {
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(parsed.data.credential)}`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!verifyRes.ok) {
      return { status: 401, body: { ok: false, code: 'invalid_credentials' } };
    }

    const info = await verifyRes.json();
    const emailVerified = info.email_verified === 'true' || info.email_verified === true;
    const expMs = Number(info.exp || 0) * 1000;
    const validIssuer = !info.iss || GOOGLE_ISSUERS.has(String(info.iss));

    if (
      info.aud !== clientId ||
      !validIssuer ||
      !Number.isFinite(expMs) ||
      expMs <= Date.now() ||
      !emailVerified ||
      !info.sub ||
      !info.email
    ) {
      return { status: 401, body: { ok: false, code: 'invalid_credentials' } };
    }

    const email = String(info.email).trim().toLowerCase();
    const fullName = String(info.name || email.split('@')[0]).slice(0, 100);
    const existing = await findUserByGoogleOrEmail(info.sub, email);

    let user;
    if (!existing) {
      user = await createUser({
        email,
        full_name: fullName,
        password_hash: '',
        email_verified: true,
        google_sub: info.sub,
        created_at: new Date().toISOString(),
      });
    } else {
      if (existing.google_sub && existing.google_sub !== info.sub) {
        return { status: 401, body: { ok: false, code: 'invalid_credentials' } };
      }

      const needsPreHijackReset =
        !existing.google_sub || (Boolean(existing.password_hash) && !existing.email_verified);

      if (needsPreHijackReset) {
        await clearUnverifiedUserSecrets(existing.id);
        await deleteUserSessions(existing.id);
        await deleteUnusedUserVerifications(existing.id);
      }

      await setGoogleVerifiedUser(existing.id, info.sub);
      user = {
        id: existing.id,
        email: existing.email,
        full_name: existing.full_name,
        role: existing.role,
      };
    }

    await issueSession(res, user.id);
    return { status: 200, body: { ok: true, user } };
  } catch {
    return { status: 503, body: { ok: false, code: 'unavailable' } };
  }
}
