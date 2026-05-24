const PASSAGES = [
  'The quick brown fox jumps over the lazy dog near the bank of the river. She sells seashells by the seashore under the bright sun.',
  'A journey of a thousand miles begins with a single step forward every day. In the middle of difficulty lies opportunity for those who seek it.',
  'The only limit to our realization of tomorrow will be our doubts of today. Let us move forward with hope and determination.',
  'Life is what happens when you are busy making other plans. Time waits for no one so seize the day and make it count.',
  'To be or not to be that is the question that we all must answer in our own way. The world is full of possibilities.',
  'Success is not final failure is not fatal it is the courage to continue that counts in the end. Keep moving forward.',
  'The best time to plant a tree was twenty years ago but the second best time is right now. Do not wait for tomorrow.',
  'In the middle of every difficulty lies opportunity for growth and change. Embrace the challenges that come your way today.',
  'The only way to do great work is to love what you do and never stop learning new things every single day of your life.',
  'It does not matter how slowly you go as long as you do not stop moving forward toward your goals and dreams.',
];

function randomPassage() {
  return PASSAGES[Math.floor(Math.random() * PASSAGES.length)];
}

export function calcStats(input, target, elapsed) {
  const sec = elapsed / 1000;
  const minutes = sec / 60;
  const words = input.length / 5;
  const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
  let correct = 0;
  for (let i = 0; i < input.length; i++) {
    if (i < target.length && input[i] === target[i]) correct++;
  }
  const accuracy = input.length > 0 ? Math.round((correct / input.length) * 100) : 100;
  return { wpm, accuracy, charsTyped: input.length, charsCorrect: correct, seconds: Math.round(sec) };
}

export const toolConfig = {
  id: 'typing-speed-test',
  name: 'Typing Speed Test',
  category: 'fun',
  description: 'Test your typing speed in words per minute with accuracy tracking.',
  icon: '⌨️',
  accept: null,
  maxSizeMB: null,
  keywords: ['typing', 'speed', 'wpm', 'typing test', 'words per minute', 'keyboard'],
  steps: ['Type the displayed text', 'Timer starts automatically', 'Review your WPM and accuracy after 30 seconds'],
  faqs: [
    { question: 'How is WPM calculated?', answer: 'WPM = (total characters typed / 5) / minutes elapsed.' },
    { question: 'What happens when time runs out?', answer: 'The test stops at 30 seconds and shows your results.' }
  ]
};

export function render(container) {
  const passage = randomPassage();
  let startTime = null;
  let finished = false;
  let timer = null;

  container.innerHTML = `
    <div class="tool-layout">
      <div style="display:flex;gap:var(--space-4);margin-bottom:var(--space-4);flex-wrap:wrap;">
        <div style="flex:1;min-width:120px;text-align:center;padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md);">
          <div style="font-size:var(--text-xs);color:var(--color-text-muted);text-transform:uppercase;">WPM</div>
          <div id="ts-wpm" style="font-size:var(--text-2xl);font-weight:700;">0</div>
        </div>
        <div style="flex:1;min-width:120px;text-align:center;padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md);">
          <div style="font-size:var(--text-xs);color:var(--color-text-muted);text-transform:uppercase;">Accuracy</div>
          <div id="ts-acc" style="font-size:var(--text-2xl);font-weight:700;">100%</div>
        </div>
        <div style="flex:1;min-width:120px;text-align:center;padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md);">
          <div style="font-size:var(--text-xs);color:var(--color-text-muted);text-transform:uppercase;">Time</div>
          <div id="ts-time" style="font-size:var(--text-2xl);font-weight:700;">30s</div>
        </div>
      </div>
      <div style="border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);margin-bottom:var(--space-3);font-size:var(--text-lg);line-height:1.6;font-family:monospace;background:var(--color-bg-secondary);" id="ts-passage"></div>
      <textarea id="ts-input" class="text-input" placeholder="Start typing here..." style="width:100%;min-height:100px;resize:none;font-family:monospace;font-size:var(--text-lg);" disabled></textarea>
      <button class="btn btn-primary btn-lg" id="ts-start" style="width:100%;margin-top:var(--space-3);">Start Test</button>
    </div>
  `;

  const passageEl = container.querySelector('#ts-passage');
  const inputEl = container.querySelector('#ts-input');
  const startBtn = container.querySelector('#ts-start');
  const wpmEl = container.querySelector('#ts-wpm');
  const accEl = container.querySelector('#ts-acc');
  const timeEl = container.querySelector('#ts-time');

  function renderPassage(input) {
    let html = '';
    for (let i = 0; i < passage.length; i++) {
      if (i < input.length) {
        const match = input[i] === passage[i];
        html += `<span style="color:${match ? 'var(--color-success)' : 'var(--color-danger)'};${match ? '' : 'background:rgba(239,68,68,0.2);'}">${esc(passage[i])}</span>`;
      } else if (i === input.length) {
        html += `<span style="background:var(--color-primary);color:#fff;">${esc(passage[i])}</span>`;
      } else {
        html += `<span>${esc(passage[i])}</span>`;
      }
    }
    passageEl.innerHTML = html;
  }

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function updateStats(input) {
    const elapsed = Date.now() - startTime;
    const stats = calcStats(input, passage, elapsed);
    wpmEl.textContent = stats.wpm;
    accEl.textContent = stats.accuracy + '%';
    const remaining = Math.max(0, 30 - stats.seconds);
    timeEl.textContent = remaining + 's';
    return stats;
  }

  function endTest(input) {
    finished = true;
    if (timer) clearInterval(timer);
    inputEl.disabled = true;
    startBtn.textContent = 'Try Again';
    startBtn.style.display = '';

    const stats = updateStats(input);
    passageEl.innerHTML = `<div style="text-align:center;padding:var(--space-4);">
      <div style="font-size:var(--text-3xl);font-weight:700;">${stats.wpm} WPM</div>
      <div style="color:var(--color-text-muted);">${stats.accuracy}% accuracy &middot; ${stats.charsCorrect}/${stats.charsTyped} correct characters</div>
    </div>`;
  }

  function startTest() {
    finished = false;
    startTime = Date.now();
    inputEl.disabled = false;
    inputEl.value = '';
    inputEl.focus();
    startBtn.style.display = 'none';
    renderPassage('');

    timer = setInterval(() => {
      if (finished) return;
      const elapsed = Date.now() - startTime;
      if (elapsed >= 30000) {
        endTest(inputEl.value);
        return;
      }
      updateStats(inputEl.value);
    }, 100);
  }

  startBtn.addEventListener('click', startTest);

  inputEl.addEventListener('input', () => {
    if (finished) return;
    renderPassage(inputEl.value);
    updateStats(inputEl.value);
  });

  inputEl.addEventListener('keydown', (e) => {
    if (finished) return;
    if (!startTime) startTest();
  });
}

export function destroy() {
  if (this._cleanup) this._cleanup();
}
