export function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const millis = ms % 1000;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

export const toolConfig = {
  id: 'stopwatch',
  name: 'Stopwatch with Lap Timer',
  category: 'productivity',
  description: 'Start, pause, and reset a stopwatch with lap time tracking.',
  icon: '⏱️',
  accept: null,
  maxSizeMB: null,
  keywords: ['stopwatch', 'lap timer', 'timer', 'count up', 'time'],
  steps: ['Click Start to begin timing', 'Click Lap to record a split time', 'Click Reset to clear all laps'],
  faqs: [
    { question: 'Can I record multiple laps?', answer: 'Yes! Click Lap to record as many laps as you want.' },
    { question: 'Does it keep running in the background?', answer: 'Yes, the timer keeps running even if you switch tabs.' }
  ]
};

export function render(container) {
  let running = false;
  let startTime = null;
  let elapsed = 0;
  let lastLapTime = 0;
  let lapCount = 0;
  let animId = null;
  const laps = [];

  container.innerHTML = `
    <div class="tool-layout">
      <div style="text-align:center;padding:var(--space-6) 0;">
        <div id="sw-display" style="font-size:3rem;font-weight:700;font-family:monospace;letter-spacing:2px;margin-bottom:var(--space-4);">00:00:00.000</div>
        <div style="display:flex;gap:var(--space-2);justify-content:center;flex-wrap:wrap;">
          <button class="btn btn-primary btn-lg" id="sw-start" style="min-width:100px;">Start</button>
          <button class="btn btn-secondary btn-lg" id="sw-lap" style="min-width:100px;" disabled>Lap</button>
          <button class="btn btn-secondary btn-lg" id="sw-reset" style="min-width:100px;">Reset</button>
        </div>
      </div>
      <div id="sw-laps" style="border-top:1px solid var(--color-border);padding-top:var(--space-3);">
        <h3 style="margin-bottom:var(--space-2);">Laps</h3>
        <div id="sw-lap-list" style="max-height:300px;overflow-y:auto;"></div>
      </div>
    </div>
  `;

  const display = container.querySelector('#sw-display');
  const startBtn = container.querySelector('#sw-start');
  const lapBtn = container.querySelector('#sw-lap');
  const resetBtn = container.querySelector('#sw-reset');
  const lapList = container.querySelector('#sw-lap-list');

  function updateDisplay() {
    const now = running ? Date.now() : startTime || Date.now();
    const total = elapsed + (running ? now - startTime : 0);
    display.textContent = formatTime(total);
  }

  function tick() {
    updateDisplay();
    if (running) animId = requestAnimationFrame(tick);
  }

  function renderLaps() {
    if (laps.length === 0) {
      lapList.innerHTML = '<div style="color:var(--color-text-muted);font-size:var(--text-sm);">No laps recorded yet.</div>';
      return;
    }
    const total = elapsed + (running ? Date.now() - startTime : 0);
    lapList.innerHTML = laps.map((l, i) => {
      const diff = i === 0 ? l.lapTime : l.lapTime - laps[i - 1].lapTime;
      return `<div style="display:flex;justify-content:space-between;padding:var(--space-2) 0;border-bottom:1px solid var(--color-border);font-family:monospace;">
        <span>Lap ${i + 1}</span>
        <span style="color:var(--color-text-muted);">+${formatTime(diff)}</span>
        <span>${formatTime(l.lapTime)}</span>
      </div>`;
    }).join('');
  }

  startBtn.addEventListener('click', () => {
    if (running) {
      running = false;
      elapsed += Date.now() - startTime;
      if (animId) cancelAnimationFrame(animId);
      startBtn.textContent = 'Resume';
      lapBtn.disabled = true;
      updateDisplay();
    } else {
      running = true;
      startTime = Date.now();
      startBtn.textContent = 'Pause';
      lapBtn.disabled = false;
      tick();
    }
  });

  lapBtn.addEventListener('click', () => {
    if (!running) return;
    lapCount++;
    const total = elapsed + (Date.now() - startTime);
    laps.push({ lapTime: total, index: lapCount });
    renderLaps();
  });

  resetBtn.addEventListener('click', () => {
    running = false;
    elapsed = 0;
    startTime = null;
    lapCount = 0;
    laps.length = 0;
    if (animId) cancelAnimationFrame(animId);
    startBtn.textContent = 'Start';
    lapBtn.disabled = true;
    updateDisplay();
    renderLaps();
  });

  renderLaps();
}

export function destroy() {}
