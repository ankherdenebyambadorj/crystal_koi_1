# Crystal Koi — Supply Side Studio

Mongolian-language product website for **Crystal Koi**, a self-serve programmatic supply curation platform. Built with React 19, Vite, Tailwind CSS, `@radix-ui/*` primitives, Three.js, WebGL1, Express, and a PostgreSQL / SQLite repository backend.

## 1. Quick Start
1. Install packages (requires **Node.js `>=22.18`**):
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill local configuration if testing SMTP or Google sign-in.
3. Run the development server (Express API + Vite middleware on `http://localhost:3000`):
   ```bash
   npm run dev
   ```

## 2. Architecture Overview
- **Frontend (`src/`)**: `HomePage` and `SceneLayout` (fixed WebGL1 pond shader + Three.js crystal koi) load eagerly; all inner routes lazy-load via `React.lazy`.
- **Backend (`server.ts`, `functions/`)**: Express entrypoint enforcing HTTP security headers, CSRF origin/Content-Type checks, sliding-window rate limiting, Zod validation, and repository-backed persistence. See `docs/ARCHITECTURE.md`.

## 3. Environment Variables
Configured in `.env` (never committed) following `.env.example`:
- **Server core**: `NODE_ENV`, `PORT`, `APP_URL`, `SESSION_SECRET` (`>= 32` chars required in production), `COOKIE_CROSS_SITE`
- **Database**: `DATABASE_URL` (PostgreSQL), `DB_PATH` (SQLite fallback)
- **Integrations**: `GOOGLE_CLIENT_ID`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `NOTIFY_EMAIL`

## 4. Folder Structure
- `src/content/` — All visible Mongolian copy (`homeContent.js`, `pagesContent.js`, `formsContent.js`, `siteContent.js`), asset URLs (`assets.js`), `brand.js`, `routes.js`
- `src/styles/` — Design tokens (`tokens.css`) and layout stylesheets (`home.css`, `inner.css`)
- `src/components/scene/` — Fixed background layers (`SceneLayout.jsx`, `PondCanvas.jsx`, `pondShader.js`, `KoiScene.jsx`, `koiMesh.js`, `koiPoses.js`, `poseMath.js`)
- `src/components/layout/` — Navigation (`SiteNav.jsx`, `NavDropdown.jsx`, `MobileNavDrawer.jsx`), `PageShell.jsx`, `EndSection.jsx`, `CtaPanel.jsx`, `SiteFooter.jsx`
- `src/components/home/` — Home sections, interactive dashboard (`dashboard/ProductDashboard.jsx`, `DashboardChart.jsx`, `DashboardSidebar.jsx`, `Sparkline.jsx`), `BidRequestCode.jsx`
- `src/components/auth/` — Modular login, signup, email verification, password reset, and Google sign-in components
- `src/components/forms/` & `src/components/ui/` — Validated form fields and restyled Radix primitives
- `src/pages/` — Home and lazy-loaded route pages (`BookCallPage.jsx`, `ContactPage.jsx`, `ContentPage.jsx`, `DocsPage.jsx`, `GetStartedPage.jsx`, `LegalPage.jsx`, `LoginPage.jsx`, `OptOutPage.jsx`, `PartnersPage.jsx`, `StatusPage.jsx`, `StoriesPage.jsx`, `NotFoundPage.jsx`)
- `functions/` — Modular server handlers (`auth/*`, `repository/pgRepo.js`, `repository/sqliteRepo.js`, `db.js`, `formSchemas.js`, `submitForm.js`, `publicContent.js`, `notify.js`, `rateLimit.js`, `security.js`)
- `tests/unit.test.js` — Node test suite covering pure helpers, validation, rate limits, auth/cookies, and CSRF checks
- `docs/` — Active documentation (`ARCHITECTURE.md`, `DATA.md`, `DEPENDENCIES.md`, `ENGINEERING.md`, `OPERATIONS.md`, `SECURITY.md`, `ui-components.md`) and `docs/history/`

## 5. Available Scripts
- `npm run dev` — Full-stack dev server (`tsx server.ts`)
- `npm run build` — Production Vite bundle into `dist/`
- `npm start` — Production Node server (`node server.ts`)
- `npm run lint` — TypeScript check (`tsc --noEmit`)
- `npm test` — Run unit tests (`node --test tests/unit.test.js`)
- `npm run audit:prod` — Production dependency vulnerability check (`npm audit --omit=dev`)

## 6. Database & Persistence
All SQL resides in `functions/repository/pgRepo.js` (PostgreSQL when `DATABASE_URL` is set) and `functions/repository/sqliteRepo.js` (SQLite dev fallback). Applications start with zero seed rows and store explicit `consent_given` + `consent_at` timestamps on consented intake forms. See `docs/DATA.md`.

## 7. Security Model
- Fails closed on missing/short production `SESSION_SECRET`.
- Default `HttpOnly; Secure; SameSite=Lax` cookies (`__Host-ck_session` in prod unless `COOKIE_CROSS_SITE=true`).
- Async `crypto.scrypt` password hashing, constant-time OTP checks, and Google Sign-In anti-pre-hijacking cleanup.
- Strict Zod schemas, `10 KB` body limit, CSRF origin/Content-Type checks, CSP from asset origins, and per-route sliding-window rate limits. See `docs/SECURITY.md`.

## 8. Responsive Breakpoints & Viewport Units
- Breakpoints preserve `STACKED_MAX = 820px`.
- Desktop scales fluidly via `--u = viewportWidth / 1440`. Below `820px`, `--u = min(viewportWidth, 487) / 390` (`PHONE_UNIT_MAX_WIDTH = 487`) so tablet widths stay balanced.

## 9. Testing
Run `npm test` (`tests/unit.test.js`). Database-dependent suites inject an in-memory fake repository via `setRepository()` so tests stay fast and isolated from disk state.

## 10. Production Deployment
Build `npm run build`, configure `NODE_ENV=production`, `SESSION_SECRET` (>= 32 chars), `DATABASE_URL` (Managed PostgreSQL), and `APP_URL`, then run `npm start` on port `3000`. See `docs/OPERATIONS.md`.

## 11. Further Documentation
- `docs/ARCHITECTURE.md` — Runtime and module boundaries
- `docs/DATA.md` — Table schemas and access rules
- `docs/SECURITY.md` — Threat model and controls
- `docs/OPERATIONS.md` — Deployment and maintenance guide
- `docs/DEPENDENCIES.md` — Installed package inventory
- `docs/ui-components.md` — Radix UI wrapper catalog
- `docs/ENGINEERING.md` — Coding and testing conventions
