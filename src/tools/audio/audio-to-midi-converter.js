import { escapeHtml } from "../../utils/escape-html.js";

export function freqToMidi(freq) {
  if (!Number.isFinite(freq) || freq <= 0) return null;
  return Math.round(69 + 12 * Math.log2(freq / 440));
}

export function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function midiToName(midi) {
  return NOTE_NAMES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1);
}

export function encodeVarLen(value) {
  if (value < 0 || !Number.isFinite(value)) value = 0;
  let n = Math.floor(value);
  const bytes = [n & 0x7f];
  n >>= 7;
  while (n > 0) {
    bytes.unshift((n & 0x7f) | 0x80);
    n >>= 7;
  }
  return bytes;
}

export function segmentNotes(
  frames,
  { hopSec = 512 / 22050, minNoteSec = 0.08, velocity = 96 } = {}
) {
  const notes = [];
  let run = null;
  const flush = endIndex => {
    if (!run) return;
    const start = run.startIndex * hopSec;
    const end = endIndex * hopSec;
    if (end - start >= minNoteSec) {
      notes.push({ midi: run.midi, start, end, velocity });
    }
    run = null;
  };
  frames.forEach((f, i) => {
    const freq = f == null ? null : typeof f === "number" ? f : f.freq;
    const midi = freq ? freqToMidi(freq) : null;
    if (midi === null) {
      flush(i);
      return;
    }
    if (run && run.midi === midi) {
      run.lastSeen = i;
      return;
    }
    flush(i);
    run = { midi, startIndex: i, lastSeen: i };
  });
  flush(frames.length);
  return notes;
}

export function buildMidiFile(notes, { bpm = 120, ticksPerQuarter = 480 } = {}) {
  const secToTick = s => Math.round((s * bpm * ticksPerQuarter) / 60);
  const events = [];
  for (const n of notes) {
    const onTick = secToTick(n.start);
    const offTick = Math.max(onTick + 1, secToTick(n.end));
    events.push({ tick: onTick, data: [0x90, n.midi & 0x7f, n.velocity & 0x7f] });
    events.push({ tick: offTick, data: [0x80, n.midi & 0x7f, 0] });
  }
  events.sort((a, b) => a.tick - b.tick || a.data[0] - b.data[0]);
  const track = [];
  const pushVLQ = v => track.push(...encodeVarLen(v));
  const microPerQuarter = Math.round(60000000 / bpm);
  pushVLQ(0);
  track.push(
    0xff,
    0x51,
    0x03,
    (microPerQuarter >> 16) & 0xff,
    (microPerQuarter >> 8) & 0xff,
    microPerQuarter & 0xff
  );
  let prev = 0;
  for (const e of events) {
    pushVLQ(e.tick - prev);
    track.push(...e.data);
    prev = e.tick;
  }
  pushVLQ(0);
  track.push(0xff, 0x2f, 0x00);

  const out = [];
  const str = s => [...s].map(c => c.charCodeAt(0));
  out.push(
    ...str("MThd"),
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    1,
    (ticksPerQuarter >> 8) & 0xff,
    ticksPerQuarter & 0xff
  );
  out.push(
    ...str("MTrk"),
    (track.length >> 24) & 0xff,
    (track.length >> 16) & 0xff,
    (track.length >> 8) & 0xff,
    track.length & 0xff
  );
  out.push(...track);
  return new Uint8Array(out);
}

export function parabolic(arr, x) {
  if (x <= 0 || x >= arr.length - 1) return x;
  const a = arr[x - 1];
  const b = arr[x];
  const c = arr[x + 1];
  const denom = 2 * (2 * b - a - c);
  if (denom === 0) return x;
  return x + (c - a) / denom;
}

export function yinDetect(buf, fs, threshold = 0.15) {
  const W = buf.length;
  const tauMin = Math.max(2, Math.floor(fs / 1500));
  const tauMax = Math.min(Math.floor(fs / 65), W >> 1);
  if (tauMax <= tauMin + 2) return null;
  let energy = 0;
  for (let i = 0; i < W; i++) energy += buf[i] * buf[i];
  if (Math.sqrt(energy / W) < 0.004) return null;
  const d = new Float32Array(tauMax);
  for (let tau = tauMin; tau < tauMax; tau++) {
    let sum = 0;
    for (let i = 0; i < W - tauMax; i++) {
      const diff = buf[i] - buf[i + tau];
      sum += diff * diff;
    }
    d[tau] = sum;
  }
  const cmnd = new Float32Array(tauMax);
  let running = 0;
  for (let tau = tauMin; tau < tauMax; tau++) {
    running += d[tau];
    cmnd[tau] = running === 0 ? 1 : (d[tau] * (tau - tauMin + 1)) / running;
  }
  let tauEst = -1;
  for (let tau = tauMin + 1; tau < tauMax - 1; tau++) {
    if (cmnd[tau] < threshold) {
      while (tau + 1 < tauMax - 1 && cmnd[tau + 1] < cmnd[tau]) tau++;
      tauEst = tau;
      break;
    }
  }
  if (tauEst === -1) return null;
  const better = parabolic(cmnd, tauEst);
  const freq = fs / better;
  return freq >= 60 && freq <= 1600 ? freq : null;
}

