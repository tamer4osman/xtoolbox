export const toolConfig = {
  id: "3d-model-viewer",
  name: "3D Model Viewer",
  category: "productivity",
  description: "Drag-and-drop 3D model viewer supporting glTF, GLB, OBJ, and STL formats.",
  icon: "🧊",
  keywords: ["3d", "model", "viewer", "gltf", "glb", "obj", "stl", "webgl"],
  accept: ".gltf,.glb,.obj,.stl",
  maxSizeMB: 100,
  steps: [
    "Drag and drop a 3D model file (GLTF, GLB, OBJ, or STL)",
    "Use mouse to rotate, scroll to zoom, right-click to pan",
    "Toggle wireframe or play animations if available",
    "Export as PNG screenshot",
  ],
  faqs: [
    {
      question: "Which formats are supported?",
      answer: "GLTF, GLB (recommended), OBJ, and STL files.",
    },
    {
      question: "Why is my model not visible?",
      answer:
        "Try scrolling to zoom out — the model may be too large or too small for the default camera position.",
    },
    {
      question: "Can I export the model?",
      answer: "You can export the current view as a PNG screenshot.",
    },
  ],
};

let THREE = null;
let GLTFLoader = null;
let OBJLoader = null;
let STLLoader = null;
let OrbitControls = null;

const CDN = "https://esm.sh/three@0.170.0";

async function loadThree() {
  if (THREE) return;
  const three = await import(CDN);
  THREE = three;
  const gltfLoader = await import(`${CDN}/examples/jsm/loaders/GLTFLoader.js`);
  GLTFLoader = gltfLoader.GLTFLoader;
  const objLoader = await import(`${CDN}/examples/jsm/loaders/OBJLoader.js`);
  OBJLoader = objLoader.OBJLoader;
  const stlLoader = await import(`${CDN}/examples/jsm/loaders/STLLoader.js`);
  STLLoader = stlLoader.STLLoader;
  const orbitControls = await import(`${CDN}/examples/jsm/controls/OrbitControls.js`);
  OrbitControls = orbitControls.OrbitControls;
}

function getExt(name) {
  return name.split(".").pop().toLowerCase();
}

function fitCameraToObject(camera, object, controls) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
  cameraZ *= 1.5;
  camera.position.set(center.x + cameraZ * 0.5, center.y + cameraZ * 0.3, center.z + cameraZ);
  camera.near = maxDim / 1000;
  camera.far = maxDim * 100;
  camera.updateProjectionMatrix();
  if (controls) {
    controls.target.copy(center);
    controls.update();
  }
}

function createGrid(THREE) {
  const grid = new THREE.GridHelper(20, 40, 0x444444, 0x333333);
  grid.material.opacity = 0.4;
  grid.material.transparent = true;
  return grid;
}

function createLights(THREE, scene) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const dir1 = new THREE.DirectionalLight(0xffffff, 0.8);
  dir1.position.set(5, 10, 7);
  scene.add(dir1);
  const dir2 = new THREE.DirectionalLight(0xffffff, 0.4);
  dir2.position.set(-5, 5, -5);
  scene.add(dir2);
}

