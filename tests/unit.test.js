import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSmoothPath, normalise, seededSeries } from '../src/lib/chartMath.js';
import { clamp, evaluatePoseTrack, lerpPose } from '../src/components/scene/poseMath.js';
import { sanitizeInternalNextPath } from '../src/lib/formLimits.js';
import { PHONE_UNIT_MAX_WIDTH, STACKED_MAX } from '../src/content/routes.js';
import { setRepository } from '../functions/db.js';
import { handleSubmitForm } from '../functions/submitForm.js';
import { getPartners, getServiceStatus, getStories } from '../functions/publicContent.js';
import {
  clearSessionCookie,
  handleGoogleLogin,
  handleLogin,
  handleRegister,
  hashPassword,
  parseCookies,
  setSessionCookie,
  validateSessionConfig,
  verifyPassword,
} from '../functions/auth.js';
import { checkRateLimit, resetRateLimits } from '../functions/rateLimit.js';
import { isAllowedOrigin } from '../functions/security.js';

function createFakeRepo() {
  let nextId = 1;
  const tables = {
    call_request: [],
    access_request: [],
    contact_message: [],
    opt_out: [],
  };
  const partners = [];
  const stories = [];
  const statusComponents = [];
  const statusIncidents = [];
  const users = [];
  const sessions = [];
  const verifications = [];

  return {
    users,
    sessions,
    verifications,
    tables,
    partners,
    async initStore() {},
    async findIntakeByRequestId(kind, requestId) {
      return tables[kind].some((r) => r.request_id === requestId);
    },
    async countRecentByEmail(email, sinceIso) {
      return Object.values(tables)
        .flat()
        .filter((r) => r.email === email && r.created_at >= sinceIso).length;
    },
    async countRecentByKind(kind, sinceIso) {
      return tables[kind].filter((r) => r.created_at >= sinceIso).length;
    },
    async insertIntake(kind, record) {
      tables[kind].push({ id: nextId++, ...record });
    },
    async getPublishedPartners() {
      return partners
        .filter((p) => p.is_published)
        .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
    },
    async getPublishedStories() {
      return stories.filter((s) => s.is_published);
    },
    async getPublishedServiceStatus(sinceIso) {
      return {
        components: statusComponents.filter((c) => c.is_published),
        incidents: statusIncidents.filter((i) => i.is_published && i.occurred_at >= sinceIso),
      };
    },
    async findUserByEmail(email) {
      return users.find((u) => u.email === email) || null;
    },
    async findUserByGoogleOrEmail(sub, email) {
      return users.find((u) => u.google_sub === sub || u.email === email) || null;
    },
    async findUserById(id) {
      return users.find((u) => u.id === id) || null;
    },
    async createUser(u) {
      const row = { id: nextId++, role: 'user', ...u, email_verified: u.email_verified ? 1 : 0 };
      users.push(row);
      return { ...row, email_verified: Boolean(row.email_verified) };
    },
    async updateUnverifiedUser(id, d) {
      const u = users.find((x) => x.id === id);
      if (u) Object.assign(u, d);
    },
    async clearUnverifiedUserSecrets(id) {
      const u = users.find((x) => x.id === id);
      if (u) u.password_hash = '';
    },
    async setGoogleVerifiedUser(id, sub) {
      const u = users.find((x) => x.id === id);
      if (u) {
        u.google_sub = u.google_sub || sub;
        u.email_verified = 1;
      }
    },
    async updateUserPasswordVerified(id, h) {
      const u = users.find((x) => x.id === id);
      if (u) {
        u.password_hash = h;
        u.email_verified = 1;
      }
    },
    async markUserEmailVerified(id) {
      const u = users.find((x) => x.id === id);
      if (u) u.email_verified = 1;
    },
    async createSession(s) {
      sessions.push(s);
    },
    async getSessionWithUser(tokenHash) {
      const s = sessions.find((x) => x.id === tokenHash);
      if (!s) return null;
      const u = users.find((x) => x.id === s.user_id);
      return u ? { ...u, expires_at: s.expires_at } : null;
    },
    async deleteSession(tokenHash) {
      const idx = sessions.findIndex((x) => x.id === tokenHash);
      if (idx >= 0) sessions.splice(idx, 1);
    },
    async deleteUserSessions(userId) {
      for (let i = sessions.length - 1; i >= 0; i -= 1) {
        if (sessions[i].user_id === userId) sessions.splice(i, 1);
      }
    },
    async countRecentVerifications(email, purpose, sinceIso) {
      return verifications.filter(
        (v) => v.email === email && v.purpose === purpose && v.created_at >= sinceIso,
      ).length;
    },
    async createVerification(v) {
      verifications.push({ id: nextId++, attempts: 0, consumed_at: null, ...v });
    },
    async getLatestActiveVerification(email, purpose) {
      return (
        [...verifications]
          .reverse()
          .find((v) => v.email === email && v.purpose === purpose && !v.consumed_at) || null
      );
    },
    async incrementVerificationAttempts(id) {
      const v = verifications.find((x) => x.id === id);
      if (v) v.attempts += 1;
    },
    async consumeVerification(id, consumedAt) {
      const v = verifications.find((x) => x.id === id);
      if (v) v.consumed_at = consumedAt;
    },
    async deleteUnusedUserVerifications(userId) {
      for (let i = verifications.length - 1; i >= 0; i -= 1) {
        if (verifications[i].user_id === userId && !verifications[i].consumed_at) {
          verifications.splice(i, 1);
        }
      }
    },
    async purgeExpiredAuthRecords() {},
  };
}

