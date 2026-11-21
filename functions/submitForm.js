import {
  countRecentByEmail,
  countRecentByKind,
  findIntakeByRequestId,
  initStore,
  insertIntake,
} from './db.js';
import { INTAKE_SCHEMAS, KIND_SET } from './formSchemas.js';
import { notifyIntakeSubmission } from './notify.js';

function logOutcome(kind, code) {
  process.stderr.write(`[submitForm] ts=${new Date().toISOString()} kind=${kind || 'unknown'} code=${code}\n`);
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

  const kind = typeof payload.kind === 'string' && KIND_SET.has(payload.kind) ? payload.kind : null;
  if (!kind) {
    logOutcome('unknown', 'invalid_input');
    return { status: 400, body: { ok: false, code: 'invalid_input' } };
  }

  if (typeof payload.website === 'string' && payload.website.trim().length > 0) {
    logOutcome(kind, 'honeypot_ignored');
    return { status: 200, body: { ok: true } };
  }

  const parsed = INTAKE_SCHEMAS[kind].safeParse(payload);
  if (!parsed.success) {
    logOutcome(kind, 'invalid_input');
    return { status: 400, body: { ok: false, code: 'invalid_input' } };
  }

  const data = parsed.data;
  const nowIso = new Date().toISOString();
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  try {
    await initStore();

    const exists = await findIntakeByRequestId(kind, data.request_id);
    if (exists) {
      return { status: 200, body: { ok: true } };
    }

    const emailCount = await countRecentByEmail(data.email, tenMinAgo);
    if (emailCount >= 3) {
      logOutcome(kind, 'rate_limited');
      return { status: 429, body: { ok: false, code: 'rate_limited' } };
    }

    const hourCount = await countRecentByKind(kind, oneHourAgo);
    if (hourCount >= 200) {
      logOutcome(kind, 'unavailable');
      return { status: 503, body: { ok: false, code: 'unavailable' } };
    }

    const record = {
      ...data,
      consent_given: kind === 'opt_out' ? undefined : true,
      consent_at: kind === 'opt_out' ? undefined : nowIso,
      created_at: nowIso,
    };

    await insertIntake(kind, record);

    notifyIntakeSubmission(kind, record).catch(() => {});

    return { status: 200, body: { ok: true } };
  } catch {
    logOutcome(kind, 'unavailable');
    return { status: 503, body: { ok: false, code: 'unavailable' } };
  }
}
