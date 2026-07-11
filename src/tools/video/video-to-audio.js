import { showToast } from "../../components/toast.js";
import { formatFileSize } from "../../utils/file.js";
import { createVideoTool } from "./video-tool-factory.js";

export const toolConfig = {
  id: "video-to-audio",
  name: "Video to Audio",
  category: "video",
  description: "Extract audio track from video files. Save as MP3 or WAV.",
  icon: "🎵",
  accept: "video/*",
  maxSizeMB: 500,
  keywords: ["video to audio", "extract audio", "mp4 to mp3"],
  steps: ["Upload a video", "Choose audio format", 'Click "Extract"', "Download audio"],
  faqs: [{ question: "What formats can I extract?", answer: "MP3, WAV, and AAC." }]
};

export function render(container) {
  const { optionsArea, runFFmpeg } = createVideoTool({ container });

  optionsArea.innerHTML += `
    <div class="form-group">
      <label>Audio Format</label>
      <select id="format-select" class="select-input">
        <option value="mp3" selected>MP3 (compressed, small file)</option>
        <option value="wav">WAV (uncompressed, best quality)</option>
        <option value="aac">AAC (good quality, small file)</option>
      </select>
    </div>
    <button class="btn btn-primary btn-lg" id="extract-btn" style="width:100%;">Extract Audio</button>
  `;

  const extractBtn = optionsArea.querySelector("#extract-btn");

  extractBtn.addEventListener("click", async () => {
    const format = container.querySelector("#format-select").value;
    const codecMap = { mp3: "libmp3lame", wav: "pcm_s16le", aac: "aac" };
    const mimeMap = { mp3: "audio/mpeg", wav: "audio/wav", aac: "audio/aac" };

    try {
      extractBtn.style.display = "none";
      const blob = await runFFmpeg(
        `audio.${format}`,
        ["-vn", "-acodec", codecMap[format], "-ab", "192k", `audio.${format}`],
        mimeMap[format],
        `extracted.${format}`
      );
      showToast({
        message: `Audio extracted as ${format.toUpperCase()}! (${formatFileSize(blob.size)})`,
        type: "success"
      });
    } catch (err) {
      showToast({ message: "Error: " + err.message, type: "error" });
    } finally {
      extractBtn.style.display = "inline-flex";
    }
  });
}

export function destroy() {}
