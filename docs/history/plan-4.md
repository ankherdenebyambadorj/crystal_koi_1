# Plan 4 — Forms, Authentication, Database & Data-Backed Pages

## 1. Architecture
- **Database**: Node.js `node:sqlite` (`DatabaseSync`) stored outside web roots (`data/crystalkoi.sqlite` or `DB_PATH`), WAL mode + foreign keys enabled.
- **No Public Entity Routes**: Direct table CRUD routes are never exposed publicly. All public reads/writes pass exclusively through server-side functions under `/functions/` mounted in `/server.ts`:
  - `POST /api/fn/submitForm` (`functions/submitForm.js`)
  - `GET /api/fn/getPartners` (`functions/publicContent.js`)
  - `GET /api/fn/getStories` (`functions/publicContent.js`)
  - `GET /api/fn/getServiceStatus` (`functions/publicContent.js`)
  - Auth endpoints under `/api/auth/*` (`functions/auth.js`)
- **Zero Seed Data**: Tables start empty; published partners, stories, and status records are supplied through admin/owner operations rather than mock seed rows.

## 2. Frontend Form & Data Integration
- Install `@tanstack/react-query` QueryClientProvider around `AppShell` (`retry: 1`, clean error states).
- Centralize API invocation (`src/api/invokeFunction.js`) with 10s timeout, one transient retry, and typed `ApiError` mapped to Mongolian copy in `src/content/formsContent.js`.
- Shared limits (`src/lib/formLimits.js`) synchronized with server Zod/regex checks; client forms built with `react-hook-form` + `@hookform/resolvers/zod` + Radix shadcn primitives (`Input`, `Textarea`, `Select`, `Checkbox`, `Label`, `Tabs`, `Button`, `DropdownMenu`).
- Wire four intake pages (`/book-a-call`, `/get-started`, `/contact` with `?topic=` validation, `/opt-out`), auth page (`/login` with login, registration + OTP email verification, password reset, and Google sign-in), three read-only data pages (`/stories`, `/resources/partners`, `/resources/status`), live `SiteFooter` status pill, and authenticated `SiteNav` account menu.
