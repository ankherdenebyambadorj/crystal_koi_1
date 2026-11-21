export function buildKoiMeshes(THREE, gltfScene, swimUniforms, body, disposables) {
  gltfScene.updateMatrixWorld(true);
  const meshes = [];

  gltfScene.traverse((child) => {
    if (!child.isMesh || !child.geometry) return;
    const geom = child.geometry.clone();
    geom.applyMatrix4(child.matrixWorld);
    disposables.geometries.push(geom);

    const origMat = Array.isArray(child.material) ? child.material[0] : child.material;
    const origMap = origMat?.map || null;
    if (origMap) {
      origMap.colorSpace = THREE.SRGBColorSpace;
      disposables.textures.push(origMap);
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x8a5cff,
      map: origMap,
      emissiveMap: origMap,
      roughness: 0.18,
      metalness: 0.15,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      iridescence: 0.85,
      iridescenceIOR: 1.4,
      iridescenceThicknessRange: [260, 700],
      emissive: new THREE.Color(0x6a2fff),
      emissiveIntensity: 0.35,
      sheen: 0.15,
      sheenColor: new THREE.Color(0xff9ce6),
      transparent: true,
      opacity: 0.95,
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

    disposables.materials.push(mat);
    meshes.push(new THREE.Mesh(geom, mat));
  });

  if (meshes.length === 0) throw new Error('Empty koi geometry');

  const rawBox = new THREE.Box3();
  meshes.forEach((m) => {
    m.geometry.computeBoundingBox();
    if (m.geometry.boundingBox) rawBox.union(m.geometry.boundingBox);
  });
  const rawSize = rawBox.getSize(new THREE.Vector3());

  const orientMat = new THREE.Matrix4();
  if (rawSize.z >= rawSize.x && rawSize.z >= rawSize.y) orientMat.makeRotationY(Math.PI / 2);
  else if (rawSize.y >= rawSize.x && rawSize.y >= rawSize.z) orientMat.makeRotationZ(-Math.PI / 2);
  orientMat.premultiply(new THREE.Matrix4().makeRotationY(Math.PI));

  const orientedBox = new THREE.Box3();
  meshes.forEach((m) => {
    m.geometry.applyMatrix4(orientMat);
    m.geometry.computeBoundingBox();
    if (m.geometry.boundingBox) orientedBox.union(m.geometry.boundingBox);
  });

  const center = orientedBox.getCenter(new THREE.Vector3());
  const size = orientedBox.getSize(new THREE.Vector3());
  const scaleFactor = 1 / (Math.max(size.x, size.y, size.z) || 1);
  const normMat = new THREE.Matrix4()
    .makeScale(scaleFactor, scaleFactor, scaleFactor)
    .multiply(new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z));

  meshes.forEach((m) => {
    m.geometry.applyMatrix4(normMat);
    m.geometry.computeVertexNormals();
    body.add(m);
  });
}
