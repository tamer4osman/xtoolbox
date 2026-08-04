import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { loadFFmpeg, getVideoInfo, writeUploadedFile, downloadVideoOutput } from "./video-utils.js";

export const toolConfig = {
  id: "chroma-key-composer",
  name: "Chroma Key Composer",
  category: "video",
  description:
    "Remove green or blue screens and composite video onto a new background or export as transparent WebM.",
  icon: "🎬",
  accept: "video/*,image/*",
  maxSizeMB: 500,
  keywords: [
    "chroma key",
    "green screen",
    "blue screen",
    "remove background video",
    "composite video",
    "transparent video"
  ],
  steps: [
    "Upload a green or blue screen video",
    "Choose compose (with background) or transparency mode",
    "Pick the screen color and tune similarity/blend",
    "Download the composited MP4 or transparent WebM"
  ],
  faqs: [
    {
      question: "Why is the transparency output a WebM file?",
      answer:
        "MP4/H.264 cannot carry transparency. WebM (VP9) with an alpha channel is the only broadly supported browser format for transparent video."
    },
    {
      question: "My footage has uneven lighting. What should I adjust?",
      answer:
        "Raise the Similarity slider (try 0.4–0.5) to catch a wider range of the screen color, and lower Blend to keep edges sharp."
    },
    {
      question: "Can I use a custom screen color?",
      answer:
        "Yes. Pick a color with the custom color selector to match any solid background, not just green or blue."
    }
  ]
};

export function hexToKeyColor(hex) {
  return "0x" + hex.replace("#", "").toUpperCase();
}

export function buildComposeFilter({ w, h, color, similarity, blend, x, y, duration }) {
  const sim = Number(similarity).toFixed(2);
  const bl = Number(blend).toFixed(2);
  return (
    `[0:v]chromakey=${color}:${sim}:${bl}[fg];` +
    `[1:v]scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},` +
    `trim=duration=${duration.toFixed(2)}[bg];` +
    `[bg][fg]overlay=${x}:${y}[out]`
  );
}

