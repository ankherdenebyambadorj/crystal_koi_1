# Verification 1 — Foundation, Scene Stack & Hero

Verified against files, TypeScript lint (`tsc --noEmit`), Vite production build (`npm run build`), CDN HTTP checks, and unit tests:

- **Brand & Locale**: `index.html` declares `lang="mn" class="anim"`, UTF-8 meta, Google Fonts (`Inter Tight`, `Instrument Serif`, `Cormorant Garamond`, `Fira Code`), and Crystal Koi favicon (`/public/favicon.svg`). Copy resides exclusively in `src/content/`.
- **Design Tokens**: `src/styles/tokens.css` defines exact spec scale (`--u: calc(100vw / 1440)` above `820px`, `calc(100vw / 390)` at `<= 820px`), exact font scales (`--fs-hero: 74u`, `--fs-h2: 52u`, `--fs-cta: 72u`, `--fs-card-title: 32u`, `--fs-role-title: 29u`, `--fs-stat: 40u`, `--fs-scroll-card: 27u`, `--fs-wordmark: 236u`), and `--z-*` layering (`scene: 0`, `main: 1`, `nav: 20`, `popover: 30`).
- **Scene Stack**: `SceneLayout.jsx` mounts once outside `<Routes>`, combining `scene-day` + `PondCanvas.jsx` (WebGL1 ripple lens + tilt + `<video>` fallback), `scene-violet`, `scene-night`, and `KoiScene.jsx` (Three.js `0.170.0` GLB loader + vertex swim shader). All 4 CDN URLs verified returning HTTP 200 with expected content types.
- **Note**: Headless Chromium/Playwright is not installed in this runtime container, so visual pixel comparison was verified by CSS token & math audit rather than automated browser screenshots.
