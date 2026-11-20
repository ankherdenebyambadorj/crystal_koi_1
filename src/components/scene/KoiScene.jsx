import { useEffect, useRef, useState } from 'react';
import { KOI_MODEL_URL } from '../../content/assets.js';
import { STACKED_MAX } from '../../content/routes.js';
import { getAnchors, subscribeAnchors } from '../../lib/measureAnchors.js';
import { getPointerState } from '../../lib/pointerStore.js';
import { getScrollSnapshot, subscribeScroll } from '../../lib/scrollStore.js';
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
    let pmremGenerator = null;
    let envTexture = null;
    let scene = null;
    let camera = null;
    let rig = null;
    let body = null;
    let contextLost = false;

    const disposableGeometries = [];
    const disposableMaterials = [];
    const disposableTextures = [];

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

        if (disposed) return;

        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(currentPr);
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.95;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(30, window.innerWidth / Math.max(1, window.innerHeight), 0.1, 100);
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);

        pmremGenerator = new THREE.PMREMGenerator(renderer);
        const roomEnv = new RoomEnvironment();
        envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
        scene.environment = envTexture;
        roomEnv.dispose();
        pmremGenerator.dispose();
        pmremGenerator = null;

        const hemi = new THREE.HemisphereLight(0xc6b2ff, 0x2a1c80, 0.7);
        const key = new THREE.DirectionalLight(0xffc8f0, 1.6);
        key.position.set(3, 5, 6);
        const rim = new THREE.DirectionalLight(0x8c7bff, 2.8);
        rim.position.set(-5, -1, -4);
        scene.add(hemi, key, rim);

        rig = new THREE.Group();
        body = new THREE.Group();
        rig.add(body);
        scene.add(rig);

        const loader = new GLTFLoader();
        loader.setCrossOrigin('anonymous');

        const gltf = await new Promise((resolve, reject) => {
          loader.load(KOI_MODEL_URL, resolve, undefined, reject);
        });

        if (disposed) return;

        gltf.scene.updateMatrixWorld(true);
        const meshes = [];
        gltf.scene.traverse((child) => {
          if (child.isMesh && child.geometry) {
            const geom = child.geometry.clone();
            geom.applyMatrix4(child.matrixWorld);
            disposableGeometries.push(geom);

            const origMat = Array.isArray(child.material) ? child.material[0] : child.material;
            const origMap = origMat && origMat.map ? origMat.map : null;
            if (origMap) {
              origMap.colorSpace = THREE.SRGBColorSpace;
              disposableTextures.push(origMap);
            }

            const mat = new THREE.MeshPhysicalMaterial({
              color: origMap ? 0xc9b4ff : 0xb8a4ff,
              map: origMap,
              emissiveMap: origMap,
              roughness: 0.18,
              metalness: 0.15,
              clearcoat: 1,
              clearcoatRoughness: 0.1,
              iridescence: 0.85,
              iridescenceIOR: 1.4,
              iridescenceThicknessRange: [260, 700],
              emissive: new THREE.Color(0x7a46ff),
              emissiveIntensity: 0.55,
              sheen: 0.25,
              sheenColor: new THREE.Color(0xff9ce6),
              transparent: true,
              opacity: 0.95,
              envMapIntensity: 0.75,
              side: THREE.DoubleSide,
            });

            mat.onBeforeCompile = (shader) => {
              shader.uniforms.uSwimTime = swimUniforms.uSwimTime;
              shader.uniforms.uSwimAmp = swimUniforms.uSwimAmp;
              shader.uniforms.uSwimFreq = swimUniforms.uSwimFreq;
              shader.uniforms.uSwimSpeed = swimUniforms.uSwimSpeed;
              shader.vertexShader =
                `uniform float uSwimTime;\nuniform float uSwimAmp;\nuniform float uSwimFreq;\nuniform float uSwimSpeed;\n` +
                shader.vertexShader.replace(
                  '#include <begin_vertex>',
                  `#include <begin_vertex>
                  float koiTail = clamp((0.32 - transformed.x) / 0.82, 0.0, 1.0);
                  transformed.z += sin(transformed.x * uSwimFreq - uSwimTime * uSwimSpeed) * uSwimAmp * (0.15 + 1.6 * koiTail * koiTail);
                  transformed.y += cos(transformed.x * uSwimFreq * 0.5 - uSwimTime * uSwimSpeed * 0.5) * uSwimAmp * 0.12 * koiTail;`,
                );
            };

            disposableMaterials.push(mat);
            const mesh = new THREE.Mesh(geom, mat);
            meshes.push(mesh);
          }
        });

        if (meshes.length === 0) {
          throw new Error('Empty koi geometry');
        }

        const rawBox = new THREE.Box3();
        meshes.forEach((m) => {
          m.geometry.computeBoundingBox();
          if (m.geometry.boundingBox) rawBox.union(m.geometry.boundingBox);
        });
        const rawSize = rawBox.getSize(new THREE.Vector3());

        const orientMat = new THREE.Matrix4();
        if (rawSize.z >= rawSize.x && rawSize.z >= rawSize.y) {
          orientMat.makeRotationY(Math.PI / 2);
        } else if (rawSize.y >= rawSize.x && rawSize.y >= rawSize.z) {
          orientMat.makeRotationZ(-Math.PI / 2);
        }
        const flipNose = new THREE.Matrix4().makeRotationY(Math.PI);
        orientMat.premultiply(flipNose);

        const orientedBox = new THREE.Box3();
        meshes.forEach((m) => {
          m.geometry.applyMatrix4(orientMat);
          m.geometry.computeBoundingBox();
          if (m.geometry.boundingBox) orientedBox.union(m.geometry.boundingBox);
        });

        const center = orientedBox.getCenter(new THREE.Vector3());
        const size = orientedBox.getSize(new THREE.Vector3());
        const length = Math.max(size.x, size.y, size.z) || 1;
        const scaleFactor = 1 / length;

        const normMat = new THREE.Matrix4()
          .makeScale(scaleFactor, scaleFactor, scaleFactor)
          .multiply(new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z));

        meshes.forEach((m) => {
          m.geometry.applyMatrix4(normMat);
          m.geometry.computeVertexNormals();
          body.add(m);
        });

        const initialTarget = computeTargetPose();
        Object.assign(currentPose, initialTarget);
        setKoiState('ready');

        const renderStep = (now, forceStatic = false) => {
          if (disposed || contextLost || !renderer || !scene || !camera || !rig || !body) return;

          const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
          lastNow = now;

          const frameStart = performance.now();
          const target = computeTargetPose();
          const isReduced = reducedRef.current;

          if (isReduced || forceStatic) {
            Object.assign(currentPose, target);
          } else {
            const k = 1 - Math.exp(-3.2 * dt);
            currentPose.x += (target.x - currentPose.x) * k;
            currentPose.y += (target.y - currentPose.y) * k;
            currentPose.s += (target.s - currentPose.s) * k;
            currentPose.yaw += (target.yaw - currentPose.yaw) * k;
            currentPose.pitch += (target.pitch - currentPose.pitch) * k;
            currentPose.roll += (target.roll - currentPose.roll) * k;
          }

          const currentScrollY = getScrollSnapshot().scrollY;
          const instantVel = (currentScrollY - lastScrollY) / dt;
          lastScrollY = currentScrollY;
          scrollVel += (instantVel - scrollVel) * 0.1;

          if (!isReduced) {
            elapsed += dt;
            const speedUp = Math.min(Math.abs(scrollVel) / 1800, 1.4);
            swimClock += dt * (1 + speedUp);
            swimUniforms.uSwimTime.value = swimClock;
            swimUniforms.uSwimAmp.value = 0.07 + 0.03 * speedUp;
          }

          const fovRad = (30 * Math.PI) / 180;
          const fh = 2 * Math.tan(fovRad / 2) * 10;
          const fw = fh * camera.aspect;

          const bob = isReduced ? 0 : Math.sin(0.9 * elapsed) * 0.018;
          const yawWobble = isReduced ? 0 : Math.sin(0.5 * elapsed) * 0.06;
          const rollWobble = isReduced ? 0 : Math.sin(0.7 * elapsed) * 0.04;

          rig.position.set((currentPose.x * fw) / 2, ((currentPose.y + bob) * fh) / 2, 0);
          rig.rotation.order = 'XYZ';
          rig.rotation.set(
            currentPose.roll + rollWobble,
            currentPose.yaw + yawWobble,
            currentPose.pitch,
          );
          const scale = currentPose.s * fh;
          body.scale.set(scale, scale, scale);

          const pointer = getPointerState();
          const targetCamY = !isReduced && pointer.canHover ? -pointer.tx * 0.01745 : 0;
          const targetCamX = !isReduced && pointer.canHover ? pointer.ty * 0.01745 : 0;
          const camRate = isReduced ? 1 : 1 - Math.exp(-dt / 0.1);
          camera.rotation.y += (targetCamY - camera.rotation.y) * camRate;
          camera.rotation.x += (targetCamX - camera.rotation.x) * camRate;

          renderer.render(scene, camera);

          if (!isReduced && !prLocked) {
            const frameMs = performance.now() - frameStart;
            frameSum += frameMs;
            frameCount += 1;
            if (frameCount >= 90) {
              const avg = frameSum / frameCount;
              frameSum = 0;
              frameCount = 0;
              if (avg > 28 && currentPr > 1) {
                currentPr = Math.max(1, currentPr - 0.25);
                renderer.setPixelRatio(currentPr);
                prLocked = true;
              }
            }
          }
        };

        redrawRef.current = () => {
          if (disposed || contextLost) return;
          renderStep(performance.now(), reducedRef.current);
        };

        const tick = (now) => {
          if (disposed) return;
          if (!document.hidden && !reducedRef.current) {
            renderStep(now, false);
            rafId = window.requestAnimationFrame(tick);
          } else {
            rafId = 0;
          }
        };

        const startOrSyncLoop = () => {
          if (disposed) return;
          if (reducedRef.current) {
            if (rafId) {
              window.cancelAnimationFrame(rafId);
              rafId = 0;
            }
            renderStep(performance.now(), true);
          } else if (!document.hidden && !rafId) {
            lastNow = performance.now();
            rafId = window.requestAnimationFrame(tick);
          }
        };

        redrawRef.current = () => {
          startOrSyncLoop();
          if (reducedRef.current) {
            renderStep(performance.now(), true);
          }
        };

        const onResize = () => {
          if (!renderer || !camera) return;
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

        const unsubScroll = subscribeScroll(() => {
          if (reducedRef.current) renderStep(performance.now(), true);
        });
        const unsubAnchors = subscribeAnchors(() => {
          if (reducedRef.current) renderStep(performance.now(), true);
        });

        const onVisibilityChange = () => {
          if (document.hidden) {
            if (rafId) {
              window.cancelAnimationFrame(rafId);
              rafId = 0;
            }
          } else {
            startOrSyncLoop();
          }
        };

        const onContextLost = (e) => {
          e.preventDefault();
          contextLost = true;
          if (rafId) {
            window.cancelAnimationFrame(rafId);
            rafId = 0;
          }
        };

        const onContextRestored = () => {
          contextLost = false;
          lastNow = performance.now();
          startOrSyncLoop();
        };

        window.addEventListener('resize', onResize, { passive: true });
        document.addEventListener('visibilitychange', onVisibilityChange);
        canvas.addEventListener('webglcontextlost', onContextLost);
        canvas.addEventListener('webglcontextrestored', onContextRestored);

        startOrSyncLoop();

        return () => {
          unsubScroll();
          unsubAnchors();
          window.removeEventListener('resize', onResize);
          document.removeEventListener('visibilitychange', onVisibilityChange);
          canvas.removeEventListener('webglcontextlost', onContextLost);
          canvas.removeEventListener('webglcontextrestored', onContextRestored);
        };
      } catch {
        if (!disposed) {
          setKoiState('failed');
        }
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

      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      disposableTextures.forEach((t) => t.dispose());
      if (envTexture) envTexture.dispose();
      if (pmremGenerator) pmremGenerator.dispose();
      if (renderer) {
        renderer.dispose();
        try {
          renderer.forceContextLoss();
        } catch {
          // Ignore already-lost contexts
        }
      }
    };
  }, []);

  if (koiState === 'failed') {
    return null;
  }

  return <canvas ref={canvasRef} className="scene-koi" data-koi-state={koiState} aria-hidden="true" />;
}
