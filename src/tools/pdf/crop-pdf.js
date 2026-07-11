import { loadPdf } from "./pdf-utils.js";
import { createPdfOptionsTool } from "./pdf-options-tool-factory.js";

export const toolConfig = {
  id: "crop-pdf",
  name: "Crop PDF Pages",
  category: "pdf",
  description: "Crop margins from PDF pages.",
  icon: "✂️",
  accept: ".pdf",
  maxSizeMB: 100,
  keywords: ["crop pdf", "trim pdf margins", "cut pdf"],
  steps: [
    "Upload a PDF file",
    "Set crop margins (top, right, bottom, left in points)",
    'Click "Crop PDF"',
    "Download the cropped PDF"
  ],
  faqs: [
    {
      question: "What unit are the margins in?",
      answer: "Margins are in PDF points (1 point = 1/72 inch). 72 points = 1 inch."
    },
    {
      question: "Can I crop individual pages?",
      answer: "Currently all pages are cropped with the same margins."
    }
  ]
};

const FIELDS = [
  { id: "crop-top", key: "top" },
  { id: "crop-right", key: "right" },
  { id: "crop-bottom", key: "bottom" },
  { id: "crop-left", key: "left" }
];

export function render(container) {
  const optionsHTML = `
    <p style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">Set margins in points (72pt = 1 inch). These margins will be removed from each page.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
      <div class="form-group">
        <label>Top (pt)</label>
        <input type="number" id="crop-top" class="text-input" value="0" min="0">
      </div>
      <div class="form-group">
        <label>Right (pt)</label>
        <input type="number" id="crop-right" class="text-input" value="0" min="0">
      </div>
      <div class="form-group">
        <label>Bottom (pt)</label>
        <input type="number" id="crop-bottom" class="text-input" value="0" min="0">
      </div>
      <div class="form-group">
        <label>Left (pt)</label>
        <input type="number" id="crop-left" class="text-input" value="0" min="0">
      </div>
    </div>
    <div class="form-group">
      <label>Quick Presets</label>
      <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
        <button type="button" class="btn btn-sm btn-secondary" data-preset="20,20,20,20">Small (20pt)</button>
        <button type="button" class="btn btn-sm btn-secondary" data-preset="50,50,50,50">Medium (50pt)</button>
        <button type="button" class="btn btn-sm btn-secondary" data-preset="72,72,72,72">Large (1in)</button>
        <button type="button" class="btn btn-sm btn-secondary" data-preset="0,0,0,0">Reset</button>
      </div>
    </div>
  `;

  const { optionsArea } = createPdfOptionsTool({
    container,
    toolId: "crop-pdf",
    optionsHTML,
    actionButtonText: "Crop PDF",
    processingMessage: "Cropping...",
    outputFilename: "cropped.pdf",
    successMessage: "Done!",
    validate: root => {
      const allZero = FIELDS.every(
        f => (parseFloat(root.querySelector(`#${f.id}`).value) || 0) === 0
      );
      return allZero ? "Set at least one margin to crop" : null;
    },
    process: async file => {
      const vals = {};
      for (const f of FIELDS) {
        vals[f.key] = parseFloat(optionsArea.querySelector(`#${f.id}`).value) || 0;
      }

      const pdfDoc = await loadPdf(file);
      const pages = pdfDoc.getPages();

      pages.forEach(page => {
        const { width, height } = page.getSize();
        const newWidth = Math.max(1, width - vals.left - vals.right);
        const newHeight = Math.max(1, height - vals.top - vals.bottom);
        page.setCropBox(vals.left, vals.bottom, newWidth, newHeight);
      });

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      return { blob, successMessage: `Cropped ${pages.length} page(s)!` };
    }
  });

  optionsArea.querySelectorAll("[data-preset]").forEach(btn => {
    btn.addEventListener("click", () => {
      const [t, r, b, l] = btn.dataset.preset.split(",");
      optionsArea.querySelector("#crop-top").value = t;
      optionsArea.querySelector("#crop-right").value = r;
      optionsArea.querySelector("#crop-bottom").value = b;
      optionsArea.querySelector("#crop-left").value = l;
    });
  });
}

export function destroy() {}
