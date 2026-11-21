# Verification 6 — Shadcn Radix UI Chrome & Feedback States

Verified against `src/components/ui/*`, `src/App.jsx`, `src/styles/inner.css`, `tsc --noEmit`, and `vite build`:

- **Inventory Complete**: All 15 primitives (`accordion`, `alert`, `badge`, `breadcrumb`, `button`, `checkbox`, `dropdown-menu`, `input`, `label`, `select`, `sheet`, `skeleton`, `tabs`, `textarea`, `tooltip`) wrap `@radix-ui/*` or native semantic elements — zero `@base-ui/*` imports.
- **Inner Page Integration**:
  - `PageShell.jsx` renders `Breadcrumb` across all inner content, docs, legal, form, auth, and data pages (`showBreadcrumb={false}` on `NotFoundPage` and omitted on `/`).
  - `NotFoundPage.jsx` uses `PageShell` + Fira Code `404` eyebrow + dark `/` pill + glass `/contact` pill.
  - `StoriesPage.jsx`, `PartnersPage.jsx`, `StatusPage.jsx`, and `FormShell.jsx` use `Badge`, `Skeleton`, `Alert`, `Tabs`, and `Tooltip` consistently without modifying `/` home hero/section layouts.
- **Z-Index & Touch Safety**: Overlays use `var(--z-popover)` (`30`); tooltips open on hover/keyboard-focus without sticky mobile tap traps.
