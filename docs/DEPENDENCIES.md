# Dependencies

Runtime and UI packages declared in `package.json`:

| Package | Version | Purpose |
|---|---|---|
| `@fontsource/krona-one` | `^5.3.0` | Self-hosted `Krona One` (OFL 1.1) wide display font for hero wordmark |
| `express` | `^4.21.2` | HTTP server, API endpoints, security middleware, and static/Vite middleware |
| `pg` | `^8.23.1` | PostgreSQL driver when `DATABASE_URL` is configured (fallback is built-in `node:sqlite`) |
| `dotenv` | `^17.2.3` | Environment variable loading for local development |
| `zod` | `^4.6.7` | Runtime schema validation shared across form inputs and API handlers |
| `react` / `react-dom` | `^19.0.1` | UI rendering and concurrent lazy-loaded page routing |
| `react-router-dom` | `^7.18.6` | Client-side routing across home, content, form, auth, and status pages |
| `@tanstack/react-query` | `^5.108.2` | Server state caching, retries, and auth/content queries |
| `react-hook-form` | `^7.92.0` | Accessible form state, validation, and focus management |
| `@hookform/resolvers` | `^7.0.8` | Connects Zod schemas with `react-hook-form` |
| `three` | `0.170.0` | 3D crystal koi GLB rendering and iridescent swim shader |
| `clsx` | `^2.1.1` | Conditional class merging for UI primitives |
| `tailwind-merge` | `^3.7.1` | Conflict-free Tailwind CSS class merging |
| `@tailwindcss/vite` | `^4.3.3` | Tailwind CSS v4 integration plugin |
| `@vitejs/plugin-react` | `^6.1.1` | Vite React transform plugin |
| `@radix-ui/react-accordion` | `^1.3.1` | Accessible FAQ accordion on `/resources/docs` |
| `@radix-ui/react-alert-dialog` | `^1.2.1` | Destructive/opt-out confirmation dialog on `/opt-out` |
| `@radix-ui/react-avatar` | `^1.3.1` | Account initials chip in `SiteNav` and `ProductDashboard` |
| `@radix-ui/react-checkbox` | `^1.4.1` | Accessible consent checkboxes across intake forms |
| `@radix-ui/react-dialog` | `^1.3.1` | Focus-trapped mobile navigation sheet drawer (`<= 820px`) |
| `@radix-ui/react-dropdown-menu` | `^2.2.1` | Authenticated user account menu in `SiteNav` |
| `@radix-ui/react-label` | `^2.1.17` | Accessible form field labels |
| `@radix-ui/react-progress` | `^1.2.1` | Accessible format-share bars in `ProductDashboard` |
| `@radix-ui/react-scroll-area` | `^1.4.0` | Custom scrollable viewport for `BidRequestCode` |
| `@radix-ui/react-select` | `^2.4.1` | Custom accessible select menus on forms |
| `@radix-ui/react-separator` | `^1.2.0` | Structural section dividers (`SiteFooter`, `ContentPage`) |
| `@radix-ui/react-slot` | `^1.5.0` | Polymorphic slot composition (`Button`, `FormControl`) |
| `@radix-ui/react-tabs` | `^1.2.1` | Login/registration tabs and partner category filters |
| `@radix-ui/react-toast` | `^1.3.1` | Transient status notifications (session logout feedback) |
| `@radix-ui/react-toggle-group` | `^1.2.1` | Keyboard-navigable `7x / 30x / 90x` selector in `ProductDashboard` |
| `@radix-ui/react-tooltip` | `^1.4.1` | Hover and keyboard-focus tooltips (`PartnersPage`, `StatusPage`) |
| `esbuild` *(dev)* | `^0.28.0` | Vite v8 bundler/minifier dependency alignment |
