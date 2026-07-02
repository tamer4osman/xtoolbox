import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";

export const toolConfig = {
  id: "screen-recorder",
  name: "Screen Recorder",
  category: "video",
  description: "Record browser tab or screen using Screen Capture API. Export as WebM video.",
  icon: "🖥️",
  accept: null,
  maxSizeMB: 0,
  keywords: ["screen", "record", "capture", "video", "webm", "browser"],
  steps: [
    "Click Start Recording",
    "Select screen or browser tab",
    "Click Stop when done",
    "Download WebM video",
  ],
  faqs: [
    {
      question: "What formats are supported?",
      answer: "WebM (VP8/VP9) is the default format. Some browsers also support MP4.",
    },
    {
      question: "Is audio recorded?",
      answer:
        'Yes, system audio can be included if you select "Share audio" in the browser dialog.',
    },
  ],
};

export function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const sec = s % 60;
  const min = m % 60;
  return `${h > 0 ? h + ":" : ""}${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export function render(container) {
  let mediaRecorder = null;
  let chunks = [];
  let stream = null;
  let startTime = 0;
  let timerInterval = null;

  container.innerHTML = `
    <div class="tool-layout">
      <div style="padding:var(--space-4);background:var(--color-bg-secondary);border-radius:var(--radius-md);text-align:center;margin-bottom:var(--space-3);">
        <div id="rec-status" style="font-size:var(--text-lg);font-weight:600;margin-bottom:var(--space-2);">Ready to Record</div>
        <div id="rec-timer" style="font-size:var(--text-3xl);font-weight:700;font-family:monospace;">00:00:00</div>
        <div id="rec-size" style="font-size:var(--text-sm);color:var(--color-text-muted);margin-top:var(--space-1);"></div>
      </div>
      <div class="form-row" style="gap:var(--space-2);">
        <button class="btn btn-primary btn-lg" id="start-btn" style="flex:1;">Start Recording</button>
        <button class="btn btn-secondary btn-lg" id="stop-btn" style="flex:1;" disabled>Stop</button>
      </div>
      <div id="preview-area" style="display:none;margin-top:var(--space-3);">
        <video id="preview-video" controls style="width:100%;border-radius:var(--radius-md);"></video>
        <button class="btn btn-primary btn-lg" id="download-btn" style="width:100%;margin-top:var(--space-2);">Download Recording</button>
      </div>
    </div>
  `;

  const recStatus = container.querySelector("#rec-status");
  const recTimer = container.querySelector("#rec-timer");
  const recSize = container.querySelector("#rec-size");
  const startBtn = container.querySelector("#start-btn");
  const stopBtn = container.querySelector("#stop-btn");
  const previewArea = container.querySelector("#preview-area");
  const previewVideo = container.querySelector("#preview-video");
  const downloadBtn = container.querySelector("#download-btn");

  let recordedBlob = null;

  startBtn.addEventListener("click", async () => {
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: true,
      });

      chunks = [];
      mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
        recSize.textContent = `${(chunks.reduce((s, c) => s + c.size, 0) / 1048576).toFixed(1)} MB`;
      };

      mediaRecorder.onstop = () => {
        recordedBlob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(recordedBlob);
        previewVideo.src = url;
        previewArea.style.display = "block";
        recStatus.textContent = "Recording Complete";
        clearInterval(timerInterval);
        showToast({ message: "Recording saved.", type: "success" });
      };

      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorder.state === "recording") mediaRecorder.stop();
      };

      mediaRecorder.start(1000);
      startTime = Date.now();
      recStatus.textContent = "Recording...";
      startBtn.disabled = true;
      stopBtn.disabled = false;
      previewArea.style.display = "none";

      timerInterval = setInterval(() => {
        recTimer.textContent = formatDuration(Date.now() - startTime);
      }, 1000);

      showToast({ message: "Recording started.", type: "success" });
    } catch (err) {
      showToast({ message: `Screen capture failed: ${err.message}`, type: "error" });
    }
  });

  stopBtn.addEventListener("click", () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    startBtn.disabled = false;
    stopBtn.disabled = true;
  });

  downloadBtn.addEventListener("click", () => {
    if (recordedBlob) {
      downloadBlob(recordedBlob, `recording-${Date.now()}.webm`);
    }
  });
}

export function destroy() {}
