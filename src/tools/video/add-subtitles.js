import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob, formatFileSize } from "../../utils/file.js";
import { loadFFmpeg, writeUploadedFile, readFFmpegFile } from "./video-utils.js";

export const toolConfig = {
  id: "add-subtitles",
  name: "Add Subtitles to Video",
  category: "video",
  description:
    "Burn SRT or VTT subtitle files permanently into your video. Subtitles become part of the video.",
  icon: "💬",
  accept: ".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime",
  maxSizeMB: 500,
  keywords: [
    "add subtitles",
    "burn subtitles",
    "srt to video",
    "vtt to video",
    "hardcode subtitles"
  ],
  steps: [
    "Upload a video",
    "Upload an SRT or VTT file",
    "Choose subtitle style",
    'Click "Burn Subtitles"',
    "Download video"
  ],
  faqs: [
    {
      question: "What subtitle formats are supported?",
      answer: "SRT and VTT (WebVTT) subtitle files are both supported."
    },
    {
      question: "Can I remove subtitles afterwards?",
      answer:
        "Once burned in, subtitles are permanent. Keep your original video if you want an unsubbed version."
    }
  ]
};

export function render(container) {
  let currentVideo = null;
  let currentSubs = null;

  const videoUpload = createFileUpload({
    accept: ".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime",
    multiple: false,
    maxSizeMB: 500,
    onFilesSelected: async files => {
      if (files.length === 0) return;
      currentVideo = files[0];
      videoInfo.textContent = `${currentVideo.name} — ${formatFileSize(currentVideo.size)}`;
      videoPreview.innerHTML = `<video controls style="max-width:100%;max-height:300px;border-radius:var(--radius-md);border:1px solid var(--color-border);">
        <source src="${URL.createObjectURL(currentVideo)}">
      </video>`;
      checkReady();
    }
  });

  const subUpload = createFileUpload({
    accept: ".srt,.vtt,text/plain,text/vtt,application/octet-stream",
    multiple: false,
    maxSizeMB: 1,
    onFilesSelected: async files => {
      if (files.length === 0) return;
      currentSubs = files[0];
      subInfo.textContent = `${currentSubs.name} — ${formatFileSize(currentSubs.size)}`;
      const text = await currentSubs.text();
      subPreview.textContent = text.slice(0, 300) + (text.length > 300 ? "..." : "");
      checkReady();
    }
  });

  function checkReady() {
    if (currentVideo && currentSubs) {
      optionsArea.style.display = "block";
    }
  }

  container.innerHTML = `
    <div class="tool-layout">
      <div class="upload-section">
        <div style="font-size:var(--text-sm);font-weight:600;margin-bottom:var(--space-2);color:var(--color-text);">1. Upload Video</div>
        <div class="tool-upload-area" id="upload-area"></div>
      </div>
      <hr style="border:none;border-top:1px solid var(--color-border);margin:var(--space-4) 0;">
      <div class="upload-section">
        <div style="font-size:var(--text-sm);font-weight:600;margin-bottom:var(--space-2);color:var(--color-text);">2. Upload Subtitles (SRT / VTT)</div>
        <div class="tool-upload-area" id="sub-upload-area"></div>
      </div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-4);">
          <div>
            <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:var(--space-1);">Video</div>
            <div id="video-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);">-</div>
            <div id="video-preview" style="margin-top:var(--space-2);"></div>
          </div>
          <div>
            <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:var(--space-1);">Subtitles</div>
            <div id="sub-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);">-</div>
            <pre id="sub-preview" style="margin-top:var(--space-2);font-size:var(--text-xs);max-height:150px;overflow:auto;background:var(--color-bg-secondary);padding:var(--space-2);border-radius:var(--radius-md);border:1px solid var(--color-border);white-space:pre-wrap;word-break:break-all;"></pre>
          </div>
        </div>
        <div class="form-group">
          <label>Font Size</label>
          <select id="fontsize-select" class="select-input">
            <option value="16" selected>Normal</option>
            <option value="20">Large</option>
            <option value="12">Small</option>
          </select>
        </div>
        <button class="btn btn-primary btn-lg" id="convert-btn" style="width:100%;">Burn Subtitles</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Processing... <span id="progress-pct">0</span>%</p>
      </div>
      <div class="tool-results" id="results" style="display:none;text-align:center;">
        <div id="preview-area" style="margin:var(--space-4) 0;"></div>
        <button class="btn btn-primary btn-lg" id="download-btn">Download Video with Subtitles</button>
      </div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(videoUpload.element);
  container.querySelector("#sub-upload-area").appendChild(subUpload.element);
  const optionsArea = container.querySelector("#options-area");
  const videoInfo = container.querySelector("#video-info");
  const videoPreview = container.querySelector("#video-preview");
  const subInfo = container.querySelector("#sub-info");
  const subPreview = container.querySelector("#sub-preview");
  const convertBtn = container.querySelector("#convert-btn");
  const processing = container.querySelector("#processing");
  const progressPct = container.querySelector("#progress-pct");
  const results = container.querySelector("#results");
  const previewArea = container.querySelector("#preview-area");
  const downloadBtn = container.querySelector("#download-btn");
  let outputBlob = null;

  convertBtn.addEventListener("click", async () => {
    if (!currentVideo || !currentSubs) return;
    const fontSize = container.querySelector("#fontsize-select").value;

    processing.style.display = "block";
    convertBtn.style.display = "none";
    results.style.display = "none";

    try {
      const ffmpeg = await loadFFmpeg(pct => {
        progressPct.textContent = pct;
      });

      const isVtt = currentSubs.name.match(/\.vtt$/i);
      const subExt = isVtt ? "vtt" : "srt";
      const subName = `subs.${subExt}`;

      await writeUploadedFile(ffmpeg, currentVideo, "input.mp4");
      const subData = await currentSubs.arrayBuffer();
      await ffmpeg.writeFile(subName, new Uint8Array(subData));

      await ffmpeg.exec([
        "-i",
        "input.mp4",
        "-vf",
        `subtitles=${subName}:fonts'='size=${fontSize}`,
        "-c:v",
        "libx264",
        "-c:a",
        "copy",
        "-pix_fmt",
        "yuv420p",
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
          Size: ${formatFileSize(outputBlob.size)} (was ${formatFileSize(currentVideo.size)})
        </div>`;
      results.style.display = "block";
      showToast({ message: "Subtitles burned in!", type: "success" });

      await ffmpeg.deleteFile("input.mp4");
      await ffmpeg.deleteFile(subName);
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
      const base = currentVideo.name.replace(/\.\w+$/, "");
      downloadBlob(outputBlob, `${base}_subtitled.mp4`);
    }
  });
}

export function destroy() {}
