import { escapeHtml } from "../../utils/escape-html.js";
import { copyToClipboard } from "../../utils/clipboard.js";

const HIST_BINS = 64;

export function grayHistogram(imageData) {
  const px = imageData.data;
  const hist = Array.from({ length: HIST_BINS }, () => 0);
  for (let i = 0; i < px.length; i += 4) {
    const gray = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    hist[Math.min(HIST_BINS - 1, Math.floor((gray / 256) * HIST_BINS))]++;
  }
  const total = px.length / 4;
  return hist.map(c => c / total);
}

export function frameDistance(h1, h2) {
  let sum = 0;
  for (let i = 0; i < h1.length; i++) sum += Math.abs(h1[i] - h2[i]);
  return sum / 2;
}

export function detectCuts(dists, { sensitivity = 5, minGapSamples = 4 } = {}) {
  if (!dists.length) return { cuts: [], threshold: 0 };
  const sorted = [...dists].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const absDevs = dists.map(d => Math.abs(d - median)).sort((a, b) => a - b);
  const mad = absDevs[Math.floor(absDevs.length / 2)] || 1e-9;
  const k = Math.max(0.5, 11 - sensitivity);
  const threshold = Math.max(median + k * mad, median * 1.15);
  const raw = [];
  dists.forEach((d, i) => {
    if (d > threshold) raw.push(i);
  });
  const merged = [];
  for (const idx of raw) {
    const last = merged[merged.length - 1];
    if (last !== undefined && idx - last < minGapSamples) {
      if (dists[idx] > dists[last]) merged[merged.length - 1] = idx;
    } else {
      merged.push(idx);
    }
  }
  return { cuts: merged, threshold };
}

