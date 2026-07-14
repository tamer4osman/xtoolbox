import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob, formatFileSize } from "../../utils/file.js";
import { getVideoInfo, formatTime, writeUploadedFile } from "./video-utils.js";

const VIDSTAB_CORE_URL = "https://unpkg.com/@willyjl/ffmpeg.wasm-core-vidstab@0.11.1/dist/esm";

let ffmpegInstance = null;
let ffmpegLoading = false;

async function loadFFmpegVidstab(onProgress) {
  if (ffmpegInstance) return ffmpegInstance;
  if (ffmpegLoading) {
    while (ffmpegLoading) await new Promise(r => setTimeout(r, 100));
    return ffmpegInstance;
  }

  ffmpegLoading = true;
  try {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");

    const ffmpeg = new FFmpeg();
    ffmpeg.on("progress", ({ progress }) => {
      if (onProgress) onProgress(Math.round(progress * 100));
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${VIDSTAB_CORE_URL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${VIDSTAB_CORE_URL}/ffmpeg-core.wasm`, "application/wasm")
    });

    ffmpegInstance = ffmpeg;
    return ffmpeg;
  } finally {
    ffmpegLoading = false;
  }
}

export const toolConfig = {
  id: "video-stabilizer",
  name: "Video Stabilizer",
  category: "video",
  description: "Reduce camera shake and stabilize shaky video footage.",
  icon: "🎥",
  accept: "video/*",
  maxSizeMB: 500,
  keywords: ["video stabilizer", "reduce shake", "steady video", "vidstab"],
  steps: [
    "Upload a shaky video",
    "Adjust shakiness and smoothing",
    'Click "Stabilize"',
    "Download stabilized video"
  ],
  faqs: [
    {
      question: "What is shakiness?",
      answer:
        "Shakiness (1-10) tells the detector how aggressive to look for motion. Use higher values for very shaky footage."
    },
    {
      question: "What is smoothing?",
      answer:
        "Smoothing (1-30) sets how many frames to average for the camera path. Higher values produce smoother output but may soften intentional pans."
    },
    {
      question: "Why does it take so long?",
      answer:
        "Stabilization requires two full passes through the video. Pass 1 analyzes motion, Pass 2 applies the transform. Longer videos take more time."
    }
  ]
};

export function render(container) {
  let currentFile = null;
  let videoInfo = null;
  let stabilizedBlob = null;

  const upload = createFileUpload({
    accept: "video/*",
    multiple: false,
    maxSizeMB: 500,
    onFilesSelected: async files => {
      if (files.length === 0) return;
      currentFile = files[0];
      videoInfo = await getVideoInfo(currentFile);
      tctx.query("#original-size").textContent = videoInfo.sizeFormatted;
      tctx.query("#original-dims").textContent = `${videoInfo.width}×${videoInfo.height}`;
      tctx.query("#original-duration").textContent = formatTime(videoInfo.duration);
      optionsArea.style.display = "block";
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div class="stats-row" style="margin-bottom:var(--space-4);">
          <div class="stat"><span class="stat-label">Size</span><span class="stat-value" id="original-size">-</span></div>
          <div class="stat"><span class="stat-label">Resolution</span><span class="stat-value" id="original-dims">-</span></div>
          <div class="stat"><span class="stat-label">Duration</span><span class="stat-value" id="original-duration">-</span></div>
        </div>
        <div class="form-group">
          <label>Shakiness (1-10)</label>
          <input type="range" id="shakiness" class="range-input" min="1" max="10" value="5" step="1">
          <div style="display:flex;justify-content:space-between;font-size:var(--text-sm);color:var(--text-muted);">
            <span>Low</span><span id="shakiness-val">5</span><span>High</span>
          </div>
        </div>
        <div class="form-group">
          <label>Smoothing (1-30)</label>
          <input type="range" id="smoothing" class="range-input" min="1" max="30" value="10" step="1">
          <div style="display:flex;justify-content:space-between;font-size:var(--text-sm);color:var(--text-muted);">
            <span>Subtle</span><span id="smoothing-val">10</span><span>Strong</span>
          </div>
        </div>
        <button class="btn btn-primary btn-lg" id="stabilize-btn" style="width:100%;">
          Stabilize Video
        </button>
        <div id="result-area" style="display:none;margin-top:var(--space-4);">
          <div id="result-preview"></div>
          <button class="btn btn-primary btn-lg" id="download-btn" style="width:100%;margin-top:var(--space-3);">
            Download Stabilized Video
          </button>
        </div>
      </div>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p id="pass-label">Pass 1 of 2: Analyzing motion...</p>
        <p><span id="progress-pct">0</span>%</p>
      </div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const optionsArea = container.querySelector("#options-area");
  const processing = container.querySelector("#processing");
  const passLabel = container.querySelector("#pass-label");
  const progressPct = container.querySelector("#progress-pct");
  const resultArea = container.querySelector("#result-area");
  const resultPreview = container.querySelector("#result-preview");
  const stabilizeBtn = container.querySelector("#stabilize-btn");
  const downloadBtn = container.querySelector("#download-btn");
  const shakinessInput = container.querySelector("#shakiness");
  const smoothingInput = container.querySelector("#smoothing");
  const shakinessVal = container.querySelector("#shakiness-val");
  const smoothingVal = container.querySelector("#smoothing-val");

  shakinessInput.addEventListener("input", () => {
    shakinessVal.textContent = shakinessInput.value;
  });
  smoothingInput.addEventListener("input", () => {
    smoothingVal.textContent = smoothingInput.value;
  });

  const tctx = { container, query: sel => container.querySelector(sel) };

  stabilizeBtn.addEventListener("click", async () => {
    if (!currentFile) return;

    stabilizeBtn.style.display = "none";
    resultArea.style.display = "none";
    processing.style.display = "block";

    try {
      const shakiness = parseInt(shakinessInput.value, 10);
      const smoothing = parseInt(smoothingInput.value, 10);

      passLabel.textContent = "Loading FFmpeg (with vidstab support)...";
      progressPct.textContent = "0";

      const ffmpeg = await loadFFmpegVidstab(pct => {
        progressPct.textContent = pct;
      });

      const ext = currentFile.name.split(".").pop() || "mp4";
      const inputName = `input.${ext}`;
      await writeUploadedFile(ffmpeg, currentFile, inputName);

      passLabel.textContent = "Pass 1 of 2: Analyzing motion...";
      progressPct.textContent = "0";

      await ffmpeg.exec([
        "-i",
        inputName,
        "-vf",
        `vidstabdetect=shakiness=${shakiness}:accuracy=15:result=transforms.trf`,
        "-f",
        "null",
        "-"
      ]);

      passLabel.textContent = "Pass 2 of 2: Applying stabilization...";
      progressPct.textContent = "0";

      await ffmpeg.exec([
        "-i",
        inputName,
        "-vf",
        `vidstabtransform=input=transforms.trf:zoom=0:smoothing=${smoothing},unsharp=5:5:0.8:3:3:0.4`,
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "23",
        "stabilized.mp4"
      ]);

      const outputData = await ffmpeg.readFile("stabilized.mp4");
      stabilizedBlob = new Blob([outputData.buffer], { type: "video/mp4" });

      const previewUrl = URL.createObjectURL(stabilizedBlob);
      resultPreview.innerHTML = `
        <video controls style="width:100%;max-height:400px;border-radius:var(--radius-md);">
          <source src="${previewUrl}" type="video/mp4">
        </video>
      `;
      resultArea.style.display = "block";

      showToast({
        message: `Stabilized! ${formatFileSize(videoInfo.size)} → ${formatFileSize(stabilizedBlob.size)}`,
        type: "success"
      });

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile("stabilized.mp4");
      await ffmpeg.deleteFile("transforms.trf");
    } catch (err) {
      showToast({ message: "Error: " + err.message, type: "error" });
    } finally {
      processing.style.display = "none";
      stabilizeBtn.style.display = "inline-flex";
    }
  });

  downloadBtn.addEventListener("click", () => {
    if (stabilizedBlob) {
      downloadBlob(stabilizedBlob, `stabilized-${currentFile.name}`);
    }
  });
}

export function destroy() {}
