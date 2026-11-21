# Crystal Koi — Security Design & Controls

## 1. HTTP Headers, CSP & CSRF Protection (`functions/security.js`, `server.ts`)
- `express.set('trust proxy', 1)` ensures `req.ip` reflects the upstream Cloud Run proxy client IP.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` enabled in `production`.
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()`, `Cross-Origin-Opener-Policy: same-origin-allow-popups`.
- **Content-Security-Policy**: Constructed dynamically from media URLs exported by `src/content/assets.js` (CloudFront media/GLB, Higgs images, Google Fonts, Google Identity Services).
- **CSRF Guard**: Every mutating `/api/*` request requires `Content-Type: application/json` and an `Origin` / `Referer` matching `APP_URL` or the request `Host` (mismatch returns `403 { ok: false, code: 'forbidden' }`).

## 2. Authentication, Sessions & Anti-Pre-Hijacking (`functions/auth/*`)
- **Production `SESSION_SECRET`**: Server refuses to start in `NODE_ENV=production` if missing or shorter than 32 characters.
- **Session Cookies**: `HttpOnly; Secure; SameSite=Lax; Path=/` (cookie name `__Host-ck_session` in production when same-site). Set `COOKIE_CROSS_SITE=true` only when embedded in a cross-site preview iframe to switch to `SameSite=None; Partitioned`.
- **Cookie Parsing**: Bounded header length and wrapped `decodeURIComponent` in `try/catch` so malformed cookie headers never throw.
- **Password Hashing**: Asynchronous `crypto.scrypt` + per-user random salt + `crypto.timingSafeEqual`. Unknown login emails execute one dummy `verifyPassword` against `DUMMY_PASSWORD_HASH` so response timing does not leak account existence.
- **Google Sign-In**: Verifies `aud`, `iss`, `exp`, and `email_verified` via Google `tokeninfo`. Before linking a verified Google identity onto an existing account without `google_sub` or with an unverified password, clears `password_hash`, deletes existing sessions, and deletes unused verification codes.
- **One-Time Codes**: 6-digit `crypto.randomInt` stored as HMAC-SHA256 digests (`10m` expiry, max `5` attempts, max `3` code sends per `10m`); hourly cleanup removes expired sessions and codes.

## 3. Input Validation & Rate Limiting (`functions/formSchemas.js`, `functions/rateLimit.js`)
- JSON payloads limited to `10 KB`; unknown keys, ASCII control characters, non-boolean consent, and invalid paths rejected via strict Zod schemas.
- Bounded in-memory sliding-window rate limiter (`MAX_BUCKETS = 10000`, expired bucket pruning, `Retry-After` header on HTTP `429`):
  - `POST /api/auth/login`: `10 / 10m` per IP and per normalized email.
  - `POST /api/auth/register` & `/api/auth/forgot-password`: `5 / 1h` per IP.
  - `POST /api/auth/verify-email` & `/api/auth/reset-password`: `10 / 10m` per IP.
  - `POST /api/auth/google`: `20 / 10m` per IP.
  - `POST /api/fn/submitForm`: `10 / 1h` per IP + `3 / 10m` per email + `request_id` UUID idempotency + honeypot drop.
- **Zero PII in logs**: Error logs emit timestamp, `kind`/`route`, and `code` only.