let fakeRepo = createFakeRepo();
test.beforeEach(() => {
  fakeRepo = createFakeRepo();
  setRepository(fakeRepo);
  resetRateLimits();
});

test('chartMath generates deterministic normalized smooth SVG paths', () => {
  const s1 = seededSeries(28, 17, 60, 12, 18);
  const s2 = seededSeries(28, 17, 60, 12, 18);
  assert.equal(s1.length, 28);
  assert.deepEqual(s1, s2);
  const norm = normalise(s1);
  assert.ok(norm.every((v) => v >= 0 && v <= 1));
  const pathStr = buildSmoothPath(norm.map((v, i) => ({ x: i * 10, y: 100 - v * 80 })));
  assert.ok(pathStr.startsWith('M 0.00 '));
  assert.ok(pathStr.includes(' C '));
});

test('poseMath interpolates hero to product stop cleanly', () => {
  assert.equal(clamp(1.5, 0, 1), 1);
  const a = { x: 0, y: 0, s: 1, yaw: 0, pitch: 0, roll: 0 };
  const b = { x: 0.4, y: -0.2, s: 0.5, yaw: 2, pitch: -0.4, roll: 0.2 };
  const mid = evaluatePoseTrack(
    [
      { at: 0, pose: a },
      { at: 1000, pose: b },
    ],
    500,
  );
  assert.ok(Math.abs(mid.x - 0.2) < 1e-6);
  assert.ok(Math.abs(mid.s - 0.75) < 1e-6);
  assert.ok(Math.abs(lerpPose(a, b, 0.5).x - 0.2) < 1e-6);
});

test('viewport unit cap limits --u growth on tablet widths up to 820px', () => {
  const calcU = (w) => {
    const stacked = w <= STACKED_MAX;
    return (stacked ? Math.min(w, PHONE_UNIT_MAX_WIDTH) : w) / (stacked ? 390 : 1440);
  };
  assert.equal(PHONE_UNIT_MAX_WIDTH, 487);
  assert.ok(Math.abs(calcU(390) - 1) < 1e-6);
  assert.ok(Math.abs(calcU(600) - 487 / 390) < 1e-6);
  assert.ok(Math.abs(calcU(820) - 487 / 390) < 1e-6);
  assert.ok(Math.abs(calcU(1440) - 1) < 1e-6);
});

