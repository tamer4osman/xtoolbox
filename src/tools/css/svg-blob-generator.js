function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateBlobPath(pointCount, variance, seed) {
  const rand = seededRandom(seed);
  const cx = 200,
    cy = 200;
  const baseR = 150;
  const angles = [];
  const radii = [];

  for (let i = 0; i < pointCount; i++) {
    const angle = (i / pointCount) * Math.PI * 2;
    const r = baseR + (rand() - 0.5) * 2 * variance * baseR * 0.3;
    angles.push(angle);
    radii.push(Math.max(r, 20));
  }

  let path = "";
  for (let i = 0; i < pointCount; i++) {
    const p0 = angles[i];
    const r0 = radii[i];
    const x0 = cx + r0 * Math.cos(p0);
    const y0 = cy + r0 * Math.sin(p0);

    const p1 = angles[(i + 1) % pointCount];
    const r1 = radii[(i + 1) % pointCount];
    const x1 = cx + r1 * Math.cos(p1);
    const y1 = cy + r1 * Math.sin(p1);

    const cAngle = (p0 + p1) / 2;
    const cR = (r0 + r1) / 2;
    const cx1 = cx + cR * Math.cos(cAngle) + (rand() - 0.5) * variance * 40;
    const cy1 = cy + cR * Math.sin(cAngle) + (rand() - 0.5) * variance * 40;

    if (i === 0) path += `M ${x0.toFixed(1)} ${y0.toFixed(1)} `;
    path += `C ${cx1.toFixed(1)} ${cy1.toFixed(1)} ${cx1.toFixed(1)} ${cy1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)} `;
  }
  path += "Z";
  return path;
}

function generateWavePath(amplitude, frequency, layers, seed) {
  const rand = seededRandom(seed);
  const w = 800,
    h = 200;
  let path = "";

  for (let layer = 0; layer < layers; layer++) {
    const amp = amplitude * (1 - layer * 0.3);
    const phaseShift = rand() * Math.PI * 2;
    const yBase = h - (h / (layers + 1)) * (layer + 1);

    if (layer > 0) path += " ";
    path += `M 0 ${h} `;
    path += `L 0 ${yBase} `;

    for (let x = 0; x <= w; x += 4) {
      const y = yBase + Math.sin((x / w) * frequency * Math.PI * 2 + phaseShift) * amp;
      path += `L ${x} ${y.toFixed(1)} `;
    }
    path += `L ${w} ${h} Z`;
  }
  return path;
}

