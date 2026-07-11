/**
 * Supported languages for OCR
 */
import { showToast } from "../../components/toast.js";
import { copyToClipboard } from "../../utils/clipboard.js";
import { downloadBlob } from "../../utils/file.js";

export const OCR_LANGUAGES = [
  { code: "eng", name: "English" },
  { code: "chi_sim", name: "Chinese (Simplified)" },
  { code: "chi_tra", name: "Chinese (Traditional)" },
  { code: "jpn", name: "Japanese" },
  { code: "kor", name: "Korean" },
  { code: "spa", name: "Spanish" },
  { code: "fra", name: "French" },
  { code: "deu", name: "German" },
  { code: "por", name: "Portuguese" },
  { code: "rus", name: "Russian" },
  { code: "ara", name: "Arabic" },
  { code: "hin", name: "Hindi" },
  { code: "ita", name: "Italian" },
  { code: "tha", name: "Thai" },
  { code: "vie", name: "Vietnamese" },
  { code: "tur", name: "Turkish" },
  { code: "pol", name: "Polish" },
  { code: "nld", name: "Dutch" }
];

/**
 * Recognize text from image source using Tesseract.js
 * @param {string|File|Blob} imageSource - Image URL, File, or Blob
 * @param {string} language - Language code (e.g., 'eng')
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} Recognized text
 */
export async function recognizeText(imageSource, language = "eng", onProgress) {
  const Tesseract = await import("tesseract.js");

  const result = await Tesseract.recognize(imageSource, language, {
    logger: m => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    }
  });

  return result.data.text;
}

/**
 * Recognize text with detailed info (words, confidence)
 */
export async function recognizeTextDetailed(imageSource, language = "eng", onProgress) {
  const Tesseract = await import("tesseract.js");

  const result = await Tesseract.recognize(imageSource, language, {
    logger: m => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    }
  });

  return {
    text: result.data.text,
    confidence: result.data.confidence,
    words: result.data.words || [],
    lines: result.data.lines || [],
    paragraphs: result.data.paragraphs || []
  };
}

/**
 * Mount a complete OCR pipeline (options + processing + results panel)
 * at the end of `container`. The caller provides input collection
 * (file upload, paste, etc.) and supplies the current input via
 * getInputFile(). Call ocr.onInputReady() to reveal the options area
 * once the input is loaded.
 *
 * @param {HTMLElement} container
 * @param {Object} opts
 * @param {() => (File|Blob|null)} opts.getInputFile - Returns the current input
 * @param {string} [opts.filename='extracted-text.txt']
 * @returns {{ onInputReady: () => void, reset: () => void }}
 */
export function createOcrTool({ container, getInputFile, filename = "extracted-text.txt" }) {
  const pipeline = document.createElement("div");
  pipeline.innerHTML = `
    <div class="tool-options" id="options-area" style="display:none;">
      <div class="form-group">
        <label>Language</label>
        <select id="lang-select" class="select-input">
          ${OCR_LANGUAGES.map(l => `<option value="${l.code}" ${l.code === "eng" ? "selected" : ""}>${l.name}</option>`).join("")}
        </select>
      </div>
      <button class="btn btn-primary btn-lg" id="extract-btn" style="width:100%;">Extract Text</button>
    </div>
    <div class="tool-processing" id="processing" style="display:none;">
      <div class="spinner"></div>
      <p>Recognizing text... <span id="progress-pct">0</span>%</p>
    </div>
    <div id="results-area" style="display:none;margin-top:var(--space-6);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4);">
        <h3 style="font-size:var(--text-lg);font-weight:600;">Extracted Text</h3>
        <div style="display:flex;gap:var(--space-2);">
          <button class="btn btn-sm btn-secondary" id="copy-btn">📋 Copy</button>
          <button class="btn btn-sm btn-secondary" id="download-btn">⬇️ Download</button>
        </div>
      </div>
      <pre id="text-output" style="background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-md);white-space:pre-wrap;word-break:break-word;font-size:var(--text-sm);line-height:1.6;max-height:400px;overflow-y:auto;border:1px solid var(--color-border);"></pre>
    </div>
  `;
  container.appendChild(pipeline);

  const optionsArea = pipeline.querySelector("#options-area");
  const extractBtn = pipeline.querySelector("#extract-btn");
  const processing = pipeline.querySelector("#processing");
  const progressPct = pipeline.querySelector("#progress-pct");
  const resultsArea = pipeline.querySelector("#results-area");
  const textOutput = pipeline.querySelector("#text-output");
  const copyBtn = pipeline.querySelector("#copy-btn");
  const downloadBtn = pipeline.querySelector("#download-btn");
  let extractedText = "";

  extractBtn.addEventListener("click", async () => {
    const file = getInputFile();
    if (!file) return;
    const lang = pipeline.querySelector("#lang-select").value;

    processing.style.display = "block";
    extractBtn.style.display = "none";
    resultsArea.style.display = "none";

    try {
      extractedText = await recognizeText(file, lang, pct => {
        progressPct.textContent = pct;
      });

      textOutput.textContent = extractedText || "(No text found)";
      resultsArea.style.display = "block";
      showToast({ message: "Text extracted!", type: "success" });
    } catch (err) {
      showToast({ message: "Error: " + err.message, type: "error" });
    } finally {
      processing.style.display = "none";
      extractBtn.style.display = "inline-flex";
    }
  });

  copyBtn.addEventListener("click", async () => {
    await copyToClipboard(extractedText);
    showToast({ message: "Copied!", type: "success" });
  });

  downloadBtn.addEventListener("click", () => {
    downloadBlob(new Blob([extractedText], { type: "text/plain" }), filename);
  });

  return {
    onInputReady() {
      optionsArea.style.display = "block";
    },
    reset() {
      optionsArea.style.display = "none";
      resultsArea.style.display = "none";
    }
  };
}
