import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob, formatFileSize } from "../../utils/file.js";
import { loadFFmpeg, writeUploadedFile, readFFmpegFile } from "./video-utils.js";

const STYLES = `
  .tool-options { background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-lg);margin:var(--space-4) 0; }
  .tool-processing { display:flex;flex-direction:column;align-items:center;gap:var(--space-3);padding:var(--space-4); }
  .tool-results { display:flex;flex-direction:column;align-items:center;gap:var(--space-3);padding:var(--space-4); }
`;

export function createVideoConverter({
  container,
  toolId,
  accept,
  maxSizeMB = 500,
  optionsHTML = "",
  actionButtonText = "Convert",
  processingMessage = "Converting...",
  outputFilename = "output.mp4",
  successMessage = "Conversion complete!",
  getInputFilename,
  ffmpegArgs = [],
  getPreviewHTML,
  getOutputExtension,
  includeAudioCodec = false
}) {
  let currentFile = null;
  let outputBlob = null;

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="${toolId}-upload-area"></div>
      <div class="tool-options" id="${toolId}-options-area" style="display:none;">
        <div id="${toolId}-file-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">-</div>
        <div id="${toolId}-file-preview" style="margin-bottom:var(--space-4);"></div>
        ${optionsHTML}
        <button class="btn btn-primary btn-lg" id="${toolId}-action-btn" style="width:100%;margin-top:var(--space-4);">${actionButtonText}</button>
      </div>
      <div class="tool-processing" id="${toolId}-processing" style="display:none;">
        <div class="spinner"></div>
        <p>${processingMessage} <span id="${toolId}-progress-pct">0</span>%</p>
      </div>
      <div class="tool-results" id="${toolId}-results" style="display:none;text-align:center;">
        <div id="${toolId}-preview-area" style="margin:var(--space-4) 0;"></div>
        <button class="btn btn-primary btn-lg" id="${toolId}-download-btn">Download ${outputFilename.toUpperCase()}</button>
      </div>
    </div>
    <style>${STYLES}</style>
  `;

  const upload = createFileUpload({
    accept,
    multiple: false,
    maxSizeMB,
    onFilesSelected: files => {
      if (files.length === 0) return;
      currentFile = files[0];
      fileInfo.textContent = `${currentFile.name} — ${formatFileSize(currentFile.size)}`;
      if (getPreviewHTML) filePreview.innerHTML = getPreviewHTML(currentFile);
      optionsArea.style.display = "block";
    }
  });

  container.querySelector(`#${toolId}-upload-area`).appendChild(upload.element);
  const optionsArea = container.querySelector(`#${toolId}-options-area`);
  const fileInfo = container.querySelector(`#${toolId}-file-info`);
  const filePreview = container.querySelector(`#${toolId}-file-preview`);
  const actionBtn = container.querySelector(`#${toolId}-action-btn`);
  const processing = container.querySelector(`#${toolId}-processing`);
  const progressPct = container.querySelector(`#${toolId}-progress-pct`);
  const results = container.querySelector(`#${toolId}-results`);
  const previewArea = container.querySelector(`#${toolId}-preview-area`);
  const downloadBtn = container.querySelector(`#${toolId}-download-btn`);

  actionBtn.addEventListener("click", async () => {
    if (!currentFile) return;
    const quality = container.querySelector("#quality-select")?.value || "medium";
    const inputFilename =
      typeof getInputFilename === "function" ? getInputFilename(currentFile.name) : "input.video";

    processing.style.display = "block";
    actionBtn.style.display = "none";
    results.style.display = "none";

    try {
      const ffmpeg = await loadFFmpeg(pct => {
        progressPct.textContent = pct;
      });
      await writeUploadedFile(ffmpeg, currentFile, inputFilename);

      const crf = quality === "max" ? "15" : quality === "high" ? "20" : "25";
      const audioArgs = includeAudioCodec ? ["-c:a", "aac"] : [];
      const args = [
        "-i",
        inputFilename,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        crf,
        "-movflags",
        "+faststart",
        ...audioArgs,
        ...ffmpegArgs,
        "output.mp4"
      ];
      await ffmpeg.exec(args);

      outputBlob = await readFFmpegFile(ffmpeg, "output.mp4", "video/mp4");
      previewArea.innerHTML = `<video controls style="max-width:100%;max-height:400px;border-radius:var(--radius-md);border:1px solid var(--color-border);">
        <source src="${URL.createObjectURL(outputBlob)}" type="video/mp4">
      </video>
      <div style="font-size:var(--text-sm);color:var(--color-text-muted);margin-top:var(--space-2);">
        Size: ${formatFileSize(outputBlob.size)} (was ${formatFileSize(currentFile.size)})
      </div>`;
      results.style.display = "block";
      showToast({ message: successMessage, type: "success" });

      await ffmpeg.deleteFile(inputFilename);
      await ffmpeg.deleteFile("output.mp4");
    } catch (err) {
      showToast({ message: "Error: " + err.message, type: "error" });
    } finally {
      processing.style.display = "none";
      actionBtn.style.display = "inline-flex";
    }
  });

  downloadBtn.addEventListener("click", () => {
    if (outputBlob && currentFile)
      downloadBlob(outputBlob, currentFile.name.replace(getOutputExtension, ".mp4"));
  });

  return { optionsArea, actionBtn, processing, results };
}