const WORKER_SRC = `
${yinDetect.toString()}
${parabolic.toString()}
self.onmessage = e => {
  const { chunks, sampleRate, threshold } = e.data;
  const pitches = [];
  for (let c = 0; c < chunks.length; c++) {
    pitches.push(yinDetect(chunks[c], sampleRate, threshold));
    if (c % 50 === 0) self.postMessage({ type: 'progress', done: c + 1, total: chunks.length });
  }
  self.postMessage({ type: 'done', pitches });
};
`;

const MAX_SECONDS = 60;

export const toolConfig = {
  id: "audio-to-midi-converter",
  name: "Audio to MIDI Converter",
  category: "audio",
  description: "Convert audio recordings to MIDI note data.",
  icon: "🎹",
  keywords: ["audio", "midi", "convert", "transcribe", "music"],
  steps: [
    "Load a mono-friendly recording (whistling, humming, or a single melodic line works best).",
    "Tune the sensitivity and minimum note length, then press Analyze.",
    "Review the detected notes on the piano roll preview.",
    "Download the generated .mid file and drop it into your DAW."
  ],
  faqs: [
    {
      question: "What kind of audio works best?",
      answer:
        "Monophonic sources: humming, whistling, voice, flute, or a single guitar/keyboard line. Polyphonic mixes produce only the dominant pitch per moment."
    },
    {
      question: "How does the detection work?",
      answer:
        "A YIN pitch tracker estimates the fundamental frequency frame-by-frame entirely in your browser (Web Worker, no upload). Stable pitch runs become MIDI notes; short blips are filtered by the minimum note length setting."
    },
    {
      question: "Is my audio uploaded anywhere?",
      answer:
        "No. Decoding, pitch detection, and MIDI generation all happen locally on your device."
    },
    {
      question: "Why is the melody limited to 60 seconds?",
      answer:
        "Pitch analysis is CPU-heavy; the cap keeps conversions snappy in the browser. Trim longer recordings first."
    }
  ]
};

let objectUrl = null;
let worker = null;

export function cleanup() {
  if (worker) worker.terminate();
  worker = null;
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = null;
}