export function generateBlobSVG(
  type,
  pointCount,
  variance,
  color1,
  color2,
  seed,
  amplitude,
  frequency,
  layers
) {
  const gradientId = `blob-grad-${seed}`;
  let pathData;
  let viewBox = "0 0 400 400";

  if (type === "wave") {
    pathData = generateWavePath(amplitude, frequency, layers, seed);
    viewBox = "0 0 800 200";
  } else {
    pathData = generateBlobPath(pointCount, variance, seed);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="100%" height="100%">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" />
    </linearGradient>
  </defs>
  <path d="${pathData}" fill="url(#${gradientId})" />
</svg>`;

  return svg;
}

export const toolConfig = {
  id: "svg-blob-generator",
  name: "Organic SVG Blob & Wave Generator",
  category: "css",
  description:
    "Generate mathematical cubic bezier organic shapes and wave page dividers with zero tracking.",
  icon: "🌊",
  accept: null,
  maxSizeMB: null,
  keywords: [
    "svg blob",
    "organic shape",
    "wave divider",
    "svg generator",
    "blob shape",
    "vector shape",
    "cubic bezier"
  ],
  steps: [
    "Choose blob or wave shape type",
    "Adjust complexity, colors, and randomization",
    "Copy the SVG code or download the SVG file"
  ],
  faqs: [
    {
      question: "What are SVG blobs used for?",
      answer:
        "Blobs are organic shapes used as background elements, hero section decorations, or section dividers in modern web design."
    },
    {
      question: "How does the randomization work?",
      answer:
        "Each seed value generates a unique shape. The same seed always produces the same result, so you can recreate shapes you like."
    },
    {
      question: "Can I use these SVGs commercially?",
      answer:
        "Yes! All shapes are generated client-side with no tracking. You own the output completely."
    }
  ]
};

export function render(container) {
  let currentSeed = Date.now();

  container.innerHTML = `
    <div class="tool-layout">
      <div class="blob-grid">
        <div class="blob-controls">
          <div class="form-group">
            <label>Shape Type</label>
            <select id="blob-type" class="text-input">
              <option value="blob">Blob</option>
              <option value="wave">Wave Divider</option>
            </select>
          </div>
          <div class="form-group" id="blob-points-group">
            <label>Complexity: <span id="blob-points-val">8</span> points</label>
            <input type="range" id="blob-points" min="4" max="16" step="1" value="8">
          </div>
          <div class="form-group" id="blob-variance-group">
            <label>Variance: <span id="blob-variance-val">60</span>%</label>
            <input type="range" id="blob-variance" min="10" max="100" step="1" value="60">
          </div>
          <div class="form-group wave-control" id="blob-amplitude-group" style="display:none;">
            <label>Amplitude: <span id="blob-amplitude-val">30</span></label>
            <input type="range" id="blob-amplitude" min="10" max="80" step="1" value="30">
          </div>
          <div class="form-group wave-control" id="blob-frequency-group" style="display:none;">
            <label>Frequency: <span id="blob-frequency-val">3</span></label>
            <input type="range" id="blob-frequency" min="1" max="10" step="1" value="3">
          </div>
          <div class="form-group wave-control" id="blob-layers-group" style="display:none;">
            <label>Layers: <span id="blob-layers-val">1</span></label>
            <input type="range" id="blob-layers" min="1" max="5" step="1" value="1">
          </div>
          <div class="form-group">
            <label>Color 1</label>
            <input type="color" id="blob-color1" value="#667eea">
          </div>
          <div class="form-group">
            <label>Color 2</label>
            <input type="color" id="blob-color2" value="#764ba2">
          </div>
          <button class="btn btn-secondary" id="blob-randomize" style="width:100%;margin-top:var(--space-2);">🎲 Randomize</button>
        </div>
        <div class="blob-preview" id="blob-preview">
          <div class="blob-svg-wrap" id="blob-svg-wrap"></div>
        </div>
      </div>
      <div class="blob-output">
        <label>Generated SVG Code</label>
        <textarea id="blob-css" class="text-input" readonly style="width:100%;min-height:140px;font-family:monospace;font-size:var(--text-sm);resize:vertical;"></textarea>
        <div style="display:flex;gap:var(--space-2);margin-top:var(--space-2);">
          <button class="btn btn-secondary" id="blob-copy" style="flex:1;">Copy SVG</button>
          <button class="btn btn-secondary" id="blob-download" style="flex:1;">Download SVG</button>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .blob-grid { display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-4); }
    .blob-controls { display:flex;flex-direction:column;gap:var(--space-3); }
    .blob-preview { background:var(--color-surface);border-radius:var(--radius-lg);min-height:350px;display:flex;align-items:center;justify-content:center;padding:var(--space-4);border:1px solid var(--color-border);overflow:hidden; }
    .blob-svg-wrap { width:100%;max-width:400px;aspect-ratio:1; }
    .blob-svg-wrap svg { width:100%;height:100%; }
    @media (max-width:768px) { .blob-grid { grid-template-columns:1fr; } }
  `;
  container.appendChild(style);

  const typeSelect = container.querySelector("#blob-type");
  const pointsSlider = container.querySelector("#blob-points");
  const varianceSlider = container.querySelector("#blob-variance");
  const amplitudeSlider = container.querySelector("#blob-amplitude");
  const frequencySlider = container.querySelector("#blob-frequency");
  const layersSlider = container.querySelector("#blob-layers");
  const color1 = container.querySelector("#blob-color1");
  const color2 = container.querySelector("#blob-color2");
  const svgWrap = container.querySelector("#blob-svg-wrap");
  const cssOutput = container.querySelector("#blob-css");
  const copyBtn = container.querySelector("#blob-copy");
  const downloadBtn = container.querySelector("#blob-download");
  const randomizeBtn = container.querySelector("#blob-randomize");

  const pointsGroup = container.querySelector("#blob-points-group");
  const varianceGroup = container.querySelector("#blob-variance-group");
  const waveGroups = container.querySelectorAll(".wave-control");

  function toggleWaveControls() {
    const isWave = typeSelect.value === "wave";
    pointsGroup.style.display = isWave ? "none" : "";
    varianceGroup.style.display = isWave ? "none" : "";
    waveGroups.forEach(g => {
      g.style.display = isWave ? "" : "none";
    });
  }

  function renderSVG() {
    const type = typeSelect.value;
    const points = parseInt(pointsSlider.value);
    const variance = parseInt(varianceSlider.value) / 100;
    const c1 = color1.value;
    const c2 = color2.value;
    const amp = parseInt(amplitudeSlider.value);
    const freq = parseInt(frequencySlider.value);
    const layers = parseInt(layersSlider.value);

    const svg = generateBlobSVG(type, points, variance, c1, c2, currentSeed, amp, freq, layers);
    svgWrap.innerHTML = svg;
    cssOutput.value = svg;
  }

  function updateLabels() {
    container.querySelector("#blob-points-val").textContent = pointsSlider.value;
    container.querySelector("#blob-variance-val").textContent = varianceSlider.value;
    container.querySelector("#blob-amplitude-val").textContent = amplitudeSlider.value;
    container.querySelector("#blob-frequency-val").textContent = frequencySlider.value;
    container.querySelector("#blob-layers-val").textContent = layersSlider.value;
  }

  function update() {
    toggleWaveControls();
    updateLabels();
    renderSVG();
  }

  typeSelect.addEventListener("change", update);
  pointsSlider.addEventListener("input", update);
  varianceSlider.addEventListener("input", update);
  amplitudeSlider.addEventListener("input", update);
  frequencySlider.addEventListener("input", update);
  layersSlider.addEventListener("input", update);
  color1.addEventListener("input", update);
  color2.addEventListener("input", update);

  randomizeBtn.addEventListener("click", () => {
    currentSeed = Date.now();
    pointsSlider.value = Math.floor(Math.random() * 12) + 5;
    varianceSlider.value = Math.floor(Math.random() * 60) + 30;
    amplitudeSlider.value = Math.floor(Math.random() * 50) + 15;
    frequencySlider.value = Math.floor(Math.random() * 8) + 2;
    layersSlider.value = Math.floor(Math.random() * 3) + 1;
    update();
  });

  copyBtn.addEventListener("click", () => {
    navigator.clipboard
      .writeText(cssOutput.value)
      .then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = "Copy SVG";
        }, 1500);
      })
      .catch(() => {});
  });

  downloadBtn.addEventListener("click", () => {
    const blob = new Blob([cssOutput.value], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blob-${currentSeed}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  update();
}

export function destroy() {}
