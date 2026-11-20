import { z } from 'zod';
import { getDb } from './db.js';
import { notifyIntakeSubmission } from './notify.js';

const KIND_TABLE = {
  call_request: 'call_requests',
  access_request: 'access_requests',
  contact_message: 'contact_messages',
  opt_out: 'opt_out_requests',
};

const ALL_TABLES = ['call_requests', 'access_requests', 'contact_messages', 'opt_out_requests'];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PHONE_RE = /^[+\d\s().-]{6,20}$/;
const SINGLE_LINE_CTRL_RE = /[\x00-\x1F\x7F]/;
const MULTI_LINE_CTRL_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
const SOURCE_PATH_RE = /^\/[A-Za-z0-9\-_/?=&%]*$/;

function hasBadControlChars(val, multiline = false) {
  if (typeof val !== 'string') return true;
  return (multiline ? MULTI_LINE_CTRL_RE : SINGLE_LINE_CTRL_RE).test(val);
}

const singleLine = (min, max) =>
  z
    .string()
    .transform((s) => s.trim())
    .refine((s) => !hasBadControlChars(s, false), 'ctrl')
    .refine((s) => s.length >= min && s.length <= max, 'len');

const optionalSingleLine = (max) =>
  z
    .string()
    .optional()
    .default('')
    .transform((s) => s.trim())
    .refine((s) => !hasBadControlChars(s, false), 'ctrl')
    .refine((s) => s.length <= max, 'len');

const multiLine = (min, max) =>
  z
    .string()
    .transform((s) => s.replace(/\r\n/g, '\n').trim())
    .refine((s) => !hasBadControlChars(s, true), 'ctrl')
    .refine((s) => s.length >= min && s.length <= max, 'len');

const optionalMultiLine = (max) =>
  z
    .string()
    .optional()
    .default('')
    .transform((s) => s.replace(/\r\n/g, '\n').trim())
    .refine((s) => !hasBadControlChars(s, true), 'ctrl')
    .refine((s) => s.length <= max, 'len');

const emailSchema = z
  .string()
  .transform((s) => s.trim().toLowerCase())
  .refine((s) => !hasBadControlChars(s, false), 'ctrl')
  .pipe(z.string().email().max(254));

const requiredPhoneSchema = z
  .string()
  .transform((s) => s.trim())
  .refine((s) => !hasBadControlChars(s, false), 'ctrl')
  .refine((s) => PHONE_RE.test(s), 'phone');

const optionalPhoneSchema = z
  .string()
  .optional()
  .default('')
  .transform((s) => s.trim())
  .refine((s) => !hasBadControlChars(s, false), 'ctrl')
  .refine((s) => s === '' || PHONE_RE.test(s), 'phone');

const sourcePathSchema = z
  .string()
  .transform((s) => s.trim())
  .refine((s) => !hasBadControlChars(s, false), 'ctrl')
  .refine((s) => s.length >= 1 && s.length <= 100 && SOURCE_PATH_RE.test(s), 'source');

const requestIdSchema = z.string().regex(UUID_RE);

const honeypotSchema = z
  .string()
  .optional()
  .default('')
  .transform((s) => s.trim());

const SCHEMAS = {
  call_request: z
    .object({
      kind: z.literal('call_request'),
      request_id: requestIdSchema,
      website: honeypotSchema,
      source_path: sourcePathSchema,
      full_name: singleLine(1, 100),
      email: emailSchema,
      phone: requiredPhoneSchema,
      company: singleLine(1, 120),
      preferred_window: z.enum(['morning', 'afternoon', 'evening']),
      consent_given: z.literal(true),
    })
    .strict(),

  access_request: z
    .object({
      kind: z.literal('access_request'),
      request_id: requestIdSchema,
      website: honeypotSchema,
      source_path: sourcePathSchema,
      full_name: singleLine(1, 100),
      email: emailSchema,
      phone: requiredPhoneSchema,
      company: singleLine(1, 120),
      role: z.enum(['media_agency', 'direct_advertiser', 'publisher', 'ad_tech']),
      monthly_volume: z.enum(['under_10m', '10m_to_100m', 'over_100m']),
      consent_given: z.literal(true),
    })
    .strict(),

  contact_message: z
    .object({
      kind: z.literal('contact_message'),
      request_id: requestIdSchema,
      website: honeypotSchema,
      source_path: sourcePathSchema,
      full_name: singleLine(1, 100),
      email: emailSchema,
      phone: optionalPhoneSchema,
      company: optionalSingleLine(120),
      topic: z.enum(['general', 'partnership', 'support']),
      message: multiLine(1, 2000),
      consent_given: z.literal(true),
    })
    .strict(),

  opt_out: z
    .object({
      kind: z.literal('opt_out'),
      request_id: requestIdSchema,
      website: honeypotSchema,
      source_path: sourcePathSchema,
      email: emailSchema,
      reason: optionalMultiLine(500),
    })
    .strict(),
};