export function render(container) {
  let foregroundFile = null;
  let backgroundFile = null;
  let foregroundInfo = null;
  let ffmpeg = null;
  const tempFiles = [];

  const isImage = file => file.type.startsWith("image/");

  const foregroundUpload = createFileUpload({
    accept: "video/*",
    multiple: false,
    maxSizeMB: 500,
    onFilesSelected: async files => {
      foregroundFile = files[0] || null;
      foregroundStatus.textContent = foregroundFile ? `✅ ${foregroundFile.name}` : "No file";
      if (foregroundFile) {
        try {
          foregroundInfo = await getVideoInfo(foregroundFile);
          if (!foregroundInfo.width) {
            showToast({ message: "Could not read video dimensions.", type: "error" });
            resetForeground();
          }
        } catch (err) {
          showToast({
            message: "Error reading video: " + (err?.message ?? String(err)),
            type: "error"
          });
          resetForeground();
        }
      }
    }
  });

  function resetForeground() {
    foregroundFile = null;
    foregroundInfo = null;
    if (foregroundStatus) foregroundStatus.textContent = "No file";
  }

  const backgroundUpload = createFileUpload({
    accept: "image/*,video/*",
    multiple: false,
    maxSizeMB: 500,
    onFilesSelected: files => {
      backgroundFile = files[0] || null;
      backgroundStatus.textContent = backgroundFile ? `✅ ${backgroundFile.name}` : "No file";
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="form-group">
        <label>Mode</label>
        <select id="mode-select" class="select-input">
          <option value="compose" selected>Compose onto a background</option>
          <option value="transparent">Transparency (no background, WebM)</option>
        </select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
        <div>
          <h3 style="margin-bottom:var(--space-3);">🎬 Screen Video</h3>
          <div id="foreground-upload-area"></div>
          <div id="foreground-status" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-top:var(--space-2);">No file</div>
        </div>
        <div id="background-column">
          <h3 style="margin-bottom:var(--space-3);">🖼️ Background</h3>
          <div id="background-upload-area"></div>
          <div id="background-status" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-top:var(--space-2);">Image or video</div>
        </div>
      </div>
      <div class="tool-options" style="margin-top:var(--space-6);">
        <div class="form-group">
          <label>Screen Color</label>
          <div id="color-presets" style="display:flex;gap:var(--space-2);flex-wrap:wrap;align-items:center;">
            <button class="btn btn-sm color-btn active" data-color="#00FF00" style="border:2px solid var(--color-border);">🟢 Green</button>
            <button class="btn btn-sm color-btn" data-color="#0000FF" style="border:2px solid var(--color-border);">🔵 Blue</button>
            <input type="color" id="color-picker" value="#00FF00" style="width:44px;height:32px;padding:0;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:none;">
          </div>
        </div>
        <div class="form-group">
          <label>Similarity: <span id="sim-value">0.30</span></label>
          <input type="range" id="similarity" class="range-input" min="0.01" max="1" step="0.01" value="0.30">
        </div>
        <div class="form-group">
          <label>Edge Blend: <span id="blend-value">0.10</span></label>
          <input type="range" id="blend" class="range-input" min="0" max="1" step="0.01" value="0.10">
        </div>
        <div id="offset-row" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);">
          <div class="form-group"><label>X Offset (px)</label><input type="number" id="offset-x" class="text-input" value="0"></div>
          <div class="form-group"><label>Y Offset (px)</label><input type="number" id="offset-y" class="text-input" value="0"></div>
        </div>
        <button class="btn btn-primary btn-lg" id="action-btn" style="width:100%;">Compose Video</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Processing... <span id="progress-pct">0</span>%</p>
      </div>
    </div>
  `;

  container.querySelector("#foreground-upload-area").appendChild(foregroundUpload.element);
  container.querySelector("#background-upload-area").appendChild(backgroundUpload.element);

  const foregroundStatus = container.querySelector("#foreground-status");
  const backgroundStatus = container.querySelector("#background-status");
  const modeSelect = container.querySelector("#mode-select");
  const backgroundColumn = container.querySelector("#background-column");
  const offsetRow = container.querySelector("#offset-row");
  const actionBtn = container.querySelector("#action-btn");
  const processing = container.querySelector("#processing");
  const progressPct = container.querySelector("#progress-pct");
  const similarity = container.querySelector("#similarity");
  const blend = container.querySelector("#blend");

  function syncMode() {
    const compose = modeSelect.value === "compose";
    backgroundColumn.style.display = compose ? "block" : "none";
    offsetRow.style.display = compose ? "grid" : "none";
    actionBtn.textContent = compose ? "Compose Video" : "Remove Background";
  }

  modeSelect.addEventListener("change", syncMode);

  similarity.addEventListener("input", () => {
    container.querySelector("#sim-value").textContent = Number(similarity.value).toFixed(2);
  });
  blend.addEventListener("input", () => {
    container.querySelector("#blend-value").textContent = Number(blend.value).toFixed(2);
  });

  container.querySelector("#color-presets").addEventListener("click", e => {
    const btn = e.target.closest(".color-btn");
    if (!btn) return;
    container.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    container.querySelector("#color-picker").value = btn.dataset.color;
  });

  container.querySelector("#color-picker").addEventListener("input", () => {
    container.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
  });

  actionBtn.addEventListener("click", async () => {
    if (!foregroundFile || !foregroundInfo) {
      showToast({ message: "Upload a green screen video first.", type: "error" });
      return;
    }
    const compose = modeSelect.value === "compose";
    if (compose && !backgroundFile) {
      showToast({ message: "Upload a background image or video.", type: "error" });
      return;
    }

    const color = hexToKeyColor(container.querySelector("#color-picker").value);
    const similarityValue = similarity.value;
    const blendValue = blend.value;

    processing.style.display = "block";
    actionBtn.style.display = "none";

    try {
      ffmpeg = await loadFFmpeg(pct => {
        progressPct.textContent = pct;
      });

      const ext = foregroundFile.name.split(".").pop() || "mp4";
      const inputName = `input.${ext}`;
      tempFiles.push(inputName);
      await writeUploadedFile(ffmpeg, foregroundFile, inputName);

      if (compose) {
        const bgExt = backgroundFile.name.split(".").pop() || "jpg";
        const bgName = `bg.${bgExt}`;
        tempFiles.push(bgName);
        await writeUploadedFile(ffmpeg, backgroundFile, bgName);

        const w = foregroundInfo.width;
        const h = foregroundInfo.height;
        const x = parseInt(container.querySelector("#offset-x").value) || 0;
        const y = parseInt(container.querySelector("#offset-y").value) || 0;

        const args = ["-i", inputName];
        if (isImage(backgroundFile)) args.push("-loop", "1");
        args.push("-i", bgName);
        args.push(
          "-filter_complex",
          buildComposeFilter({
            w,
            h,
            color,
            similarity: similarityValue,
            blend: blendValue,
            x,
            y,
            duration: foregroundInfo.duration
          }),
          "-map",
          "[out]",
          "-map",
          "0:a?",
          "-c:v",
          "libx264",
          "-pix_fmt",
          "yuv420p",
          "-c:a",
          "aac",
          "-shortest",
          "-movflags",
          "+faststart",
          "output.mp4"
        );

        await ffmpeg.exec(args);
        await downloadVideoOutput(ffmpeg, "output.mp4", "composed.mp4", "mp4");
      } else {
        await ffmpeg.exec([
          "-i",
          inputName,
          "-vf",
          `chromakey=${color}:${Number(similarityValue).toFixed(2)}:${Number(blendValue).toFixed(2)}`,
          "-c:v",
          "libvpx",
          "-auto-alt-ref",
          "0",
          "-lag-in-frames",
          "0",
          "-pix_fmt",
          "yuva420p",
          "-c:a",
          "libopus",
          "output.webm"
        ]);
        await downloadVideoOutput(ffmpeg, "output.webm", "transparent.webm", "webm");
      }

      showToast({ message: compose ? "Video composed!" : "Background removed!", type: "success" });
    } catch (err) {
      showToast({ message: "Error: " + (err?.message ?? String(err)), type: "error" });
    } finally {
      if (ffmpeg) {
        for (const name of tempFiles) {
          try {
            await ffmpeg.deleteFile(name);
          } catch {
            // ignore file-not-found cleanup errors
          }
        }
      }
      tempFiles.length = 0;
      processing.style.display = "none";
      actionBtn.style.display = "inline-flex";
    }
  });

  syncMode();
}

export function destroy() {}
