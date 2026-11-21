# Crystal Koi — Architecture

## 1. High-Level Topology
- **Client SPA (`src/`)**: React 19 + Vite application. `HomePage` and `SceneLayout` load eagerly for immediate first-paint rendering; all inner pages (`/product/*`, `/use-cases/*`, `/channels/*`, `/resources/*`, `/contact`, `/stories`, `/book-a-call`, `/get-started`, `/login`, `/opt-out`, `*`) are lazy-loaded via `React.lazy`.
- **Express Backend (`server.ts`)**: Single entrypoint serving API routes (`/api/fn/*`, `/api/auth/*`) plus Vite middleware in development or static `dist/` assets in production.

## 2. Scene Stack & Responsive Layout
- Fixed full-viewport backdrop (`SceneLayout`) layers `PondCanvas` (`pondShader.js` WebGL1 ripple shader over streaming MP4), `night` depth plate, and `KoiScene` (Three.js GLB koi with scroll/cursor pose interpolation via `poseMath.js` and custom tail-swim vertex displacement in `koiMesh.js`).
- **Fluid Scale (`--u`)**: Above `820px`, `--u = viewportWidth / 1440`. At `<= 820px` (`STACKED_MAX`), `--u` uses `min(viewportWidth, 487) / 390` (`PHONE_UNIT_MAX_WIDTH = 487`) so components scale cleanly on tablets (`488px–820px`) without exceeding ~`1.25×` mobile sizes.

## 3. Data & Auth Flow
1. Forms (`BookCallPage`, `GetStartedPage`, `ContactPage`, `OptOutPage`) validate client-side with Zod + `react-hook-form`, generate a per-attempt UUID `request_id`, and `POST /api/fn/submitForm`.
2. `functions/security.js` enforces CSRF origin/Content-Type checks, `functions/rateLimit.js` enforces IP/email sliding-window bounds, and `functions/submitForm.js` validates via `functions/formSchemas.js`, persists rows with `consent_given` + `consent_at` via `functions/db.js`, and emails `NOTIFY_EMAIL` asynchronously via `functions/notify.js`.
3. Authentication (`functions/auth/*`) manages async `crypto.scrypt` password accounts, 6-digit HMAC-SHA256 email verification/reset codes, Google Identity Services token verification with pre-hijack protection, and hashed database sessions stored in hardened cookies.
