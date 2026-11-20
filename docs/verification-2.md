# Verification 2 — Home Sections, Dashboard, Packs, Uses & Footer

Verified against implementation files, `node --test tests/unit.test.js`, `tsc --noEmit`, and `vite build`:

- **Studio Section (`StudioSection.jsx`)**: Renders glass statement card, typewriter-animated search/brief bar (`useTypewriter.js`), and the studio preview panel.
- **Product Dashboard & Bid Request (`ProductDashboard.jsx`, `DashboardChart.jsx`, `BidRequestCode.jsx`)**: 2-column grid with interactive chart tab switching (`28-point` deterministic series verified by `tests/unit.test.js`), animated metric counters, and OpenRTB JSON snippet (`ck` deal prefix).
- **Steps, Packs, Uses & End Section (`StepsStrip.jsx`, `PacksSection.jsx`, `UsesSection.jsx`, `CtaPanel.jsx`, `SiteFooter.jsx`)**: 3-step onboarding strip, 6-pack inventory showcase, 4-role matrix linking directly into `/use-cases/*`, CTA panel, footer grid with oversized background wordmark (`236u`).
- **Footer Live Status (`SiteFooter.jsx`)**: Connected to live `/api/fn/getServiceStatus`; renders nothing while loading, on error, or when component table has 0 published rows (never fakes green).
