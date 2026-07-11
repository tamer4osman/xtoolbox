import { showToast } from "../../components/toast.js";
import { downloadBlob, formatFileSize } from "../../utils/file.js";
import { readFFmpegFile, formatTime } from "./video-utils.js";
import { createVideoTool } from "./video-tool-factory.js";

export const toolConfig = {
  id: "compress-video",
  name: "Video Compressor",
  category: "video",
  description: "Reduce video file size by adjusting quality, resolution, and bitrate.",
  icon: "📦",
  accept: "video/*",
  maxSizeMB: 500,
  keywords: ["compress video", "reduce video size", "video compressor"],
  steps: [
    "Upload a video",
    "Choose quality and resolution",
    'Click "Compress"',
    "Download compressed video"
  ],
  faqs: [
    {
      question: "How much can I compress?",
      answer: "Typically 30-70% reduction depending on settings."
    },
    {
      question: "Does compression reduce quality?",
      answer: "Lower quality settings will reduce visual quality."
    }
  ]
};

export const render = createVideoTool({
  maxSizeMB: 500,
  processingText: "Compressing...",
  actionBtnLabel: "Compress Video",
  optionsHTML: `
    <div class="stats-row" style="margin-bottom:var(--space-4);">
      <div class="stat"><span class="stat-label">Size</span><span class="stat-value" id="original-size">-</span></div>
      <div class="stat"><span class="stat-label">Resolution</span><span class="stat-value" id="original-dims">-</span></div>
      <div class="stat"><span class="stat-label">Duration</span><span class="stat-value" id="original-duration">-</span></div>
    </div>
    <div class="form-group">
      <label>Quality</label>
      <select id="quality-select" class="select-input">
        <option value="high">High (larger file)</option>
        <option value="medium" selected>Medium (balanced)</option>
        <option value="low">Low (smallest file)</option>
      </select>
    </div>
    <div class="form-group">
      <label>Resolution</label>
      <select id="resolution-select" class="select-input">
        <option value="original">Original</option>
        <option value="1920:1080">1080p</option>
        <option value="1280:720" selected>720p</option>
        <option value="854:480">480p</option>
        <option value="640:360">360p</option>
      </select>
    </div>
  `,
  onFileLoaded(info, tctx) {
    tctx.query("#original-size").textContent = info.sizeFormatted;
    tctx.query("#original-dims").textContent = `${info.width}×${info.height}`;
    tctx.query("#original-duration").textContent = formatTime(info.duration);
  },
  async onProcess(ffmpeg, inputName, videoInfo, tctx) {
    const quality = tctx.getValue("quality-select");
    const resolution = tctx.getValue("resolution-select");
    const outputName = "compressed.mp4";

    const bitrateMap = { high: "2M", medium: "1M", low: "500k" };
    const args = ["-i", inputName, "-b:v", bitrateMap[quality]];
    if (resolution !== "original") args.push("-s", resolution);
    args.push("-c:a", "aac", "-b:a", "128k", outputName);

    await ffmpeg.exec(args);

    const blob = await readFFmpegFile(ffmpeg, outputName, "video/mp4");
    downloadBlob(blob, `compressed-${quality}.mp4`);
    showToast({
      message: `Compressed from ${formatFileSize(videoInfo.size)} to ${formatFileSize(blob.size)}!`,
      type: "success"
    });

    await ffmpeg.deleteFile(outputName);
  }
});

export function destroy() {}
