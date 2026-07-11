import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob, formatFileSize } from "../../utils/file.js";
import { loadFFmpeg, writeUploadedFile, readFFmpegFile } from "../video/video-utils.js";

export const toolConfig = {
  id: "convert-audio",
  name: "Audio Converter",
  category: "audio",
  description: "Convert audio between MP3, WAV, OGG, FLAC, and AAC formats.",
  icon: "🔄",
  accept: "audio/*",
  maxSizeMB: 100,
  keywords: ["convert audio", "mp3 to wav", "audio converter"],
  steps: [
    "Upload an audio file",
    "Choose output format",
    'Click "Convert"',
    "Download converted audio"
  ],
  faqs: [
    {
      question: "Which format should I choose?",
      answer: "MP3 for compatibility, WAV for quality, OGG for web, FLAC for archival."
    }
  ]
};

export function render(container) {
  let currentFile = null;

  const upload = createFileUpload({
    accept: "audio/*",
    multiple: false,
    maxSizeMB: 100,
    onFilesSelected: files => {
      currentFile = files[0] || null;
      if (currentFile) {
        fileInfo.textContent = `${currentFile.name} (${formatFileSize(currentFile.size)})`;
        optionsArea.style.display = "block";
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div id="file-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">-</div>
        <div class="form-group">
          <label>Output Format</label>
          <select id="format-select" class="select-input">
            <option value="mp3" selected>MP3 (compressed, universal)</option>
            <option value="wav">WAV (uncompressed, best quality)</option>
            <option value="ogg">OGG (open source, good compression)</option>
            <option value="flac">FLAC (lossless, larger than MP3)</option>
            <option value="aac">AAC (good quality, Apple-friendly)</option>
          </select>
        </div>
        <div class="form-group" id="bitrate-group">
          <label>Bitrate</label>
          <select id="bitrate-select" class="select-input">
            <option value="128k">128 kbps</option>
            <option value="192k" selected>192 kbps</option>
            <option value="256k">256 kbps</option>
            <option value="320k">320 kbps</option>
          </select>
        </div>
        <button class="btn btn-primary btn-lg" id="convert-btn" style="width:100%;">Convert & Download</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Converting...</p></div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const optionsArea = container.querySelector("#options-area");
  const fileInfo = container.querySelector("#file-info");
  const convertBtn = container.querySelector("#convert-btn");
  const processing = container.querySelector("#processing");

  container.querySelector("#format-select").addEventListener("change", e => {
    container.querySelector("#bitrate-group").style.display =
      e.target.value === "wav" ? "none" : "block";
  });

  convertBtn.addEventListener("click", async () => {
    if (!currentFile) return;
    const format = container.querySelector("#format-select").value;
    const bitrate = container.querySelector("#bitrate-select").value;

    processing.style.display = "block";
    convertBtn.style.display = "none";

    try {
      const ffmpeg = await loadFFmpeg();
      const ext = currentFile.name.split(".").pop() || "mp3";
      await writeUploadedFile(ffmpeg, currentFile, `input.${ext}`);

      const codecMap = {
        mp3: "libmp3lame",
        wav: "pcm_s16le",
        ogg: "libvorbis",
        flac: "flac",
        aac: "aac"
      };
      const outputName = `output.${format}`;
      const args = ["-i", `input.${ext}`, "-acodec", codecMap[format]];
      if (format !== "wav" && format !== "flac") args.push("-ab", bitrate);
      args.push(outputName);

      await ffmpeg.exec(args);

      const mimeMap = {
        mp3: "audio/mpeg",
        wav: "audio/wav",
        ogg: "audio/ogg",
        flac: "audio/flac",
        aac: "audio/aac"
      };
      const blob = await readFFmpegFile(ffmpeg, outputName, mimeMap[format]);
      downloadBlob(blob, `converted.${format}`);
      showToast({ message: `Converted to ${format.toUpperCase()}!`, type: "success" });

      await ffmpeg.deleteFile(`input.${ext}`);
      await ffmpeg.deleteFile(outputName);
    } catch (err) {
      showToast({ message: "Error: " + err.message, type: "error" });
    } finally {
      processing.style.display = "none";
      convertBtn.style.display = "inline-flex";
    }
  });
}

export function destroy() {}
