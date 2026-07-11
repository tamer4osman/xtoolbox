import { createVideoTool } from "./video-tool-factory.js";
import { readFFmpegFile, createVideoPreview, formatTime } from "./video-utils.js";
import { downloadBlob } from "../../utils/file.js";
import { showToast } from "../../components/toast.js";

export const toolConfig = {
  id: "silence-remover",
  name: "Video Silence Remover",
  category: "video",
  description: "Automatically detect and cut silent sections from video using ffmpeg.wasm.",
  icon: "✂️",
  accept: "video/*",
  maxSizeMB: 500,
  keywords: ["silence", "remove", "video", "trim", "auto", "cut"],
  steps: [
    "Upload a video",
    "Adjust silence threshold",
    'Click "Remove Silence"',
    "Download trimmed video"
  ],
  faqs: [
    {
      question: "How does silence detection work?",
      answer:
        "ffmpeg scans audio volume and marks sections below the threshold as silence. Those sections are then removed from the video."
    },
    {
      question: "What is the default noise threshold?",
      answer:
        "-30dB. Lower values (e.g. -50dB) detect less silence; higher values (e.g. -20dB) detect more."
    }
  ]
};

function parseSilenceEvents(logOutput) {
  const events = [];
  const lines = logOutput.split("\n");
  let currentStart = null;

  for (const line of lines) {
    const startMatch = line.match(/silence_start:\s*([\d.]+)/);
    const endMatch = line.match(/silence_end:\s*([\d.]+)/);

    if (startMatch) {
      currentStart = parseFloat(startMatch[1]);
    } else if (endMatch && currentStart !== null) {
      const end = parseFloat(endMatch[1]);
      events.push({ start: currentStart, end });
      currentStart = null;
    }
  }

  if (currentStart !== null) {
    events.push({ start: currentStart, end: Infinity });
  }

  return events;
}

function buildTrimSegments(silenceEvents, duration) {
  if (silenceEvents.length === 0) return null;

  const segments = [];
  let lastEnd = 0;

  for (const evt of silenceEvents) {
    if (evt.start > lastEnd) {
      segments.push({ start: lastEnd, end: evt.start });
    }
    lastEnd = evt.end;
  }

  if (lastEnd < duration) {
    segments.push({ start: lastEnd, end: duration });
  }

  return segments.length > 0 ? segments : null;
}

function buildSelectFilter(segments) {
  if (!segments || segments.length === 0) return null;

  const exprs = segments.map(s => `between(t,${s.start.toFixed(3)},${s.end.toFixed(3)})`);
  return `select='${exprs.join("+")}',setpts=N/FRAME_RATE/TB`;
}

function buildAudioSelectFilter(segments) {
  if (!segments || segments.length === 0) return null;

  const exprs = segments.map(s => `between(t,${s.start.toFixed(3)},${s.end.toFixed(3)})`);
  return `aselect='${exprs.join("+")}',asetpts=N/SR/TB`;
}

