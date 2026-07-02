import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { loadAudioFile } from './audio-utils.js';
import { downloadBlob } from '../../utils/file.js';

export const toolConfig = {
  id: 'video-transcriber',
  name: 'Local Video Transcriber',
  category: 'video',
  description: 'Transcribe video/audio to text locally using browser speech recognition.',
  icon: '📝',
  accept: 'audio/*,video/*',
  maxSizeMB: 100,
  keywords: ['transcribe', 'video', 'whisper', 'speech', 'text', 'audio'],
  steps: ['Upload a video or audio file', 'Wait for transcription to complete', 'Copy or download the transcript'],
  faqs: [
    { question: 'Is my audio sent to a server?', answer: 'No. Transcription happens entirely in your browser using the Web Speech API.' },
    { question: 'What languages are supported?', answer: 'Depends on your browser. Chrome supports 100+ languages for speech recognition.' }
  ]
};

export function createSpeechRecognizer(lang = 'en-US') {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  const recognizer = new SpeechRecognition();
  recognizer.continuous = true;
  recognizer.interimResults = false;
  recognizer.lang = lang;
  return recognizer;
}

export function formatTranscript(segments) {
  return segments.map((s, i) => `[${formatTime(s.start)}] ${s.text}`).join('\n');
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function render(container) {
  let audioBuffer = null;
  let audioElement = null;
  let recognizer = null;
  let segments = [];

  const upload = createFileUpload({
    accept: 'audio/*,video/*',
    multiple: false,
    maxSizeMB: 100,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      try {
        const file = files[0];
        audioElement = new Audio();
        audioElement.src = URL.createObjectURL(file);
        audioElement.crossOrigin = 'anonymous';
        optionsArea.style.display = 'block';
        transcriptArea.style.display = 'none';
        transcribeBtn.disabled = false;
        showToast({ message: 'Media loaded. Click Transcribe.', type: 'success' });
      } catch {
        showToast({ message: 'Failed to load media file.', type: 'error' });
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div class="form-group">
          <label for="lang-select">Language</label>
          <select id="lang-select" class="text-input">
            <option value="en-US">English</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
            <option value="it-IT">Italian</option>
            <option value="pt-BR">Portuguese</option>
            <option value="ja-JP">Japanese</option>
            <option value="ko-KR">Korean</option>
            <option value="zh-CN">Chinese</option>
            <option value="ar-SA">Arabic</option>
          </select>
        </div>
        <button class="btn btn-primary btn-lg" id="transcribe-btn" style="width:100%;">Transcribe</button>
      </div>
      <div id="transcript-area" style="display:none;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
          <div style="font-weight:600;">Transcript</div>
          <div style="display:flex;gap:var(--space-2);">
            <button class="btn btn-secondary btn-sm" id="copy-btn">Copy</button>
            <button class="btn btn-secondary btn-sm" id="download-btn">Download</button>
          </div>
        </div>
        <textarea id="transcript-text" class="text-input" rows="15" readonly style="width:100%;font-family:monospace;"></textarea>
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const transcriptArea = container.querySelector('#transcript-area');
  const transcribeBtn = container.querySelector('#transcribe-btn');
  const langSelect = container.querySelector('#lang-select');
  const transcriptText = container.querySelector('#transcript-text');
  const copyBtn = container.querySelector('#copy-btn');
  const downloadBtn = container.querySelector('#download-btn');

  transcribeBtn.addEventListener('click', () => {
    if (!audioElement) return;
    recognizer = createSpeechRecognizer(langSelect.value);
    if (!recognizer) {
      showToast({ message: 'Speech recognition not supported in this browser.', type: 'error' });
      return;
    }
    segments = [];
    transcribeBtn.disabled = true;
    transcribeBtn.textContent = 'Transcribing...';
    transcriptArea.style.display = 'block';

    recognizer.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          segments.push({
            text: event.results[i][0].transcript,
            start: segments.length * 3
          });
        }
      }
      transcriptText.value = formatTranscript(segments);
    };

    recognizer.onend = () => {
      transcribeBtn.disabled = false;
      transcribeBtn.textContent = 'Transcribe Again';
      showToast({ message: `Transcription complete: ${segments.length} segments.`, type: 'success' });
    };

    recognizer.onerror = (event) => {
      transcribeBtn.disabled = false;
      transcribeBtn.textContent = 'Transcribe';
      showToast({ message: `Recognition error: ${event.error}`, type: 'error' });
    };

    audioElement.play();
    recognizer.start();
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(transcriptText.value);
    showToast({ message: 'Transcript copied to clipboard.', type: 'success' });
  });

  downloadBtn.addEventListener('click', () => {
    const blob = new Blob([transcriptText.value], { type: 'text/plain' });
    downloadBlob(blob, 'transcript.txt');
  });
}

export function destroy() {}
