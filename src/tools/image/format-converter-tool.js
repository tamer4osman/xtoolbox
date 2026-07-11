import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";
import { loadImageFromFile, canvasToBlob } from "./image-utils.js";

/**
 * Factory for canvas-based image format converters.
 * Used by jpg-to-png, jpg-to-webp, png-to-jpg, webp-to-jpg.
 *
 * @param {Object} opts
 * @param {string} opts.accept                File picker accept pattern (e.g. '.jpg,.jpeg')
 * @param {number} opts.maxSizeMB
 * @param {string} opts.sourceFormatName      Display name of source (e.g. 'JPG', 'PNG', 'WebP')
 * @param {RegExp} opts.sourceExtRegex        Matches source extension in file names
 * @param {string} opts.targetFormatName      Display name of target (e.g. 'PNG', 'WebP', 'JPG')
 * @param {string} opts.targetMime            Target MIME (e.g. 'image/png', 'image/webp', 'image/jpeg')
 * @param {string} opts.targetExt             Target extension with leading dot (e.g. '.png')
 * @param {number} [opts.qualityDefault=null] Show quality slider at this default; null = no slider
 * @param {boolean} [opts.fillBackgroundColor=false] Show bg color input for transparency handling
 * @returns {function(container): void}
 */
export function createFormatConverterTool({
  accept,
  maxSizeMB,
  sourceFormatName,
  sourceExtRegex,
  targetFormatName,
  targetMime,
  targetExt,
  qualityDefault = null,
  fillBackgroundColor = false
}) {
  return function render(container) {
    let images = [];
    let files = [];

    const upload = createFileUpload({
      accept,
      multiple: true,
      maxSizeMB,
      onFilesSelected: async selectedFiles => {
        if (selectedFiles.length === 0) return;

        files = Array.from(selectedFiles);
        images = [];

        for (const file of files) {
          const img = await loadImageFromFile(file);
          images.push(img);
        }

        totalFiles.textContent = files.length + " " + sourceFormatName + " file(s)";
        totalSize.textContent =
          (files.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(1) + " KB total";
        optionsArea.style.display = "block";
      }
    });

    const qualityBlock =
      qualityDefault !== null
        ? `
        <div class="form-group">
          <label>Quality: <strong id="quality-display">${qualityDefault}</strong>%</label>
          <input type="range" id="quality-slider" min="10" max="100" value="${qualityDefault}" step="5" class="range-slider-input">
        </div>`
        : "";

    const bgColorBlock = fillBackgroundColor
      ? `
        <div class="form-group">
          <label>Background Color (for transparency)</label>
          <div style="display:flex;align-items:center;gap:var(--space-3);">
            <input type="color" id="bg-color" value="#ffffff" class="color-input" style="width:40px;height:40px;border:none;cursor:pointer;">
            <span id="bg-color-hex">#ffffff</span>
          </div>
        </div>`
      : "";

    const extraStyle = fillBackgroundColor
      ? ".color-input { border:1px solid var(--color-border);border-radius:var(--radius-sm); }\n        "
      : "";

    container.innerHTML = `
      <div class="tool-layout">
        <div class="tool-upload-area" id="upload-area"></div>
        <div class="tool-options" id="options-area" style="display:none;">
          <div style="display:flex;gap:var(--space-6);margin-bottom:var(--space-4);">
            <div><span style="font-size:var(--text-xs);color:var(--color-text-muted);">Files</span><div id="total-files" style="font-weight:600;">-</div></div>
            <div><span style="font-size:var(--text-xs);color:var(--color-text-muted);">Total Size</span><div id="total-size" style="font-weight:600;">-</div></div>
          </div>${qualityBlock}${bgColorBlock}
          <div class="form-group">
            <label>Resize (optional)</label>
            <div style="display:flex;gap:var(--space-3);align-items:center;">
              <input type="number" id="resize-width" placeholder="Width" class="text-input" style="width:100px;">
              <span>×</span>
              <input type="number" id="resize-height" placeholder="Height" class="text-input" style="width:100px;">
              <label style="display:flex;align-items:center;gap:var(--space-2);margin-left:var(--space-3);">
                <input type="checkbox" id="maintain-aspect" checked> Keep aspect ratio
              </label>
            </div>
          </div>
          <button class="btn btn-primary btn-lg" id="convert-btn" style="width:100%;">Convert to ${targetFormatName}</button>
          <div class="tool-processing" id="processing" style="display:none;">
            <div class="spinner"></div>
            <p>Converting... <span id="progress-pct">0</span>%</p>
          </div>
        </div>
      </div>
      <style>
        ${extraStyle}.text-input { padding:var(--space-2);border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface);color:var(--color-text); }
      </style>
    `;

    container.querySelector("#upload-area").appendChild(upload.element);
    const optionsArea = container.querySelector("#options-area");
    const totalFiles = container.querySelector("#total-files");
    const totalSize = container.querySelector("#total-size");
    const qualitySlider =
      qualityDefault !== null ? container.querySelector("#quality-slider") : null;
    const qualityDisplay =
      qualityDefault !== null ? container.querySelector("#quality-display") : null;
    const bgColor = fillBackgroundColor ? container.querySelector("#bg-color") : null;
    const bgColorHex = fillBackgroundColor ? container.querySelector("#bg-color-hex") : null;
    const convertBtn = container.querySelector("#convert-btn");
    const processing = container.querySelector("#processing");
    const progressPct = container.querySelector("#progress-pct");
    const resizeWidth = container.querySelector("#resize-width");
    const resizeHeight = container.querySelector("#resize-height");
    const maintainAspect = container.querySelector("#maintain-aspect");

    if (qualitySlider) {
      qualitySlider.addEventListener("input", () => {
        qualityDisplay.textContent = qualitySlider.value;
      });
    }
    if (bgColor) {
      bgColor.addEventListener("input", () => {
        bgColorHex.textContent = bgColor.value;
      });
    }

    resizeWidth.addEventListener("input", () => {
      if (maintainAspect.checked && images.length > 0 && resizeWidth.value) {
        const ratio = images[0].naturalHeight / images[0].naturalWidth;
        resizeHeight.value = Math.round(resizeWidth.value * ratio);
      }
    });

    resizeHeight.addEventListener("input", () => {
      if (maintainAspect.checked && images.length > 0 && resizeHeight.value) {
        const ratio = images[0].naturalWidth / images[0].naturalHeight;
        resizeWidth.value = Math.round(resizeHeight.value * ratio);
      }
    });

    convertBtn.addEventListener("click", async () => {
      if (images.length === 0) return;

      processing.style.display = "block";
      convertBtn.style.display = "none";

      const quality = qualitySlider !== null ? parseInt(qualitySlider.value) / 100 : undefined;
      const bgColorValue = bgColor ? bgColor.value : null;
      const targetWidth = parseInt(resizeWidth.value) || 0;
      const targetHeight = parseInt(resizeHeight.value) || 0;

      try {
        for (let i = 0; i < images.length; i++) {
          progressPct.textContent = Math.round(((i + 1) / images.length) * 100);

          const img = images[i];
          const canvas = document.createElement("canvas");

          const width = targetWidth || img.naturalWidth;
          const height = targetHeight || img.naturalHeight;

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (fillBackgroundColor && bgColorValue) {
            ctx.fillStyle = bgColorValue;
            ctx.fillRect(0, 0, width, height);
          }
          ctx.drawImage(img, 0, 0, width, height);

          const blob = await canvasToBlob(canvas, targetMime, quality);
          const fileName = files[i].name.replace(sourceExtRegex, "");
          downloadBlob(blob, `${fileName}${targetExt}`);
        }

        showToast({
          message: `Converted ${images.length} ${sourceFormatName}(s) to ${targetFormatName}!`,
          type: "success"
        });
      } catch (err) {
        showToast({ message: "Error: " + err.message, type: "error" });
      } finally {
        processing.style.display = "none";
        convertBtn.style.display = "inline-flex";
      }
    });
  };
}