test('sanitizeInternalNextPath blocks open redirects', () => {
  assert.equal(sanitizeInternalNextPath('/contact?topic=support'), '/contact?topic=support');
  assert.equal(sanitizeInternalNextPath('https://evil.com'), '/');
  assert.equal(sanitizeInternalNextPath('//evil.com'), '/');
  assert.equal(sanitizeInternalNextPath('/\\evil.com'), '/');
});

test('publicContent starts empty with zero seed records', async () => {
  assert.deepEqual((await getPartners()).items, []);
  assert.deepEqual((await getStories()).items, []);
  assert.deepEqual(await getServiceStatus(), { components: [], incidents: [] });
});

test('submitForm stores consent fields, enforces validation, honeypot, idempotency, and rate limit', async () => {
  const oversized = await handleSubmitForm({}, 10241);
  assert.equal(oversized.body.code, 'invalid_input');

  const consented = await handleSubmitForm(
    {
      kind: 'contact_message',
      request_id: '01111111-1111-4111-8111-111111111111',
      website: '',
      source_path: '/contact',
      full_name: 'Bold Bat',
      email: 'Bold@Example.com',
      phone: '',
      company: '',
      topic: 'general',
      message: 'Hello studio team',
      consent_given: true,
    },
    320,
  );
  assert.deepEqual(consented.body, { ok: true });
  assert.equal(fakeRepo.tables.contact_message.length, 1);
  assert.equal(fakeRepo.tables.contact_message[0].consent_given, true);
  assert.ok(fakeRepo.tables.contact_message[0].consent_at);

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
  assert.equal(fakeRepo.tables.opt_out.length, 0);

  const req1 = '33333333-3333-4333-8333-333333333333';
  await handleSubmitForm(
    {
      kind: 'opt_out',
      request_id: req1,
      website: '',
      source_path: '/opt-out',
      email: 'Rate@Example.com',
      reason: 'Stop',
    },
    180,
  );
  await handleSubmitForm(
    {
      kind: 'opt_out',
      request_id: req1,
      website: '',
      source_path: '/opt-out',
      email: 'Rate@Example.com',
      reason: 'Stop',
    },
    180,
  );
  assert.equal(fakeRepo.tables.opt_out.length, 1);

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
  const limited = await handleSubmitForm(
    {
      kind: 'opt_out',
      request_id: '66666666-6666-4666-8666-666666666666',
      website: '',
      source_path: '/opt-out',
      email: 'rate@example.com',
    },
    150,
  );
  assert.equal(limited.status, 429);
  assert.equal(limited.body.code, 'rate_limited');
});

test('getPartners returns only published rows and https URLs', async () => {
  const now = new Date().toISOString();
  fakeRepo.partners.push(
    { id: 1, name: 'Hidden', category: 'supply', description: 'Draft', website_url: 'https://hidden.example', is_published: 0, sort_order: 1, created_at: now },
    { id: 2, name: 'Safe', category: 'supply', description: 'Live', website_url: 'https://safe.example', is_published: 1, sort_order: 2, created_at: now },
    { id: 3, name: 'Unsafe', category: 'demand', description: 'Live', website_url: 'javascript:alert(1)', is_published: 1, sort_order: 3, created_at: now },
  );

  const res = await getPartners();
  assert.equal(res.items.length, 2);
  assert.equal(res.items[0].name, 'Safe');
  assert.equal(res.items[0].website_url, 'https://safe.example/');
  assert.equal(res.items[1].website_url, '');
});

test('rate limiter enforces window limits, Retry-After, and resets cleanly after expiry', () => {
  const t0 = 100000;
  for (let i = 0; i < 3; i += 1) {
    assert.equal(checkRateLimit('k:1', 3, 60000, t0 + i).allowed, true);
  }
  const blocked = checkRateLimit('k:1', 3, 60000, t0 + 100);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSec >= 59);
  assert.equal(checkRateLimit('k:1', 3, 60000, t0 + 60005).allowed, true);
});

