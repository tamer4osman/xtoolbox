import { showToast } from '../../components/toast.js';

const STORAGE_KEY = 'world-clock:state';

const DEFAULT_ZONES = [
  'America/New_York',
  'Europe/London',
  'Europe/Istanbul',
  'Asia/Tokyo',
  'Australia/Sydney'
];

const CITY_LABELS = {
  'America/New_York': 'New York',
  'America/Los_Angeles': 'Los Angeles',
  'America/Chicago': 'Chicago',
  'America/Toronto': 'Toronto',
  'America/Sao_Paulo': 'São Paulo',
  'Europe/London': 'London',
  'Europe/Paris': 'Paris',
  'Europe/Berlin': 'Berlin',
  'Europe/Madrid': 'Madrid',
  'Europe/Rome': 'Rome',
  'Europe/Moscow': 'Moscow',
  'Europe/Istanbul': 'Istanbul',
  'Africa/Cairo': 'Cairo',
  'Africa/Johannesburg': 'Johannesburg',
  'Asia/Dubai': 'Dubai',
  'Asia/Kolkata': 'Mumbai',
  'Asia/Bangkok': 'Bangkok',
  'Asia/Singapore': 'Singapore',
  'Asia/Hong_Kong': 'Hong Kong',
  'Asia/Shanghai': 'Shanghai',
  'Asia/Tokyo': 'Tokyo',
  'Asia/Seoul': 'Seoul',
  'Australia/Sydney': 'Sydney',
  'Australia/Melbourne': 'Melbourne',
  'Pacific/Auckland': 'Auckland',
  'Pacific/Honolulu': 'Honolulu'
};

export const toolConfig = {
  id: 'world-clock',
  name: 'World Clock & Time Zone Converter',
  category: 'reference',
  description: 'Compare current times across multiple time zones and convert a specific date/time between zones. Add cities, reorder, and persist your selection.',
  icon: '🌐',
  accept: null,
  maxSizeMB: null,
  keywords: ['world clock', 'time zone', 'timezone', 'time', 'converter', 'iana', 'utc', 'meeting', 'remote'],
  steps: [
    'Add an IANA time zone (e.g. Europe/Istanbul) or pick a quick city',
    'Watch each clock tick live, reorder, or remove entries',
    'Pick a base zone and source date/time to see the equivalent in every listed zone'
  ],
  faqs: [
    { question: 'What is an IANA time zone?', answer: 'IANA time zones are standard identifiers like "America/New_York" or "Europe/Istanbul". Every modern browser knows how to handle them via the Intl API.' },
    { question: 'Do you handle daylight saving time?', answer: 'Yes. Offsets are computed for the exact moment you are viewing, so DST transitions (spring forward / fall back) are reflected automatically.' },
    { question: 'Can I save my favorite cities?', answer: 'Yes. The list of zones is stored in your browser via localStorage and restored on your next visit. Removing all zones will reset to the default set next time.' },
    { question: 'Is data sent to a server?', answer: 'No. Everything happens locally using your browser\'s built-in Intl and Date APIs.' }
  ]
};

export function getAllTimeZones() {
  try {
    if (typeof Intl.supportedValuesOf === 'function') {
      const zones = Intl.supportedValuesOf('timeZone');
      if (Array.isArray(zones) && zones.length > 0) return zones;
    }
  } catch {
    // fall through to fallback
  }
  return [...new Set([...DEFAULT_ZONES, ...Object.keys(CITY_LABELS)])];
}

export function getZoneOffsetMinutes(zone, date = new Date()) {
  if (!zone) return 0;
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    timeZoneName: 'shortOffset'
  });
  const parts = dtf.formatToParts(date);
  const tzn = parts.find(p => p.type === 'timeZoneName');
  if (!tzn) return 0;
  const m = tzn.value.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/i);
  if (!m) return 0;
  const sign = m[1] === '-' ? -1 : 1;
  const hours = parseInt(m[2], 10) || 0;
  const mins = parseInt(m[3] || '0', 10) || 0;
  return sign * (hours * 60 + mins);
}

export function formatInZone(date, zone, opts = {}) {
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    ...opts,
    timeZone: zone
  };
  try {
    return new Intl.DateTimeFormat('en-GB', options).format(date);
  } catch {
    return '—';
  }
}

