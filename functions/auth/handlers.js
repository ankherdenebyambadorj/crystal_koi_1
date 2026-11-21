import { z } from 'zod';
import {
  createUser,
  deleteUserSessions,
  findUserByEmail,
  findUserById,
  markUserEmailVerified,
  updateUnverifiedUser,
  updateUserPasswordVerified,
} from '../db.js';
import { isSmtpConfigured } from '../notify.js';
import { issueVerificationCode, verifyAndConsumeCode } from './codes.js';
import { DUMMY_PASSWORD_HASH, hashPassword, verifyPassword } from './password.js';
import { issueSession, revokeRequestSession } from './session.js';

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
  const parsed = z.object({ email: emailSchema, password: passwordSchema }).strict().safeParse(body);
  if (!parsed.success) {
    return { status: 400, body: { ok: false, code: 'invalid_credentials' } };
  }

  const user = await findUserByEmail(parsed.data.email);
  const hashToCheck = user?.password_hash ? user.password_hash : DUMMY_PASSWORD_HASH;
  const passwordValid = await verifyPassword(parsed.data.password, hashToCheck);

  if (!user || !user.password_hash || !passwordValid) {
    return { status: 401, body: { ok: false, code: 'invalid_credentials' } };
  }

  if (!user.email_verified) {
    return { status: 403, body: { ok: false, code: 'verification_required' } };
  }

  await issueSession(res, user.id);
  return {
    status: 200,
    body: {
      ok: true,
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
    },
  };
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

  const { email, full_name, password } = parsed.data;
  const existing = await findUserByEmail(email);

  if (existing && existing.email_verified) {
    return { status: 200, body: { ok: true, requiresVerification: true } };
  }

  const passHash = await hashPassword(password);
  let userId;
  if (existing) {
    await updateUnverifiedUser(existing.id, { full_name, password_hash: passHash });
    userId = existing.id;
  } else {
    const created = await createUser({
      email,
      full_name,
      password_hash: passHash,
      email_verified: false,
      google_sub: null,
      created_at: new Date().toISOString(),
    });
    userId = created.id;
  }

  const sent = await issueVerificationCode(userId, email, 'verify_email');
  if (!sent.sent) {
    return { status: sent.code === 'rate_limited' ? 429 : 503, body: { ok: false, code: sent.code } };
  }

  return { status: 200, body: { ok: true, requiresVerification: true } };
}

export async function handleVerifyEmail(body, res) {
  const parsed = z.object({ email: emailSchema, code: codeSchema }).strict().safeParse(body);
  if (!parsed.success) {
    return { status: 400, body: { ok: false, code: 'invalid_code' } };
  }

  const { valid, record } = await verifyAndConsumeCode(parsed.data.email, 'verify_email', parsed.data.code);
  if (!valid || !record) {
    return { status: 400, body: { ok: false, code: 'invalid_code' } };
  }

  await markUserEmailVerified(record.user_id);
  const user = await findUserById(record.user_id);
  if (!user) {
    return { status: 400, body: { ok: false, code: 'invalid_code' } };
  }

  await issueSession(res, user.id);
  return {
    status: 200,
    body: { ok: true, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } },
  };
}

export async function handleForgotPassword(body) {
  const parsed = z.object({ email: emailSchema }).strict().safeParse(body);
  if (!parsed.success) {
    return { status: 400, body: { ok: false, code: 'invalid_input' } };
  }

  if (!isSmtpConfigured()) {
    return { status: 503, body: { ok: false, code: 'unavailable' } };
  }

  const user = await findUserByEmail(parsed.data.email);
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

  const { valid, record } = await verifyAndConsumeCode(parsed.data.email, 'reset_password', parsed.data.code);
  if (!valid || !record) {
    return { status: 400, body: { ok: false, code: 'invalid_code' } };
  }

  const passHash = await hashPassword(parsed.data.new_password);
  await updateUserPasswordVerified(record.user_id, passHash);
  await deleteUserSessions(record.user_id);

  const user = await findUserById(record.user_id);
  if (!user) {
    return { status: 400, body: { ok: false, code: 'invalid_code' } };
  }

  await issueSession(res, user.id);
  return {
    status: 200,
    body: { ok: true, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } },
  };
}

export async function handleLogout(req, res) {
  await revokeRequestSession(req, res);
  return { status: 200, body: { ok: true } };
}
