import heic2any from "heic2any";
import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";
import { canvasToBlob } from "../image/image-utils.js";
import { createUploadTool } from "./upload-tool-factory.js";

export const toolConfig = {
  id: "heic-to-jpg",
  name: "HEIC to JPG Converter",
  category: "image",
  description: "Convert iPhone HEIC photos to JPG format.",
  icon: "",
  accept: ".heic,.heif",
  maxSizeMB: 50,
  keywords: ["heic to jpg", "heif to jpg", "iphone to jpg", "heic converter"],
  steps: [
    "Upload HEIC image(s)",
    "Adjust quality",
    'Click "Convert to JPG"',
    "Download converted images"
  ],
  faqs: [
    {
      question: "What is HEIC?",
      answer:
        "HEIC is Apple's default photo format on iPhones. It provides better compression than JPG but isn't widely supported."
    },
    {
      question: "Are multiple files supported?",
      answer: "Yes, you can convert multiple HEIC files at once."
    },
    {
      question: "Is conversion lossless?",
      answer: "No, HEIC to JPG conversion is lossy. Use 90-100% quality for best results."
    }
  ]
};

export function render(container) {
  createUploadTool({
    container,
    toolId: "heic",
    fileTypeName: "HEIC",
    accept: ".heic,.heif",
    buttonText: "Convert to JPG",
    optionsHTML: `
      <div class="form-group">
        <label>Quality: <strong id="heic-quality-display">92</strong>%</label>
        <input type="range" id="heic-quality" min="10" max="100" value="92" step="5">
      </div>
      <div class="form-group">
        <label>Resize (optional)</label>
        <div style="display:flex;gap:var(--space-3);align-items:center;">
          <input type="number" id="heic-width" placeholder="Width" class="text-input" style="width:100px;">
          <span>x</span>
          <input type="number" id="heic-height" placeholder="Height" class="text-input" style="width:100px;">
          <label style="display:flex;align-items:center;gap:var(--space-2);margin-left:var(--space-3);">
            <input type="checkbox" id="heic-aspect" checked> Keep aspect ratio
          </label>
        </div>
      </div>
    `,
    async onConvert({ files, uploadedData, progress }) {
      const quality = parseInt(container.querySelector("#heic-quality").value) / 100;
      const targetWidth = parseInt(container.querySelector("#heic-width").value) || 0;
      const targetHeight = parseInt(container.querySelector("#heic-height").value) || 0;

      for (let i = 0; i < files.length; i++) {
        progress(Math.round(((i + 1) / files.length) * 100));
        const blob = await heic2any({ blob: files[i], toType: "image/jpeg", quality });
        let outputBlob = blob;
        if (targetWidth > 0 || targetHeight > 0) {
          const img = await createImageBitmap(blob);
          const canvas = document.createElement("canvas");
          const w = targetWidth || img.width;
          const h = targetHeight || img.height;
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          outputBlob = await canvasToBlob(canvas, "image/jpeg", quality);
        }
        downloadBlob(outputBlob, files[i].name.replace(/\.(heic|heif)$/i, "") + ".jpg");
      }
      showToast({ message: `Converted ${files.length} HEIC file(s) to JPG!`, type: "success" });
    }
  });

  container.querySelector("#heic-quality")?.addEventListener("input", e => {
    container.querySelector("#heic-quality-display").textContent = e.target.value;
  });
}

export function destroy() {}