test('async password hashing, session config validation, cookies, and CSRF guard work securely', async () => {
  const hashed = await hashPassword('StrongPassword123');
  assert.equal(await verifyPassword('StrongPassword123', hashed), true);
  assert.equal(await verifyPassword('WrongPassword123', hashed), false);

  const parsed = parseCookies({ headers: { cookie: 'bad=%ZZ; ok=hello%20world' } });
  assert.equal(parsed.ok, 'hello world');
  assert.equal(parsed.bad, undefined);

  const captured = [];
  const res = {
    cookie(name, val, opts) { captured.push({ op: 'set', name, opts }); },
    clearCookie(name, opts) { captured.push({ op: 'clear', name, opts }); },
  };
  delete process.env.COOKIE_CROSS_SITE;
  setSessionCookie(res, 'tok');
  clearSessionCookie(res);
  assert.equal(captured[0].opts.sameSite, 'lax');
  assert.equal(captured[0].opts.partitioned, undefined);

  process.env.COOKIE_CROSS_SITE = 'true';
  setSessionCookie(res, 'tok');
  assert.equal(captured[2].opts.sameSite, 'none');
  assert.equal(captured[2].opts.partitioned, true);
  delete process.env.COOKIE_CROSS_SITE;

  const prevEnv = process.env.NODE_ENV;
  const prevSecret = process.env.SESSION_SECRET;
  process.env.NODE_ENV = 'production';
  process.env.SESSION_SECRET = 'short';
  assert.throws(() => validateSessionConfig(), /SESSION_SECRET/);
  process.env.NODE_ENV = prevEnv;
  if (prevSecret === undefined) delete process.env.SESSION_SECRET;
  else process.env.SESSION_SECRET = prevSecret;

  assert.equal(isAllowedOrigin({ origin: 'https://evil.example', host: 'ck.mn', appUrl: 'https://ck.mn' }), false);
  assert.equal(isAllowedOrigin({ origin: 'https://ck.mn', host: 'ck.mn', appUrl: 'https://ck.mn' }), true);
  assert.equal(isAllowedOrigin({ referer: 'https://evil.example/x', host: 'ck.mn', appUrl: 'https://ck.mn' }), false);
});