export function render(container) {
  cleanup();
  container.innerHTML = `
    <style>
      .atm-drop { border: 2px dashed var(--color-border); border-radius: var(--radius-md); padding: var(--space-5); text-align: center; cursor: pointer; margin-bottom: var(--space-3); }
      .atm-drop.drag { border-color: var(--color-primary); background: rgba(99,102,241,.06); }
      .atm-file-info { font-size: var(--text-sm); color: var(--color-text-muted, #777); margin-top: var(--space-2); }
      .atm-controls { display: flex; gap: var(--space-3); flex-wrap: wrap; align-items: end; margin: var(--space-3) 0; }
      .atm-controls label { display: flex; flex-direction: column; gap: 2px; font-size: var(--text-xs); font-weight: 600; }
      .atm-controls input { padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); width: 110px; }
      .atm-progress { height: 8px; background: rgba(127,127,127,.15); border-radius: 999px; overflow: hidden; margin: var(--space-2) 0; }
      .atm-progress-fill { height: 100%; width: 0%; background: var(--color-primary); transition: width .15s; }
      .atm-roll-wrap { overflow-x: auto; border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-bottom: var(--space-3); background: var(--color-surface); }
      .atm-note-count { font-size: var(--text-sm); color: var(--color-text-muted, #777); margin-bottom: var(--space-2); }
      .atm-error { border: 1px solid #dc2626; color: #dc2626; background: rgba(220,38,38,.06); border-radius: var(--radius-md); padding: var(--space-3); font-size: var(--text-sm); margin-bottom: var(--space-3); }
    </style>
    <div class="atm-drop" id="atm-drop">
      <div style="font-size:34px">🎵</div>
      <div style="font-weight:600">Drop an audio file or click to browse</div>
      <div class="atm-file-info">MP3 / WAV / OGG / M4A · up to ${MAX_SECONDS}s analyzed</div>
      <input type="file" id="atm-file" accept="audio/*" hidden>
    </div>
    <div class="atm-controls">
      <label>Sensitivity (lower = stricter)
        <input type="number" id="atm-sens" value="0.15" step="0.01" min="0.02" max="0.5">
      </label>
      <label>Min note length (ms)
        <input type="number" id="atm-minlen" value="80" step="10" min="20" max="500">
      </label>
      <label>Output BPM
        <input type="number" id="atm-bpm" value="120" step="1" min="30" max="300">
      </label>
      <button type="button" class="btn-primary" id="atm-analyze" disabled>Analyze</button>
      <button type="button" class="btn-secondary" id="atm-download" disabled>Download .mid</button>
    </div>
    <div id="atm-status"><p class="atm-file-info">Load a file to begin.</p></div>
    <div class="atm-progress" id="atm-progress" hidden><div class="atm-progress-fill" id="atm-progress-fill"></div></div>
    <div id="atm-result"></div>
  `;
  const $ = id => container.querySelector("#" + id);
  const state = { buffer: null, name: "notes", notes: [], sampleRate: 22050 };

  const drop = $("atm-drop");
  const fileInput = $("atm-file");

  async function loadFile(file) {
    $("atm-status").innerHTML = `<p class="atm-file-info">Decoding…</p>`;
    try {
      const raw = await file.arrayBuffer();
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const tmp = new Ctx();
      const decoded = await tmp.decodeAudioData(raw);
      await tmp.close();
      const seconds = Math.min(decoded.duration, MAX_SECONDS);
      const offline = new OfflineAudioContext(
        1,
        Math.ceil(seconds * state.sampleRate),
        state.sampleRate
      );
      const src = offline.createBufferSource();
      src.buffer = decoded;
      src.connect(offline.destination);
      src.start(0);
      const rendered = await offline.startRendering();
      state.buffer = rendered.getChannelData(0);
      state.name = file.name.replace(/\.[^.]+$/, "");
      $("atm-analyze").disabled = false;
      $("atm-download").disabled = true;
      $("atm-status").innerHTML =
        `<p class="atm-file-info">${escapeHtml(file.name)} · ${decoded.duration.toFixed(1)}s decoded (${seconds.toFixed(1)}s analyzed) · ready.</p>`;
    } catch {
      $("atm-status").innerHTML =
        `<div class="atm-error">Could not decode that file as audio. Try MP3, WAV, or OGG.</div>`;
    }
  }

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

  function drawRoll(notes) {
    if (!notes.length) return;
    const minMidi = Math.min(...notes.map(n => n.midi)) - 2;
    const maxMidi = Math.max(...notes.map(n => n.midi)) + 2;
    const dur = Math.max(...notes.map(n => n.end));
    const H = Math.max(140, (maxMidi - minMidi) * 8);
    const pxPerSec = Math.max(60, Math.min(400, 800 / dur));
    const W = Math.ceil(dur * pxPerSec) + 20;
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    cv.style.maxWidth = "100%";
    const g = cv.getContext("2d");
    g.fillStyle = "#0f172a";
    g.fillRect(0, 0, W, H);
    for (let m = minMidi; m <= maxMidi; m++) {
      const isBlack = [1, 3, 6, 8, 10].includes(((m % 12) + 12) % 12);
      g.fillStyle = isBlack ? "#1e293b" : "#243049";
      g.fillRect(0, (maxMidi - m) * 8, W, 7);
    }
    g.fillStyle = "#34d399";
    for (const n of notes) {
      const x = n.start * pxPerSec;
      const w = Math.max(2, (n.end - n.start) * pxPerSec);
      g.fillRect(x, (maxMidi - n.midi) * 8, w, 7);
    }
    const wrap = document.createElement("div");
    wrap.className = "atm-roll-wrap";
    wrap.appendChild(cv);
    $("atm-result").prepend(wrap);
  }

  function analyze() {
    if (!state.buffer) return;
    const sens = Math.min(0.5, Math.max(0.02, parseFloat($("atm-sens").value) || 0.15));
    const minNoteMs = Math.min(500, Math.max(20, parseInt($("atm-minlen").value, 10) || 80));
    const hop = 512;
    const win = 2048;
    const total = Math.max(1, Math.floor((state.buffer.length - win) / hop));
    const chunks = [];
    for (let i = 0; i < total; i++) chunks.push(state.buffer.slice(i * hop, i * hop + win));
    $("atm-progress").hidden = false;
    $("atm-progress-fill").style.width = "0%";
    $("atm-analyze").disabled = true;

    worker = new Worker(
      URL.createObjectURL(new Blob([WORKER_SRC], { type: "application/javascript" }))
    );
    const hopSec = hop / state.sampleRate;
    worker.onmessage = e => {
      const msg = e.data;
      if (msg.type === "progress") {
        $("atm-progress-fill").style.width = `${Math.round((msg.done / msg.total) * 100)}%`;
        return;
      }
      if (msg.type === "done") {
        worker.terminate();
        worker = null;
        $("atm-progress").hidden = true;
        state.notes = segmentNotes(msg.pitches, { hopSec, minNoteSec: minNoteMs / 1000 });
        $("atm-download").disabled = state.notes.length === 0;
        $("atm-analyze").disabled = false;
        $("atm-result").innerHTML =
          `<p class="atm-note-count">${state.notes.length} notes detected.</p>`;
        drawRoll(state.notes);
      }
    };
    worker.onerror = e => {
      $("atm-progress").hidden = true;
      $("atm-analyze").disabled = false;
      $("atm-status").innerHTML = `<div class="atm-error">Analysis failed: ${escapeHtml(e.message || "unknown worker error")}</div>`;
    };
    worker.postMessage({ chunks, sampleRate: state.sampleRate, threshold: sens });
  }

  $("atm-analyze").addEventListener("click", analyze);

  $("atm-download").addEventListener("click", () => {
    if (!state.notes.length) return;
    const midi = buildMidiFile(state.notes, { bpm: parseInt($("atm-bpm").value, 10) || 120 });
    const blob = new Blob([midi], { type: "audio/midi" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${state.name}.mid`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
}
