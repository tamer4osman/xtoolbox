import { createMergeTool } from "../shared/merge-tool-factory.js";
import {
  loadAudioFile,
  audioBufferToWav,
  concatAudioBuffers,
  formatAudioTime
} from "./audio-utils.js";

export const toolConfig = {
  id: "merge-audio",
  name: "Audio Merger",
  category: "audio",
  description: "Combine multiple audio files into one.",
  icon: "🔗",
  accept: "audio/*",
  maxSizeMB: 100,
  keywords: ["merge audio", "combine audio", "join audio"],
  steps: [
    "Upload multiple audio files",
    "Reorder if needed",
    'Click "Merge"',
    "Download merged audio"
  ],
  faqs: [
    {
      question: "Can I merge different formats?",
      answer: "Yes. All files are decoded and merged as WAV."
    }
  ]
};

export function render(container) {
  createMergeTool({
    id: toolConfig.id,
    name: toolConfig.name,
    category: toolConfig.category,
    icon: toolConfig.icon,
    accept: toolConfig.accept,
    maxSizeMB: toolConfig.maxSizeMB,
    keywords: toolConfig.keywords,
    steps: toolConfig.steps,
    faqs: toolConfig.faqs,
    buttonText: "Merge Audio Files",
    successMessage: (files, result) =>
      `${files.length} files merged! (${formatAudioTime(result.duration)})`,
    async mergeFiles(files, downloadBlob) {
      const buffers = [];
      for (const file of files) {
        buffers.push(await loadAudioFile(file));
      }
      const merged = concatAudioBuffers(buffers);
      const blob = audioBufferToWav(merged);
      downloadBlob(blob, "merged.wav");
      return merged;
    }
  }).render(container);
}

export function destroy() {}
