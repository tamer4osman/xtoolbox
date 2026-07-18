import { formatFileSize, downloadBlob } from "../../utils/file.js";

let ffmpegInstance = null;
let ffmpegLoading = false;

/**
 * Load and cache FFmpeg instance
 */
export async function loadFFmpeg(onProgress) {
  if (ffmpegInstance) return ffmpegInstance;
  if (ffmpegLoading) {
    // Wait for existing load
    while (ffmpegLoading) await new Promise(r => setTimeout(r, 100));
    return ffmpegInstance;
  }

  ffmpegLoading = true;
  try {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");

    const ffmpeg = new FFmpeg();
    ffmpeg.on("progress", ({ progress }) => {
      if (onProgress) onProgress(Math.round(progress * 100));
    });

    await ffmpeg.load({
      coreURL: "/ffmpeg-core/ffmpeg-core.js",
      wasmURL: "/ffmpeg-core/ffmpeg-core.wasm"
    });

    ffmpegInstance = ffmpeg;
    return ffmpeg;
  } finally {
    ffmpegLoading = false;
  }
}

/**
 * Get video info from file
 */
export async function getVideoInfo(file) {
  return new Promise(resolve => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        type: file.type,
        name: file.name
      });
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => {
      resolve({
        duration: 0,
        width: 0,
        height: 0,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        type: file.type,
        name: file.name
      });
    };
    video.src = URL.createObjectURL(file);
  });
}

/**
 * Format seconds to HH:MM:SS
 */
export function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Write file to FFmpeg virtual filesystem
 */
export async function writeUploadedFile(ffmpeg, file, filename) {
  const { fetchFile } = await import("@ffmpeg/util");
  const data = await fetchFile(file);
  await ffmpeg.writeFile(filename, data);
}

/**
 * Read file from FFmpeg virtual filesystem as Blob
 */
export async function readFFmpegFile(ffmpeg, filename, mimeType) {
  const data = await ffmpeg.readFile(filename);
  return new Blob([data.buffer], { type: mimeType });
}

/**
 * Read FFmpeg output, download it, and clean up
 */
export async function downloadVideoOutput(ffmpeg, outputName, downloadName, ext) {
  const mimeType = ext === "webm" ? "video/webm" : "video/mp4";
  try {
    const blob = await readFFmpegFile(ffmpeg, outputName, mimeType);
    downloadBlob(blob, downloadName);
  } finally {
    await ffmpeg.deleteFile(outputName);
  }
}

/**
 * Create a video preview element
 */
export function createVideoPreview(file) {
  const container = document.createElement("div");
  container.style.cssText = "text-align:center;margin:var(--space-4) 0;";

  const video = document.createElement("video");
  video.controls = true;
  video.style.cssText = "max-width:100%;max-height:400px;border-radius:var(--radius-md);";
  video.src = URL.createObjectURL(file);

  container.appendChild(video);
  return { element: container, video };
}
