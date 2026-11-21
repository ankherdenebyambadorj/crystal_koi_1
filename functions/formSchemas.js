import { z } from 'zod';

export const KIND_SET = new Set(['call_request', 'access_request', 'contact_message', 'opt_out']);

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
const honeypotSchema = z.string().optional().default('').transform((s) => s.trim());

export const INTAKE_SCHEMAS = {
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
