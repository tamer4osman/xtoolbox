import { createVideoConverter } from "./video-converter-factory.js";

export const toolConfig = {
  id: "gif-to-mp4",
  name: "GIF to MP4",
  category: "video",
  description: "Convert animated GIF to MP4 video. MP4 is smaller and plays on all devices.",
  icon: "🎬",
  accept: ".gif,image/gif",
  maxSizeMB: 100,
  keywords: ["gif to mp4", "gif converter", "gif to video"],
  steps: ["Upload a GIF", "Choose quality preset", 'Click "Convert"', "Download MP4"],
  faqs: [
    {
      question: "Why convert GIF to MP4?",
      answer: "MP4 files are typically 90% smaller than GIFs with better quality."
    },
    {
      question: "Will the animation still play?",
      answer: "Yes! The full animation is preserved as an MP4 video."
    }
  ]
};

export function render(container) {
  const optionsHTML = `
    <div class="form-group">
      <label>Quality</label>
      <select id="quality-select" class="select-input">
        <option value="medium" selected>Medium (good quality, small file)</option>
        <option value="high">High (great quality, larger file)</option>
        <option value="max">Maximum (best quality, largest file)</option>
      </select>
    </div>
  `;

  createVideoConverter({
    container,
    toolId: "gif-to-mp4",
    optionsHTML,
    actionButtonText: "Convert to MP4",
    processingMessage: "Converting...",
    outputFilename: "output.mp4",
    successMessage: "Converted to MP4!",
    getInputFilename: name => "input.gif",
    getPreviewHTML: file =>
      `<img src="${URL.createObjectURL(file)}" style="max-width:100%;max-height:300px;border-radius:var(--radius-md);border:1px solid var(--color-border);">`,
    getOutputExtension: /\.gif$/i
  });
}

export function destroy() {}
