# Crystal Koi — Supply Side Studio

Mongolian-language product website for **Crystal Koi**, a self-serve programmatic-media curation studio. Built with React, Vite, Tailwind CSS, shadcn/ui (Radix), React Router, Three.js, WebGL1, and an Express + SQLite backend.

## Running locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the full-stack development server (Express + Vite middleware on port 3000):
   ```bash
   npm run dev
   ```
3. Build for production and start:
   ```bash
   npm run build
   npm start
   ```

## Folder map

- `src/content/` — All visible Mongolian copy, media asset URLs (`assets.js`), brand/contact config (`brand.js`), and route paths (`routes.js`).
- `src/styles/` — Design tokens (`tokens.css`) and layout stylesheets.
- `src/components/scene/` — Fixed WebGL1 pond ripple canvas, 3D crystal koi Three.js scene, scroll crossfade, and pose math.
- `src/components/layout/` — Navigation bar, dropdown menus, mobile drawer, `PageShell`, `EndSection`, `CtaPanel`, `SiteFooter`.
- `src/components/home/` — Studio stats, interactive product dashboard, package cards, typewriter OpenRTB block, steps strip, and use-case staircase.
- `src/components/forms/` — Zod-validated form shell and fields built on shadcn/ui Radix primitives.
- `src/components/ui/` — Restyled shadcn/ui Radix components (`Input`, `Textarea`, `Select`, `Checkbox`, `Label`, `Tabs`, `Accordion`, `Badge`, `Skeleton`, `Alert`, `Tooltip`, `Breadcrumb`, `Button`).
- `src/pages/` — Home, data-driven `ContentPage`, `DocsPage`, `LegalPage`, forms, auth, `StoriesPage`, `PartnersPage`, `StatusPage`, and `NotFoundPage`.
- `src/api/` & `src/hooks/` — Timeout/retry API wrapper, TanStack Query hooks, auth hook, scroll/pointer stores, entrance/reveal hooks.
- `functions/` & `server.ts` — Server-side validation, rate limiting, idempotency, SQLite persistence, auth endpoints, and Express entrypoint.
- `docs/` — Engineering standards, data model, security notes, plans, audits, and verification logs.

## Content & data updates

- **Routes**: Add path constants in `src/content/routes.js` and register `<Route>` entries in `src/App.jsx`.
- **Copy & links**: Edit `src/content/brand.js`, `src/content/siteContent.js`, `src/content/homeContent.js`, `src/content/pagesContent.js`, `src/content/formsContent.js`, and `src/content/uiContent.js`.
- **Partners, customer stories & service status**: Managed in the SQLite tables (`Partner`, `CustomerStory`, `ServiceStatus`, `StatusIncident`) on the server (`DB_PATH`). Public read endpoints return only published, whitelisted fields.
