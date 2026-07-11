import { showToast } from "../../components/toast.js";
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

export function render(container) {
  const { optionsArea, runFFmpeg } = createVideoTool({ container });

  optionsArea.innerHTML += `
    <div class="form-group">
      <label>Output Format</label>
      <select id="format-select" class="select-input">
        <option value="mp4" selected>MP4 (H.264 — best compatibility)</option>
        <option value="webm">WebM (VP9 — best for web)</option>
        <option value="avi">AVI (legacy format)</option>
        <option value="mov">MOV (Apple QuickTime)</option>
      </select>
    </div>
    <button class="btn btn-primary btn-lg" id="convert-btn" style="width:100%;">Convert Video</button>
  `;

  const convertBtn = optionsArea.querySelector("#convert-btn");

  convertBtn.addEventListener("click", async () => {
    const format = container.querySelector("#format-select").value;
    const codecMap = {
      mp4: ["-c:v", "libx264", "-c:a", "aac"],
      webm: ["-c:v", "libvpx-vp9", "-c:a", "libopus"],
      avi: ["-c:v", "mpeg4", "-c:a", "mp3"],
      mov: ["-c:v", "libx264", "-c:a", "aac"]
    };
    const mimeMap = {
      mp4: "video/mp4",
      webm: "video/webm",
      avi: "video/x-msvideo",
      mov: "video/quicktime"
    };

    try {
      convertBtn.style.display = "none";
      await runFFmpeg(
        `output.${format}`,
        [...codecMap[format], `output.${format}`],
        mimeMap[format],
        `converted.${format}`
      );
      showToast({ message: `Converted to ${format.toUpperCase()}!`, type: "success" });
    } catch (err) {
      showToast({ message: "Error: " + err.message, type: "error" });
    } finally {
      convertBtn.style.display = "inline-flex";
    }
  });
}

export function destroy() {}
