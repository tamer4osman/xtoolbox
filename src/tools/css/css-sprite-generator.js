import { createFileUpload } from "../../components/file-upload.js";

export const toolConfig = {
  id: "css-sprite-generator",
  name: "CSS Sprite Sheet Generator",
  category: "css",
  description:
    "Upload multiple images and generate a CSS sprite sheet with corresponding CSS background-position rules.",
  icon: "🧩",
  keywords: ["css", "sprite", "spritesheet", "background", "image", "generator"],
  accept: "image/*",
  maxSizeMB: 10
};

let state = {
  images: [],
  gridCols: 4,
  padding: 2,
  prefix: "icon-"
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <h1>${toolConfig.name}</h1>
        <p>${toolConfig.description}</p>
      </div>
      
      <div id="fileUploadContainer"></div>

      <div class="controls-section">
        <div class="control-row">
          <label>Grid Columns</label>
          <input type="range" id="gridCols" min="1" max="20" value="4">
          <span id="gridColsVal">4</span>
        </div>
        <div class="control-row">
          <label>Padding (px)</label>
          <input type="range" id="padding" min="0" max="20" value="2">
          <span id="paddingVal">2px</span>
        </div>
        <div class="control-row">
          <label>Class Prefix</label>
          <input type="text" id="prefix" value="icon-" placeholder="e.g. icon-">
        </div>
      </div>

      <div class="preview-section">
        <h3>Preview</h3>
        <div class="sprite-preview" id="spritePreview"></div>
      </div>

      <div class="output-section">
        <h3>Generated CSS</h3>
        <div class="code-output">
          <pre id="cssOutput"><code></code></pre>
        </div>
        <div class="action-buttons">
          <button class="btn-primary" id="downloadSprite" disabled>Download Sprite Image</button>
          <button class="btn-secondary" id="downloadCSS" disabled>Download CSS</button>
          <button class="btn-secondary" id="copyCSS">Copy CSS</button>
        </div>
      </div>

      <div class="image-list" id="imageList"></div>
    </div>
  `;

  const fileUploadContainer = container.querySelector("#fileUploadContainer");
  const fileUpload = createFileUpload({
    accept: "image/*",
    multiple: true,
    maxSizeMB: 10,
    maxFiles: 50,
    label: "Drag & drop images here or click to browse",
    onFilesSelected: async files => {
      for (const file of files) {
        const dataUrl = await readFileAsDataURL(file);
        const img = new Image();
        await new Promise(resolve => {
          img.onload = resolve;
          img.src = dataUrl;
        });
        state.images.push({
          name: file.name.replace(/\.[^/.]+$/, ""),
          dataUrl,
          width: img.width,
          height: img.height,
          img
        });
      }
      renderSprite(container);
      renderImageList(container);
    }
  });
  fileUploadContainer.appendChild(fileUpload.element);

  bindEvents(container);
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function bindEvents(container) {
  const gridCols = container.querySelector("#gridCols");
  const padding = container.querySelector("#padding");
  const prefix = container.querySelector("#prefix");
  const downloadSprite = container.querySelector("#downloadSprite");
  const downloadCSS = container.querySelector("#downloadCSS");
  const copyCSS = container.querySelector("#copyCSS");

  gridCols.addEventListener("input", e => {
    state.gridCols = parseInt(e.target.value);
    container.querySelector("#gridColsVal").textContent = state.gridCols;
    renderSprite(container);
  });
  padding.addEventListener("input", e => {
    state.padding = parseInt(e.target.value);
    container.querySelector("#paddingVal").textContent = state.padding + "px";
    renderSprite(container);
  });
  prefix.addEventListener("input", e => {
    state.prefix = e.target.value;
    renderCSS(container);
  });
  downloadSprite.addEventListener("click", () => downloadSpriteImage(container));
  downloadCSS.addEventListener("click", () => downloadCSSFile(container));
  copyCSS.addEventListener("click", () => copyCSSCode(container));
}

function renderSprite(container) {
  const spritePreview = container.querySelector("#spritePreview");
  if (!spritePreview || state.images.length === 0) return;

  const cols = state.gridCols;
  const padding = state.padding;
  const maxWidth = state.images.reduce((max, img) => Math.max(max, img.width), 0);
  const maxHeight = state.images.reduce((max, img) => Math.max(max, img.height), 0);
  const spriteWidth = cols * maxWidth + (cols + 1) * padding;
  const rows = Math.ceil(state.images.length / cols);
  const spriteHeight = rows * maxHeight + (rows + 1) * padding;

  const canvas = document.createElement("canvas");
  canvas.width = spriteWidth;
  canvas.height = spriteHeight;
  const ctx = canvas.getContext("2d");

  state.images.forEach((img, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padding + col * (maxWidth + padding);
    const y = padding + row * (maxHeight + padding);
    ctx.drawImage(img.img, x, y);
    img.spriteX = x;
    img.spriteY = y;
  });

  spritePreview.innerHTML = "";
  spritePreview.appendChild(canvas);

  renderCSS(container);
}

function renderCSS(container) {
  const cssOutput = container.querySelector("#cssOutput");
  if (!cssOutput || state.images.length === 0) {
    if (cssOutput) cssOutput.querySelector("code").textContent = "";
    return;
  }

  const maxWidth = state.images.reduce((max, img) => Math.max(max, img.width), 0);
  const maxHeight = state.images.reduce((max, img) => Math.max(max, img.height), 0);
  const padding = state.padding;

  let css = `.sprite { background-image: url('sprite.png'); background-repeat: no-repeat; }\n\n`;

  state.images.forEach((img, i) => {
    const col = i % state.gridCols;
    const row = Math.floor(i / state.gridCols);
    const x = -(padding + col * (maxWidth + padding));
    const y = -(padding + row * (maxHeight + padding));
    css += `.${state.prefix}${img.name} {\n`;
    css += `  width: ${img.width}px;\n`;
    css += `  height: ${img.height}px;\n`;
    css += `  background-position: ${x}px ${y}px;\n`;
    css += `}\n`;
  });

  cssOutput.querySelector("code").textContent = css;

  const downloadSprite = container.querySelector("#downloadSprite");
  const downloadCSS = container.querySelector("#downloadCSS");
  if (downloadSprite) downloadSprite.disabled = false;
  if (downloadCSS) downloadCSS.disabled = false;
}

function renderImageList(container) {
  const imageList = container.querySelector("#imageList");
  if (!imageList) return;

  if (state.images.length === 0) {
    imageList.innerHTML = "";
    return;
  }

  imageList.innerHTML = state.images
    .map(
      (img, i) => `
    <div class="sprite-image-item">
      <img src="${img.dataUrl}" alt="${img.name}">
      <span>${img.name} (${img.width}x${img.height})</span>
      <button class="remove-btn" data-index="${i}">✕</button>
    </div>
  `
    )
    .join("");

  imageList.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const index = parseInt(e.target.dataset.index);
      state.images.splice(index, 1);
      renderSprite(container);
      renderImageList(container);
    });
  });
}

function downloadSpriteImage(container) {
  const canvas = document.createElement("canvas");
  const cols = state.gridCols;
  const padding = state.padding;
  const maxWidth = state.images.reduce((max, img) => Math.max(max, img.width), 0);
  const maxHeight = state.images.reduce((max, img) => Math.max(max, img.height), 0);
  canvas.width = cols * maxWidth + (cols + 1) * padding;
  canvas.height =
    Math.ceil(state.images.length / cols) * maxHeight +
    (Math.ceil(state.images.length / cols) + 1) * padding;

  const ctx = canvas.getContext("2d");
  state.images.forEach((img, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    ctx.drawImage(
      img.img,
      padding + col * (maxWidth + padding),
      padding + row * (maxHeight + padding)
    );
  });

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sprite.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, "image/png");
}

function downloadCSSFile(container) {
  const css = container.querySelector("#cssOutput code").textContent;
  const blob = new Blob([css], { type: "text/css" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sprite.css";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function copyCSSCode(container) {
  const css = container.querySelector("#cssOutput code").textContent;
  navigator.clipboard.writeText(css);
  const btn = container.querySelector("#copyCSS");
  btn.textContent = "Copied!";
  setTimeout(() => (btn.textContent = "Copy CSS"), 2000);
}
