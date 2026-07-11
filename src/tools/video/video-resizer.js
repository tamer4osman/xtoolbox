import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob, formatFileSize } from "../../utils/file.js";
import { loadFFmpeg, writeUploadedFile, readFFmpegFile } from "./video-utils.js";

export const presets = [
  { label: "4K (3840×2160)", value: "3840:2160" },
  { label: "1440p (2560×1440)", value: "2560:1440" },
  { label: "1080p (1920×1080)", value: "1920:1080" },
  { label: "720p (1280×720)", value: "1280:720" },
  { label: "480p (854×480)", value: "854:480" },
  { label: "360p (640×360)", value: "640:360" },
  { label: "240p (426×240)", value: "426:240" }
];

export function parseResolution(input) {
  const match = input.match(/^\s*(\d+)\s*[x×:]\s*(\d+)\s*$/);
  if (!match) return null;
  return { width: parseInt(match[1], 10), height: parseInt(match[2], 10) };
}

export const toolConfig = {
  id: "video-resizer",
  name: "Video Resizer",
  category: "video",
  description:
    "Change video resolution to any size. Choose from popular presets or enter custom dimensions.",
  icon: "📐",
  accept: ".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime",
  maxSizeMB: 500,
  keywords: ["video resizer", "change resolution", "resize video", "4k to 1080p"],
  steps: ["Upload a video", "Choose resolution preset", 'Click "Resize"', "Download resized video"],
  faqs: [
    {
      question: "Does resizing reduce quality?",
      answer:
        "Downscaling (e.g., 4K to 1080p) looks great. Upscaling (e.g., 720p to 1080p) may look blurry."
    },
    {
      question: "What resolutions are available?",
      answer: "Presets from 240p up to 4K, or enter a custom width×height."
    }
  ]
};

export function render(container) {
  let currentFile = null;

  const upload = createFileUpload({
    accept: ".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime",
    multiple: false,
    maxSizeMB: 500,
    onFilesSelected: async files => {
      if (files.length === 0) return;
      currentFile = files[0];
      fileInfo.textContent = `${currentFile.name} — ${formatFileSize(currentFile.size)}`;
      filePreview.innerHTML = `<video controls style="max-width:100%;max-height:300px;border-radius:var(--radius-md);border:1px solid var(--color-border);">
        <source src="${URL.createObjectURL(currentFile)}">
      </video>`;
      optionsArea.style.display = "block";
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div id="file-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">-</div>
        <div id="file-preview" style="margin-bottom:var(--space-4);"></div>
        <div class="form-group">
          <label>Resolution</label>
          <select id="preset-select" class="select-input">
            ${presets.map(p => `<option value="${p.value}">${p.label}</option>`).join("")}
            <option value="custom">Custom...</option>
          </select>
        </div>
        <div class="form-group" id="custom-res-group" style="display:none;">
          <label>Custom (Width×Height)</label>
          <input type="text" id="custom-res-input" class="text-input" placeholder="e.g. 1280x720" value="1280x720">
          <div id="custom-res-error" style="font-size:var(--text-xs);color:var(--color-danger);margin-top:var(--space-1);display:none;">Enter width×height (e.g. 1280x720)</div>
        </div>
        <button class="btn btn-primary btn-lg" id="convert-btn" style="width:100%;">Resize Video</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Resizing... <span id="progress-pct">0</span>%</p>
      </div>
      <div class="tool-results" id="results" style="display:none;text-align:center;">
        <div id="preview-area" style="margin:var(--space-4) 0;"></div>
        <button class="btn btn-primary btn-lg" id="download-btn">Download Resized Video</button>
      </div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const optionsArea = container.querySelector("#options-area");
  const fileInfo = container.querySelector("#file-info");
  const filePreview = container.querySelector("#file-preview");
  const presetSelect = container.querySelector("#preset-select");
  const customResGroup = container.querySelector("#custom-res-group");
  const customResInput = container.querySelector("#custom-res-input");
  const customResError = container.querySelector("#custom-res-error");
  const convertBtn = container.querySelector("#convert-btn");
  const processing = container.querySelector("#processing");
  const progressPct = container.querySelector("#progress-pct");
  const results = container.querySelector("#results");
  const previewArea = container.querySelector("#preview-area");
  const downloadBtn = container.querySelector("#download-btn");
  let outputBlob = null;

  presetSelect.addEventListener("change", () => {
    customResGroup.style.display = presetSelect.value === "custom" ? "block" : "none";
  });

  convertBtn.addEventListener("click", async () => {
    if (!currentFile) return;

    let size;
    if (presetSelect.value === "custom") {
      const parsed = parseResolution(customResInput.value);
      if (!parsed) {
        customResError.style.display = "block";
        return;
      }
      customResError.style.display = "none";
      size = `${parsed.width}:${parsed.height}`;
    } else {
      size = presetSelect.value;
    }

    processing.style.display = "block";
    convertBtn.style.display = "none";
    results.style.display = "none";

    try {
      const ffmpeg = await loadFFmpeg(pct => {
        progressPct.textContent = pct;
      });
      await writeUploadedFile(ffmpeg, currentFile, "input.mp4");

      await ffmpeg.exec([
        "-i",
        "input.mp4",
        "-vf",
        `scale=${size}:flags=lanczos`,
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "23",
        "-movflags",
        "+faststart",
        "output.mp4"
      ]);

      outputBlob = await readFFmpegFile(ffmpeg, "output.mp4", "video/mp4");
      previewArea.innerHTML = `
        <video controls style="max-width:100%;max-height:400px;border-radius:var(--radius-md);border:1px solid var(--color-border);">
          <source src="${URL.createObjectURL(outputBlob)}" type="video/mp4">
        </video>
        <div style="font-size:var(--text-sm);color:var(--color-text-muted);margin-top:var(--space-2);">
          Size: ${formatFileSize(outputBlob.size)} (was ${formatFileSize(currentFile.size)})
        </div>`;
      results.style.display = "block";
      showToast({ message: "Video resized!", type: "success" });

      await ffmpeg.deleteFile("input.mp4");
      await ffmpeg.deleteFile("output.mp4");
    } catch (err) {
      showToast({ message: "Error: " + err.message, type: "error" });
    } finally {
      processing.style.display = "none";
      convertBtn.style.display = "inline-flex";
    }
  });

  downloadBtn.addEventListener("click", () => {
    if (outputBlob) {
      const base = currentFile.name.replace(/\.\w+$/, "");
      downloadBlob(outputBlob, `${base}_resized.mp4`);
    }
  });
}

export function destroy() {}
