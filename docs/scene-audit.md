# Scene Audit — Visual, Scroll, Motion & Canvas Verification

1. **Hero Stage (`0px` -> `100vh`)**:
   - `SceneLayout.jsx` locks `mode = 'home'` -> `dayOpacity = 1`, `violetOpacity = 0`, `nightOpacity = 0`.
   - `PondCanvas.jsx` decodes `POND_VIDEO_URL` (HTTP 200 `video/mp4`) into WebGL1 ripple/tilt shader when `reducedMotion === false`; falls back cleanly to `<video>` if WebGL unavailable, and holds sharp `DAY_PLATE_URL` still when `reducedMotion === true` or on video error.
   - `KoiScene.jsx` loads `KOI_MODEL_URL` (HTTP 200 `model/gltf-binary`) once via `GLTFLoader` with vertex swim deformation (`uSwimTime`, `uSwimAmp`, `uSwimFreq`, `uSwimSpeed`) normalized to unit body length.

2. **Scroll Crossfade & Pose Track (`50%` & Bottom)**:
   - `toViolet = smoothstep(0.15 * h, 1.05 * h, y)` transitions seamlessly from day plate into violet gradient behind Studio/Dashboard/Packs/Uses.
   - `toNight = smoothstep(endTop - 1.1 * h, endTop - 0.1 * h, y)` blends into `NIGHT_PLATE_URL` gradient overlay over `EndSection` (`#end`).
   - `buildHomePoseStops` & `buildInnerPoseStops` evaluate smoothstep/cubic-eased 6-stop pose tracks (`hero`, `statement`, `dash`, `packs`, `uses`, `end`).

3. **Pointer & Touch Input**:
   - `pointerStore.js` gates hover ripple & subtle camera parallax via `(hover: hover) and (pointer: fine)` media query so touch devices (`<= 820px`) keep clean static framing without phantom tilt offsets.

4. **Responsive Sizing & Breakpoint (`820px`)**:
   - `useViewportUnit.js` + `tokens.css` compute `--u = clientWidth / 1440` above `820px` (`1280`, `1440`, `1920`) and `clientWidth / 390` at `<= 820px` (`390x844`, `820px`), flipping cleanly back to desktop grid at `821px`.

5. **WebGL Fallback, Reduced Motion & Context Recovery**:
   - Live `useReducedMotion` toggles both CSS animations (`html.reduced-motion`) and RAF/video loops immediately.
   - `webglcontextlost` pauses render loops cleanly via `e.preventDefault()`; `webglcontextrestored` re-initializes shaders (`PondCanvas`) and resumes `KoiScene` cleanly.
   - Single `SceneLayout` outside `<Routes>` keeps exactly 2 `<canvas>` nodes (`scene-pondfx`, `scene-koi`) across route changes.
