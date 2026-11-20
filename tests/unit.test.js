import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildSmoothPath, normalise, seededSeries } from '../src/lib/chartMath.js';
import { clamp, evaluatePoseTrack, lerpPose } from '../src/components/scene/poseMath.js';
import { sanitizeInternalNextPath } from '../src/lib/formLimits.js';

const TEMP_DB = path.join(os.tmpdir(), `ck-test-${Date.now()}.sqlite`);
process.env.DB_PATH = TEMP_DB;

const { getDb } = await import('../functions/db.js');
const { handleSubmitForm } = await import('../functions/submitForm.js');
const { getPartners, getServiceStatus, getStories } = await import('../functions/publicContent.js');
const { handleLogin, handleRegister } = await import('../functions/auth.js');

test.after(() => {
  for (const suffix of ['', '-wal', '-shm']) {
    const f = `${TEMP_DB}${suffix}`;
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
});

test('chartMath generates deterministic normalized smooth SVG paths', () => {
  const s1 = seededSeries(28, 17, 60, 12, 18);
  const s2 = seededSeries(28, 17, 60, 12, 18);
  assert.equal(s1.length, 28);
  assert.deepEqual(s1, s2);
  const norm = normalise(s1);
  assert.ok(norm.every((v) => v >= 0 && v <= 1));
  const pathStr = buildSmoothPath(
    norm.map((v, i) => ({ x: i * 10, y: 100 - v * 80 })),
  );
  assert.ok(pathStr.startsWith('M 0.00 '));
  assert.ok(pathStr.includes(' C '));
});

test('poseMath interpolates hero to product stop cleanly', () => {
  assert.equal(clamp(1.5, 0, 1), 1);
  const a = { x: 0, y: 0, s: 1, yaw: 0, pitch: 0, roll: 0 };
  const b = { x: 0.4, y: -0.2, s: 0.5, yaw: 2, pitch: -0.4, roll: 0.2 };
  const exactHalf = lerpPose(a, b, 0.5);
  assert.ok(Math.abs(exactHalf.x - 0.2) < 1e-6);
  const stops = [
    { at: 0, pose: a },
    { at: 1000, pose: b },
  ];
  const mid = evaluatePoseTrack(stops, 500);
  assert.ok(Math.abs(mid.x - 0.2) < 1e-6);
  assert.ok(Math.abs(mid.s - 0.75) < 1e-6);
});

test('sanitizeInternalNextPath blocks open redirects', () => {
  assert.equal(sanitizeInternalNextPath('/contact?topic=support'), '/contact?topic=support');
  assert.equal(sanitizeInternalNextPath('https://evil.com'), '/');
  assert.equal(sanitizeInternalNextPath('//evil.com'), '/');
  assert.equal(sanitizeInternalNextPath('/\\evil.com'), '/');
});

test('database starts with zero seed records', () => {
  const db = getDb();
  for (const table of [
    'call_requests',
    'access_requests',
    'contact_messages',
    'opt_out_requests',
    'partners',
    'customer_stories',
    'service_status',
    'status_incidents',
  ]) {
    const row = db.prepare(`SELECT COUNT(*) AS cnt FROM ${table}`).get();
    assert.equal(row.cnt, 0, `${table} must start empty`);
  }
  assert.deepEqual(getPartners().items, []);
  assert.deepEqual(getStories().items, []);
  assert.deepEqual(getServiceStatus(), { components: [], incidents: [] });
});

test('submitForm enforces validation, honeypot, idempotency, and rate limit', async () => {
  const oversized = await handleSubmitForm({}, 10241);
  assert.equal(oversized.body.code, 'invalid_input');

  const extraKey = await handleSubmitForm(
    {
      kind: 'opt_out',
      request_id: '11111111-1111-4111-8111-111111111111',
      website: '',
      source_path: '/opt-out',
      email: 'user@example.com',
      reason: 'none',
      role: 'admin',
    },
    200,
  );
  assert.equal(extraKey.status, 400);
  assert.equal(extraKey.body.code, 'invalid_input');

  const hp = await handleSubmitForm(
    {
      kind: 'opt_out',
      request_id: '22222222-2222-4222-8222-222222222222',
      website: 'https://bot.example',
      source_path: '/opt-out',
      email: 'bot@example.com',
    },
    180,
  );
  assert.deepEqual(hp.body, { ok: true });
  const db = getDb();
  assert.equal(db.prepare('SELECT COUNT(*) AS cnt FROM opt_out_requests').get().cnt, 0);

  const req1 = '33333333-3333-4333-8333-333333333333';
  const ok1 = await handleSubmitForm(
    {
      kind: 'opt_out',
      request_id: req1,
      website: '',
      source_path: '/opt-out',
      email: 'Rate@Example.com',
      reason: 'Stop telemetry',
    },
    180,
  );
  assert.deepEqual(ok1.body, { ok: true });

  // Duplicate request_id is idempotent
  const dup = await handleSubmitForm(
    {
      kind: 'opt_out',
      request_id: req1,
      website: '',
      source_path: '/opt-out',
      email: 'Rate@Example.com',
      reason: 'Stop telemetry',
    },
    180,
  );
  assert.deepEqual(dup.body, { ok: true });
  assert.equal(db.prepare('SELECT COUNT(*) AS cnt FROM opt_out_requests').get().cnt, 1);

  await handleSubmitForm(
    {
      kind: 'opt_out',
      request_id: '44444444-4444-4444-8444-444444444444',
      website: '',
      source_path: '/opt-out',
      email: 'rate@example.com',
    },
    150,
  );
  await handleSubmitForm(
    {
      kind: 'opt_out',
      request_id: '55555555-5555-4555-8555-555555555555',
      website: '',
      source_path: '/opt-out',
      email: 'rate@example.com',
    },
    150,
  );

  // 4th attempt in 10 min triggers rate_limited
  const rateLimited = await handleSubmitForm(
    {
      kind: 'opt_out',
      request_id: '66666666-6666-4666-8666-666666666666',
      website: '',
      source_path: '/opt-out',
      email: 'rate@example.com',
    },
    150,
  );
  assert.equal(rateLimited.status, 429);
  assert.equal(rateLimited.body.code, 'rate_limited');
});

test('getPartners returns only published rows and https URLs', () => {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO partners (name, category, description, website_url, is_published, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run('Hidden', 'supply', 'Draft', 'https://hidden.example', 0, 1, now);
  db.prepare(
    `INSERT INTO partners (name, category, description, website_url, is_published, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run('PublishedSafe', 'supply', 'Live', 'https://safe.example', 1, 2, now);
  db.prepare(
    `INSERT INTO partners (name, category, description, website_url, is_published, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run('UnsafeUrl', 'demand', 'Live', 'javascript:alert(1)', 1, 3, now);

  const res = getPartners();
  assert.equal(res.items.length, 2);
  assert.equal(res.items[0].name, 'PublishedSafe');
  assert.equal(res.items[0].website_url, 'https://safe.example/');
  assert.equal(res.items[1].website_url, '');
});

test('auth fails closed when SMTP is unconfigured and rejects invalid login', async () => {
  const reg = await handleRegister({
    full_name: 'Bat',
    email: 'bat@example.com',
    password: 'StrongPassword123',
  });
  assert.equal(reg.status, 503);
  assert.equal(reg.body.code, 'unavailable');

  const login = await handleLogin(
    { email: 'nobody@example.com', password: 'WrongPassword123' },
    { cookie() {}, clearCookie() {} },
  );
  assert.equal(login.status, 401);
  assert.equal(login.body.code, 'invalid_credentials');
});
