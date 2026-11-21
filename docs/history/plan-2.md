# Plan — Part 2: Home sections and footer

## Files to create and update
1. `src/content/homeContent.js` — exact Mongolian copy for Studio, Dashboard, Packages, Use Cases, CTA, and Footer contact labels.
2. `src/lib/chartMath.js` — deterministic seeded series generator, normalizer, and smooth cubic SVG path builder.
3. `src/hooks/useTypewriter.js` — IntersectionObserver-triggered typewriter loop with reduced-motion support and timer cleanup.
4. `src/components/icons/featureIcons.jsx` — bare line icons (`crosshair`, `screen`, `trend`, `briefcase`, `megaphone`, `document`, `code`) plus footer contact line icons (`MapPinIcon`, `PhoneIcon`).
5. `src/styles/home.css` & `src/index.css` — desktop and phone (`<= 820px`) layout, dashboard, charts, staircase, CTA, and footer styles.
6. `src/components/home/StudioSection.jsx`, `src/components/home/dashboard/ProductDashboard.jsx`, `src/components/home/dashboard/DashboardChart.jsx`.
7. `src/components/home/PacksSection.jsx`, `src/components/home/BidRequestCode.jsx`, `src/components/home/StepsStrip.jsx`, `src/components/home/UsesSection.jsx`.
8. `src/components/layout/CtaPanel.jsx`, `src/components/layout/SiteFooter.jsx`, `src/components/layout/EndSection.jsx`, and `src/pages/HomePage.jsx`.