function logOutcome(kind, code) {
  process.stderr.write(`[submitForm] kind=${kind || 'unknown'} code=${code}\n`);
}

export async function handleSubmitForm(payload, byteLength = 0) {
  if (byteLength > 10240) {
    logOutcome('unknown', 'invalid_input');
    return { status: 413, body: { ok: false, code: 'invalid_input' } };
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    logOutcome('unknown', 'invalid_input');
    return { status: 400, body: { ok: false, code: 'invalid_input' } };
  }

  const kind = typeof payload.kind === 'string' && KIND_TABLE[payload.kind] ? payload.kind : null;
  if (!kind) {
    logOutcome('unknown', 'invalid_input');
    return { status: 400, body: { ok: false, code: 'invalid_input' } };
  }

  if (typeof payload.website === 'string' && payload.website.trim().length > 0) {
    logOutcome(kind, 'honeypot_ignored');
    return { status: 200, body: { ok: true } };
  }

  const parsed = SCHEMAS[kind].safeParse(payload);
  if (!parsed.success) {
    logOutcome(kind, 'invalid_input');
    return { status: 400, body: { ok: false, code: 'invalid_input' } };
  }

  const data = parsed.data;
  const table = KIND_TABLE[kind];
  const nowIso = new Date().toISOString();
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  try {
    const db = getDb();

    const existing = db
      .prepare(`SELECT id FROM ${table} WHERE request_id = ? LIMIT 1`)
      .get(data.request_id);
    if (existing) {
      return { status: 200, body: { ok: true } };
    }

    let emailCount = 0;
    for (const tbl of ALL_TABLES) {
      const row = db
        .prepare(`SELECT COUNT(*) AS cnt FROM ${tbl} WHERE email = ? AND created_at >= ?`)
        .get(data.email, tenMinAgo);
      emailCount += Number(row?.cnt || 0);
    }

    if (emailCount >= 3) {
      logOutcome(kind, 'rate_limited');
      return { status: 429, body: { ok: false, code: 'rate_limited' } };
    }

    const hourRow = db
      .prepare(`SELECT COUNT(*) AS cnt FROM ${table} WHERE created_at >= ?`)
      .get(oneHourAgo);
    if (Number(hourRow?.cnt || 0) >= 200) {
      logOutcome(kind, 'unavailable');
      return { status: 503, body: { ok: false, code: 'unavailable' } };
    }

    if (kind === 'call_request') {
      db.prepare(
        `INSERT INTO call_requests
         (request_id, full_name, email, phone, company, preferred_window, status, source_path, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'new', ?, ?)`,
      ).run(
        data.request_id,
        data.full_name,
        data.email,
        data.phone,
        data.company,
        data.preferred_window,
        data.source_path,
        nowIso,
      );
    } else if (kind === 'access_request') {
      db.prepare(
        `INSERT INTO access_requests
         (request_id, full_name, email, phone, company, role, monthly_volume, status, source_path, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)`,
      ).run(
        data.request_id,
        data.full_name,
        data.email,
        data.phone,
        data.company,
        data.role,
        data.monthly_volume,
        data.source_path,
        nowIso,
      );
    } else if (kind === 'contact_message') {
      db.prepare(
        `INSERT INTO contact_messages
         (request_id, full_name, email, phone, company, topic, message, status, source_path, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)`,
      ).run(
        data.request_id,
        data.full_name,
        data.email,
        data.phone,
        data.company,
        data.topic,
        data.message,
        data.source_path,
        nowIso,
      );
    } else if (kind === 'opt_out') {
      db.prepare(
        `INSERT INTO opt_out_requests
         (request_id, email, reason, status, source_path, created_at)
         VALUES (?, ?, ?, 'new', ?, ?)`,
      ).run(data.request_id, data.email, data.reason, data.source_path, nowIso);
    }

    notifyIntakeSubmission(kind, {
      request_id: data.request_id,
      source_path: data.source_path,
      created_at: nowIso,
    }).catch(() => {});

    return { status: 200, body: { ok: true } };
  } catch {
    logOutcome(kind, 'unavailable');
    return { status: 503, body: { ok: false, code: 'unavailable' } };
  }
}
