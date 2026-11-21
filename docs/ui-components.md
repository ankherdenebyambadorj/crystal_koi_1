# Crystal Koi — UI Components Inventory

All interface primitives live under `src/components/ui/` and wrap `@radix-ui/*` primitives restyled to Crystal Koi tokens (`#0d0830`, `#f4f2ff`, `#6f78ff`, `--glass-hi`, `var(--u)` sizing, `var(--z-popover)` overlays):

| Component | File | Base Primitive | Used In |
| --- | --- | --- | --- |
| `Accordion` | `src/components/ui/accordion.jsx` | `@radix-ui/react-accordion` | `DocsPage` FAQ section |
| `Alert` | `src/components/ui/alert.jsx` | Semantic `role="alert"` | `FormShell`, `LoginPage`, `StoriesPage`, `PartnersPage`, `StatusPage` |
| `AlertDialog` | `src/components/ui/alert-dialog.jsx` | `@radix-ui/react-alert-dialog` | `OptOutPage` submit confirmation dialog |
| `Avatar` | `src/components/ui/avatar.jsx` | `@radix-ui/react-avatar` | `SiteNav` account badge, `ProductDashboard` `PM` avatar |
| `Badge` | `src/components/ui/badge.jsx` | Custom (`ck-badge--*`) | `StoriesPage`, `PartnersPage`, `StatusPage` |
| `Breadcrumb` | `src/components/ui/breadcrumb.jsx` | Custom `<nav>` `<ol>` | `PageShell` |
| `Button` | `src/components/ui/button.jsx` | `@radix-ui/react-slot` | `FormShell`, auth forms, `NotFoundPage` |
| `Checkbox` | `src/components/ui/checkbox.jsx` | `@radix-ui/react-checkbox` | `ConsentField` across forms |
| `DropdownMenu` | `src/components/ui/dropdown-menu.jsx` | `@radix-ui/react-dropdown-menu` | `SiteNav` authenticated account menu |
| `Form` | `src/components/ui/form.jsx` | `react-hook-form` + `@radix-ui/react-slot` | `TextField`, `TextAreaField`, `SelectField`, `ConsentField` |
| `Input` | `src/components/ui/input.jsx` | Native `<input>` | `TextField` across intake & auth forms |
| `Label` | `src/components/ui/label.jsx` | `@radix-ui/react-label` | All form fields |
| `Progress` | `src/components/ui/progress.jsx` | `@radix-ui/react-progress` | `ProductDashboard` format-share progress bars |
| `ScrollArea` | `src/components/ui/scroll-area.jsx` | `@radix-ui/react-scroll-area` | `BidRequestCode` OpenRTB snippet viewport |
| `Select` | `src/components/ui/select.jsx` | `@radix-ui/react-select` | `SelectField` (`/book-a-call`, `/get-started`, `/contact`) |
| `Separator` | `src/components/ui/separator.jsx` | `@radix-ui/react-separator` | `SiteFooter`, `ContentPage` related section |
| `Sheet` | `src/components/ui/sheet.jsx` | `@radix-ui/react-dialog` | `SiteNav` mobile navigation drawer (`<= 820px`) |
| `Skeleton` | `src/components/ui/skeleton.jsx` | Custom pulse element | `StoriesPage`, `PartnersPage`, `StatusPage` loading states |
| `Tabs` | `src/components/ui/tabs.jsx` | `@radix-ui/react-tabs` | `LoginPage` auth tabs, `PartnersPage` category filters |
| `Textarea` | `src/components/ui/textarea.jsx` | Native `<textarea>` | `TextAreaField` (`/contact`, `/opt-out`) |
| `Toast` | `src/components/ui/toast.jsx` | `@radix-ui/react-toast` | Root `<Toaster />` + `SiteNav` logout feedback |
| `ToggleGroup` | `src/components/ui/toggle-group.jsx` | `@radix-ui/react-toggle-group` | `ProductDashboard` `7x / 30x / 90x` range selector |
| `Tooltip` | `src/components/ui/tooltip.jsx` | `@radix-ui/react-tooltip` | `PartnersPage` website preview, `StatusPage` timestamp |
| `ActionLink` / `RichText` | `ActionLink.jsx` / `RichText.jsx` | Custom Crystal Koi UI | Home & inner content sections |
