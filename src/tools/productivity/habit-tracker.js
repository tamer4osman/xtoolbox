import { downloadBlob } from '../../utils/file.js';

export const toolConfig = {
  id: 'habit-tracker',
  name: 'Habit Tracker',
  category: 'productivity',
  description: 'GitHub-style contribution graph for daily habits with streak tracking and heatmaps.',
  icon: '📅',
  keywords: ['habit', 'tracker', 'streak', 'heatmap', 'productivity', 'goals'],
  accept: '',
  maxSizeMB: 10
};

const STORAGE_KEY = 'habit-tracker-v2';

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { habits: {}, completions: {} };
  } catch {
    return { habits: {}, completions: {} };
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Save failed:', e);
  }
}

const styles = `
  .habits-grid { display: flex; flex-direction: column; gap: 12px; margin: 20px 0; }
  .habit-card { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--bg-secondary); border-radius: 8px; }
  .habit-name { flex: 1; font-weight: 500; }
  .habit-streak { color: var(--text-secondary); font-size: 13px; }
  .btn-today { padding: 8px 16px; border-radius: 6px; border: none; background: var(--primary); color: white; cursor: pointer; }
  .btn-today.completed { background: #22c55e; }
  .btn-delete { background: transparent; border: none; color: #ef4444; font-size: 18px; cursor: pointer; padding: 4px 8px; }
  .h-grid { display: flex; gap: 3px; margin: 16px 0; }
  .h-week { display: flex; flex-direction: column; gap: 3px; }
  .h-cell { width: 12px; height: 12px; border-radius: 2px; background: #ebedf0; border: 1px solid #ccc; }
  .h-cell[data-level="1"] { background: #9be9a8; border-color: #40a857; }
  .h-cell[data-level="2"] { background: #40c463; border-color: #2d8f42; }
  .h-cell[data-level="3"] { background: #30a14e; border-color: #1a632e; }
  .h-cell[data-level="4"] { background: #216e39; border-color: #144023; }
  .h-cell.level-1 { background: #9be9a8; }
  .h-cell.level-2 { background: #40c463; }
  .h-cell.level-3 { background: #30a14e; }
  .h-cell.level-4 { background: #216e39; }
  .empty-state { color: var(--text-secondary); font-style: italic; }
`;

export function render(container) {
  let state = loadData();

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  container.appendChild(styleEl);

  container.innerHTML = `
    <div class="tool-container">
      <h1>${toolConfig.name}</h1>
      <p>${toolConfig.description}</p>
      <div class="form-section">
        <label>Add New Habit</label>
        <div class="input-group">
          <input type="text" id="newHabit" placeholder="e.g., Exercise, Read, Meditate" />
          <button type="button" id="addHabit" class="btn-primary">Add</button>
        </div>
      </div>
      <div id="habitsList" class="habits-grid"></div>
      <div class="form-section">
        <h3>${new Date().getFullYear()} Activity</h3>
        <div id="heatmap" class="hm-area"></div>
        <div class="heatmap-legend">
          <span>Less</span>
          <div class="h-cell"></div>
          <div class="h-cell level-1"></div>
          <div class="h-cell level-2"></div>
          <div class="h-cell level-3"></div>
          <div class="h-cell level-4"></div>
          <span>More</span>
        </div>
      </div>
      <div class="form-section">
        <button type="button" id="exportData" class="btn-secondary">Export</button>
        <button type="button" id="clearData" class="btn-danger">Clear All</button>
      </div>
    </div>
  `;

  const $ = (id) => container.querySelector(id);
  const el = (sel) => container.querySelector(sel);

  function renderHabits() {
    const list = $('#habitsList');
    const habitNames = Object.keys(state.habits);
    
    if (habitNames.length === 0) {
      list.innerHTML = '<p class="empty-state">No habits yet. Add your first habit above!</p>';
      return;
    }

    list.innerHTML = habitNames.map(name => {
      const completions = state.completions[name] || [];
      const today = new Date().toISOString().split('T')[0];
      const done = completions.includes(today);
      const streak = calculateStreak(completions);

      return `
        <div class="habit-card">
          <span class="habit-name">${name}</span>
          <span class="habit-streak">${streak} day streak</span>
          <button type="button" class="btn-today ${done ? 'completed' : ''}" data-name="${name}">
            ${done ? '✓ Done' : 'Mark Today'}
          </button>
          <button type="button" class="btn-delete" data-name="${name}">&times;</button>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-today').forEach(btn => {
      btn.addEventListener('click', () => toggleHabit(btn.dataset.name));
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteHabit(btn.dataset.name));
    });
  }

  function calculateStreak(completions) {
    if (!completions || completions.length === 0) return 0;
    
    const sorted = [...completions].sort();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (sorted[sorted.length - 1] !== today && sorted[sorted.length - 1] !== yesterday) return 0;
    
    let streak = 0;
    let checkDate = new Date();
    
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (completions.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }

  function toggleHabit(name) {
    const today = new Date().toISOString().split('T')[0];
    if (!state.completions[name]) state.completions[name] = [];
    
    const idx = state.completions[name].indexOf(today);
    if (idx > -1) {
      state.completions[name].splice(idx, 1);
    } else {
      state.completions[name].push(today);
    }
    
    saveData(state);
    renderHabits();
    renderHeatmap();
  }

  function deleteHabit(name) {
    if (!confirm(`Delete "${name}"?`)) return;
    delete state.habits[name];
    delete state.completions[name];
    saveData(state);
    renderHabits();
    renderHeatmap();
  }

  function renderHeatmap() {
    const hm = $('#heatmap');
    const year = new Date().getFullYear();
    const habitCounts = {};
    
    Object.values(state.completions).forEach(dates => {
      dates.forEach(d => habitCounts[d] = (habitCounts[d] || 0) + 1);
    });

    const weeks = [];
    const start = new Date(year, 0, 1);
    start.setDate(start.getDate() - start.getDay());

    let current = new Date(start);
    for (let w = 0; w < 53; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().split('T')[0];
        const count = current.getFullYear() === year ? (habitCounts[dateStr] || 0) : 0;
        let level = 0;
        if (count > 0) level = 1;
        if (count >= 2) level = 2;
        if (count >= 3) level = 3;
        if (count >= 4) level = 4;
        
        const bg = level === 0 ? '#ebedf0' : level === 1 ? '#9be9a8' : level === 2 ? '#40c463' : level === 3 ? '#30a14e' : '#216e39';
        days.push(`<div class="h-cell" style="background:${bg};width:11px;height:11px;border-radius:2px;display:inline-block;margin:1px;" title="${dateStr}: ${count} habits"></div>`);
        current.setDate(current.getDate() + 1);
      }
      weeks.push(`<div class="h-week">${days.join('')}</div>`);
    }

    hm.innerHTML = `<div class="h-grid">${weeks.join('')}</div>`;
  }

  el('#addHabit').addEventListener('click', () => {
    const name = $('#newHabit').value.trim();
    if (!name || state.habits[name]) return;
    state.habits[name] = true;
    if (!state.completions[name]) state.completions[name] = [];
    saveData(state);
    $('#newHabit').value = '';
    renderHabits();
    renderHeatmap();
  });

  el('#exportData').addEventListener('click', () => {
    downloadBlob(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }), 'habits.json');
  });

  el('#clearData').addEventListener('click', () => {
    if (!confirm('Clear all?')) return;
    state = { habits: {}, completions: {} };
    saveData(state);
    renderHabits();
    renderHeatmap();
  });

  renderHabits();
  renderHeatmap();
}