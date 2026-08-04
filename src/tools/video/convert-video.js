import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";
import { readFFmpegFile } from "./video-utils.js";
import { createVideoTool } from "./video-tool-factory.js";

export const toolConfig = {
  id: "convert-video",
  name: "Video Format Converter",
  category: "video",
  description: "Convert videos between MP4, WebM, AVI, and MOV formats.",
  icon: "🔄",
  accept: "video/*",
  maxSizeMB: 500,
  keywords: ["convert video", "mp4 to webm", "video converter"],
  steps: ["Upload a video", "Choose output format", 'Click "Convert"', "Download converted video"],
  faqs: [
    {
      question: "Which format should I choose?",
      answer: "MP4 for compatibility, WebM for web, MOV for Apple devices."
    }
  ]
};

export const render = createVideoTool({
  maxSizeMB: 500,
  processingText: "Converting...",
  actionBtnLabel: "Convert Video",
  optionsHTML: `
    <div class="form-group">
      <label>Output Format</label>
      <select id="format-select" class="select-input">
        <option value="mp4" selected>MP4 (H.264 — best compatibility)</option>
        <option value="webm">WebM (VP8 — best for web)</option>
        <option value="avi">AVI (legacy format)</option>
        <option value="mov">MOV (Apple QuickTime)</option>
      </select>
    </div>
  `,
  async onProcess(ffmpeg, inputName, videoInfo, tctx) {
    const format = tctx.getValue("format-select");
    const codecMap = {
      mp4: ["-c:v", "libx264", "-preset", "fast", "-c:a", "aac"],
      webm: ["-c:v", "libvpx", "-c:a", "libopus"],
      avi: ["-c:v", "mpeg4", "-c:a", "mp3"],
      mov: ["-c:v", "libx264", "-preset", "fast", "-c:a", "aac"]
    };
    const mimeMap = {
      mp4: "video/mp4",
      webm: "video/webm",
      avi: "video/x-msvideo",
      mov: "video/quicktime"
    };

    const outputName = `output.${format}`;
    await ffmpeg.exec(["-i", inputName, ...codecMap[format], outputName]);

    const blob = await readFFmpegFile(ffmpeg, outputName, mimeMap[format]);
    downloadBlob(blob, `converted.${format}`);
    showToast({ message: `Converted to ${format.toUpperCase()}!`, type: "success" });

    await ffmpeg.deleteFile(outputName);
  }
});

export function destroy() {}
