import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB_PATH = path.resolve(__dirname, '..', '..', 'data', 'crystalkoi.sqlite');

const INTAKE_TABLES = {
  call_request: 'call_requests',
  access_request: 'access_requests',
  contact_message: 'contact_messages',
  opt_out: 'opt_out_requests',
};

let dbInstance = null;

function ensureDb() {
  if (dbInstance) return dbInstance;
  const dbPath = path.resolve(process.env.DB_PATH || DEFAULT_DB_PATH);
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new DatabaseSync(dbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS call_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      company TEXT NOT NULL,
      preferred_window TEXT NOT NULL,
      consent_given INTEGER NOT NULL DEFAULT 1,
      consent_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      source_path TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_call_requests_email_created ON call_requests(email, created_at);
    CREATE INDEX IF NOT EXISTS idx_call_requests_created ON call_requests(created_at);

    CREATE TABLE IF NOT EXISTS access_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      monthly_volume TEXT NOT NULL,
      consent_given INTEGER NOT NULL DEFAULT 1,
      consent_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      source_path TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_access_requests_email_created ON access_requests(email, created_at);
    CREATE INDEX IF NOT EXISTS idx_access_requests_created ON access_requests(created_at);

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      company TEXT NOT NULL DEFAULT '',
      topic TEXT NOT NULL,
      message TEXT NOT NULL,
      consent_given INTEGER NOT NULL DEFAULT 1,
      consent_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      source_path TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_contact_messages_email_created ON contact_messages(email, created_at);
    CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at);

    CREATE TABLE IF NOT EXISTS opt_out_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      website_url TEXT NOT NULL DEFAULT '',
      is_published INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customer_stories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      industry TEXT NOT NULL,
      headline TEXT NOT NULL,
      summary TEXT NOT NULL,
      is_published INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS service_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      component_name TEXT NOT NULL,
      state TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      is_published INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS status_incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      severity TEXT NOT NULL,
      summary TEXT NOT NULL,
      state TEXT NOT NULL,
      is_published INTEGER NOT NULL DEFAULT 0,
      occurred_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'user',
      email_verified INTEGER NOT NULL DEFAULT 0,
      google_sub TEXT UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS email_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      purpose TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      expires_at TEXT NOT NULL,
      consumed_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  `);

  dbInstance = db;
  return dbInstance;
}

export const sqliteRepository = {
  async initStore() {
    ensureDb();
  },
  async findIntakeByRequestId(kind, requestId) {
    const tbl = INTAKE_TABLES[kind];
    return Boolean(ensureDb().prepare(`SELECT id FROM ${tbl} WHERE request_id = ? LIMIT 1`).get(requestId));
  },
  async countRecentByEmail(email, sinceIso) {
    const db = ensureDb();
    let total = 0;
    for (const tbl of Object.values(INTAKE_TABLES)) {
      const r = db.prepare(`SELECT COUNT(*) AS cnt FROM ${tbl} WHERE email = ? AND created_at >= ?`).get(email, sinceIso);
      total += Number(r?.cnt || 0);
    }
    return total;
  },
  async countRecentByKind(kind, sinceIso) {
    const tbl = INTAKE_TABLES[kind];
    const r = ensureDb().prepare(`SELECT COUNT(*) AS cnt FROM ${tbl} WHERE created_at >= ?`).get(sinceIso);
    return Number(r?.cnt || 0);
  },
  async insertIntake(kind, r) {
    const db = ensureDb();
    if (kind === 'call_request') {
      db.prepare(`INSERT INTO call_requests (request_id, full_name, email, phone, company, preferred_window, consent_given, consent_at, status, source_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)`).run(r.request_id, r.full_name, r.email, r.phone, r.company, r.preferred_window, r.consent_given ? 1 : 0, r.consent_at, r.source_path, r.created_at);
    } else if (kind === 'access_request') {
      db.prepare(`INSERT INTO access_requests (request_id, full_name, email, phone, company, role, monthly_volume, consent_given, consent_at, status, source_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)`).run(r.request_id, r.full_name, r.email, r.phone, r.company, r.role, r.monthly_volume, r.consent_given ? 1 : 0, r.consent_at, r.source_path, r.created_at);
    } else if (kind === 'contact_message') {
      db.prepare(`INSERT INTO contact_messages (request_id, full_name, email, phone, company, topic, message, consent_given, consent_at, status, source_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)`).run(r.request_id, r.full_name, r.email, r.phone, r.company, r.topic, r.message, r.consent_given ? 1 : 0, r.consent_at, r.source_path, r.created_at);
    } else if (kind === 'opt_out') {
      db.prepare(`INSERT INTO opt_out_requests (request_id, email, reason, status, source_path, created_at) VALUES (?, ?, ?, 'new', ?, ?)`).run(r.request_id, r.email, r.reason, r.source_path, r.created_at);
    }
  },
  async getPublishedPartners() {
    return ensureDb().prepare(`SELECT id, name, category, description, website_url FROM partners WHERE is_published = 1 ORDER BY sort_order ASC, id ASC LIMIT 100`).all();
  },
  async getPublishedStories() {
    return ensureDb().prepare(`SELECT id, customer_name, industry, headline, summary FROM customer_stories WHERE is_published = 1 ORDER BY sort_order ASC, id ASC LIMIT 50`).all();
  },
  async getPublishedServiceStatus(sinceIso) {
    const db = ensureDb();
    const components = db.prepare(`SELECT id, component_name, state, note, updated_at FROM service_status WHERE is_published = 1 ORDER BY sort_order ASC, id ASC LIMIT 100`).all();
    const incidents = db.prepare(`SELECT id, title, severity, summary, state, occurred_at FROM status_incidents WHERE is_published = 1 AND occurred_at >= ? ORDER BY occurred_at DESC, id DESC LIMIT 20`).all(sinceIso);
    return { components, incidents };
  },
  async findUserByEmail(email) {
    return ensureDb().prepare('SELECT id, email, full_name, password_hash, role, email_verified, google_sub FROM users WHERE email = ? LIMIT 1').get(email) || null;
  },
  async findUserByGoogleOrEmail(sub, email) {
    return ensureDb().prepare('SELECT id, email, full_name, password_hash, role, email_verified, google_sub FROM users WHERE google_sub = ? OR email = ? LIMIT 1').get(sub, email) || null;
  },
  async findUserById(id) {
    return ensureDb().prepare('SELECT id, email, full_name, role, email_verified FROM users WHERE id = ? LIMIT 1').get(id) || null;
  },
  async createUser({ email, full_name, password_hash, email_verified, google_sub, created_at }) {
    const info = ensureDb().prepare(`INSERT INTO users (email, full_name, password_hash, role, email_verified, google_sub, created_at) VALUES (?, ?, ?, 'user', ?, ?, ?)`).run(email, full_name, password_hash, email_verified ? 1 : 0, google_sub || null, created_at);
    return { id: Number(info.lastInsertRowid), email, full_name, role: 'user', email_verified: Boolean(email_verified) };
  },
  async updateUnverifiedUser(id, { full_name, password_hash }) {
    ensureDb().prepare('UPDATE users SET full_name = ?, password_hash = ? WHERE id = ?').run(full_name, password_hash, id);
  },
  async clearUnverifiedUserSecrets(id) {
    ensureDb().prepare("UPDATE users SET password_hash = '' WHERE id = ?").run(id);
  },
  async setGoogleVerifiedUser(id, sub) {
    ensureDb().prepare('UPDATE users SET google_sub = COALESCE(google_sub, ?), email_verified = 1 WHERE id = ?').run(sub, id);
  },
  async updateUserPasswordVerified(id, passwordHash) {
    ensureDb().prepare('UPDATE users SET password_hash = ?, email_verified = 1 WHERE id = ?').run(passwordHash, id);
  },
  async markUserEmailVerified(id) {
    ensureDb().prepare('UPDATE users SET email_verified = 1 WHERE id = ?').run(id);
  },
  async createSession({ id, user_id, expires_at, created_at }) {
    ensureDb().prepare('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').run(id, user_id, expires_at, created_at);
  },
  async getSessionWithUser(tokenHash) {
    return ensureDb().prepare(`SELECT u.id, u.email, u.full_name, u.role, u.email_verified, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? LIMIT 1`).get(tokenHash) || null;
  },
  async deleteSession(tokenHash) {
    ensureDb().prepare('DELETE FROM sessions WHERE id = ?').run(tokenHash);
  },
  async deleteUserSessions(userId) {
    ensureDb().prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
  },
  async countRecentVerifications(email, purpose, sinceIso) {
    const r = ensureDb().prepare('SELECT COUNT(*) AS cnt FROM email_verifications WHERE email = ? AND purpose = ? AND created_at >= ?').get(email, purpose, sinceIso);
    return Number(r?.cnt || 0);
  },
  async createVerification({ user_id, email, purpose, code_hash, expires_at, created_at }) {
    ensureDb().prepare(`INSERT INTO email_verifications (user_id, email, purpose, code_hash, attempts, expires_at, created_at) VALUES (?, ?, ?, ?, 0, ?, ?)`).run(user_id, email, purpose, code_hash, expires_at, created_at);
  },
  async getLatestActiveVerification(email, purpose) {
    return ensureDb().prepare(`SELECT id, user_id, code_hash, attempts, expires_at FROM email_verifications WHERE email = ? AND purpose = ? AND consumed_at IS NULL ORDER BY id DESC LIMIT 1`).get(email, purpose) || null;
  },
  async incrementVerificationAttempts(id) {
    ensureDb().prepare('UPDATE email_verifications SET attempts = attempts + 1 WHERE id = ?').run(id);
  },
  async consumeVerification(id, consumedAt) {
    ensureDb().prepare('UPDATE email_verifications SET consumed_at = ? WHERE id = ?').run(consumedAt, id);
  },
  async deleteUnusedUserVerifications(userId) {
    ensureDb().prepare('DELETE FROM email_verifications WHERE user_id = ? AND consumed_at IS NULL').run(userId);
  },
  async purgeExpiredAuthRecords(nowIso) {
    const db = ensureDb();
    db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(nowIso);
    db.prepare('DELETE FROM email_verifications WHERE expires_at <= ? OR consumed_at IS NOT NULL').run(nowIso);
  },
};