export const render = createVideoTool({
  maxSizeMB: 500,
  processingText: "Detecting silence & trimming...",
  actionBtnLabel: "✂️ Remove Silence",
  optionsHTML: `
    <div id="preview-area"></div>
    <div id="duration-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);"></div>
    <div class="form-group">
      <label>Noise Threshold (dB)</label>
      <input type="range" id="noise-threshold" min="-60" max="-10" value="-30" step="1" style="width:100%;">
      <div style="display:flex;justify-content:space-between;font-size:var(--text-sm);color:var(--color-text-secondary);">
        <span>-60dB (less sensitive)</span>
        <span id="threshold-value">-30dB</span>
        <span>-10dB (more sensitive)</span>
      </div>
    </div>
    <div class="form-group">
      <label>Minimum Silence Duration (seconds)</label>
      <input type="number" id="min-silence" class="text-input" value="1" min="0.1" max="60" step="0.1" placeholder="1">
    </div>
    <div id="silence-results" style="display:none;margin-top:var(--space-4);padding:var(--space-3);background:var(--color-surface-alt);border-radius:var(--radius-md);font-size:var(--text-sm);"></div>
  `,
  onFileLoaded(videoInfo, tctx) {
    const previewArea = tctx.query("#preview-area");
    previewArea.innerHTML = "";
    const preview = createVideoPreview(tctx.container._currentFile);
    previewArea.appendChild(preview.element);
    tctx.query("#duration-info").textContent =
      `Duration: ${videoInfo.duration ? formatTime(videoInfo.duration) : "unknown"}`;
    tctx.container._videoInfo = videoInfo;
  },
  async onProcess(ffmpeg, inputName, videoInfo, tctx) {
    const noiseThreshold = parseInt(tctx.getValue("noise-threshold"), 10);
    const minSilence = parseFloat(tctx.getValue("min-silence")) || 1;
    const duration = videoInfo.duration || 0;

    const outputName = "trimmed.mp4";

    tctx.query("#silence-results").style.display = "block";
    tctx.query("#silence-results").textContent = "Step 1/2: Detecting silent sections...";

    let logOutput = "";
    const logHandler = ({ message }) => {
      logOutput += message + "\n";
    };
    ffmpeg.on("log", logHandler);
    try {
      await ffmpeg.exec([
        "-i",
        inputName,
        "-af",
        `silencedetect=noise=${noiseThreshold}dB:d=${minSilence}`,
        "-f",
        "null",
        "-"
      ]);
    } finally {
      ffmpeg.off("log", logHandler);
    }

    const silenceEvents = parseSilenceEvents(logOutput);

    if (silenceEvents.length === 0) {
      showToast({ message: "No silent sections detected.", type: "info" });
      tctx.query("#silence-results").innerHTML =
        "<strong>No silence found.</strong> Try lowering the threshold or reducing minimum duration.";
      return;
    }

    const totalSilent = silenceEvents.reduce((sum, e) => {
      const end = e.end === Infinity ? duration : e.end;
      return sum + (end - e.start);
    }, 0);

    tctx.query("#silence-results").innerHTML =
      `<strong>Detected ${silenceEvents.length} silent section${silenceEvents.length > 1 ? "s" : ""}</strong> (${formatTime(totalSilent)} total)` +
      silenceEvents
        .slice(0, 8)
        .map((e, i) => {
          const endStr = e.end === Infinity ? "end" : formatTime(e.end);
          return `<br>${i + 1}. ${formatTime(e.start)} → ${endStr}`;
        })
        .join("") +
      (silenceEvents.length > 8 ? `<br>...and ${silenceEvents.length - 8} more` : "");

    const segments = buildTrimSegments(silenceEvents, duration);

    if (!segments || segments.length === 0) {
      showToast({ message: "Video would be empty after removing silence.", type: "error" });
      return;
    }

    tctx.query("#silence-results").innerHTML += "<br><strong>Step 2/2: Trimming video...</strong>";

    const selectExpr = buildSelectFilter(segments);
    const audioSelectExpr = buildAudioSelectFilter(segments);

    if (selectExpr) {
      await ffmpeg.exec([
        "-i",
        inputName,
        "-vf",
        selectExpr,
        "-af",
        audioSelectExpr,
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        "-movflags",
        "+faststart",
        outputName
      ]);
    } else {
      await ffmpeg.exec(["-i", inputName, "-c", "copy", outputName]);
    }

    const blob = await readFFmpegFile(ffmpeg, outputName, "video/mp4");

    const newTime = segments.reduce((sum, s) => sum + (s.end - s.start), 0);
    downloadBlob(blob, "silence-removed.mp4");

    tctx.query("#silence-results").innerHTML +=
      `<br><strong>Done!</strong> Saved ~${formatTime(totalSilent)}. Output: ${formatTime(newTime)}`;
    showToast({ message: "Silence removed!", type: "success" });

    await ffmpeg.deleteFile(outputName);
  }
});

export function destroy() {}

export { parseSilenceEvents, buildTrimSegments, buildSelectFilter, buildAudioSelectFilter };
