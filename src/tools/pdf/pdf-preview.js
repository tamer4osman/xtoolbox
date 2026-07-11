export const toolConfig = {
  id: "pdf-preview",
  name: "PDF Previewer",
  category: "pdf",
  description: "Preview PDF pages and thumbnails.",
  icon: "👁️",
  status: "done"
};

import { renderAllPages } from "./pdf-utils.js";

/**
 * Create a PDF page preview component with thumbnails
 * @param {Object} opts
 * @param {File} opts.file - PDF file
 * @param {boolean} opts.selectable - Show checkboxes for page selection
 * @param {boolean} opts.reorderable - Allow drag-and-drop reordering
 * @param {Function} opts.onSelectionChange - Callback(selectedIndices)
 * @param {Function} opts.onReorder - Callback(newOrder)
 * @returns {Promise<{ element: HTMLElement, getSelectedPages: () => number[], getPageOrder: () => number[] }>}
 */
export async function createPdfPreview({
  file,
  selectable = false,
  reorderable = false,
  onSelectionChange,
  onReorder
}) {
  const container = document.createElement("div");
  container.className = "pdf-preview";
  container.style.cssText =
    "display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:var(--space-4);margin:var(--space-4) 0;";

  // Show loading state
  container.innerHTML =
    '<div style="grid-column:1/-1;text-align:center;padding:var(--space-8);"><div class="spinner"></div><p>Rendering pages...</p></div>';

  const pages = await renderAllPages(file, 0.3);
  let selectedPages = new Set(pages.map((_, i) => i));
  let pageOrder = pages.map((_, i) => i);
  let draggedIndex = null;

  function render() {
    container.innerHTML = "";
    pageOrder.forEach((originalIndex, displayIndex) => {
      const canvas = pages[originalIndex];
      const thumb = document.createElement("div");
      thumb.style.cssText =
        "position:relative;border:2px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;cursor:pointer;transition:border-color 0.2s;";
      if (selectedPages.has(originalIndex)) {
        thumb.style.borderColor = "var(--color-primary)";
      }

      const img = document.createElement("img");
      img.src = canvas.toDataURL();
      img.style.cssText = "width:100%;display:block;";
      img.alt = `Page ${originalIndex + 1}`;

      const label = document.createElement("div");
      label.style.cssText =
        "position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.7);color:white;font-size:var(--text-xs);text-align:center;padding:2px;";
      label.textContent = `Page ${originalIndex + 1}`;

      thumb.appendChild(img);
      thumb.appendChild(label);

      if (selectable) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = selectedPages.has(originalIndex);
        checkbox.style.cssText =
          "position:absolute;top:4px;right:4px;width:18px;height:18px;accent-color:var(--color-primary);";
        checkbox.addEventListener("change", () => {
          if (checkbox.checked) selectedPages.add(originalIndex);
          else selectedPages.delete(originalIndex);
          thumb.style.borderColor = checkbox.checked
            ? "var(--color-primary)"
            : "var(--color-border)";
          if (onSelectionChange) onSelectionChange(Array.from(selectedPages));
        });
        thumb.appendChild(checkbox);
      }

      if (reorderable) {
        thumb.draggable = true;
        thumb.addEventListener("dragstart", () => {
          draggedIndex = displayIndex;
          thumb.style.opacity = "0.5";
        });
        thumb.addEventListener("dragend", () => {
          thumb.style.opacity = "1";
          draggedIndex = null;
        });
        thumb.addEventListener("dragover", e => {
          e.preventDefault();
          thumb.style.borderColor = "var(--color-secondary)";
        });
        thumb.addEventListener("dragleave", () => {
          thumb.style.borderColor = selectedPages.has(originalIndex)
            ? "var(--color-primary)"
            : "var(--color-border)";
        });
        thumb.addEventListener("drop", e => {
          e.preventDefault();
          if (draggedIndex !== null && draggedIndex !== displayIndex) {
            const item = pageOrder.splice(draggedIndex, 1)[0];
            pageOrder.splice(displayIndex, 0, item);
            render();
            if (onReorder) onReorder(pageOrder);
          }
        });
      }

      container.appendChild(thumb);
    });
  }

  render();

  return {
    element: container,
    getSelectedPages: () => Array.from(selectedPages),
    getPageOrder: () => [...pageOrder]
  };
}
