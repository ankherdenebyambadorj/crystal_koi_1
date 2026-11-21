# Crystal Koi — Operations Runbook

## 1. Environment Variables
| Variable | Required | Purpose |
|---|---|---|
| `NODE_ENV` | Prod: `production` | Enables production strict checks, `dist/` static serving, HSTS, and `__Host-` session cookies |
| `SESSION_SECRET` | **Required in Prod** (`>=32` chars) | HMAC key for session tokens and email OTP digests (server refuses startup in prod if missing/short) |
| `DATABASE_URL` | **Recommended in Prod** | PostgreSQL connection string (`functions/repository/pgRepo.js`); omits -> local `DB_PATH` SQLite fallback |
| `DB_PATH` | Optional (local dev) | SQLite file path when `DATABASE_URL` is unset (defaults to `data/crystalkoi.sqlite`) |
| `APP_URL` | Prod recommended | Canonical origin allowed by CSRF `Origin`/`Referer` verification |
| `COOKIE_CROSS_SITE` | `false` in prod | Set `true` only inside cross-site preview iframes (`SameSite=None; Partitioned`) |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth Web Client ID for Sign in with Google |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `NOTIFY_EMAIL` | Optional | SMTP credentials for OTP verification emails and intake notifications |

## 2. Commands
- `npm install` — Install dependencies cleanly.
- `npm run lint` — TypeScript syntax check (`tsc --noEmit`).
- `npm test` — Run unit test suite (`node --test tests/unit.test.js`).
- `npm run build` — Build optimized Vite client bundle (`dist/`).
- `npm run audit:prod` — Audit runtime production dependencies.
- `npm run dev` — Start local full-stack Express + Vite server (`http://localhost:3000`).
- `npm start` — Start production Express server serving `dist/` (`node server.ts`).

## 3. Maintenance & Cloud Run Notes
- On startup and every 60 minutes, `server.ts` executes `purgeExpiredAuthRecords()` to remove expired `sessions` and consumed/expired `email_verifications`.
- Always provision Managed PostgreSQL (`DATABASE_URL`) and inject `SESSION_SECRET` (>= 32 random chars) via secret manager when deploying to stateless multi-instance containers like Cloud Run.
