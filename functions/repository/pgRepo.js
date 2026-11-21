import pg from 'pg';

const { Pool } = pg;

const INTAKE_TABLES = {
  call_request: 'call_requests',
  access_request: 'access_requests',
  contact_message: 'contact_messages',
  opt_out: 'opt_out_requests',
};

let pool = null;

function getPool() {
  if (pool) return pool;
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  return pool;
}

export const pgRepository = {
  async initStore() {
    const client = getPool();
    await client.query(`
      CREATE TABLE IF NOT EXISTS call_requests (
        id SERIAL PRIMARY KEY,
        request_id TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        company TEXT NOT NULL,
        preferred_window TEXT NOT NULL,
        consent_given BOOLEAN NOT NULL DEFAULT TRUE,
        consent_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        source_path TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_call_requests_email_created ON call_requests(email, created_at);
      CREATE INDEX IF NOT EXISTS idx_call_requests_created ON call_requests(created_at);

      CREATE TABLE IF NOT EXISTS access_requests (
        id SERIAL PRIMARY KEY,
        request_id TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        monthly_volume TEXT NOT NULL,
        consent_given BOOLEAN NOT NULL DEFAULT TRUE,
        consent_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        source_path TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_access_requests_email_created ON access_requests(email, created_at);
      CREATE INDEX IF NOT EXISTS idx_access_requests_created ON access_requests(created_at);

      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        request_id TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL DEFAULT '',
        company TEXT NOT NULL DEFAULT '',
        topic TEXT NOT NULL,
        message TEXT NOT NULL,
        consent_given BOOLEAN NOT NULL DEFAULT TRUE,
        consent_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        source_path TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_contact_messages_email_created ON contact_messages(email, created_at);
      CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at);

      CREATE TABLE IF NOT EXISTS opt_out_requests (
        id SERIAL PRIMARY KEY,
        request_id TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        reason TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'new',
        source_path TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_opt_out_requests_email_created ON opt_out_requests(email, created_at);
      CREATE INDEX IF NOT EXISTS idx_opt_out_requests_created ON opt_out_requests(created_at);

      CREATE TABLE IF NOT EXISTS partners (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        website_url TEXT NOT NULL DEFAULT '',
        is_published INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS customer_stories (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        industry TEXT NOT NULL,
        headline TEXT NOT NULL,
        summary TEXT NOT NULL,
        is_published INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS service_status (
        id SERIAL PRIMARY KEY,
        component_name TEXT NOT NULL,
        state TEXT NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        is_published INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS status_incidents (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        severity TEXT NOT NULL,
        summary TEXT NOT NULL,
        state TEXT NOT NULL,
        is_published INTEGER NOT NULL DEFAULT 0,
        occurred_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL DEFAULT '',
        password_hash TEXT NOT NULL DEFAULT '',
        role TEXT NOT NULL DEFAULT 'user',
        email_verified INTEGER NOT NULL DEFAULT 0,
        google_sub TEXT UNIQUE,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS email_verifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        purpose TEXT NOT NULL,
        code_hash TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        expires_at TEXT NOT NULL,
        consumed_at TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    `);
  },
  async findIntakeByRequestId(kind, requestId) {
    const tbl = INTAKE_TABLES[kind];
    const r = await getPool().query(`SELECT id FROM ${tbl} WHERE request_id = $1 LIMIT 1`, [requestId]);
    return r.rowCount > 0;
  },
  async countRecentByEmail(email, sinceIso) {
    const p = getPool();
    let total = 0;
    for (const tbl of Object.values(INTAKE_TABLES)) {
      const r = await p.query(`SELECT COUNT(*)::int AS cnt FROM ${tbl} WHERE email = $1 AND created_at >= $2`, [email, sinceIso]);
      total += Number(r.rows[0]?.cnt || 0);
    }
    return total;
  },
  async countRecentByKind(kind, sinceIso) {
    const tbl = INTAKE_TABLES[kind];
    const r = await getPool().query(`SELECT COUNT(*)::int AS cnt FROM ${tbl} WHERE created_at >= $1`, [sinceIso]);
    return Number(r.rows[0]?.cnt || 0);
  },
  async insertIntake(kind, r) {
    const p = getPool();
    if (kind === 'call_request') {
      await p.query(`INSERT INTO call_requests (request_id, full_name, email, phone, company, preferred_window, consent_given, consent_at, status, source_path, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'new', $9, $10)`, [r.request_id, r.full_name, r.email, r.phone, r.company, r.preferred_window, Boolean(r.consent_given), r.consent_at, r.source_path, r.created_at]);
    } else if (kind === 'access_request') {
      await p.query(`INSERT INTO access_requests (request_id, full_name, email, phone, company, role, monthly_volume, consent_given, consent_at, status, source_path, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'new', $10, $11)`, [r.request_id, r.full_name, r.email, r.phone, r.company, r.role, r.monthly_volume, Boolean(r.consent_given), r.consent_at, r.source_path, r.created_at]);
    } else if (kind === 'contact_message') {
      await p.query(`INSERT INTO contact_messages (request_id, full_name, email, phone, company, topic, message, consent_given, consent_at, status, source_path, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'new', $10, $11)`, [r.request_id, r.full_name, r.email, r.phone, r.company, r.topic, r.message, Boolean(r.consent_given), r.consent_at, r.source_path, r.created_at]);
    } else if (kind === 'opt_out') {
      await p.query(`INSERT INTO opt_out_requests (request_id, email, reason, status, source_path, created_at) VALUES ($1, $2, $3, 'new', $4, $5)`, [r.request_id, r.email, r.reason, r.source_path, r.created_at]);
    }
  },
  async getPublishedPartners() {
    const r = await getPool().query(`SELECT id, name, category, description, website_url FROM partners WHERE is_published = 1 ORDER BY sort_order ASC, id ASC LIMIT 100`);
    return r.rows;
  },
  async getPublishedStories() {
    const r = await getPool().query(`SELECT id, customer_name, industry, headline, summary FROM customer_stories WHERE is_published = 1 ORDER BY sort_order ASC, id ASC LIMIT 50`);
    return r.rows;
  },
  async getPublishedServiceStatus(sinceIso) {
    const p = getPool();
    const [comps, incs] = await Promise.all([
      p.query(`SELECT id, component_name, state, note, updated_at FROM service_status WHERE is_published = 1 ORDER BY sort_order ASC, id ASC LIMIT 100`),
      p.query(`SELECT id, title, severity, summary, state, occurred_at FROM status_incidents WHERE is_published = 1 AND occurred_at >= $1 ORDER BY occurred_at DESC, id DESC LIMIT 20`, [sinceIso]),
    ]);
    return { components: comps.rows, incidents: incs.rows };
  },
  async findUserByEmail(email) {
    const r = await getPool().query('SELECT id, email, full_name, password_hash, role, email_verified, google_sub FROM users WHERE email = $1 LIMIT 1', [email]);
    return r.rows[0] || null;
  },
  async findUserByGoogleOrEmail(sub, email) {
    const r = await getPool().query('SELECT id, email, full_name, password_hash, role, email_verified, google_sub FROM users WHERE google_sub = $1 OR email = $2 LIMIT 1', [sub, email]);
    return r.rows[0] || null;
  },
  async findUserById(id) {
    const r = await getPool().query('SELECT id, email, full_name, role, email_verified FROM users WHERE id = $1 LIMIT 1', [id]);
    return r.rows[0] || null;
  },
  async createUser({ email, full_name, password_hash, email_verified, google_sub, created_at }) {
    const r = await getPool().query(`INSERT INTO users (email, full_name, password_hash, role, email_verified, google_sub, created_at) VALUES ($1, $2, $3, 'user', $4, $5, $6) RETURNING id, email, full_name, role, email_verified`, [email, full_name, password_hash, email_verified ? 1 : 0, google_sub || null, created_at]);
    return { ...r.rows[0], email_verified: Boolean(r.rows[0].email_verified) };
  },
  async updateUnverifiedUser(id, { full_name, password_hash }) {
    await getPool().query('UPDATE users SET full_name = $1, password_hash = $2 WHERE id = $3', [full_name, password_hash, id]);
  },
  async clearUnverifiedUserSecrets(id) {
    await getPool().query("UPDATE users SET password_hash = '' WHERE id = $1", [id]);
  },
  async setGoogleVerifiedUser(id, sub) {
    await getPool().query('UPDATE users SET google_sub = COALESCE(google_sub, $1), email_verified = 1 WHERE id = $2', [sub, id]);
  },
  async updateUserPasswordVerified(id, passwordHash) {
    await getPool().query('UPDATE users SET password_hash = $1, email_verified = 1 WHERE id = $2', [passwordHash, id]);
  },
  async markUserEmailVerified(id) {
    await getPool().query('UPDATE users SET email_verified = 1 WHERE id = $1', [id]);
  },
  async createSession({ id, user_id, expires_at, created_at }) {
    await getPool().query('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES ($1, $2, $3, $4)', [id, user_id, expires_at, created_at]);
  },
  async getSessionWithUser(tokenHash) {
    const r = await getPool().query(`SELECT u.id, u.email, u.full_name, u.role, u.email_verified, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = $1 LIMIT 1`, [tokenHash]);
    return r.rows[0] || null;
  },
  async deleteSession(tokenHash) {
    await getPool().query('DELETE FROM sessions WHERE id = $1', [tokenHash]);
  },
  async deleteUserSessions(userId) {
    await getPool().query('DELETE FROM sessions WHERE user_id = $1', [userId]);
  },
  async countRecentVerifications(email, purpose, sinceIso) {
    const r = await getPool().query('SELECT COUNT(*)::int AS cnt FROM email_verifications WHERE email = $1 AND purpose = $2 AND created_at >= $3', [email, purpose, sinceIso]);
    return Number(r.rows[0]?.cnt || 0);
  },
  async createVerification({ user_id, email, purpose, code_hash, expires_at, created_at }) {
    await getPool().query(`INSERT INTO email_verifications (user_id, email, purpose, code_hash, attempts, expires_at, created_at) VALUES ($1, $2, $3, $4, 0, $5, $6)`, [user_id, email, purpose, code_hash, expires_at, created_at]);
  },
  async getLatestActiveVerification(email, purpose) {
    const r = await getPool().query(`SELECT id, user_id, code_hash, attempts, expires_at FROM email_verifications WHERE email = $1 AND purpose = $2 AND consumed_at IS NULL ORDER BY id DESC LIMIT 1`, [email, purpose]);
    return r.rows[0] || null;
  },
  async incrementVerificationAttempts(id) {
    await getPool().query('UPDATE email_verifications SET attempts = attempts + 1 WHERE id = $1', [id]);
  },
  async consumeVerification(id, consumedAt) {
    await getPool().query('UPDATE email_verifications SET consumed_at = $1 WHERE id = $2', [consumedAt, id]);
  },
  async deleteUnusedUserVerifications(userId) {
    await getPool().query('DELETE FROM email_verifications WHERE user_id = $1 AND consumed_at IS NULL', [userId]);
  },
  async purgeExpiredAuthRecords(nowIso) {
    const p = getPool();
    await p.query('DELETE FROM sessions WHERE expires_at <= $1', [nowIso]);
    await p.query('DELETE FROM email_verifications WHERE expires_at <= $1 OR consumed_at IS NOT NULL', [nowIso]);
  },
};
