import { createImageFilterTool } from "./image-filter-tool.js";

export const toolConfig = {
  id: "grayscale-sepia",
  name: "Grayscale & Sepia Filter",
  category: "image",
  description: "Apply grayscale, sepia, or invert filters to images.",
  icon: "🎨",
  accept: "image/*",
  maxSizeMB: 50,
  keywords: ["grayscale", "sepia", "black and white", "image filter"],
  steps: ["Upload an image", "Choose a filter", "Preview", "Download"],
  faqs: [
    {
      question: "Can I combine filters?",
      answer: "Currently one filter at a time. You can download and re-upload to stack filters."
    }
  ]
};

const filterMap = {
  none: "none",
  grayscale: "grayscale(100%)",
  sepia: "sepia(100%)",
  invert: "invert(100%)",
  warm: "sepia(30%) saturate(140%) brightness(105%)",
  cool: "saturate(80%) hue-rotate(20deg) brightness(105%)",
  vintage: "sepia(40%) contrast(120%) brightness(90%) saturate(80%)"
};

export const render = createImageFilterTool({
  optionsHTML: `
    <div style="display:flex;gap:var(--space-3);justify-content:center;flex-wrap:wrap;margin-bottom:var(--space-4);">
      <button class="btn btn-secondary filter-btn active" data-filter="none">Original</button>
      <button class="btn btn-secondary filter-btn" data-filter="grayscale">Grayscale</button>
      <button class="btn btn-secondary filter-btn" data-filter="sepia">Sepia</button>
      <button class="btn btn-secondary filter-btn" data-filter="invert">Invert</button>
      <button class="btn btn-secondary filter-btn" data-filter="warm">Warm</button>
      <button class="btn btn-secondary filter-btn" data-filter="cool">Cool</button>
      <button class="btn btn-secondary filter-btn" data-filter="vintage">Vintage</button>
    </div>
  `,
  getFilter: t => filterMap[t.currentFilter],
  filename: t => `filtered-${t.currentFilter}.png`,
  onReady: ({ container, tctx, updatePreview }) => {
    tctx.currentFilter = "none";
    container.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        tctx.currentFilter = btn.dataset.filter;
        container.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        updatePreview();
      });
    });
  }
});

export function destroy() {}
