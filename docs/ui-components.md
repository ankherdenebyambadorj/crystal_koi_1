# Crystal Koi — UI Components Inventory

All interface primitives live under `src/components/ui/` and wrap `@radix-ui/*` primitives restyled to Crystal Koi tokens (`#0d0830`, `#f4f2ff`, `#6f78ff`, `--glass-hi`, `var(--u)` sizing, `var(--z-popover)` overlays):

| Component | File | Base Primitive | Used In |
| --- | --- | --- | --- |
| `Accordion` | `src/components/ui/accordion.jsx` | `@radix-ui/react-accordion` | `DocsPage` FAQ section |
| `Alert` | `src/components/ui/alert.jsx` | Semantic `role="alert"` | `FormShell`, `LoginPage`, `StoriesPage`, `PartnersPage`, `StatusPage` |
| `Badge` | `src/components/ui/badge.jsx` | Custom (`ck-badge--*`) | `StoriesPage`, `PartnersPage`, `StatusPage` |
| `Breadcrumb` | `src/components/ui/breadcrumb.jsx` | Custom `<nav>` `<ol>` | `PageShell` (all inner pages except 404) |
| `Button` | `src/components/ui/button.jsx` | `@radix-ui/react-slot` | `FormShell`, `LoginPage`, `NotFoundPage`, retry actions |
| `Checkbox` | `src/components/ui/checkbox.jsx` | `@radix-ui/react-checkbox` | `ConsentField` across forms |
| `DropdownMenu` | `src/components/ui/dropdown-menu.jsx` | `@radix-ui/react-dropdown-menu` | `SiteNav` authenticated account menu |
| `Input` | `src/components/ui/input.jsx` | Native `<input>` | `TextField` across intake & auth forms |
| `Label` | `src/components/ui/label.jsx` | `@radix-ui/react-label` | `TextField`, `TextAreaField`, `SelectField`, `ConsentField` |
| `Select` | `src/components/ui/select.jsx` | `@radix-ui/react-select` | `SelectField` (`/book-a-call`, `/get-started`, `/contact`) |
| `Sheet` | `src/components/ui/sheet.jsx` | `@radix-ui/react-dialog` | `SiteNav` mobile navigation drawer (`<= 820px`) |
| `Skeleton` | `src/components/ui/skeleton.jsx` | Custom pulse element | `StoriesPage`, `PartnersPage`, `StatusPage` loading states |
| `Tabs` | `src/components/ui/tabs.jsx` | `@radix-ui/react-tabs` | `LoginPage` auth tabs, `PartnersPage` category filter |
| `Textarea` | `src/components/ui/textarea.jsx` | Native `<textarea>` | `TextAreaField` (`/contact`, `/opt-out`) |
| `Tooltip` | `src/components/ui/tooltip.jsx` | `@radix-ui/react-tooltip` | `PartnersPage` website URL preview, `StatusPage` updated timestamp (`TooltipProvider` at root) |
| `ActionLink` / `RichText` | `ActionLink.jsx` / `RichText.jsx` | Custom Crystal Koi UI | Home & inner content sections |
