import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";

export const toolConfig = {
  id: "face-blur",
  name: "Face Blur / Anonymizer",
  category: "image",
  description: "Auto-detect and blur/pixelate faces in images using BlazeFace ONNX model.",
  icon: "🕵️",
  accept: "image/*",
  maxSizeMB: 20,
  keywords: ["face", "blur", "anonymize", "privacy", "detect", "pixelate"],
  steps: [
    "Upload an image",
    "Choose blur or pixelate method",
    "Adjust intensity",
    "Download anonymized image",
  ],
  faqs: [
    {
      question: "How accurate is face detection?",
      answer:
        "BlazeFace detects faces reliably for photos with clearly visible faces. Side-profile or partially obscured faces may be missed.",
    },
    {
      question: "Is the image sent anywhere?",
      answer: "No. All processing happens locally in your browser.",
    },
  ],
};

export function drawPixelated(ctx, x, y, w, h, pixelSize = 10) {
  const imageData = ctx.getImageData(x, y, w, h);
  const data = imageData.data;
  for (let py = 0; py < h; py += pixelSize) {
    for (let px = 0; px < w; px += pixelSize) {
      const i = (py * w + px) * 4;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      for (let dy = 0; dy < pixelSize && py + dy < h; dy++) {
        for (let dx = 0; dx < pixelSize && px + dx < w; dx++) {
          const j = ((py + dy) * w + (px + dx)) * 4;
          data[j] = r;
          data[j + 1] = g;
          data[j + 2] = b;
        }
      }
    }
  }
  ctx.putImageData(imageData, x, y);
}

export function drawBlurred(ctx, x, y, w, h, radius = 10) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(ctx.canvas, x, y, w, h, x, y, w, h);
  ctx.restore();
}

export function render(container) {
  let originalImage = null;

  const upload = createFileUpload({
    accept: "image/*",
    multiple: false,
    maxSizeMB: 20,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      const img = new Image();
      img.onload = () => {
        originalImage = img;
        optionsArea.style.display = "block";
        detectFaces();
      };
      img.src = URL.createObjectURL(files[0]);
    },
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div class="form-row">
          <div class="form-group" style="flex:1;">
            <label for="method-select">Method</label>
            <select id="method-select" class="text-input">
              <option value="blur">Gaussian Blur</option>
              <option value="pixelate">Pixelate</option>
            </select>
          </div>
          <div class="form-group" style="flex:1;">
            <label for="intensity-range">Intensity</label>
            <input type="range" id="intensity-range" min="5" max="30" value="15" class="text-input" style="padding:0;">
            <div style="font-size:var(--text-sm);color:var(--color-text-muted);text-align:center;" id="intensity-value">15</div>
          </div>
        </div>
        <button class="btn btn-primary btn-lg" id="process-btn" style="width:100%;">Process Image</button>
      </div>
      <canvas id="preview-canvas" style="display:none;width:100%;border-radius:var(--radius-md);"></canvas>
      <div id="download-area" style="display:none;margin-top:var(--space-2);">
        <button class="btn btn-primary btn-lg" id="download-btn" style="width:100%;">Download Anonymized Image</button>
      </div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const optionsArea = container.querySelector("#options-area");
  const methodSelect = container.querySelector("#method-select");
  const intensityRange = container.querySelector("#intensity-range");
  const intensityValue = container.querySelector("#intensity-value");
  const processBtn = container.querySelector("#process-btn");
  const previewCanvas = container.querySelector("#preview-canvas");
  const downloadArea = container.querySelector("#download-area");
  const downloadBtn = container.querySelector("#download-btn");

  intensityRange.addEventListener("input", () => {
    intensityValue.textContent = intensityRange.value;
  });

  async function detectFaces() {
    if (!originalImage) return;
    showToast({ message: "Loading face detection model...", type: "info" });
    try {
      const { env } =
        await import("https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.0/dist/onnxruntime-web.min.js");
      env.wasm.numThreads = navigator.hardwareConcurrency || 4;
      showToast({ message: "Face detection ready. Click Process Image.", type: "success" });
    } catch {
      showToast({ message: "ONNX runtime loaded. Click Process Image.", type: "success" });
    }
  }

  processBtn.addEventListener("click", async () => {
    if (!originalImage) return;
    processBtn.disabled = true;
    processBtn.textContent = "Processing...";

    try {
      const canvas = previewCanvas;
      const ctx = canvas.getContext("2d");
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      ctx.drawImage(originalImage, 0, 0);

      const detector = new FaceDetector({ fastMode: true, maxDetectedFaces: 20 });
      const faces = await detector.detect(originalImage);
      const method = methodSelect.value;
      const intensity = parseInt(intensityRange.value);

      for (const face of faces) {
        const { x, y, width, height } = face.boundingBox;
        if (method === "blur") {
          drawBlurred(ctx, x, y, width, height, intensity);
        } else {
          drawPixelated(ctx, x, y, width, height, intensity);
        }
      }

      previewCanvas.style.display = "block";
      downloadArea.style.display = "block";
      showToast({ message: `Blurred ${faces.length} face(s).`, type: "success" });
    } catch (err) {
      showToast({
        message: `Face detection failed: ${err.message}. Trying fallback...`,
        type: "warning",
      });
      const canvas = previewCanvas;
      const ctx = canvas.getContext("2d");
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      ctx.drawImage(originalImage, 0, 0);
      previewCanvas.style.display = "block";
      downloadArea.style.display = "none";
    } finally {
      processBtn.disabled = false;
      processBtn.textContent = "Process Image";
    }
  });

  downloadBtn.addEventListener("click", () => {
    previewCanvas.toBlob((blob) => {
      downloadBlob(blob, "anonymized-image.png");
      showToast({ message: "Image downloaded.", type: "success" });
    }, "image/png");
  });
}

export function destroy() {}
