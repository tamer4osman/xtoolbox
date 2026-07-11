import { createOcrTool } from "./ocr-utils.js";

export const toolConfig = {
  id: "screenshot-to-text",
  name: "Screenshot to Text",
  category: "ocr",
  description: "Paste a screenshot or image from clipboard and extract text.",
  icon: "📋",
  accept: "image/*",
  maxSizeMB: 20,
  keywords: ["screenshot to text", "clipboard ocr", "paste image text"],
  steps: [
    "Take a screenshot (Print Screen)",
    "Paste it here (Ctrl+V)",
    "Select language",
    "Extract text"
  ],
  faqs: [
    {
      question: "How do I paste a screenshot?",
      answer:
        "Take a screenshot with Print Screen or Snipping Tool, then press Ctrl+V in this page."
    },
    {
      question: "Can I also upload an image?",
      answer: "Yes! You can paste from clipboard or upload a file."
    }
  ]
};

export function render(container) {
  let imageBlob = null;

  container.innerHTML = `
    <div class="tool-layout">
      <div id="paste-area" style="border:2px dashed var(--color-border);border-radius:var(--radius-lg);padding:var(--space-10) var(--space-6);text-align:center;cursor:pointer;transition:border-color 0.2s,background 0.2s;background:var(--color-surface);">
        <div style="font-size:3rem;margin-bottom:var(--space-4);">📋</div>
        <p style="font-size:var(--text-lg);font-weight:500;margin-bottom:var(--space-2);">Paste an image here (Ctrl+V)</p>
        <p style="font-size:var(--text-sm);color:var(--color-text-muted);margin-bottom:var(--space-4);">or click to upload a file</p>
        <input type="file" id="file-input" accept="image/*" style="display:none;">
        <button class="btn btn-secondary" id="upload-btn">Browse Files</button>
      </div>
      <div id="preview-area" style="display:none;text-align:center;margin:var(--space-4) 0;"></div>
    </div>
  `;

  const ocr = createOcrTool({
    container,
    getInputFile: () => imageBlob,
    filename: "extracted-text.txt"
  });

  const pasteArea = container.querySelector("#paste-area");
  const fileInput = container.querySelector("#file-input");
  const uploadBtn = container.querySelector("#upload-btn");
  const previewArea = container.querySelector("#preview-area");

  function handleImage(blob) {
    imageBlob = blob;
    previewArea.innerHTML = `<img src="${URL.createObjectURL(blob)}" style="max-width:100%;max-height:300px;border-radius:var(--radius-md);border:1px solid var(--color-border);">`;
    previewArea.style.display = "block";
    ocr.onInputReady();
    pasteArea.style.display = "none";
  }

  document.addEventListener("paste", e => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        handleImage(item.getAsFile());
        return;
      }
    }
  });

  pasteArea.addEventListener("click", () => fileInput.click());
  uploadBtn.addEventListener("click", e => {
    e.stopPropagation();
    fileInput.click();
  });
  fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) handleImage(fileInput.files[0]);
  });

  pasteArea.addEventListener("dragover", e => {
    e.preventDefault();
    pasteArea.style.borderColor = "var(--color-primary)";
    pasteArea.style.background = "var(--color-primary-light)";
  });
  pasteArea.addEventListener("dragleave", () => {
    pasteArea.style.borderColor = "var(--color-border)";
    pasteArea.style.background = "var(--color-surface)";
  });
  pasteArea.addEventListener("drop", e => {
    e.preventDefault();
    pasteArea.style.borderColor = "var(--color-border)";
    pasteArea.style.background = "var(--color-surface)";
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleImage(file);
  });
}

export function destroy() {}
