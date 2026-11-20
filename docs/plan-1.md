# Plan — Part 1: Foundation (scene, navigation, hero)

## Files to create in order
1. `docs/ENGINEERING.md`, `docs/DEPENDENCIES.md`, `README.md`, `public/favicon.svg`, `index.html`, `metadata.json`.
2. `src/styles/tokens.css`, `src/index.css` — spec color tokens, `--u` scaling, type tokens, reduced-motion overrides, and scene/nav/hero styling.
3. `src/content/assets.js`, `src/content/brand.js`, `src/content/routes.js`, `src/content/siteContent.js` — verbatim asset URLs, brand/contact data, single-source route constants, and Mongolian copy.
4. `src/lib/scrollStore.js`, `src/lib/pointerStore.js`, `src/lib/measureAnchors.js` — passive rAF-batched scroll store, pointer/tilt store, and anchor measurement.
5. `src/hooks/useViewportUnit.js`, `src/hooks/useReducedMotion.js`, `src/hooks/usePageMeta.js`, `src/hooks/useHeroEntrance.js`, `src/hooks/useReveal.js`, `src/hooks/useOverflowWatch.js`.
6. `src/components/icons/Logo.jsx`, `src/components/icons/FacebookIcon.jsx`, `src/components/icons/InstagramIcon.jsx`, `src/components/ui/RichText.jsx`, `src/components/ui/ActionLink.jsx`.
7. `src/components/scene/poseMath.js`, `src/components/scene/koiPoses.js`, `src/components/scene/PondCanvas.jsx`, `src/components/scene/KoiScene.jsx`, `src/components/scene/SceneLayout.jsx`.
8. `src/components/layout/SiteNav.jsx`, `src/components/home/HeroSection.jsx`, `src/pages/HomePage.jsx`, `src/pages/PageStub.jsx`, `src/pages/NotFoundPage.jsx`, `src/App.jsx`, `src/main.jsx`.
