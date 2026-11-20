# Verification 4 — Backend Functions, Database, Auth & Data Pages

Verified by automated tests (`node --test tests/unit.test.js` — 7/7 passed) and live production Express server smoke test (`NODE_ENV=production node server.ts`):

- **Database Zero Seed State**: SQLite database (`node:sqlite`) initializes all 8 entity tables plus auth tables (`users`, `email_verifications`, `sessions`) cleanly outside `public/`/`src/` with 0 rows seeded.
- **Strict Validation & Abuse Protection (`submitForm`)**: Verified via unit tests and live HTTP `POST /api/fn/submitForm`:
  - Rejects payloads > 10 KB (`413`) and unknown extra fields (`400 invalid_input`).
  - Silently accepts honeypot submissions (`website` non-empty) returning `{ ok: true }` without persisting.
  - Enforces UUID `request_id` idempotency and 3-per-email / 10-minute rate limiting (`429 rate_limited`).
- **Whitelisted Read Endpoints**: Verified `/api/fn/getPartners`, `/api/fn/getStories`, and `/api/fn/getServiceStatus` return only `is_published = 1` rows, whitelisted fields, and sanitized `https://` URLs.
- **Auth & Sessions**: Passwords hashed via `scrypt` + `timingSafeEqual`; session tokens hashed in SQLite and set via `HttpOnly; Secure; SameSite=None; Partitioned` cookies; `/api/auth/me` returns `{ user: null }` when signed out. Register/forgot-password fail closed (`503 unavailable`) unless SMTP env variables are configured.
- **Platform Note**: Email notifications (`NOTIFY_EMAIL`), OTP verification mail (`SMTP_*`), and Google Sign-In (`GOOGLE_CLIENT_ID`) are dormant until configured via environment secrets; client bundles contain zero secrets.
