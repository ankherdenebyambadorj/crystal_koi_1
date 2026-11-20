# Crystal Koi — Security Design & Controls

1. **Zero Public Entity Table Access**: Clients cannot query or mutate database tables directly. Public writes go strictly through `POST /api/fn/submitForm`, and public reads go strictly through whitelisted read endpoints (`getPartners`, `getStories`, `getServiceStatus`) selecting only published rows and non-sensitive columns.
2. **Strict Input Validation & Size Limits**:
   - JSON request body capped at 10 KB (`express.json({ limit: '10kb' })`).
   - Unknown keys rejected per form `kind`.
   - ASCII control characters rejected (`[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]`; CR/LF rejected on single-line fields).
   - Strict length caps (`full_name <= 100`, `email <= 254`, `phone` 6..20 allowed chars, `company <= 120`, `message <= 2000`, `reason <= 500`, `source_path <= 100` starting with `/`).
   - Consent strictly verified as boolean `true` where required (`call_request`, `access_request`, `contact_message`).
3. **Abuse Prevention & Idempotency**:
   - Hidden honeypot field (`website`) silently returns `{ ok: true }` without persisting or sending notifications.
   - UUID `request_id` enforces idempotency across retries (`UNIQUE` column + pre-insert lookup).
   - Rate limit: 3+ submissions from the same lowercase email in 10 minutes return `{ ok: false, code: 'rate_limited' }` (HTTP 429); 200+ submissions in 1 hour per form entity return `{ ok: false, code: 'unavailable' }` (HTTP 503).
   - Fail-closed error handling: any database or validation error aborts safely; server logs record only `kind` and `code` (no PII, tokens, or emails).
4. **Authentication & Sessions**:
   - Passwords hashed with Node `crypto.scrypt` + per-user random salt and compared via `crypto.timingSafeEqual`.
   - 6-digit email verification & password reset codes stored as HMAC-SHA256 digests with 10-minute expiration and max-attempt lockouts; forgot-password always returns generic success so account existence is never disclosed.
   - Session tokens stored hashed in SQLite (`sessions`) and delivered in `HttpOnly; Secure; SameSite=None; Partitioned; Path=/` cookies.
   - No open `next` redirects: post-login navigation validates internal paths starting with single `/`.
5. **Client Output Safety**:
   - Zero `dangerouslySetInnerHTML`, zero `eval`, no external image/font/API secrets in client code, `website_url` restricted to `https://` URLs with `rel="noopener noreferrer"`.
