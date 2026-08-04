import { showToast } from "../../components/toast.js";
import { formatFileSize, downloadBlob } from "../../utils/file.js";
import { readFFmpegFile } from "./video-utils.js";
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

export const render = createVideoTool({
  maxSizeMB: 500,
  processingText: "Extracting audio...",
  actionBtnLabel: "Extract Audio",
  optionsHTML: `
    <div class="form-group">
      <label>Audio Format</label>
      <select id="format-select" class="select-input">
        <option value="mp3" selected>MP3 (compressed, small file)</option>
        <option value="wav">WAV (uncompressed, best quality)</option>
        <option value="aac">AAC (good quality, small file)</option>
      </select>
    </div>
  `,
  async onProcess(ffmpeg, inputName, videoInfo, tctx) {
    const format = tctx.getValue("format-select");
    const codecMap = { mp3: "libmp3lame", wav: "pcm_s16le", aac: "aac" };
    const mimeMap = { mp3: "audio/mpeg", wav: "audio/wav", aac: "audio/aac" };

    const outputName = `audio.${format}`;
    await ffmpeg.exec([
      "-i",
      inputName,
      "-vn",
      "-acodec",
      codecMap[format],
      "-ab",
      "192k",
      outputName
    ]);

    const blob = await readFFmpegFile(ffmpeg, outputName, mimeMap[format]);
    downloadBlob(blob, `extracted.${format}`);
    showToast({
      message: `Audio extracted as ${format.toUpperCase()}! (${formatFileSize(blob.size)})`,
      type: "success"
    });

    await ffmpeg.deleteFile(outputName);
  }
});

export function destroy() {}
