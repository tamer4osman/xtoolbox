import { downloadBlob } from "../../utils/file.js";

/**
 * Load an image from File into an HTMLImageElement
 */
export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Draw image to canvas with given dimensions
 */
export function drawImageToCanvas(img, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

/**
 * Convert canvas to Blob
 */
export function canvasToBlob(canvas, type = "image/png", quality = 0.92) {
  return new Promise(resolve => canvas.toBlob(resolve, type, quality));
}

/**
 * Get image dimensions from File
 */
export async function getImageDimensions(file) {
  const img = await loadImageFromFile(file);
  return { width: img.naturalWidth, height: img.naturalHeight };
}

/**
 * Load image and return canvas with original dimensions
 */
export async function fileToCanvas(file) {
  const img = await loadImageFromFile(file);
  return drawImageToCanvas(img, img.naturalWidth, img.naturalHeight);
}

/**
 * Download canvas as image file
 */
export async function downloadCanvas(canvas, filename, type = "image/png", quality = 0.92) {
  const blob = await canvasToBlob(canvas, type, quality);
  downloadBlob(blob, filename);
}

/**
 * Apply CSS filter to canvas and return new canvas
 */
export function applyFilter(canvas, filterString) {
  const newCanvas = document.createElement("canvas");
  newCanvas.width = canvas.width;
  newCanvas.height = canvas.height;
  const ctx = newCanvas.getContext("2d");
  ctx.filter = filterString;
  ctx.drawImage(canvas, 0, 0);
  return newCanvas;
}

/**
 * Get pixel data from canvas for manipulation
 */
export function getPixelData(canvas) {
  const ctx = canvas.getContext("2d");
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Put pixel data back to canvas
 */
export function putPixelData(canvas, imageData) {
  const ctx = canvas.getContext("2d");
  ctx.putImageData(imageData, 0, 0);
}
