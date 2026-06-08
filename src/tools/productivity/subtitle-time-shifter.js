import { showToast } from '../../components/toast.js';
import { copyToClipboard } from '../../utils/clipboard.js';

export function parseTime(timeStr, isVtt) {
  // Handle both SRT (00:00:01,000) and VTT (00:00:01.000) formats
  const clean = timeStr.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2}):(\d{2})[,.](\d{3})$/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);
  const milliseconds = parseInt(match[4], 10);
  return hours * 3600000 + minutes * 60000 + seconds * 1000 + milliseconds;
}

export function formatTime(totalMs, isVtt) {
  if (totalMs < 0) totalMs = 0;
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const milliseconds = totalMs % 1000;
  const pad = (n, len = 2) => String(n).padStart(len, '0');
  const sep = isVtt ? '.' : ',';
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}${sep}${pad(milliseconds, 3)}`;
}

export function shiftSubtitles(content, offsetMs, isVtt) {
  const lines = content.split('\n');
  const result = [];
  let i = 0;

  if (isVtt && lines[0]?.trim() === 'WEBVTT') {
    result.push(lines[0]);
    i = 1;
    while (i < lines.length && lines[i]?.trim() === '') {
      result.push(lines[i++]);
    }
  }

  while (i < lines.length) {
    const line = lines[i].trim();

    if (line.includes('-->')) {
      const shifted = shiftTimestampLine(line, offsetMs, isVtt);
      if (shifted) {
        result.push(shifted);
        i++;
        while (i < lines.length && lines[i].trim() && !lines[i].includes('-->')) {
          result.push(lines[i++]);
        }
        if (i < lines.length && lines[i]?.trim() === '') result.push(lines[i++]);
        continue;
      }
    }

    if (!isVtt && /^\d+$/.test(line)) {
      result.push(lines[i++]);
      continue;
    }

    result.push(lines[i++]);
  }

  return result.join('\n');
}

function shiftTimestampLine(line, offsetMs, isVtt) {
  const parts = line.split('-->');
  if (parts.length !== 2) return null;
  const startTime = parseTime(parts[0], isVtt);
  const endTime = parseTime(parts[1], isVtt);
  if (startTime === null || endTime === null) return null;
  return `${formatTime(startTime + offsetMs, isVtt)} --> ${formatTime(endTime + offsetMs, isVtt)}`;
}

export const toolConfig = {
  id: 'subtitle-time-shifter',
  name: 'SRT / VTT Subtitle Sync Shifter',
  category: 'productivity',
  description: 'Adjust SRT and VTT subtitle timestamps client-side with millisecond accuracy sync offsets.',
  icon: '⏱️',
  accept: '.srt,.vtt',
  maxSizeMB: 10,
  keywords: ['subtitle', 'srt', 'vtt', 'sync', 'timestamp', 'shift', 'adjust', 'subtitles'],
  steps: ['Upload an SRT or VTT subtitle file', 'Enter offset in milliseconds (positive = delay, negative = advance)', 'Preview the timestamp changes', 'Download the adjusted subtitle file'],
  faqs: [
    { question: 'What subtitle formats are supported?', answer: 'SRT (SubRip) and VTT (WebVTT) subtitle formats are supported.' },
    { question: 'What does a positive offset do?', answer: 'A positive offset delays subtitles (makes them appear later). A negative offset advances them (makes them appear earlier).' },
    { question: 'Will this change the subtitle text?', answer: 'No, only the timestamps are adjusted. The subtitle text remains unchanged.' }
  ]
};

function extractPreview(content, isVtt, maxEntries = 5) {
  const lines = content.split('\n');
  const previewLines = [];
  let entryCount = 0;
  let i = 0;

  if (isVtt && lines[0]?.trim() === 'WEBVTT') {
    previewLines.push(lines[0]);
    i = 1;
    while (i < lines.length && lines[i]?.trim() === '') previewLines.push(lines[i++]);
  }

  while (i < lines.length && entryCount < maxEntries) {
    const line = lines[i].trim();
    if (line.includes('-->')) {
      entryCount++;
      previewLines.push(lines[i]);
      i++;
      while (i < lines.length && lines[i].trim() && !lines[i].includes('-->')) previewLines.push(lines[i++]);
      if (i < lines.length && lines[i]?.trim() === '') previewLines.push(lines[i++]);
    } else {
      previewLines.push(lines[i]);
      i++;
    }
  }

  if (entryCount >= maxEntries) previewLines.push('...');
  return previewLines.join('\n');
}

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div class="form-group">
        <label>Upload Subtitle File</label>
        <input type="file" id="sts-file" accept=".srt,.vtt" class="text-input">
      </div>
      
      <div class="form-group">
        <label>Offset (milliseconds)</label>
        <div style="display:flex;gap:var(--space-2);align-items:center;">
          <input type="range" id="sts-offset-slider" min="-5000" max="5000" step="100" value="0" style="flex:1;">
          <input type="number" id="sts-offset-input" class="text-input" value="0" min="-50000" max="50000" style="width:100px;">
          <span>ms</span>
        </div>
        <div style="display:flex;gap:var(--space-2);margin-top:var(--space-2);">
          <button class="btn btn-sm btn-secondary" id="sts-preset-100">+100ms</button>
          <button class="btn btn-sm btn-secondary" id="sts-preset-500">+500ms</button>
          <button class="btn btn-sm btn-secondary" id="sts-preset-1000">+1000ms</button>
          <button class="btn btn-sm btn-secondary" id="sts-preset-n100">-100ms</button>
          <button class="btn btn-sm btn-secondary" id="sts-preset-n500">-500ms</button>
          <button class="btn btn-sm btn-secondary" id="sts-preset-n1000">-1000ms</button>
        </div>
      </div>
      
      <div id="sts-preview" style="display:none;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
          <label style="margin-bottom:0;font-weight:600;">Preview (first 5 entries)</label>
          <div style="display:flex;gap:var(--space-2);">
            <button class="btn btn-sm btn-secondary" id="sts-copy">Copy</button>
            <button class="btn btn-sm btn-primary" id="sts-download">Download</button>
          </div>
        </div>
        <pre id="sts-output" style="background:var(--color-code-bg, #1e1e2e);color:#cdd6f4;padding:var(--space-3);border-radius:var(--radius-md);overflow-x:auto;font-size:var(--text-sm);line-height:1.6;white-space:pre-wrap;word-break:break-all;min-height:120px;font-family:monospace;max-height:300px;overflow-y:auto;"></pre>
      </div>
      
      <div id="sts-info" style="display:none;margin-top:var(--space-3);padding:var(--space-3);background:var(--color-surface);border-radius:var(--radius-md);font-size:var(--text-sm);">
        <div>Format: <strong id="sts-format">-</strong></div>
        <div>Entries: <strong id="sts-count">-</strong></div>
        <div>Offset: <strong id="sts-applied-offset">0 ms</strong></div>
      </div>
    </div>
  `;

  const fileInput = container.querySelector('#sts-file');
  const offsetSlider = container.querySelector('#sts-offset-slider');
  const offsetInput = container.querySelector('#sts-offset-input');
  const preview = container.querySelector('#sts-preview');
  const output = container.querySelector('#sts-output');
  const copyBtn = container.querySelector('#sts-copy');
  const downloadBtn = container.querySelector('#sts-download');
  const info = container.querySelector('#sts-info');
  const formatEl = container.querySelector('#sts-format');
  const countEl = container.querySelector('#sts-count');
  const appliedOffsetEl = container.querySelector('#sts-applied-offset');

  let originalContent = '';
  let currentFileName = '';
  let isVtt = false;

  function updateOutput() {
    if (!originalContent) return;
    const offset = parseInt(offsetInput.value) || 0;
    const shifted = shiftSubtitles(originalContent, offset, isVtt);
    output.textContent = extractPreview(shifted, isVtt);
    appliedOffsetEl.textContent = `${offset} ms`;
  }

  function setOffset(value) {
    offsetInput.value = value;
    offsetSlider.value = value;
    updateOutput();
  }

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    currentFileName = file.name;
    isVtt = file.name.toLowerCase().endsWith('.vtt');
    formatEl.textContent = isVtt ? 'WebVTT (.vtt)' : 'SRT (.srt)';

    const reader = new FileReader();
    reader.onload = (event) => {
      originalContent = event.target.result;
      const count = (originalContent.split('\n').filter(l => l.trim().includes('-->')).length);
      countEl.textContent = count;
      preview.style.display = 'block';
      info.style.display = 'block';
      updateOutput();
    };
    reader.readAsText(file);
  });

  offsetSlider.addEventListener('input', () => {
    offsetInput.value = offsetSlider.value;
    updateOutput();
  });

  offsetInput.addEventListener('input', () => {
    offsetSlider.value = offsetInput.value;
    updateOutput();
  });

  const presets = [100, 500, 1000, -100, -500, -1000];
  const presetIds = ['sts-preset-100', 'sts-preset-500', 'sts-preset-1000', 'sts-preset-n100', 'sts-preset-n500', 'sts-preset-n1000'];
  for (let i = 0; i < presets.length; i++) {
    container.querySelector(`#${presetIds[i]}`).addEventListener('click', () => setOffset(presetIds[i].includes('n') ? -Math.abs(presets[i]) : presets[i]));
  }

  copyBtn.addEventListener('click', async () => {
    if (!originalContent) return;
    const offset = parseInt(offsetInput.value) || 0;
    const shifted = shiftSubtitles(originalContent, offset, isVtt);
    const success = await copyToClipboard(shifted);
    if (success) {
      showToast({ message: 'Shifted subtitles copied to clipboard', type: 'success' });
    } else {
      showToast({ message: 'Failed to copy', type: 'error' });
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!originalContent) return;
    const offset = parseInt(offsetInput.value) || 0;
    const shifted = shiftSubtitles(originalContent, offset, isVtt);
    const blob = new Blob([shifted], { type: isVtt ? 'text/vtt' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = currentFileName.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}_shifted${isVtt ? '.vtt' : '.srt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast({ message: 'Subtitle file downloaded', type: 'success' });
  });
}

export function destroy() {}