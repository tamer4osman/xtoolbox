import { showToast } from "../../components/toast.js";
import { createVideoTool } from "./video-tool-factory.js";

export const toolConfig = {
  id: "mute-video",
  name: "Mute Video",
  category: "video",
  description: "Remove audio track from a video file.",
  icon: "🔇",
  accept: "video/*",
  maxSizeMB: 500,
  keywords: ["mute video", "remove audio", "silent video"],
  steps: ["Upload a video", 'Click "Remove Audio"', "Download muted video"],
  faqs: [
    {
      question: "Does this affect video quality?",
      answer: "No. Only the audio track is removed. Video quality is preserved."
    }
  ]
};

export const render = createVideoTool({
  maxSizeMB: 500,
  processingText: "Processing...",
  actionBtnLabel: "🔇 Remove Audio & Download",
  optionsHTML: "",
  async onProcess(ffmpeg, inputName) {
    const outputName = "output.mp4";
    await ffmpeg.exec(["-i", inputName, "-an", "-c:v", "copy", outputName]);

    const { readFFmpegFile } = await import("./video-utils.js");
    const { downloadBlob } = await import("../../utils/file.js");
    const blob = await readFFmpegFile(ffmpeg, outputName, "video/mp4");
    downloadBlob(blob, "muted.mp4");
    showToast({ message: "Audio removed!", type: "success" });

    await ffmpeg.deleteFile(outputName);
  }
});

export function destroy() {}