export function formatDateInZone(date, zone) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: zone
  }).format(date);
}

export function convertTime(sourceDate, sourceZone, targetZone) {
  if (!sourceZone || !targetZone || !(sourceDate instanceof Date)) return null;
  const sourceOffset = getZoneOffsetMinutes(sourceZone, sourceDate);
  return new Date(sourceDate.getTime() - sourceOffset * 60_000);
}

export function buildSourceUTC(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [y, mo, d] = dateStr.split('-').map(Number);
  const [h, mi] = timeStr.split(':').map(Number);
  if ([y, mo, d, h, mi].some(n => !Number.isFinite(n))) return null;
  return new Date(Date.UTC(y, mo - 1, d, h, mi, 0, 0));
}

export function getDefaultZones() {
  try {
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const list = [...DEFAULT_ZONES];
    if (local && !list.includes(local)) list.unshift(local);
    return list;
  } catch {
    return [...DEFAULT_ZONES];
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.zones)) return parsed;
  } catch {
    // ignore
  }
  return null;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function zoneLabel(zone) {
  return CITY_LABELS[zone] || zone.split('/').pop().replace(/_/g, ' ');
}

function pad2(n) { return String(n).padStart(2, '0'); }

function toDateInputValue(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function toTimeInputValue(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatOffset(min) {
  const sign = min >= 0 ? '+' : '-';
  const a = Math.abs(min);
  return `UTC${sign}${pad2(Math.floor(a / 60))}:${pad2(a % 60)}`;
}

function renderClockRow(z, i, now, state) {
  const offset = getZoneOffsetMinutes(z, now);
  const time = formatInZone(now, z);
  const date = formatDateInZone(now, z);
  const isBase = z === state.baseZone;
  return `
    <div class="wc-row" data-zone="${z}" style="display:grid;grid-template-columns:1fr auto auto;gap:var(--space-3);align-items:center;padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--color-border);${isBase ? 'background:var(--color-primary-light, rgba(99,102,241,0.08));' : ''}">
      <div>
        <div style="font-weight:600;font-size:var(--text-base);">${zoneLabel(z)}</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);">${z} · ${formatOffset(offset)}</div>
      </div>
      <div style="text-align:right;">
        <div class="wc-time" data-zone="${z}" style="font-family:monospace;font-size:var(--text-xl);font-weight:600;letter-spacing:0.05em;">${time}</div>
        <div class="wc-date" data-zone="${z}" style="font-size:var(--text-xs);color:var(--color-text-muted);">${date}</div>
      </div>
      <div style="display:flex;gap:var(--space-1);">
        <button class="btn btn-sm wc-base" data-zone="${z}" type="button" title="Set as converter base" style="background:transparent;border:1px solid var(--color-border);color:var(--color-text-muted);cursor:pointer;padding:2px 6px;border-radius:var(--radius-sm);${isBase ? 'color:var(--color-primary);border-color:var(--color-primary);' : ''}">${isBase ? '★' : '☆'}</button>
        <button class="btn btn-sm wc-up" data-zone="${z}" type="button" title="Move up" style="background:transparent;border:1px solid var(--color-border);color:var(--color-text-muted);cursor:pointer;padding:2px 6px;border-radius:var(--radius-sm);" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button class="btn btn-sm wc-down" data-zone="${z}" type="button" title="Move down" style="background:transparent;border:1px solid var(--color-border);color:var(--color-text-muted);cursor:pointer;padding:2px 6px;border-radius:var(--radius-sm);" ${i === state.zones.length - 1 ? 'disabled' : ''}>↓</button>
        <button class="btn btn-sm wc-rm" data-zone="${z}" type="button" title="Remove" style="background:transparent;border:1px solid var(--color-border);color:var(--color-text-muted);cursor:pointer;padding:2px 6px;border-radius:var(--radius-sm);">×</button>
      </div>
    </div>
  `;
}

function renderConverterCard(z, converted, state) {
  const offset = getZoneOffsetMinutes(z, converted);
  const time = formatInZone(converted, z);
  const date = formatDateInZone(converted, z);
  return `
    <div style="background:var(--color-bg);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-3);">
      <div style="font-size:var(--text-xs);color:var(--color-text-muted);">${zoneLabel(z)} · ${formatOffset(offset)}</div>
      <div style="font-family:monospace;font-size:var(--text-lg);font-weight:600;letter-spacing:0.04em;margin-top:var(--space-1);">${time}</div>
      <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:var(--space-1);">${date}</div>
    </div>
  `;
}

function renderListHtml(zones, now, state) {
  if (zones.length === 0) {
    return '<div style="padding:var(--space-4);text-align:center;color:var(--color-text-muted);font-size:var(--text-sm);">Add a zone to get started.</div>';
  }
  return zones.map((z, i) => renderClockRow(z, i, now, state)).join('');
}

function renderConverterHtml(zones, baseZone, dateStr, timeStr) {
  if (!baseZone) {
    return '<div style="color:var(--color-text-muted);font-size:var(--text-sm);">Pick a base zone above to use the converter.</div>';
  }
  const local = buildSourceUTC(dateStr, timeStr);
  if (!local) {
    return '<div style="color:var(--color-text-muted);font-size:var(--text-sm);">Enter a valid date and time.</div>';
  }
  return zones.map(z => renderConverterCard(z, convertTime(local, baseZone, z))).join('');
}

export function render(container) {
  const allZones = getAllTimeZones();
  const initial = loadState() || { zones: getDefaultZones(), baseZone: null };
  const state = {
    zones: initial.zones.filter(z => allZones.includes(z)),
    baseZone: initial.baseZone && initial.zones.includes(initial.baseZone) ? initial.baseZone : (initial.zones[0] || null)
  };
  if (state.zones.length === 0) state.zones = getDefaultZones();

  const quickPicks = Object.keys(CITY_LABELS).filter(z => !state.zones.includes(z)).slice(0, 8);

  container.innerHTML = `
    <div class="tool-layout">
      <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);margin-bottom:var(--space-4);">
        <label for="wc-input" style="font-size:var(--text-sm);font-weight:600;color:var(--color-text-muted);display:block;margin-bottom:var(--space-2);">Add a time zone (IANA, e.g. <code>Europe/Istanbul</code>)</label>
        <div style="display:flex;gap:var(--space-2);">
          <input type="text" id="wc-input" class="text-input" list="wc-zones" placeholder="Type or pick a zone..." autocomplete="off" style="flex:1;">
          <datalist id="wc-zones">${allZones.map(z => `<option value="${z}"></option>`).join('')}</datalist>
          <button class="btn btn-primary" id="wc-add" type="button">Add</button>
        </div>
        ${quickPicks.length ? `
        <div style="margin-top:var(--space-3);">
          <span style="font-size:var(--text-xs);color:var(--color-text-muted);">Quick picks:</span>
          <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);margin-top:var(--space-2);">
            ${quickPicks.map(z => `<button class="btn btn-sm btn-secondary wc-quick" data-zone="${z}" type="button">${zoneLabel(z)}</button>`).join('')}
          </div>
        </div>
        ` : ''}
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
        <span style="font-weight:600;font-size:var(--text-sm);color:var(--color-text-muted);">Live clocks</span>
        <button class="btn btn-sm btn-secondary" id="wc-reset" type="button">Reset to defaults</button>
      </div>
      <div id="wc-list" style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;margin-bottom:var(--space-4);"></div>

      <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3);flex-wrap:wrap;gap:var(--space-2);">
          <span style="font-weight:600;font-size:var(--text-sm);color:var(--color-text-muted);">Time converter</span>
          <span style="font-size:var(--text-xs);color:var(--color-text-muted);">Pick a base zone and a source time</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:var(--space-3);margin-bottom:var(--space-3);">
          <div>
            <label for="wc-base" style="font-size:var(--text-xs);color:var(--color-text-muted);display:block;margin-bottom:var(--space-1);">Base zone</label>
            <select id="wc-base" class="text-input"></select>
          </div>
          <div>
            <label for="wc-date" style="font-size:var(--text-xs);color:var(--color-text-muted);display:block;margin-bottom:var(--space-1);">Date</label>
            <input type="date" id="wc-date" class="text-input">
          </div>
          <div>
            <label for="wc-time" style="font-size:var(--text-xs);color:var(--color-text-muted);display:block;margin-bottom:var(--space-1);">Time</label>
            <input type="time" id="wc-time" class="text-input">
          </div>
          <div style="display:flex;align-items:flex-end;">
            <button class="btn btn-secondary" id="wc-now" type="button" style="width:100%;">Use now</button>
          </div>
        </div>
        <div id="wc-converter-out" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:var(--space-2);"></div>
      </div>
    </div>
  `;

  const listEl = container.querySelector('#wc-list');
  const inputEl = container.querySelector('#wc-input');
  const addBtn = container.querySelector('#wc-add');
  const resetBtn = container.querySelector('#wc-reset');
  const baseEl = container.querySelector('#wc-base');
  const dateEl = container.querySelector('#wc-date');
  const timeEl = container.querySelector('#wc-time');
  const nowBtn = container.querySelector('#wc-now');
  const outEl = container.querySelector('#wc-converter-out');

  function persist() { saveState({ zones: state.zones, baseZone: state.baseZone }); }

  function addZone(zone) {
    if (!zone) return;
    if (!allZones.includes(zone)) { showToast({ message: `Unknown zone: ${zone}`, type: 'error' }); return; }
    if (state.zones.includes(zone)) { showToast({ message: `${zoneLabel(zone)} is already in the list`, type: 'info' }); return; }
    state.zones.push(zone);
    if (!state.baseZone) state.baseZone = zone;
    inputEl.value = '';
    persist();
    renderAll();
  }

  function removeZone(zone) {
    state.zones = state.zones.filter(z => z !== zone);
    if (state.baseZone === zone) state.baseZone = state.zones[0] || null;
    persist();
    renderAll();
  }

  function moveZone(zone, delta) {
    const i = state.zones.indexOf(zone);
    if (i < 0) return;
    const j = i + delta;
    if (j < 0 || j >= state.zones.length) return;
    [state.zones[i], state.zones[j]] = [state.zones[j], state.zones[i]];
    persist();
    renderAll();
  }

  function setBase(zone) { state.baseZone = zone; persist(); renderAll(); }

  function renderAll() {
    listEl.innerHTML = renderListHtml(state.zones, new Date(), state);
    baseEl.innerHTML = state.zones.map(z => `<option value="${z}" ${z === state.baseZone ? 'selected' : ''}>${zoneLabel(z)} (${z})</option>`).join('');
    outEl.innerHTML = renderConverterHtml(state.zones, state.baseZone, dateEl.value, timeEl.value);
  }

  function tick() {
    const now = new Date();
    container.querySelectorAll('.wc-time').forEach(el => { el.textContent = formatInZone(now, el.dataset.zone); });
    container.querySelectorAll('.wc-date').forEach(el => { el.textContent = formatDateInZone(now, el.dataset.zone); });
  }

  addBtn.addEventListener('click', () => addZone(inputEl.value.trim()));
  inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addZone(inputEl.value.trim()); } });

  container.addEventListener('click', e => {
    const quick = e.target.closest('.wc-quick');
    if (quick) { addZone(quick.dataset.zone); return; }
    const rm = e.target.closest('.wc-rm');
    if (rm) { removeZone(rm.dataset.zone); return; }
    const up = e.target.closest('.wc-up');
    if (up) { moveZone(up.dataset.zone, -1); return; }
    const down = e.target.closest('.wc-down');
    if (down) { moveZone(down.dataset.zone, 1); return; }
    const base = e.target.closest('.wc-base');
    if (base) { setBase(base.dataset.zone); return; }
  });

  resetBtn.addEventListener('click', () => {
    state.zones = getDefaultZones();
    state.baseZone = state.zones[0] || null;
    persist();
    renderAll();
  });

  baseEl.addEventListener('change', () => { state.baseZone = baseEl.value; persist(); renderAll(); });
  dateEl.addEventListener('input', renderAll);
  timeEl.addEventListener('input', renderAll);

  nowBtn.addEventListener('click', () => {
    const n = new Date();
    dateEl.value = toDateInputValue(n);
    timeEl.value = toTimeInputValue(n);
    renderAll();
  });

  const n = new Date();
  dateEl.value = toDateInputValue(n);
  timeEl.value = toTimeInputValue(n);
  renderAll();

  const intervalId = setInterval(tick, 1000);
  const prevDestroy = container.dataset.destroy;
  container.dataset.destroy = 'true';
  container._destroy = () => { clearInterval(intervalId); if (typeof prevDestroy === 'function') prevDestroy(); };
}

export function destroy() {}
