# Verification 3 — Navigation, Inner Content, Docs & Legal Pages

Verified against routing, Radix primitives, CSS tokens, `tsc --noEmit`, and `vite build`:

- **Desktop & Mobile Navigation (`SiteNav.jsx`, `sheet.jsx`)**: Hover/keyboard desktop dropdowns (`product`, `channels`, `resources`) with viewport clamping and arrow/Escape key handling; mobile `<Sheet>` drawer at `<= 820px` with full navigation links, actions, and contact details.
- **Inner Content (`ContentPage.jsx`)**: Serves all 11 product, use-case, and channel routes cleanly from `src/content/pagesContent.js` inside `PageShell`.
- **Docs (`DocsPage.jsx`) & Legal (`LegalPage.jsx`)**: Sticky/scrollable section navigation on `/resources/docs`, glossary rows, Radix `<Accordion>` FAQ (`accordion.jsx`) with matching desktop `--u` and mobile `<= 820px` styling, and full Mongolian Privacy & Terms pages.
