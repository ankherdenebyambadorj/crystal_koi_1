import crypto from 'node:crypto';
import {
  consumeVerification,
  countRecentVerifications,
  createVerification,
  getLatestActiveVerification,
  incrementVerificationAttempts,
} from '../db.js';
import { isSmtpConfigured, sendPlainEmail } from '../notify.js';
import { hashToken } from './session.js';

export async function issueVerificationCode(userId, email, purpose) {
  if (!isSmtpConfigured()) {
    return { sent: false, code: 'unavailable' };
  }

  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const recentCount = await countRecentVerifications(email, purpose, tenMinAgo);
  if (recentCount >= 3) {
    return { sent: false, code: 'rate_limited' };
  }

  const code = String(crypto.randomInt(100000, 1000000));
  const codeHash = hashToken(`${purpose}:${email}:${code}`);
  const nowIso = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await createVerification({
    user_id: userId,
    email,
    purpose,
    code_hash: codeHash,
    expires_at: expiresAt,
    created_at: nowIso,
  });

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

export async function verifyAndConsumeCode(email, purpose, submittedCode) {
  const nowIso = new Date().toISOString();
  const record = await getLatestActiveVerification(email, purpose);

  if (!record || record.expires_at <= nowIso || record.attempts >= 5) {
    return { valid: false, record: null };
  }

  const candidateHash = hashToken(`${purpose}:${email}:${submittedCode}`);
  const candidateBuf = Buffer.from(candidateHash, 'hex');
  const storedBuf = Buffer.from(record.code_hash, 'hex');

  if (candidateBuf.length !== storedBuf.length || !crypto.timingSafeEqual(candidateBuf, storedBuf)) {
    await incrementVerificationAttempts(record.id);
    return { valid: false, record: null };
  }

  await consumeVerification(record.id, nowIso);
  return { valid: true, record };
}