export function formatTs(sec) {
  const s = Math.max(0, sec);
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function buildChaptersText(cutTimes) {
  const lines = ["0:00 Chapter 1"];
  cutTimes.forEach((t, i) => lines.push(`${formatTs(t)} Chapter ${i + 2}`));
  return lines.join("\n");
}

export function buildCsv(cutTimes) {
  const rows = ["index,start_seconds,timestamp"];
  cutTimes.forEach((t, i) => rows.push(`${i + 1},${t.toFixed(2)},${formatTs(t)}`));
  return rows.join("\n") + "\n";
}

export const toolConfig = {
  id: "video-scene-cut-detector",
  name: "Video Scene Cut Detector",
  category: "video",
  description: "Detect scene changes and generate chapter markers.",
  icon: "✂️",
  keywords: ["scene", "cut", "detect", "chapter", "marker"],
  steps: [
    "Load a video (up to 3 minutes are analyzed) and press Detect.",
    "Adjust sensitivity if you see too many or too few cuts, then re-run.",
    "Click any detected cut to jump straight to that moment in the preview.",
    "Copy the timestamps as YouTube-ready chapters or as CSV."
  ],
  faqs: [
    {
      question: "How does cut detection work?",
      answer:
        "Frames are sampled five times per second, downscaled to 48×27 pixels, and compared using a histogram distance. Samples whose difference exceeds an adaptive threshold (median plus a robust-deviation margin you control via Sensitivity) are reported as cuts."
    },
    {
      question: "Why is analysis limited to three minutes?",
      answer:
        "Seeking through video frame-by-frame is CPU-heavy in the browser. The cap keeps runs quick; trim longer videos first."
    },
    {
      question: "Are my videos uploaded anywhere?",
      answer: "No. Everything runs locally — the file never leaves your device."
    },
    {
      question: "Can I use the output on YouTube?",
      answer:
        "Yes. The Chapters export follows YouTube's description format (starting at 0:00); paste it into your video description to enable chapter navigation."
    }
  ]
};

let objectUrl = null;

export function cleanup() {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = null;
}

export function render(container) {
  cleanup();
  container.innerHTML = `
    <style>
      .vsc-drop { border: 2px dashed var(--color-border); border-radius: var(--radius-md); padding: var(--space-5); text-align: center; cursor: pointer; margin-bottom: var(--space-3); }
      .vsc-drop.drag { border-color: var(--color-primary); background: rgba(99,102,241,.06); }
      .vsc-controls { display: flex; gap: var(--space-3); flex-wrap: wrap; align-items: end; margin: var(--space-3) 0; }
      .vsc-controls label { display: flex; flex-direction: column; gap: 4px; font-size: var(--text-xs); font-weight: 600; flex: 1 1 240px; }
      .vsc-preview { width: 100%; max-width: 480px; border-radius: var(--radius-md); background: #000; margin-bottom: var(--space-3); }
      .vsc-progress { height: 8px; background: rgba(127,127,127,.15); border-radius: 999px; overflow: hidden; margin: var(--space-2) 0; }
      .vsc-progress-fill { height: 100%; width: 0%; background: var(--color-primary); transition: width .1s; }
      .vsc-cuts { max-height: 260px; overflow-y: auto; margin-top: var(--space-2); }
      .vsc-cut-row { display: flex; gap: var(--space-3); align-items: center; padding: 6px var(--space-2); border-radius: var(--radius-sm); cursor: pointer; font-size: var(--text-sm); }
      .vsc-cut-row:hover { background: rgba(127,127,127,.1); }
      .vsc-cut-ts { font-family: ui-monospace, monospace; font-weight: 700; min-width: 74px; }
      .vsc-strength { height: 6px; border-radius: 999px; background: var(--color-primary); opacity: .8; }
      .vsc-chapters { width: 100%; min-height: 120px; font-family: ui-monospace, monospace; font-size: 12px; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-sizing: border-box; margin-top: var(--space-2); }
      .vsc-actions { display: flex; gap: var(--space-2); margin-top: var(--space-2); }
      .vsc-error { border: 1px solid #dc2626; color: #dc2626; background: rgba(220,38,38,.06); border-radius: var(--radius-md); padding: var(--space-3); font-size: var(--text-sm); }
      .vsc-hint { color: var(--color-text-muted, #888); font-size: var(--text-xs); }
    </style>
    <div class="vsc-drop" id="vsc-drop">
      <div style="font-size:34px">✂️</div>
      <div style="font-weight:600">Drop a video or click to browse</div>
      <div class="vsc-hint">MP4 / WebM · first 3 minutes analyzed</div>
      <input type="file" id="vsc-file" accept="video/*" hidden>
    </div>
    <video class="vsc-preview" id="vsc-video" controls muted></video>
    <div class="vsc-controls">
      <label>Sensitivity: <span id="vsc-sens-val">5</span>
        <input type="range" id="vsc-sens" min="1" max="10" step="1" value="5">
      </label>
      <button type="button" class="btn-primary" id="vsc-go" disabled>Detect cuts</button>
      <button type="button" class="btn-secondary" id="vsc-copy-chapters" disabled>Copy chapters</button>
      <button type="button" class="btn-secondary" id="vsc-copy-csv" disabled>Copy CSV</button>
    </div>
    <div id="vsc-status"><p class="vsc-hint">Load a video to begin.</p></div>
    <div class="vsc-progress" id="vsc-progress" hidden><div class="vsc-progress-fill" id="vsc-fill"></div></div>
    <div id="vsc-result"></div>
  `;
  const $ = id => container.querySelector("#" + id);
  const state = { url: null, duration: 0, cutTimes: [], dists: [], intervalSec: 0.2 };

  const drop = $("vsc-drop");
  const fileInput = $("vsc-file");
  const video = $("vsc-video");

  $("vsc-sens").addEventListener("input", () => {
    $("vsc-sens-val").textContent = $("vsc-sens").value;
  });

  drop.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => fileInput.files[0] && loadFile(fileInput.files[0]));
  drop.addEventListener("dragover", e => {
    e.preventDefault();
    drop.classList.add("drag");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("drag"));
  drop.addEventListener("drop", e => {
    e.preventDefault();
    drop.classList.remove("drag");
    if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
  });

  function loadFile(file) {
    cleanup();
    state.url = URL.createObjectURL(file);
    objectUrl = state.url;
    video.src = state.url;
    video.onloadedmetadata = () => {
      state.duration = Math.min(video.duration || 0, 180);
      $("vsc-go").disabled = false;
      $("vsc-status").innerHTML =
        `<p class="vsc-hint">${escapeHtml(file.name)} · ${video.duration.toFixed(1)}s (${state.duration.toFixed(1)}s analyzed) · ready.</p>`;
    };
    video.onerror = () => {
      $("vsc-status").innerHTML = `<div class="vsc-error">Could not load that file as video.</div>`;
    };
  }

  function seek(videoEl, t) {
    return new Promise(resolve => {
      const done = () => {
        videoEl.removeEventListener("seeked", done);
        resolve();
      };
      videoEl.addEventListener("seeked", done);
      videoEl.currentTime = t;
    });
  }

  async function run() {
    if (!video.src) return;
    const sens = parseInt($("vsc-sens").value, 10) || 5;
    $("vsc-progress").hidden = false;
    $("vsc-fill").style.width = "0%";
    $("vsc-go").disabled = true;
    $("vsc-result").innerHTML = "";

    const cv = document.createElement("canvas");
    cv.width = 48;
    cv.height = 27;
    const g = cv.getContext("2d", { willReadFrequently: true });
    const times = [];
    const hists = [];
    try {
      for (let t = 0; t <= state.duration; t += state.intervalSec) {
        await seek(video, t);
        g.drawImage(video, 0, 0, 48, 27);
        hists.push(grayHistogram(g.getImageData(0, 0, 48, 27)));
        times.push(t);
        $("vsc-fill").style.width = `${Math.round((t / state.duration) * 100)}%`;
      }

      const dists = [];
      for (let i = 1; i < hists.length; i++) dists.push(frameDistance(hists[i - 1], hists[i]));
      state.dists = dists;
      const { cuts, threshold } = detectCuts(dists, { sensitivity: sens });
      state.cutTimes = cuts.map(i => times[i + 1]);

      const maxDist = Math.max(...dists, 0.0001);
      const rows = state.cutTimes
        .map(t => {
          const idx = times.indexOf(t) - 1;
          const w = Math.round((dists[idx] / maxDist) * 100);
          return `<div class="vsc-cut-row" data-t="${t}"><span class="vsc-cut-ts">${formatTs(t)}</span><span class="vsc-strength" style="width:${w}%"></span><span class="vsc-hint">${(w / 100).toFixed(2)}</span></div>`;
        })
        .join("");
      $("vsc-result").innerHTML = `
        <p class="vsc-hint">${state.cutTimes.length} cuts found (threshold ${threshold.toFixed(3)}).</p>
        <div class="vsc-cuts">${rows || "<p class='vsc-hint'>No cuts above threshold.</p>"}</div>
        <textarea class="vsc-chapters" readonly>${escapeHtml(buildChaptersText(state.cutTimes))}</textarea>`;
      $("vsc-copy-chapters").disabled = false;
      $("vsc-copy-csv").disabled = false;
      container.querySelectorAll(".vsc-cut-row").forEach(row =>
        row.addEventListener("click", () => {
          video.currentTime = parseFloat(row.dataset.t);
          video.play();
        })
      );
    } catch {
      $("vsc-result").innerHTML = `<div class="vsc-error">Detection failed unexpectedly.</div>`;
    } finally {
      $("vsc-progress").hidden = true;
      $("vsc-go").disabled = false;
    }
  }

  $("vsc-go").addEventListener("click", run);

  $("vsc-copy-chapters").addEventListener("click", async e =>
    copyToClipboard(buildChaptersText(state.cutTimes), e.target)
  );
  $("vsc-copy-csv").addEventListener("click", async e =>
    copyToClipboard(buildCsv(state.cutTimes), e.target)
  );
}
