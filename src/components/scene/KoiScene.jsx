import { useEffect, useRef, useState } from 'react';
import { KOI_MODEL_URL } from '../../content/assets.js';
import { STACKED_MAX } from '../../content/routes.js';
import { getAnchors, subscribeAnchors } from '../../lib/measureAnchors.js';
import { getPointerState } from '../../lib/pointerStore.js';
import { getScrollSnapshot, subscribeScroll } from '../../lib/scrollStore.js';
import { buildKoiMeshes } from './koiMesh.js';
import { buildHomePoseStops, buildInnerPoseStops, getPose } from './koiPoses.js';
import { evaluatePoseTrack } from './poseMath.js';

export function KoiScene({ mode, reducedMotion }) {
  const canvasRef = useRef(null);
  const [koiState, setKoiState] = useState('loading');
  const modeRef = useRef(mode);
  const reducedRef = useRef(reducedMotion);
  const redrawRef = useRef(null);

  useEffect(() => {
    modeRef.current = mode;
    if (redrawRef.current) redrawRef.current();
  }, [mode]);

  useEffect(() => {
    reducedRef.current = reducedMotion;
    if (redrawRef.current) redrawRef.current();
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let disposed = false;
    let rafId = 0;
    let renderer = null;
    let envTexture = null;
    let contextLost = false;
    const disposables = { geometries: [], materials: [], textures: [] };
    const swimUniforms = {
      uSwimTime: { value: 0 },
      uSwimAmp: { value: 0.075 },
      uSwimFreq: { value: 5.2 },
      uSwimSpeed: { value: 6.5 },
    };

    const getIsStacked = () =>
      (document.documentElement.clientWidth || window.innerWidth || 1440) <= STACKED_MAX;

    let currentPr = Math.min(window.devicePixelRatio || 1, getIsStacked() ? 1.5 : 2);
    let prLocked = false;
    let frameSum = 0;
    let frameCount = 0;
    const currentPose = getPose('hero', getIsStacked());
    let lastScrollY = getScrollSnapshot().scrollY;
    let scrollVel = 0;
    let swimClock = 0;
    let elapsed = 0;
    let lastNow = performance.now();

    const computeTargetPose = () => {
      const snap = getScrollSnapshot();
      const stacked = getIsStacked();
      const stops =
        modeRef.current === 'home'
          ? buildHomePoseStops(getAnchors(), snap.viewportHeight, snap.maxScroll, stacked)
          : buildInnerPoseStops(snap.viewportHeight, snap.maxScroll, stacked);
      return evaluatePoseTrack(stops, snap.scrollY) || getPose('hero', stacked);
    };

    const init = async () => {
      try {
        const [THREE, { GLTFLoader }, { RoomEnvironment }] = await Promise.all([
          import('three'),
          import('three/examples/jsm/loaders/GLTFLoader.js'),
          import('three/examples/jsm/environments/RoomEnvironment.js'),
        ]);
        if (disposed) return undefined;

        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(currentPr);
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.95;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(30, window.innerWidth / Math.max(1, window.innerHeight), 0.1, 100);
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);

        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        const roomEnv = new RoomEnvironment();
        envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
        scene.environment = envTexture;
        roomEnv.dispose();
        pmremGenerator.dispose();

        const key = new THREE.DirectionalLight(0xffc8f0, 1.6);
        key.position.set(3, 5, 6);
        const rim = new THREE.DirectionalLight(0x8c7bff, 2.8);
        rim.position.set(-5, -1, -4);
        scene.add(new THREE.HemisphereLight(0xc6b2ff, 0x2a1c80, 0.7), key, rim);

        const rig = new THREE.Group();
        const body = new THREE.Group();
        rig.add(body);
        scene.add(rig);

        const loader = new GLTFLoader();
        loader.setCrossOrigin('anonymous');
        const gltf = await new Promise((resolve, reject) => loader.load(KOI_MODEL_URL, resolve, undefined, reject));
        if (disposed) return undefined;

        buildKoiMeshes(THREE, gltf.scene, swimUniforms, body, disposables);
        Object.assign(currentPose, computeTargetPose());
        setKoiState('ready');

        const renderStep = (now, forceStatic = false) => {
          if (disposed || contextLost || !renderer) return;
          const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
          lastNow = now;
          const frameStart = performance.now();
          const target = computeTargetPose();
          const isReduced = reducedRef.current;

          if (isReduced || forceStatic) {
            Object.assign(currentPose, target);
          } else {
            const k = 1 - Math.exp(-3.2 * dt);
            for (const keyName of ['x', 'y', 's', 'yaw', 'pitch', 'roll']) {
              currentPose[keyName] += (target[keyName] - currentPose[keyName]) * k;
            }
          }

          const currentScrollY = getScrollSnapshot().scrollY;
          scrollVel += ((currentScrollY - lastScrollY) / dt - scrollVel) * 0.1;
          lastScrollY = currentScrollY;

          if (!isReduced) {
            elapsed += dt;
            const speedUp = Math.min(Math.abs(scrollVel) / 1800, 1.4);
            swimClock += dt * (1 + speedUp);
            swimUniforms.uSwimTime.value = swimClock;
            swimUniforms.uSwimAmp.value = 0.07 + 0.03 * speedUp;
          }

          const fh = 2 * Math.tan((30 * Math.PI) / 360) * 10;
          const fw = fh * camera.aspect;
          const bob = isReduced ? 0 : Math.sin(0.9 * elapsed) * 0.018;
          rig.position.set((currentPose.x * fw) / 2, ((currentPose.y + bob) * fh) / 2, 0);
          rig.rotation.order = 'XYZ';
          rig.rotation.set(
            currentPose.roll + (isReduced ? 0 : Math.sin(0.7 * elapsed) * 0.04),
            currentPose.yaw + (isReduced ? 0 : Math.sin(0.5 * elapsed) * 0.06),
            currentPose.pitch,
          );
          const scale = currentPose.s * fh;
          body.scale.set(scale, scale, scale);

          const pointer = getPointerState();
          const camRate = isReduced ? 1 : 1 - Math.exp(-dt / 0.1);
          camera.rotation.y += ((!isReduced && pointer.canHover ? -pointer.tx * 0.01745 : 0) - camera.rotation.y) * camRate;
          camera.rotation.x += ((!isReduced && pointer.canHover ? pointer.ty * 0.01745 : 0) - camera.rotation.x) * camRate;
          renderer.render(scene, camera);

          if (!isReduced && !prLocked && ++frameCount >= 90) {
            const avg = (frameSum + performance.now() - frameStart) / 90;
            frameSum = 0;
            frameCount = 0;
            if (avg > 28 && currentPr > 1) {
              currentPr = Math.max(1, currentPr - 0.25);
              renderer.setPixelRatio(currentPr);
              prLocked = true;
            }
          } else if (!isReduced && !prLocked) {
            frameSum += performance.now() - frameStart;
          }
        };

        const tick = (now) => {
          if (!disposed && !document.hidden && !reducedRef.current) {
            renderStep(now, false);
            rafId = window.requestAnimationFrame(tick);
          } else rafId = 0;
        };

        const startOrSyncLoop = () => {
          if (disposed) return;
          if (reducedRef.current) {
            if (rafId) window.cancelAnimationFrame(rafId);
            rafId = 0;
            renderStep(performance.now(), true);
          } else if (!document.hidden && !rafId) {
            lastNow = performance.now();
            rafId = window.requestAnimationFrame(tick);
          }
        };

        redrawRef.current = () => {
          startOrSyncLoop();
          if (reducedRef.current) renderStep(performance.now(), true);
        };

        const onResize = () => {
          const w = window.innerWidth;
          const h = Math.max(1, window.innerHeight);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          if (!prLocked) {
            currentPr = Math.min(window.devicePixelRatio || 1, getIsStacked() ? 1.5 : 2);
            renderer.setPixelRatio(currentPr);
          }
          renderer.setSize(w, h, false);
          if (reducedRef.current) renderStep(performance.now(), true);
        };

        const unsubScroll = subscribeScroll(() => reducedRef.current && renderStep(performance.now(), true));
        const unsubAnchors = subscribeAnchors(() => reducedRef.current && renderStep(performance.now(), true));
        const onVisibility = () => (document.hidden ? (rafId && window.cancelAnimationFrame(rafId), (rafId = 0)) : startOrSyncLoop());
        const onLost = (e) => { e.preventDefault(); contextLost = true; if (rafId) window.cancelAnimationFrame(rafId); rafId = 0; };
        const onRestored = () => { contextLost = false; lastNow = performance.now(); startOrSyncLoop(); };

        window.addEventListener('resize', onResize, { passive: true });
        document.addEventListener('visibilitychange', onVisibility);
        canvas.addEventListener('webglcontextlost', onLost);
        canvas.addEventListener('webglcontextrestored', onRestored);
        startOrSyncLoop();

        return () => {
          unsubScroll();
          unsubAnchors();
          window.removeEventListener('resize', onResize);
          document.removeEventListener('visibilitychange', onVisibility);
          canvas.removeEventListener('webglcontextlost', onLost);
          canvas.removeEventListener('webglcontextrestored', onRestored);
        };
      } catch {
        if (!disposed) setKoiState('failed');
        return undefined;
      }
    };

    let cleanupEvents = null;
    init().then((fn) => {
      if (typeof fn === 'function') {
        if (disposed) fn();
        else cleanupEvents = fn;
      }
    });

    return () => {
      disposed = true;
      redrawRef.current = null;
      if (rafId) window.cancelAnimationFrame(rafId);
      if (cleanupEvents) cleanupEvents();
      disposables.geometries.forEach((g) => g.dispose());
      disposables.materials.forEach((m) => m.dispose());
      disposables.textures.forEach((t) => t.dispose());
      if (envTexture) envTexture.dispose();
      if (renderer) {
        renderer.dispose();
        try { renderer.forceContextLoss(); } catch { /* noop */ }
      }
    };
  }, []);

  if (koiState === 'failed') return null;
  return <canvas ref={canvasRef} className="scene-koi" data-koi-state={koiState} aria-hidden="true" />;
}
