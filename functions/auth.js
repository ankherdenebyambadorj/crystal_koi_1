import crypto from 'node:crypto';
import { z } from 'zod';
import { getDb } from './db.js';
import { isSmtpConfigured, sendPlainEmail } from './notify.js';

const SESSION_COOKIE = 'ck_session';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const EPHEMERAL_SECRET = crypto.randomBytes(32).toString('hex');

function getSessionSecret() {
  return process.env.SESSION_SECRET || EPHEMERAL_SECRET;
}

function hashToken(token) {
  return crypto.createHmac('sha256', getSessionSecret()).update(token).digest('hex');
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, expectedHex] = storedHash.split(':');
  if (!salt || !expectedHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function parseCookies(req) {
  const header = req.headers?.cookie || '';
  const result = {};
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq <= 0) continue;
    const key = part.slice(0, eq).trim();
    const val = part.slice(eq + 1).trim();
    result[key] = decodeURIComponent(val);
  }
  return result;
}

function setSessionCookie(res, rawToken) {
  res.cookie(SESSION_COOKIE, rawToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    partitioned: true,
    path: '/',
    maxAge: SESSION_MAX_AGE_MS,
  });
}

function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    partitioned: true,
    path: '/',
  });
}

function createSession(res, userId) {
  const db = getDb();
  const rawToken = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashToken(rawToken);
  const nowIso = new Date().toISOString();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString();

  db.prepare('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').run(
    tokenHash,
    userId,
    expiresAt,
    nowIso,
  );
  setSessionCookie(res, rawToken);
}

