import { createVideoConverter } from "./video-converter-factory.js";

export const toolConfig = {
  id: "mov-to-mp4",
  name: "MOV to MP4",
  category: "video",
  description: "Convert MOV videos from iPhones and cameras to MP4 format for universal playback.",
  icon: "📱",
  accept: ".mov,video/quicktime",
  maxSizeMB: 500,
  keywords: ["mov to mp4", "quicktime to mp4", "iphone video converter"],
  steps: ["Upload a MOV file", "Choose quality preset", 'Click "Convert"', "Download MP4"],
  faqs: [
    {
      question: "Why convert MOV to MP4?",
      answer:
        "MP4 is more widely supported — it plays on all devices, browsers, and social media platforms."
    },
    {
      question: "Will I lose quality?",
      answer: "At High/Maximum settings, the quality is virtually identical to the original MOV."
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
    toolId: "mov-to-mp4",
    optionsHTML,
    actionButtonText: "Convert to MP4",
    processingMessage: "Converting...",
    outputFilename: "output.mp4",
    successMessage: "Converted to MP4!",
    getInputFilename: () => "input.mov",
    includeAudioCodec: true,
    getPreviewHTML:
      file => `<video controls style="max-width:100%;max-height:300px;border-radius:var(--radius-md);border:1px solid var(--color-border);">
        <source src="${URL.createObjectURL(file)}" type="video/quicktime">
      </video>`,
    getOutputExtension: /\.mov$/i
  });
}

export function destroy() {}
