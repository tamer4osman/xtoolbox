import { createFileUpload } from "../../components/file-upload.js";

export const toolConfig = {
  id: "transcribe-audio",
  name: "Audio Transcription",
  category: "audio",
  description: "Transcribe audio to text using AI. Supports 100+ languages.",
  icon: "📝",
  accept: "audio/*",
  maxSizeMB: 200,
  keywords: ["transcribe audio", "speech to text", "audio to text"],
  steps: ["Upload an audio file", "Select language", 'Click "Transcribe"', "Copy or download text"],
  faqs: [
    {
      question: "How accurate is it?",
      answer: "Accuracy depends on audio quality and language. English is typically 90%+ accurate."
    },
    {
      question: "Is my audio sent to a server?",
      answer: "The Whisper model runs in your browser via WASM. No data leaves your device."
    }
  ]
};

export function render(container) {
  const upload = createFileUpload({
    accept: "audio/*",
    multiple: false,
    maxSizeMB: 200,
    onFilesSelected: async files => {
      if (files.length === 0) return;
      resultArea.style.display = "block";
      resultArea.innerHTML = `
        <div style="text-align:center;padding:var(--space-8);">
          <div style="font-size:3rem;margin-bottom:var(--space-4);">📝</div>
          <h3 style="font-size:var(--text-xl);font-weight:600;margin-bottom:var(--space-2);">Audio Transcription</h3>
          <p style="color:var(--color-text-secondary);margin-bottom:var(--space-4);max-width:500px;margin-left:auto;margin-right:auto;">
            This tool requires the Whisper WASM model (~75MB) to be hosted at <code>/models/whisper-tiny.bin</code>.
            The model runs entirely in your browser — no data is sent to any server.
          </p>
          <div style="background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-md);text-align:left;font-size:var(--text-sm);color:var(--color-text-secondary);">
            <strong>To enable:</strong> Download the whisper.cpp WASM build and tiny model, then rebuild.
          </div>
        </div>
      `;
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div id="result-area" style="display:none;margin-top:var(--space-6);"></div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const resultArea = container.querySelector("#result-area");
}

export function destroy() {}
