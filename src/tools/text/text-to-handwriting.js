import { createBasicTool } from "../shared/basic-tool-factory.js";

const { toolConfig, render } = createBasicTool({
  toolConfig: {
    id: "text-to-handwriting",
    name: "Text to Handwriting",
    category: "text",
    description:
      "Convert text to handwritten-style images. Choose from different handwriting fonts.",
    icon: "✍",
    accept: ".txt",
    maxSizeMB: 5,
    keywords: [
      "text to handwriting",
      "handwriting generator",
      " handwritten text",
      "font converter"
    ],
    steps: ["Enter text", "Choose font style", "Download as image"]
  },
  inputHTML: `
    <div class="handwriting-input">
      <textarea id="text-input" placeholder="Enter text to convert to handwriting...">Hello World!</textarea>
    </div>
    <div class="handwriting-options">
      <label>Font Style:</label>
      <select id="font-select">
        <option value="caveat">Caveat (Casual)</option>
        <option value="meow">Meow Script (Cute)</option>
        <option value="sahitya">Sahitya (Calligraphy)</option>
        <option value="amita">Amita (Elegant)</option>
        <option value="sing">Signika (Clear)</option>
      </select>
      <label>Font Size:</label>
      <input type="range" id="size-slider" min="20" max="80" value="40">
      <span id="size-value">40px</span>
    </div>
    <button id="generate-btn" class="btn btn-primary">Generate</button>
    <button id="download-btn" class="btn btn-secondary" disabled>Download PNG</button>
  `,
  outputHTML: `<div id="preview" class="handwriting-preview"></div>`,
  extraCSS: `
    .handwriting-input { margin-bottom: var(--space-4); }
    .handwriting-input textarea { font-size: var(--text-base); }
    .handwriting-options { display: flex; gap: var(--space-4); align-items: center; margin-bottom: var(--space-4); flex-wrap: wrap; }
    .handwriting-options label { font-weight: 600; }
    .handwriting-options select { padding: var(--space-2); border-radius: var(--radius-md); }
    .handwriting-options input[type="range"] { width: 120px; }
    .handwriting-preview { 
      min-height: 150px; padding: var(--space-6); 
      background: white; border-radius: var(--radius-lg);
      display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--color-border); margin-top: var(--space-4);
    }
    .handwriting-preview canvas { max-width: 100%; }
  `,
  init(container) {
    const input = container.querySelector("#text-input");
    const fontSelect = container.querySelector("#font-select");
    const sizeSlider = container.querySelector("#size-slider");
    const sizeValue = container.querySelector("#size-value");
    const generateBtn = container.querySelector("#generate-btn");
    const downloadBtn = container.querySelector("#download-btn");
    const preview = container.querySelector("#preview");

    const fonts = {
      caveat: "Caveat",
      meow: "Meow Script",
      sahitya: "Sahitya",
      amita: "Amita",
      sing: "Signika Negative"
    };

    const fontUrls = {
      caveat: "https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap",
      meow: "https://fonts.googleapis.com/css2?family=Meow+Script&display=swap",
      sahitya: "https://fonts.googleapis.com/css2?family=Sahitya:wght@400;700&display=swap",
      amita: "https://fonts.googleapis.com/css2?family=Amita:wght@400;700&display=swap",
      sing: "https://fonts.googleapis.com/css2?family=Signika+Negative:wght@400;700&display=swap"
    };

    let loadedFonts = {};

    function loadFont(fontName) {
      if (loadedFonts[fontName]) return Promise.resolve();

      return new Promise(resolve => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = fontUrls[fontName];
        link.onload = () => {
          loadedFonts[fontName] = true;
          resolve();
        };
        link.onerror = () => resolve();
        document.head.appendChild(link);
      });
    }

    async function generate() {
      const text = input.value.trim();
      if (!text) return;

      const font = fontSelect.value;
      const fontSize = parseInt(sizeSlider.value);

      await loadFont(font);

      const lines = text.split("\n");
      const lineHeight = fontSize * 1.4;
      const padding = 40;
      const width = 700;
      const height = lines.length * lineHeight + padding * 2;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px '${fonts[font]}', cursive`;
      ctx.fillStyle = "#1a1a1a";
      ctx.textBaseline = "top";

      lines.forEach((line, i) => {
        ctx.fillText(line, padding, padding + i * lineHeight);
      });

      preview.innerHTML = "";
      preview.appendChild(canvas);
      downloadBtn.disabled = false;
    }

    sizeSlider.addEventListener("input", () => {
      sizeValue.textContent = sizeSlider.value + "px";
    });

    generateBtn.addEventListener("click", generate);
    downloadBtn.addEventListener("click", () => {
      const canvas = preview.querySelector("canvas");
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = "handwriting.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });

    generate();
  }
});

export { toolConfig, render };
