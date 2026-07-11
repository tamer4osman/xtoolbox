import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";
import { audioBufferToWav, drawWaveform, formatAudioTime } from "./audio-utils.js";

export const toolConfig = {
  id: "voice-recorder",
  name: "Voice Recorder",
  category: "audio",
  description: "Record audio from your microphone and download as WAV.",
  icon: "🎤",
  accept: null,
  maxSizeMB: null,
  keywords: ["voice recorder", "audio recorder", "mic recorder"],
  steps: [
    'Click "Start Recording"',
    "Speak into your microphone",
    'Click "Stop"',
    "Download the recording"
  ],
  faqs: [
    {
      question: "What format is the recording?",
      answer: "WAV format. You can use the Audio Converter to convert to MP3."
    }
  ]
};

export function render(container) {
  let mediaRecorder = null;
  let chunks = [];
  let startTime = null;
  let timerInterval = null;
  let recordedBlob = null;

  container.innerHTML = `
    <div class="tool-layout" style="text-align:center;">
      <div id="record-area" style="padding:var(--space-8) 0;">
        <div id="mic-icon" style="font-size:4rem;margin-bottom:var(--space-4);">🎤</div>
        <div id="timer" style="font-size:var(--text-3xl);font-weight:700;font-family:monospace;margin-bottom:var(--space-4);">0:00</div>
        <div id="status-text" style="color:var(--color-text-secondary);margin-bottom:var(--space-6);">Click to start recording</div>
        <button class="btn btn-primary btn-lg" id="record-btn" style="min-width:200px;">⏺️ Start Recording</button>
      </div>
      <div id="result-area" style="display:none;">
        <canvas id="waveform" style="width:100%;height:80px;border:1px solid var(--color-border);border-radius:var(--radius-md);margin-bottom:var(--space-4);"></canvas>
        <audio id="preview" controls style="width:100%;margin-bottom:var(--space-4);"></audio>
        <div style="display:flex;gap:var(--space-3);justify-content:center;">
          <button class="btn btn-secondary" id="re-record-btn">🔄 Re-record</button>
          <button class="btn btn-primary" id="download-btn">⬇️ Download WAV</button>
        </div>
      </div>
    </div>
  `;

  const recordBtn = container.querySelector("#record-btn");
  const timer = container.querySelector("#timer");
  const statusText = container.querySelector("#status-text");
  const micIcon = container.querySelector("#mic-icon");
  const recordArea = container.querySelector("#record-area");
  const resultArea = container.querySelector("#result-area");
  const waveformCanvas = container.querySelector("#waveform");
  const preview = container.querySelector("#preview");
  const reRecordBtn = container.querySelector("#re-record-btn");
  const downloadBtn = container.querySelector("#download-btn");

  recordBtn.addEventListener("click", async () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(t => t.stop());
      recordBtn.innerHTML = "⏺️ Start Recording";
      recordBtn.classList.remove("btn-danger");
      recordBtn.classList.add("btn-primary");
      statusText.textContent = "Recording stopped";
      clearInterval(timerInterval);
      micIcon.style.animation = "";
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      chunks = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        recordedBlob = new Blob(chunks, { type: "audio/webm" });
        preview.src = URL.createObjectURL(recordedBlob);

        // Draw waveform
        const arrayBuffer = await recordedBlob.arrayBuffer();
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        waveformCanvas.width = 600;
        waveformCanvas.height = 80;
        drawWaveform(audioBuffer, waveformCanvas);

        recordArea.style.display = "none";
        resultArea.style.display = "block";
      };

      mediaRecorder.start(100);
      startTime = Date.now();
      recordBtn.innerHTML = "⏹️ Stop Recording";
      recordBtn.classList.remove("btn-primary");
      recordBtn.classList.add("btn-danger");
      statusText.textContent = "Recording...";
      micIcon.style.animation = "pulse 1s infinite";

      timerInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        timer.textContent = formatAudioTime(elapsed);
      }, 100);
    } catch (err) {
      showToast({ message: "Microphone access denied: " + err.message, type: "error" });
    }
  });

  reRecordBtn.addEventListener("click", () => {
    recordArea.style.display = "block";
    resultArea.style.display = "none";
    timer.textContent = "0:00";
    statusText.textContent = "Click to start recording";
  });

  downloadBtn.addEventListener("click", () => {
    if (recordedBlob) {
      downloadBlob(recordedBlob, "recording.wav");
      showToast({ message: "Downloaded!", type: "success" });
    }
  });
}

export function destroy() {}
