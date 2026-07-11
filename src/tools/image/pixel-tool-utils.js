import { downloadBlob } from "../../utils/file.js";
import { canvasToBlob } from "./image-utils.js";
import { showToast } from "../../components/toast.js";

/**
 * Scale an image to fit a max width and draw it onto a preview canvas.
 * Returns the display dimensions and scale factor for further use.
 */
export function setupPreviewCanvas(previewCanvas, originalImage, container, maxWidth = 600) {
  const maxW = Math.min(maxWidth, container.parentElement.clientWidth - 40);
  const scale = maxW / originalImage.naturalWidth;
  const displayW = Math.round(originalImage.naturalWidth * scale);
  const displayH = Math.round(originalImage.naturalHeight * scale);
  previewCanvas.width = displayW;
  previewCanvas.height = displayH;
  const ctx = previewCanvas.getContext("2d");
  ctx.clearRect(0, 0, displayW, displayH);
  ctx.drawImage(originalImage, 0, 0, displayW, displayH);
  return { width: displayW, height: displayH, scale };
}

/**
 * Convert a mouse event into canvas-internal coordinates, accounting for CSS scaling.
 */
export function getCanvasCoords(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height)
  };
}

/**
 * Attach drag-to-select rectangle behavior to a canvas.
 * Calls onChange(selection | null) on every state change. Returns a getter for current selection.
 */
export function attachDragSelection(canvas, onChange) {
  let isDragging = false;
  let selStart = { x: 0, y: 0 };
  let selection = null;

  canvas.addEventListener("mousedown", e => {
    isDragging = true;
    selStart = getCanvasCoords(e, canvas);
    selection = null;
    onChange(selection);
  });

  canvas.addEventListener("mousemove", e => {
    if (!isDragging) return;
    const current = getCanvasCoords(e, canvas);
    selection = {
      x: Math.min(selStart.x, current.x),
      y: Math.min(selStart.y, current.y),
      w: Math.abs(current.x - selStart.x),
      h: Math.abs(current.y - selStart.y)
    };
    onChange(selection);
  });

  canvas.addEventListener("mouseup", () => {
    isDragging = false;
    if (selection && (selection.w < 5 || selection.h < 5)) {
      selection = null;
      onChange(selection);
    }
  });

  canvas.addEventListener("mouseleave", () => {
    isDragging = false;
  });

  return () => selection;
}

/**
 * Build a full-size canvas, draw the original image, apply a transform, and download as PNG.
 * Shows success/error toast.
 */
export async function downloadTransformedImage(originalImage, transform, filename, successMsg) {
  const canvas = document.createElement("canvas");
  canvas.width = originalImage.naturalWidth;
  canvas.height = originalImage.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(originalImage, 0, 0);
  transform(ctx, canvas.width, canvas.height);
  const blob = await canvasToBlob(canvas, "image/png");
  downloadBlob(blob, filename);
  showToast(successMsg, "success");
  return blob;
}
