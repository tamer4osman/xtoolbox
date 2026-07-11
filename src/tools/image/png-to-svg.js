import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";
import { loadImageFromFile } from "./image-utils.js";
import { createUploadTool } from "./upload-tool-factory.js";

export const toolConfig = {
  id: "png-to-svg",
  name: "PNG to SVG Converter",
  category: "image",
  description: "Convert PNG images to SVG vector format.",
  icon: "",
  accept: ".png",
  maxSizeMB: 50,
  keywords: ["png to svg", "convert png to svg", "png to vector", "svg converter"],
  steps: ["Upload PNG image(s)", 'Click "Convert to SVG"', "Download converted SVG files"],
  faqs: [
    {
      question: "Is the output a true vector?",
      answer:
        "No, the SVG contains a base64-encoded PNG. For true vectorization, use a tracing tool like Potrace."
    },
    {
      question: "Why convert PNG to SVG?",
      answer: "SVG is widely supported in web design and can be embedded directly in HTML/CSS."
    },
    {
      question: "Can I convert multiple PNGs?",
      answer: "Yes, upload multiple PNGs and they will all be converted."
    }
  ]
};

export function render(container) {
  createUploadTool({
    container,
    toolId: "png2svg",
    fileTypeName: "PNG",
    accept: ".png",
    buttonText: "Convert to SVG",
    optionsHTML: `
      <div class="form-group">
        <label>Mode</label>
        <select id="png2svg-mode" class="select-input">
          <option value="embed">Embed PNG in SVG (base64)</option>
          <option value="trace">Simple trace (pixel-to-rect)</option>
        </select>
      </div>
      <div class="form-group" id="png2svg-trace-options" style="display:none;">
        <label>Detail Level: <strong id="png2svg-detail-display">50</strong></label>
        <input type="range" id="png2svg-detail" min="10" max="100" value="50" step="5">
        <p style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:var(--space-2);">Higher = more detail, larger file</p>
      </div>
    `,
    async onConvert({ files, uploadedData, progress }) {
      const images = [];
      for (const file of files) {
        images.push(await loadImageFromFile(file));
      }

      const mode = container.querySelector("#png2svg-mode").value;
      const detail = parseInt(container.querySelector("#png2svg-detail").value);

      for (let i = 0; i < images.length; i++) {
        progress(Math.round(((i + 1) / images.length) * 100));
        const img = images[i];
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        let svg;

        if (mode === "embed") {
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><image width="${w}" height="${h}" xlink:href="${dataUrl}"/></svg>`;
        } else {
          const canvas = document.createElement("canvas");
          const scale = Math.max(1, Math.floor(detail / 10));
          const sw = Math.ceil(w / scale);
          const sh = Math.ceil(h / scale);
          canvas.width = sw;
          canvas.height = sh;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, sw, sh);
          const imageData = ctx.getImageData(0, 0, sw, sh);
          let rects = "";
          for (let y = 0; y < sh; y++) {
            for (let x = 0; x < sw; x++) {
              const idx = (y * sw + x) * 4;
              const r = imageData.data[idx];
              const g = imageData.data[idx + 1];
              const b = imageData.data[idx + 2];
              const a = imageData.data[idx + 3] / 255;
              if (a > 0.01) {
                rects += `<rect x="${x * scale}" y="${y * scale}" width="${scale}" height="${scale}" fill="rgb(${r},${g},${b})" fill-opacity="${a.toFixed(2)}"/>`;
              }
            }
          }
          svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${rects}</svg>`;
        }

        downloadBlob(
          new Blob([svg], { type: "image/svg+xml" }),
          files[i].name.replace(/\.png$/i, "") + ".svg"
        );
      }
      showToast({ message: `Converted ${images.length} PNG(s) to SVG!`, type: "success" });
    }
  });

  container.querySelector("#png2svg-mode")?.addEventListener("change", e => {
    container.querySelector("#png2svg-trace-options").style.display =
      e.target.value === "trace" ? "block" : "none";
  });
  container.querySelector("#png2svg-detail")?.addEventListener("input", e => {
    container.querySelector("#png2svg-detail-display").textContent = e.target.value;
  });
}

export function destroy() {}
