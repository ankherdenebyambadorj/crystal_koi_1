# Plan — Part 3: Navigation menus and inner pages

## Files to create and update
1. `src/content/pagesContent.js` — exact Mongolian copy for 11 content pages, documentation, privacy, and terms.
2. `src/styles/inner.css` (imported in `src/index.css`) — styles for nav dropdowns, mobile drawer, `PageShell`, `ContentPage`, `DocsPage`, and `LegalPage`.
3. `src/components/ui/accordion.jsx` & `src/components/ui/sheet.jsx` — Radix-based shadcn primitives styled with Crystal Koi tokens.
4. `src/components/layout/SiteNav.jsx` — desktop dropdown menus (hover/click/keyboard) and Radix mobile drawer (`<= 820px`).
5. `src/components/layout/PageShell.jsx`, `src/pages/ContentPage.jsx`, `src/pages/DocsPage.jsx`, `src/pages/LegalPage.jsx`.
6. `src/App.jsx` — register all 11 `ContentPage` routes, `/resources/docs`, `/privacy`, and `/terms`.
