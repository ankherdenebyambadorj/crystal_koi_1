# Crystal Koi — Operations Runbook

## 1. Environment Variables
| Variable | Required | Purpose |
|---|---|---|
| `NODE_ENV` | Prod: `production` | Enables production strict checks, `dist/` static serving, HSTS, and `__Host-` session cookies |
| `SESSION_SECRET` | **Required in Prod** (`>=32` chars) | HMAC key for session tokens and email OTP digests (server refuses startup in prod if missing/short) |
| `DATABASE_URL` | **Recommended in Prod** | PostgreSQL connection string (`functions/repository/pgRepo.js`); omits -> local `DB_PATH` SQLite fallback. On Cloud Run, use the provider's IPv4 connection **pooler** address rather than an IPv6-only direct address. |
| `PGSSL` | Optional | Set `1` (or pass `?sslmode=require` in `DATABASE_URL`) to enable verified TLS connections to PostgreSQL. |
| `PG_CA_CERT` | Optional | Custom CA PEM certificate text used when verifying TLS connections for managed PostgreSQL providers with private CAs. |
| `DB_PATH` | Optional (local dev) | SQLite file path when `DATABASE_URL` is unset (defaults to `data/crystalkoi.sqlite`). |
| `APP_URL` | Prod recommended | Canonical origin allowed by CSRF `Origin`/`Referer` verification. |
| `COOKIE_CROSS_SITE` | `false` in prod | Set `true` only inside cross-site preview iframes (`SameSite=None; Partitioned`). |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth Web Client ID for Sign in with Google. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `NOTIFY_EMAIL`, `SMTP_ALLOW_PLAINTEXT` | Optional | SMTP credentials for OTP emails and notifications. Port `!= 465` requires `STARTTLS` (`220`) and fails closed unless `SMTP_ALLOW_PLAINTEXT=1` is set for local dev. |

## 2. Commands
- `npm install` — Install dependencies cleanly (single `package-lock.json` lockfile).
- `npm run lint` — TypeScript syntax check (`tsc --noEmit`).
- `npm test` — Run unit test suite (`node --test tests/unit.test.js`).
- `npm run build` — Build optimized Vite client bundle (`dist/`).
- `npm run audit:prod` — Audit runtime production dependencies.
- `npm run dev` — Start local full-stack Express + Vite server (`http://localhost:3000`).
- `npm start` — Start production Express server serving `dist/` (`node server.ts`).

## 3. Database Conventions & Cloud Run Maintenance
- Tables are created automatically on first start (`initStore()` runs idempotent `CREATE TABLE IF NOT EXISTS` statements).
- In public catalog/status tables (`partners`, `customer_stories`, `service_status`, `status_incidents`), `is_published` is an integer (`1` = shown, `0` = hidden).
- Timestamp columns `created_at` and `occurred_at` store ISO-8601 UTC text such as `2026-11-21T08:00:00Z`.
- On startup and every 60 minutes, `server.ts` executes `purgeExpiredAuthRecords()` to remove expired `sessions` and consumed/expired `email_verifications`.
- Always provision Managed PostgreSQL (`DATABASE_URL` pointing at the IPv4 connection **pooler** address, never an IPv6-only direct host, with `sslmode=require` or `PGSSL=1` and optional `PG_CA_CERT`) and inject `SESSION_SECRET` (>= 32 random chars) via secret manager when deploying to stateless multi-instance containers like Cloud Run.
