import { createFileUpload } from "../../components/file-upload.js";
import { createOcrTool } from "./ocr-utils.js";

export const toolConfig = {
  id: "image-to-text",
  name: "Image to Text (OCR)",
  category: "ocr",
  description: "Extract text from images using OCR. Supports 100+ languages.",
  icon: "📝",
  accept: "image/*",
  maxSizeMB: 20,
  keywords: ["image to text", "ocr", "extract text from image"],
  steps: [
    "Upload an image",
    "Select language",
    'Click "Extract Text"',
    "Copy or download the text"
  ],
  faqs: [
    {
      question: "What image formats work?",
      answer: "JPG, PNG, WebP, BMP, GIF — any image your browser can display."
    },
    {
      question: "How accurate is OCR?",
      answer: "Accuracy depends on image quality. Clear, well-lit text gives the best results."
    }
  ]
};

export function render(container) {
  let currentFile = null;

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div id="preview-area"></div>
    </div>
  `;

  const ocr = createOcrTool({
    container,
    getInputFile: () => currentFile,
    filename: "extracted-text.txt"
  });

  const upload = createFileUpload({
    accept: "image/*",
    multiple: false,
    maxSizeMB: 20,
    onFilesSelected: files => {
      currentFile = files[0] || null;
      if (currentFile) {
        previewArea.innerHTML = `<img src="${URL.createObjectURL(currentFile)}" style="max-width:100%;max-height:300px;border-radius:var(--radius-md);border:1px solid var(--color-border);margin:var(--space-4) 0;">`;
        ocr.onInputReady();
      }
    }
  });

  container.querySelector("#upload-area").appendChild(upload.element);
  const previewArea = container.querySelector("#preview-area");
}

export function destroy() {}