export function getSessionUser(req) {
  const cookies = parseCookies(req);
  const rawToken = cookies[SESSION_COOKIE];
  if (!rawToken) return null;

  const db = getDb();
  const tokenHash = hashToken(rawToken);
  const nowIso = new Date().toISOString();
  const row = db
    .prepare(
      `SELECT u.id, u.email, u.full_name, u.role, u.email_verified, s.expires_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ? LIMIT 1`,
    )
    .get(tokenHash);

  if (!row || row.expires_at <= nowIso) {
    if (row) db.prepare('DELETE FROM sessions WHERE id = ?').run(tokenHash);
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

const emailSchema = z
  .string()
  .transform((s) => s.trim().toLowerCase())
  .pipe(z.string().email().max(254));

const passwordSchema = z.string().min(8).max(128);
const nameSchema = z
  .string()
  .transform((s) => s.trim())
  .refine((s) => !/[\x00-\x1F\x7F]/.test(s) && s.length >= 1 && s.length <= 100);

const codeSchema = z.string().regex(/^\d{6}$/);

export function getAuthConfig() {
  return {
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    mailEnabled: isSmtpConfigured(),
  };
}

export async function handleLogin(body, res) {
  const parsed = z
    .object({ email: emailSchema, password: passwordSchema })
    .strict()
    .safeParse(body);

  if (!parsed.success) {
    return { status: 400, body: { ok: false, code: 'invalid_credentials' } };
  }

  const db = getDb();
  const user = db
    .prepare('SELECT id, email, full_name, password_hash, role, email_verified FROM users WHERE email = ? LIMIT 1')
    .get(parsed.data.email);

  if (!user || !verifyPassword(parsed.data.password, user.password_hash)) {
    return { status: 401, body: { ok: false, code: 'invalid_credentials' } };
  }

  if (!user.email_verified) {
    return { status: 403, body: { ok: false, code: 'verification_required' } };
  }

  createSession(res, user.id);
  return {
    status: 200,
    body: {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    },
  };
}

async function issueVerificationCode(userId, email, purpose) {
  if (!isSmtpConfigured()) {
    return { sent: false, code: 'unavailable' };
  }

  const db = getDb();
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const recent = db
    .prepare(
      'SELECT COUNT(*) AS cnt FROM email_verifications WHERE email = ? AND purpose = ? AND created_at >= ?',
    )
    .get(email, purpose, tenMinAgo);
  if (Number(recent?.cnt || 0) >= 3) {
    return { sent: false, code: 'rate_limited' };
  }

  const code = String(crypto.randomInt(100000, 1000000));
  const codeHash = hashToken(`${purpose}:${email}:${code}`);
  const nowIso = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  db.prepare(
    `INSERT INTO email_verifications (user_id, email, purpose, code_hash, attempts, expires_at, created_at)
     VALUES (?, ?, ?, ?, 0, ?, ?)`,
  ).run(userId, email, purpose, codeHash, expiresAt, nowIso);

  const mail = await sendPlainEmail({
    to: email,
    subject: 'Crystal Koi — Баталгаажуулах код',
    text: `Crystal Koi баталгаажуулах код: ${code}\nЭнэ код 10 минутын хугацаанд хүчинтэй.`,
  });

  if (!mail.sent) {
    return { sent: false, code: 'unavailable' };
  }
  return { sent: true };
}

export async function handleRegister(body) {
  const parsed = z
    .object({ full_name: nameSchema, email: emailSchema, password: passwordSchema })
    .strict()
    .safeParse(body);

  if (!parsed.success) {
    return { status: 400, body: { ok: false, code: 'invalid_input' } };
  }

  if (!isSmtpConfigured()) {
    return { status: 503, body: { ok: false, code: 'unavailable' } };
  }

  const db = getDb();
  const { email, full_name, password } = parsed.data;
  const existing = db.prepare('SELECT id, email_verified FROM users WHERE email = ? LIMIT 1').get(email);

  let userId;
  const passHash = hashPassword(password);
  const nowIso = new Date().toISOString();

  if (existing && existing.email_verified) {
    // Return uniform verification step response without altering verified account or leaking existence
    return { status: 200, body: { ok: true, requiresVerification: true } };
  }

  if (existing) {
    db.prepare('UPDATE users SET full_name = ?, password_hash = ? WHERE id = ?').run(
      full_name,
      passHash,
      existing.id,
    );
    userId = existing.id;
  } else {
    const info = db
      .prepare(
        `INSERT INTO users (email, full_name, password_hash, role, email_verified, created_at)
         VALUES (?, ?, ?, 'user', 0, ?)`,
      )
      .run(email, full_name, passHash, nowIso);
    userId = Number(info.lastInsertRowid);
  }

  const sent = await issueVerificationCode(userId, email, 'verify_email');
  if (!sent.sent) {
    return {
      status: sent.code === 'rate_limited' ? 429 : 503,
      body: { ok: false, code: sent.code },
    };
  }

  return { status: 200, body: { ok: true, requiresVerification: true } };
}

export async function handleVerifyEmail(body, res) {
  const parsed = z
    .object({ email: emailSchema, code: codeSchema })
    .strict()
    .safeParse(body);

  if (!parsed.success) {
    return { status: 400, body: { ok: false, code: 'invalid_code' } };
  }

  const db = getDb();
  const nowIso = new Date().toISOString();
  const record = db
    .prepare(
      `SELECT id, user_id, code_hash, attempts, expires_at
       FROM email_verifications
       WHERE email = ? AND purpose = 'verify_email' AND consumed_at IS NULL
       ORDER BY id DESC LIMIT 1`,
    )
    .get(parsed.data.email);

  if (!record || record.expires_at <= nowIso || record.attempts >= 5) {
    return { status: 400, body: { ok: false, code: 'invalid_code' } };
  }

  const candidateHash = hashToken(`verify_email:${parsed.data.email}:${parsed.data.code}`);
  if (!crypto.timingSafeEqual(Buffer.from(candidateHash, 'hex'), Buffer.from(record.code_hash, 'hex'))) {
    db.prepare('UPDATE email_verifications SET attempts = attempts + 1 WHERE id = ?').run(record.id);
    return { status: 400, body: { ok: false, code: 'invalid_code' } };
  }

  db.prepare('UPDATE email_verifications SET consumed_at = ? WHERE id = ?').run(nowIso, record.id);
  db.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').run(record.user_id);

  const user = db
    .prepare('SELECT id, email, full_name, role FROM users WHERE id = ? LIMIT 1')
    .get(record.user_id);

  createSession(res, user.id);
  return { status: 200, body: { ok: true, user } };
}

export async function handleForgotPassword(body) {
  const parsed = z.object({ email: emailSchema }).strict().safeParse(body);
  if (!parsed.success) {
    return { status: 400, body: { ok: false, code: 'invalid_input' } };
  }

  if (!isSmtpConfigured()) {
    return { status: 503, body: { ok: false, code: 'unavailable' } };
  }

  const db = getDb();
  const user = db.prepare('SELECT id, email FROM users WHERE email = ? LIMIT 1').get(parsed.data.email);
  if (user) {
    await issueVerificationCode(user.id, user.email, 'reset_password').catch(() => {});
  }

  return { status: 200, body: { ok: true } };
}

export async function handleResetPassword(body, res) {
  const parsed = z
    .object({ email: emailSchema, code: codeSchema, new_password: passwordSchema })
    .strict()
    .safeParse(body);

  if (!parsed.success) {
    return { status: 400, body: { ok: false, code: 'invalid_code' } };
  }

  const db = getDb();
  const nowIso = new Date().toISOString();
  const record = db
    .prepare(
      `SELECT id, user_id, code_hash, attempts, expires_at
       FROM email_verifications
       WHERE email = ? AND purpose = 'reset_password' AND consumed_at IS NULL
       ORDER BY id DESC LIMIT 1`,
    )
    .get(parsed.data.email);

  if (!record || record.expires_at <= nowIso || record.attempts >= 5) {
    return { status: 400, body: { ok: false, code: 'invalid_code' } };
  }

  const candidateHash = hashToken(`reset_password:${parsed.data.email}:${parsed.data.code}`);
  if (!crypto.timingSafeEqual(Buffer.from(candidateHash, 'hex'), Buffer.from(record.code_hash, 'hex'))) {
    db.prepare('UPDATE email_verifications SET attempts = attempts + 1 WHERE id = ?').run(record.id);
    return { status: 400, body: { ok: false, code: 'invalid_code' } };
  }

  const passHash = hashPassword(parsed.data.new_password);
  db.prepare('UPDATE email_verifications SET consumed_at = ? WHERE id = ?').run(nowIso, record.id);
  db.prepare('UPDATE users SET password_hash = ?, email_verified = 1 WHERE id = ?').run(
    passHash,
    record.user_id,
  );
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(record.user_id);

  const user = db
    .prepare('SELECT id, email, full_name, role FROM users WHERE id = ? LIMIT 1')
    .get(record.user_id);

  createSession(res, user.id);
  return { status: 200, body: { ok: true, user } };
}

export async function handleGoogleLogin(body, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return { status: 503, body: { ok: false, code: 'unavailable' } };
  }

  const parsed = z
    .object({ credential: z.string().min(20).max(4096) })
    .strict()
    .safeParse(body);
  if (!parsed.success) {
    return { status: 400, body: { ok: false, code: 'invalid_credentials' } };
  }

  try {
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(parsed.data.credential)}`,
    );
    if (!verifyRes.ok) {
      return { status: 401, body: { ok: false, code: 'invalid_credentials' } };
    }
    const info = await verifyRes.json();
    if (info.aud !== clientId || info.email_verified !== 'true' || !info.sub || !info.email) {
      return { status: 401, body: { ok: false, code: 'invalid_credentials' } };
    }

    const email = String(info.email).trim().toLowerCase();
    const fullName = String(info.name || email.split('@')[0]).slice(0, 100);
    const db = getDb();
    let user = db
      .prepare('SELECT id, email, full_name, role FROM users WHERE google_sub = ? OR email = ? LIMIT 1')
      .get(info.sub, email);

    if (!user) {
      const insert = db
        .prepare(
          `INSERT INTO users (email, full_name, password_hash, role, email_verified, google_sub, created_at)
           VALUES (?, ?, '', 'user', 1, ?, ?)`,
        )
        .run(email, fullName, info.sub, new Date().toISOString());
      user = {
        id: Number(insert.lastInsertRowid),
        email,
        full_name: fullName,
        role: 'user',
      };
    } else {
      db.prepare('UPDATE users SET google_sub = COALESCE(google_sub, ?), email_verified = 1 WHERE id = ?').run(
        info.sub,
        user.id,
      );
    }

    createSession(res, user.id);
    return { status: 200, body: { ok: true, user } };
  } catch {
    return { status: 503, body: { ok: false, code: 'unavailable' } };
  }
}

export function handleLogout(req, res) {
  const cookies = parseCookies(req);
  const rawToken = cookies[SESSION_COOKIE];
  if (rawToken) {
    const db = getDb();
    db.prepare('DELETE FROM sessions WHERE id = ?').run(hashToken(rawToken));
  }
  clearSessionCookie(res);
  return { status: 200, body: { ok: true } };
}
