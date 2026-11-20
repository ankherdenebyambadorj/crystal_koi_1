# Crystal Koi — Audit & Hardening Report

## 1. Security Audit
- **Database Access**: Zero public entity CRUD routes exposed; SQLite (`node:sqlite`) lives outside `public/` and `src/`. Public writes execute exclusively through `POST /api/fn/submitForm`; public reads execute only via `getPartners`, `getStories`, and `getServiceStatus` selecting `is_published = 1` rows and non-sensitive columns.
- **Validation & Sanitization**: Strict Zod schemas reject extra keys, enforce exact length/pattern limits (`email <= 254`, `full_name <= 100`, `phone` 6–20 allowed chars, `company <= 120`, `message <= 2000`, `reason <= 500`, `source_path <= 100`), reject ASCII control chars, cap JSON payloads at 10 KB (`413` on overflow), validate UUID `request_id` for idempotency, silently accept honeypot `website` without DB insertion, and enforce per-email (3/10 min) and per-entity (200/hr) rate limits.
- **Auth & Sessions**: Passwords hashed via `crypto.scryptSync` + 16-byte random salt and checked via `crypto.timingSafeEqual`. Sessions stored as HMAC-SHA256 digests and issued via `HttpOnly; Secure; SameSite=None; Partitioned` cookies. Open `next` redirects prevented (`sanitizeInternalNextPath`). Zero secrets exist in client files or git history.
- **XSS / CSP Surface**: Zero occurrences of `dangerouslySetInnerHTML`, `eval`, or `new Function`; external URLs restricted to `https://` with `rel="noopener noreferrer"`.

## 2. Dependencies
- All extra runtime packages verified present in `package.json` and documented in `docs/DEPENDENCIES.md` (`three@0.170.0`, `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-*` primitives). Zero `@base-ui/*` packages.

## 3. Reliability
- **WebGL & Media Resilience**: `PondCanvas.jsx` pauses video decode when hidden or day opacity <= 0.001, prevents infinite reload loops on `<video>` error (`failedVideo` ref/local guard), and handles `webglcontextlost`/`webglcontextrestored`. `KoiScene.jsx` dynamically imports Three.js, skips redundant frames on reduced motion or hidden tab, reduces DPR under >28ms average frame times, cleans up GPU resources on unmount, and handles `webglcontextlost`/`webglcontextrestored`.
- **Single Canvas Pair Across Routes**: `SceneLayout` stays mounted outside `<Routes>`, maintaining at most 2 canvases across route transitions.

## 4. Design Fidelity & Mongolian Text Fit
- Design scale (`--u: calc(100vw / 1440)` above `820px`, `calc(100vw / 390)` at `<= 820px`), `STACKED_MAX = 820`, typography scale (`--fs-hero` to `--fs-wordmark`), and color palette match the reference design.
- Contrast adjustment: `--ink-3` opacity increased from `0.50` to `0.62` (`~5.24:1` on `#160c40`) so mono labels and helper metadata clear 4.5:1 AA contrast.
- All Cyrillic copy uses `overflow-wrap: break-word` with no cramped uppercase truncation; `Cormorant Garamond` italic fallback supports `Ө ө Ү ү` glyphs alongside `Instrument Serif`.

## 5. Automated Checks Executed
- `tsc --noEmit` (`npm run lint`): passed (exit 0).
- `npm run build` (`vite build`): passed (dist generated cleanly).
- `node --test tests/unit.test.js`: 7/7 tests passed (math helpers, redirect guard, zero-seed DB, validation/honeypot/idempotency/rate-limit, published partner filter, fail-closed auth).
- Live production server (`NODE_ENV=production node server.ts`) smoke test verified HTTP `200 OK`, security headers, empty initial feeds, and form submission persistence.

---

### Summary Lists

**Fixed**
- Prevented infinite video error reload loop in `PondCanvas.jsx`.
- Added `webglcontextrestored` recovery handler in `KoiScene.jsx`.
- Increased `--ink-3` opacity to `0.62` for 4.5:1 AA text contrast on `#160c40`.
- Added TypeScript annotations to Express error middleware in `server.ts`.

**Cannot be fixed on this platform**
- No Playwright/Chromium binary is preinstalled in this container runtime, so live rendered screenshot inspection across desktop/mobile viewports must be verified externally in a browser.

**Owner must do**
- Configure `SESSION_SECRET`, `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM`, `NOTIFY_EMAIL`, and `GOOGLE_CLIENT_ID` in production environment variables before enabling live registration emails, password resets, admin notifications, and Google sign-in.
- Populate published records in `partners`, `customer_stories`, `service_status`, and `status_incidents` via owner/admin database access when ready to publish live ecosystem listings.