function loadModel(scene, buffer, ext, onLoad, onProgress, onError) {
  const blob = new Blob([buffer]);
  const url = URL.createObjectURL(blob);

  if (ext === "gltf" || ext === "glb") {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        const root = gltf.scene;
        scene.add(root);
        onLoad({
          scene: root,
          animations: gltf.animations || [],
          mixer: gltf.animations.length > 0 ? new THREE.AnimationMixer(root) : null,
        });
        URL.revokeObjectURL(url);
      },
      onProgress,
      (err) => {
        URL.revokeObjectURL(url);
        onError(err);
      },
    );
  } else if (ext === "obj") {
    const loader = new OBJLoader();
    loader.load(
      url,
      (obj) => {
        scene.add(obj);
        onLoad({ scene: obj, animations: [], mixer: null });
        URL.revokeObjectURL(url);
      },
      onProgress,
      (err) => {
        URL.revokeObjectURL(url);
        onError(err);
      },
    );
  } else if (ext === "stl") {
    const loader = new STLLoader();
    loader.load(
      url,
      (geometry) => {
        const material = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.6 });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        onLoad({ scene: mesh, animations: [], mixer: null });
        URL.revokeObjectURL(url);
      },
      onProgress,
      (err) => {
        URL.revokeObjectURL(url);
        onError(err);
      },
    );
  } else {
    URL.revokeObjectURL(url);
    onError(new Error("Unsupported format: " + ext));
  }
}

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <h1>${toolConfig.name}</h1>
        <p>${toolConfig.description}</p>
      </div>
      <div id="td-viewer-controls" style="display:flex;flex-wrap:wrap;gap:var(--space-2);margin-bottom:var(--space-3);align-items:center;">
        <button class="btn btn-secondary" id="td-wireframe">Wireframe</button>
        <button class="btn btn-secondary" id="td-reset-camera">Reset Camera</button>
        <button class="btn btn-secondary" id="td-screenshot">Screenshot</button>
        <span id="td-model-info" style="font-size:var(--text-sm);color:var(--color-text-muted);"></span>
      </div>
      <div id="td-drop-zone" style="border:2px dashed var(--color-border);border-radius:var(--radius-md);min-height:400px;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;">
        <div id="td-placeholder" style="text-align:center;color:var(--color-text-muted);">
          <p style="font-size:var(--text-lg);margin-bottom:var(--space-2);">Drag & drop a 3D model here</p>
          <p style="font-size:var(--text-sm);">GLTF, GLB, OBJ, or STL</p>
          <p style="font-size:var(--text-sm);margin-top:var(--space-1);">or click to browse</p>
          <input type="file" id="td-file-input" accept=".gltf,.glb,.obj,.stl" style="display:none;">
        </div>
        <canvas id="td-canvas" style="width:100%;height:100%;display:none;position:absolute;top:0;left:0;"></canvas>
      </div>
      <div id="td-animation-controls" style="display:none;margin-top:var(--space-2);gap:var(--space-2);align-items:center;">
        <button class="btn btn-secondary" id="td-play-anim">Play</button>
        <select id="td-anim-select" class="input" style="flex:1;"></select>
      </div>
    </div>
  `;

  const dropZone = container.querySelector("#td-drop-zone");
  const placeholder = container.querySelector("#td-placeholder");
  const canvas = container.querySelector("#td-canvas");
  const fileInput = container.querySelector("#td-file-input");
  const wireframeBtn = container.querySelector("#td-wireframe");
  const resetBtn = container.querySelector("#td-reset-camera");
  const screenshotBtn = container.querySelector("#td-screenshot");
  const modelInfo = container.querySelector("#td-model-info");
  const animControls = container.querySelector("#td-animation-controls");
  const playBtn = container.querySelector("#td-play-anim");
  const animSelect = container.querySelector("#td-anim-select");

  let renderer,
    scene,
    camera,
    controls,
    currentModel = null,
    animations = [],
    mixer = null,
    clock = null,
    wireframe = false,
    animPlaying = false;

  async function init() {
    await loadThree();
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(dropZone.clientWidth, dropZone.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    camera = new THREE.PerspectiveCamera(
      45,
      dropZone.clientWidth / dropZone.clientHeight,
      0.01,
      1000,
    );
    camera.position.set(0, 2, 5);

    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    scene.add(createGrid(THREE));
    createLights(THREE, scene);

    clock = new THREE.Clock();
    animate();

    window.addEventListener("resize", onResize);
  }

  function onResize() {
    if (!renderer || !camera) return;
    const w = dropZone.clientWidth;
    const h = dropZone.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    if (mixer && animPlaying) mixer.update(clock.getDelta());
    if (renderer && scene && camera) renderer.render(scene, camera);
  }

  function clearModel() {
    if (currentModel) {
      scene.remove(currentModel);
      currentModel.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
          else child.material.dispose();
        }
      });
      currentModel = null;
    }
    mixer = null;
    animations = [];
    animPlaying = false;
    animControls.style.display = "none";
    animSelect.innerHTML = "";
  }

  async function handleFile(file) {
    if (!renderer) await init();
    placeholder.style.display = "none";
    canvas.style.display = "block";
    onResize();
    clearModel();
    modelInfo.textContent = "Loading " + file.name + "...";

    const ext = getExt(file.name);
    const buffer = await file.arrayBuffer();

    loadModel(
      scene,
      buffer,
      ext,
      (result) => {
        currentModel = result.scene;
        animations = result.animations;
        mixer = result.mixer;
        fitCameraToObject(camera, currentModel, controls);
        controls.update();

        const info = [];
        let verts = 0;
        currentModel.traverse((child) => {
          if (child.geometry) {
            const pos = child.geometry.getAttribute("position");
            if (pos) verts += pos.count;
          }
        });
        if (verts > 0) info.push(verts.toLocaleString() + " vertices");
        if (animations.length > 0) {
          info.push(animations.length + " animation" + (animations.length > 1 ? "s" : ""));
          animControls.style.display = "flex";
          animSelect.innerHTML = animations
            .map((a, i) => `<option value="${i}">${a.name || "Animation " + (i + 1)}</option>`)
            .join("");
        }
        modelInfo.textContent = info.join(" · ") || file.name;
      },
      null,
      (err) => {
        modelInfo.textContent = "Error loading model";
        console.error("Model load error:", err);
      },
    );
  }

  dropZone.addEventListener("click", (e) => {
    if (e.target === dropZone || e.target.closest("#td-placeholder")) fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "var(--color-primary)";
  });
  dropZone.addEventListener("dragleave", () => {
    dropZone.style.borderColor = "";
  });
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "";
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });

  wireframeBtn.addEventListener("click", () => {
    wireframe = !wireframe;
    wireframeBtn.textContent = wireframe ? "Solid" : "Wireframe";
    if (currentModel) {
      currentModel.traverse((child) => {
        if (child.material) {
          if (Array.isArray(child.material))
            child.material.forEach((m) => {
              m.wireframe = wireframe;
            });
          else child.material.wireframe = wireframe;
        }
      });
    }
  });

  resetBtn.addEventListener("click", () => {
    if (currentModel) fitCameraToObject(camera, currentModel, controls);
    else {
      camera.position.set(0, 2, 5);
      controls.target.set(0, 0, 0);
    }
    controls.update();
  });

  screenshotBtn.addEventListener("click", () => {
    if (!renderer) return;
    renderer.render(scene, camera);
    canvas.toBlob((blob) => {
      const link = document.createElement("a");
      link.download = "3d-screenshot.png";
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    });
  });

  playBtn.addEventListener("click", () => {
    if (!mixer || animations.length === 0) return;
    animPlaying = !animPlaying;
    playBtn.textContent = animPlaying ? "Pause" : "Play";
    if (animPlaying) {
      const idx = parseInt(animSelect.value) || 0;
      mixer.stopAllAction();
      mixer.clipAction(animations[idx]).play();
      clock.getDelta();
    }
  });

  animSelect.addEventListener("change", () => {
    if (!mixer || animations.length === 0) return;
    const idx = parseInt(animSelect.value) || 0;
    mixer.stopAllAction();
    if (animPlaying) mixer.clipAction(animations[idx]).play();
  });
}

export function destroy() {
  THREE = null;
  GLTFLoader = null;
  OBJLoader = null;
  STLLoader = null;
  OrbitControls = null;
}
