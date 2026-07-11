import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import {
  loadFFmpeg,
  getVideoInfo,
  writeUploadedFile
} from "./video-utils.js";

export function createVideoTool({
  optionsHTML,
  maxSizeMB = 500,
  processingText = "Processing...",
  actionBtnLabel = "Process",
  onFileLoaded,
  onProcess,
  destroy: onDestroy
}) {
  return function render(container) {
    let currentFile = null;
    let videoInfo = null;

    const upload = createFileUpload({
      accept: "video/*",
      multiple: false,
      maxSizeMB,
      onFilesSelected: async files => {
        if (files.length === 0) return;
        currentFile = files[0];
        videoInfo = await getVideoInfo(currentFile);
        if (onFileLoaded) onFileLoaded(videoInfo, tctx);
        optionsArea.style.display = "block";
      }
    });

    container.innerHTML = `
      <div class="tool-layout">
        <div class="tool-upload-area" id="upload-area"></div>
        <div class="tool-options" id="options-area" style="display:none;">
          ${optionsHTML}
          <button class="btn btn-primary btn-lg" id="action-btn" style="width:100%;">${actionBtnLabel}</button>
        </div>
        <div class="tool-processing" id="processing" style="display:none;">
          <div class="spinner"></div>
          <p>${processingText} <span id="progress-pct">0</span>%</p>
        </div>
      </div>
    `;

    container.querySelector("#upload-area").appendChild(upload.element);
    const optionsArea = container.querySelector("#options-area");
    const actionBtn = container.querySelector("#action-btn");
    const processing = container.querySelector("#processing");
    const progressPct = container.querySelector("#progress-pct");

    const tctx = {
      container,
      getValue: id => container.querySelector(`#${id}`).value,
      query: sel => container.querySelector(sel)
    };

    actionBtn.addEventListener("click", async () => {
      if (!currentFile) return;

      processing.style.display = "block";
      actionBtn.style.display = "none";

      try {
        const ffmpeg = await loadFFmpeg(pct => {
          progressPct.textContent = pct;
        });
        const ext = currentFile.name.split(".").pop() || "mp4";
        const inputName = `input.${ext}`;

        await writeUploadedFile(ffmpeg, currentFile, inputName);
        await onProcess(ffmpeg, inputName, videoInfo, tctx);
        await ffmpeg.deleteFile(inputName);
      } catch (err) {
        showToast({ message: "Error: " + err.message, type: "error" });
      } finally {
        processing.style.display = "none";
        actionBtn.style.display = "inline-flex";
      }
    });

    if (onDestroy) container._destroy = onDestroy;
  };
}
