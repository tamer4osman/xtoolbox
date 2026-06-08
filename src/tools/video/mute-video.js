import { showToast } from '../../components/toast.js';
import { createVideoTool } from './video-tool-factory.js';

export const toolConfig = {
  id: 'mute-video',
  name: 'Mute Video',
  category: 'video',
  description: 'Remove audio track from a video file.',
  icon: '🔇',
  accept: 'video/*',
  maxSizeMB: 500,
  keywords: ['mute video', 'remove audio', 'silent video'],
  steps: ['Upload a video', 'Click "Remove Audio"', 'Download muted video'],
  faqs: [
    { question: 'Does this affect video quality?', answer: 'No. Only the audio track is removed. Video quality is preserved.' }
  ]
};

export function render(container) {
  const { optionsArea, runFFmpeg } = createVideoTool({ container });

  optionsArea.innerHTML += `
    <button class="btn btn-primary btn-lg" id="mute-btn" style="width:100%;">🔇 Remove Audio & Download</button>
  `;

  const muteBtn = optionsArea.querySelector('#mute-btn');

  muteBtn.addEventListener('click', async () => {
    try {
      muteBtn.style.display = 'none';
      await runFFmpeg('output.mp4', ['-an', '-c:v', 'copy', 'output.mp4'], 'video/mp4', 'muted.mp4');
      showToast({ message: 'Audio removed!', type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      muteBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
