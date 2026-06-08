import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { audioBufferToWav, reverseAudioBuffer, drawWaveform, formatAudioTime } from './audio-utils.js';
import { createAudioTool } from './audio-tool-factory.js';

export const toolConfig = {
  id: 'reverse-audio',
  name: 'Audio Reverser',
  category: 'audio',
  description: 'Play an audio file backwards.',
  icon: '⏪',
  accept: 'audio/*',
  maxSizeMB: 100,
  keywords: ['reverse audio', 'play backwards', 'audio reverser'],
  steps: ['Upload an audio file', 'Click "Reverse"', 'Preview or download'],
  faqs: [{ question: 'Why would I reverse audio?', answer: 'For creative effects, hidden messages, or music production.' }]
};

export function render(container) {
  const { getAudioBuffer, optionsArea } = createAudioTool({
    container,
    onFileLoaded(buf) {
      durationInfo.textContent = `Duration: ${formatAudioTime(buf.duration)}`;
      waveformCanvas.width = 600;
      waveformCanvas.height = 80;
      drawWaveform(buf, waveformCanvas);
    }
  });

  optionsArea.innerHTML = `
    <div id="duration-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">-</div>
    <div style="text-align:center;margin:var(--space-4) 0;">
      <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:var(--space-2);">Original Waveform</div>
      <canvas id="waveform" style="width:100%;height:80px;border:1px solid var(--color-border);border-radius:var(--radius-md);"></canvas>
    </div>
    <button class="btn btn-primary btn-lg" id="reverse-btn" style="width:100%;">⏪ Reverse & Download</button>
  `;

  const durationInfo = optionsArea.querySelector('#duration-info');
  const waveformCanvas = optionsArea.querySelector('#waveform');
  const reverseBtn = optionsArea.querySelector('#reverse-btn');

  reverseBtn.addEventListener('click', () => {
    const buf = getAudioBuffer();
    if (!buf) return;
    downloadBlob(audioBufferToWav(reverseAudioBuffer(buf)), 'reversed.wav');
    showToast({ message: 'Audio reversed!', type: 'success' });
  });
}

export function destroy() {}
