import { createVideoConverter } from "./video-converter-factory.js";

export const toolConfig = {
  id: "webm-to-mp4",
  name: "WEBM to MP4",
  category: "video",
  description: "Convert WEBM videos to MP4 format. Make your videos playable on all devices.",
  icon: "🔄",
  accept: ".webm,video/webm",
  maxSizeMB: 500,
  keywords: ["webm to mp4", "webm converter", "webm to video"],
  steps: ["Upload a WEBM file", "Choose quality preset", 'Click "Convert"', "Download MP4"],
  faqs: [
    {
      question: "Why convert WEBM to MP4?",
      answer:
        "MP4 is the most widely supported video format — it plays on all devices, browsers, and platforms."
    },
    {
      question: "Will I lose quality?",
      answer:
        "At High/Maximum settings, visual quality is virtually identical while ensuring broad compatibility."
    }
  ]
};

export function render(container) {
  const optionsHTML = `
    <div class="form-group">
      <label>Quality</label>
      <select id="quality-select" class="select-input">
        <option value="medium" selected>Medium (good quality, smaller file)</option>
        <option value="high">High (great quality, larger file)</option>
        <option value="max">Maximum (best quality, largest file)</option>
      </select>
    </div>
  `;

  createVideoConverter({
    container,
    toolId: "webm-to-mp4",
    optionsHTML,
    actionButtonText: "Convert to MP4",
    processingMessage: "Converting...",
    outputFilename: "output.mp4",
    successMessage: "Converted to MP4!",
    getInputFilename: () => "input.webm",
    includeAudioCodec: true,
    getPreviewHTML:
      file => `<video controls style="max-width:100%;max-height:300px;border-radius:var(--radius-md);border:1px solid var(--color-border);">
        <source src="${URL.createObjectURL(file)}" type="video/webm">
      </video>`,
    getOutputExtension: /\.webm$/i
  });
}

export function destroy() {}
