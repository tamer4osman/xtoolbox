export function calcTimeRemaining(target) {
  const diff = target - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const totalSec = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    expired: false
  };
}

export const toolConfig = {
  id: 'countdown-timer',
  name: 'Countdown Timer',
  category: 'productivity',
  description: 'Count down to a specific date or event. Save multiple countdowns and see live updates.',
  icon: '⏳',
  accept: null,
  maxSizeMB: null,
  keywords: ['countdown', 'timer', 'countdown timer', 'event countdown', 'days until'],
  steps: ['Enter event name and date', 'Click "Start Countdown"', 'Watch live countdown'],
  faqs: [
    { question: 'Does it save my countdowns?', answer: 'Yes! Countdowns are saved in your browser and persist across page loads.' },
    { question: 'What happens when time runs out?', answer: 'The countdown shows "Time\'s up!" but remains visible.' }
  ]
};

const STORAGE_KEY = 'xtoolbox-countdowns';

function saveCountdowns(countdowns) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(countdowns)); } catch {}
}

function loadCountdowns() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function render(container) {
  let countdowns = loadCountdowns();
  let intervals = [];

  function renderAll() {
    const list = container.querySelector('#cd-list');
    if (!list) return;
    list.innerHTML = '';

    if (countdowns.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:var(--space-8);color:var(--color-text-muted);">No countdowns yet. Add one above!</div>';
      return;
    }

    for (let i = 0; i < countdowns.length; i++) {
      const cd = countdowns[i];
      const rem = calcTimeRemaining(cd.target);
      const card = document.createElement('div');
      card.style.cssText = 'border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);margin-bottom:var(--space-3);';
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-2);">
          <div>
            <div style="font-weight:600;font-size:var(--text-base);">${esc(cd.name)}</div>
            <div style="font-size:var(--text-xs);color:var(--color-text-muted);">${new Date(cd.target).toLocaleString()}</div>
          </div>
          <button class="btn btn-sm btn-secondary" data-del="${i}" style="font-size:var(--text-xs);padding:var(--space-1) var(--space-2);">Delete</button>
        </div>
        <div style="display:flex;gap:var(--space-3);justify-content:center;margin-top:var(--space-3);">
          ${rem.expired ? '<div style="font-size:var(--text-xl);font-weight:700;color:var(--color-primary);">Time\'s up!</div>'
          : ['days', 'hours', 'minutes', 'seconds'].map(u => `
            <div style="text-align:center;">
              <div style="font-size:var(--text-2xl);font-weight:700;line-height:1;">${rem[u]}</div>
              <div style="font-size:var(--text-xs);color:var(--color-text-muted);text-transform:uppercase;">${u}</div>
            </div>
          `).join('')}
        </div>
      `;
      list.appendChild(card);

      card.querySelector('[data-del]')?.addEventListener('click', () => {
        countdowns.splice(i, 1);
        saveCountdowns(countdowns);
        renderAll();
      });
    }
  }

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  container.innerHTML = `
    <div class="tool-layout">
      <div style="border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);margin-bottom:var(--space-6);">
        <div class="form-group">
          <label>Event Name</label>
          <input type="text" id="event-name" class="text-input" placeholder="e.g. New Year 2027" value="New Year 2027">
        </div>
        <div class="form-group">
          <label>Target Date & Time</label>
          <input type="datetime-local" id="event-date" class="text-input">
        </div>
        <button class="btn btn-primary btn-lg" id="add-btn" style="width:100%;">Start Countdown</button>
      </div>
      <div id="cd-list"></div>
    </div>
  `;

  const nameInput = container.querySelector('#event-name');
  const dateInput = container.querySelector('#event-date');
  const addBtn = container.querySelector('#add-btn');

  dateInput.value = new Date(Date.now() + 86400000).toISOString().slice(0, 16);

  addBtn.addEventListener('click', () => {
    const name = nameInput.value.trim() || 'Countdown';
    const dateVal = dateInput.value;
    if (!dateVal) { return; }
    const target = new Date(dateVal).getTime();
    if (target <= Date.now()) { return; }

    countdowns.push({ name, target, created: Date.now() });
    saveCountdowns(countdowns);
    renderAll();
    nameInput.value = '';
  });

  renderAll();

  const id = setInterval(renderAll, 1000);
  intervals.push(id);

  container._cleanup = () => {
    for (const id of intervals) clearInterval(id);
    intervals = [];
  };
}

export function destroy() {
  if (this._cleanup) this._cleanup();
}