test('Google login prevents pre-hijacking by clearing unverified passwords, sessions, and verification codes', async () => {
  const passHash = await hashPassword('AttackerPassword99');
  const user = await fakeRepo.createUser({
    email: 'victim@example.com',
    full_name: 'Victim',
    password_hash: passHash,
    email_verified: false,
    google_sub: null,
    created_at: new Date().toISOString(),
  });
  await fakeRepo.createSession({ id: 'stale-sess', user_id: user.id, expires_at: '2099-01-01T00:00:00.000Z', created_at: new Date().toISOString() });
  await fakeRepo.createVerification({ user_id: user.id, email: user.email, purpose: 'verify_email', code_hash: 'aa'.repeat(32), expires_at: '2099-01-01T00:00:00.000Z', created_at: new Date().toISOString() });

  const prevClient = process.env.GOOGLE_CLIENT_ID;
  const origFetch = globalThis.fetch;
  process.env.GOOGLE_CLIENT_ID = 'google-client-123';
  globalThis.fetch = async () => ({
    ok: true,
    async json() {
      return {
        aud: 'google-client-123',
        iss: 'https://accounts.google.com',
        exp: String(Math.floor(Date.now() / 1000) + 3600),
        email_verified: 'true',
        sub: 'google-sub-victim',
        email: 'victim@example.com',
        name: 'Victim Real',
      };
    },
  });

  try {
    const res = await handleGoogleLogin(
      { credential: 'x'.repeat(32) },
      { cookie() {}, clearCookie() {} },
    );
    assert.equal(res.status, 200);
    assert.equal(fakeRepo.users[0].password_hash, '');
    assert.equal(fakeRepo.users[0].google_sub, 'google-sub-victim');
    assert.equal(fakeRepo.users[0].email_verified, 1);
    assert.equal(fakeRepo.verifications.length, 0);
    assert.equal(fakeRepo.sessions.some((s) => s.id === 'stale-sess'), false);

    const attackerLogin = await handleLogin(
      { email: 'victim@example.com', password: 'AttackerPassword99' },
      { cookie() {}, clearCookie() {} },
    );
    assert.equal(attackerLogin.status, 401);
  } finally {
    globalThis.fetch = origFetch;
    if (prevClient === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = prevClient;
  }

  const reg = await handleRegister({ full_name: 'Bat', email: 'bat@example.com', password: 'StrongPassword123' });
  assert.equal(reg.status, 503);
});

test('sendPlainEmail fails closed when server refuses STARTTLS and sends no credentials', async () => {
  const net = await import('node:net');
  const { sendPlainEmail } = await import('../functions/notify.js');
  const receivedLines = [];

  const server = net.createServer((sock) => {
    sock.write('220 fake.smtp ESMTP\r\n');
    let buf = '';
    sock.on('data', (chunk) => {
      buf += chunk.toString('utf8');
      while (buf.includes('\n')) {
        const idx = buf.indexOf('\n');
        const line = buf.slice(0, idx).replace(/\r$/, '');
        buf = buf.slice(idx + 1);
        receivedLines.push(line);
        if (line.startsWith('EHLO')) sock.write('250 fake.smtp OK\r\n');
        else if (line === 'STARTTLS') sock.write('502 STARTTLS unavailable\r\n');
        else sock.write('500 unexpected\r\n');
      }
    });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  const prevEnv = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_ALLOW_PLAINTEXT: process.env.SMTP_ALLOW_PLAINTEXT,
  };

  process.env.SMTP_HOST = '127.0.0.1';
  process.env.SMTP_PORT = String(addr.port);
  process.env.SMTP_USER = 'secret-user';
  process.env.SMTP_PASS = 'secret-pass';
  delete process.env.SMTP_ALLOW_PLAINTEXT;

  try {
    const res = await sendPlainEmail({ to: 'dest@example.com', subject: 'Test', text: 'Body' });
    assert.deepEqual(res, { sent: false, reason: 'tls_required' });
    assert.equal(receivedLines.some((l) => l.startsWith('AUTH')), false);
    assert.equal(receivedLines.some((l) => l.includes(Buffer.from('secret-user').toString('base64'))), false);
    assert.equal(receivedLines.some((l) => l.includes(Buffer.from('secret-pass').toString('base64'))), false);
  } finally {
    for (const [k, v] of Object.entries(prevEnv)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    await new Promise((resolve) => server.close(resolve));
  }
});

test('pgRepo buildPoolConfig enables verified TLS for sslmode=require, PGSSL=1, and optional PG_CA_CERT', async () => {
  const { buildPoolConfig } = await import('../functions/repository/pgRepo.js');

  const noSsl = buildPoolConfig({ DATABASE_URL: 'postgresql://user:pw@pooler.example:5432/db' });
  assert.equal(noSsl.ssl, undefined);

  const urlSsl = buildPoolConfig({ DATABASE_URL: 'postgresql://user:pw@pooler.example:5432/db?sslmode=require' });
  assert.deepEqual(urlSsl.ssl, { rejectUnauthorized: true });

  const envSsl = buildPoolConfig({
    DATABASE_URL: 'postgresql://user:pw@pooler.example:5432/db',
    PGSSL: '1',
    PG_CA_CERT: '---CERT---\\nLINE2',
  });
  assert.deepEqual(envSsl.ssl, { rejectUnauthorized: true, ca: '---CERT---\nLINE2' });
});
