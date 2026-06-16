import { escapeHtml } from '../../utils/escape-html.js';

export const toolConfig = {
  id: 'earthquake-monitor',
  name: 'Earthquake Monitor',
  category: 'reference',
  description: 'Track recent earthquakes worldwide with magnitude, location, and depth data from USGS.',
  icon: '🌍',
  keywords: ['earthquake', 'seismic', 'usgs', 'magnitude', 'tremor'],
  accept: '',
  maxSizeMB: 0,
  status: 'done'
};

const API_BASE = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
const MAG_COLORS = {
  red: '#dc2626',
  orange: '#ea580c',
  yellow: '#ca8a04',
  green: '#16a34a',
  blue: '#2563eb'
};

function getMagColor(mag) {
  if (mag >= 6) return MAG_COLORS.red;
  if (mag >= 4.5) return MAG_COLORS.orange;
  if (mag >= 2.5) return MAG_COLORS.yellow;
  if (mag >= 1) return MAG_COLORS.green;
  return MAG_COLORS.blue;
}

function getMagLabel(mag) {
  if (mag >= 6) return 'Major';
  if (mag >= 4.5) return 'Strong';
  if (mag >= 2.5) return 'Moderate';
  if (mag >= 1) return 'Light';
  return 'Minor';
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  return days + 'd ago';
}

function formatDate(ts) {
  return new Date(ts).toLocaleString();
}

export function parseFeatures(features) {
  return features.map(f => ({
    id: f.id,
    mag: f.properties.mag,
    place: f.properties.place || 'Unknown location',
    time: f.properties.time,
    url: f.properties.url,
    depth: f.geometry.coordinates[2],
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0],
    tsunami: f.properties.tsunami === 1,
    sig: f.properties.sig,
    magType: f.properties.magType,
    type: f.properties.type
  }));
}

function renderQuakeList(quakes) {
  if (!quakes.length) return '<p class="eq-empty">No earthquakes found for this criteria.</p>';
  return quakes.map(q => {
    const color = getMagColor(q.mag);
    const label = getMagLabel(q.mag);
    return `
      <a href="${escapeHtml(q.url)}" target="_blank" rel="noopener" class="eq-item">
        <div class="eq-mag-badge" style="background:${color}">${q.mag.toFixed(1)}</div>
        <div class="eq-info">
          <div class="eq-place">${escapeHtml(q.place)}</div>
          <div class="eq-meta">
            <span class="eq-label" style="color:${color}">${label}</span>
            <span>Depth: ${q.depth.toFixed(1)} km</span>
            <span>${timeAgo(q.time)}</span>
            ${q.tsunami ? '<span class="eq-tsunami">⚠ Tsunami</span>' : ''}
          </div>
        </div>
        <div class="eq-time">${formatDate(q.time)}</div>
      </a>
    `;
  }).join('');
}

function renderStats(quakes) {
  if (!quakes.length) return '';
  const maxMag = Math.max(...quakes.map(q => q.mag));
  const avgMag = (quakes.reduce((s, q) => s + q.mag, 0) / quakes.length).toFixed(1);
  const tsunamiCount = quakes.filter(q => q.tsunami).length;
  return `
    <div class="eq-stats">
      <div class="eq-stat"><span class="eq-stat-value">${quakes.length}</span><span class="eq-stat-label">Earthquakes</span></div>
      <div class="eq-stat"><span class="eq-stat-value" style="color:${getMagColor(maxMag)}">${maxMag.toFixed(1)}</span><span class="eq-stat-label">Max Magnitude</span></div>
      <div class="eq-stat"><span class="eq-stat-value">${avgMag}</span><span class="eq-stat-label">Avg Magnitude</span></div>
      ${tsunamiCount ? `<div class="eq-stat"><span class="eq-stat-value" style="color:#dc2626">${tsunamiCount}</span><span class="eq-stat-label">Tsunami Alerts</span></div>` : ''}
    </div>
  `;
}

export function render(container) {
  container.innerHTML = `
    <div class="eq-container">
      <div class="eq-controls">
        <div class="eq-row">
          <label class="eq-filter-label">Min Magnitude</label>
          <select id="eq-mag" class="eq-select">
            <option value="all">All</option>
            <option value="1">1.0+</option>
            <option value="2.5" selected>2.5+</option>
            <option value="4.5">4.5+</option>
            <option value="6">6.0+</option>
          </select>
        </div>
        <div class="eq-row">
          <label class="eq-filter-label">Time Range</label>
          <select id="eq-time" class="eq-select">
            <option value="hour">Past Hour</option>
            <option value="day" selected>Past 24 Hours</option>
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
          </select>
        </div>
        <button id="eq-fetch" class="eq-btn eq-btn-primary">Fetch Earthquakes</button>
      </div>
      <div id="eq-status" class="eq-status"></div>
      <div id="eq-stats" class="eq-stats-wrap"></div>
      <div id="eq-results" class="eq-results"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .eq-container { max-width: 800px; margin: 0 auto; }
    .eq-controls { display: flex; gap: var(--space-3); align-items: flex-end; flex-wrap: wrap; margin-bottom: var(--space-4); }
    .eq-row { display: flex; flex-direction: column; gap: var(--space-1); }
    .eq-filter-label { font-size: var(--text-sm); font-weight: 600; color: var(--color-text-secondary); }
    .eq-select { padding: var(--space-3); border: 2px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface); min-width: 140px; }
    .eq-btn { padding: var(--space-3) var(--space-4); border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .eq-btn-primary { background: var(--color-primary); color: white; }
    .eq-btn-primary:hover { filter: brightness(0.9); }
    .eq-status { text-align: center; padding: var(--space-3); color: var(--color-text-secondary); }
    .eq-stats-wrap { margin-bottom: var(--space-4); }
    .eq-stats { display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap; }
    .eq-stat { display: flex; flex-direction: column; align-items: center; padding: var(--space-3) var(--space-4); background: var(--color-surface); border-radius: var(--radius-xl); border: 2px solid var(--color-border); min-width: 100px; }
    .eq-stat-value { font-size: var(--text-xl); font-weight: 700; }
    .eq-stat-label { font-size: var(--text-xs); color: var(--color-text-muted); }
    .eq-results { display: flex; flex-direction: column; gap: var(--space-2); }
    .eq-item { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); border: 2px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-surface); text-decoration: none; color: inherit; transition: border-color 0.15s; }
    .eq-item:hover { border-color: var(--color-primary); }
    .eq-mag-badge { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: var(--text-sm); flex-shrink: 0; }
    .eq-info { flex: 1; min-width: 0; }
    .eq-place { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .eq-meta { display: flex; gap: var(--space-3); font-size: var(--text-xs); color: var(--color-text-muted); flex-wrap: wrap; margin-top: 2px; }
    .eq-label { font-weight: 600; }
    .eq-tsunami { color: #dc2626; font-weight: 600; }
    .eq-time { font-size: var(--text-xs); color: var(--color-text-muted); white-space: nowrap; }
    .eq-empty { text-align: center; color: var(--color-text-muted); padding: var(--space-6); }
    @media (max-width: 600px) { .eq-controls { flex-direction: column; } .eq-time { display: none; } }
  `;
  container.appendChild(style);

  const status = container.querySelector('#eq-status');
  const statsWrap = container.querySelector('#eq-stats');
  const results = container.querySelector('#eq-results');

  async function fetchQuakes() {
    const mag = container.querySelector('#eq-mag').value;
    const time = container.querySelector('#eq-time').value;

    status.textContent = 'Fetching earthquakes...';
    results.innerHTML = '';
    statsWrap.innerHTML = '';

    const now = new Date();
    let starttime;
    if (time === 'hour') starttime = new Date(now - 3600000);
    else if (time === 'day') starttime = new Date(now - 86400000);
    else if (time === 'week') starttime = new Date(now - 604800000);
    else starttime = new Date(now - 2592000000);

    const params = new URLSearchParams({
      format: 'geojson',
      orderby: 'time',
      limit: '50',
      starttime: starttime.toISOString()
    });
    if (mag !== 'all') params.set('minmagnitude', mag);

    try {
      const res = await fetch(API_BASE + '?' + params.toString());
      if (!res.ok) throw new Error('API error ' + res.status);
      const data = await res.json();
      const quakes = parseFeatures(data.features);
      status.textContent = quakes.length ? '' : 'No earthquakes found.';
      statsWrap.innerHTML = renderStats(quakes);
      results.innerHTML = renderQuakeList(quakes);
    } catch {
      status.textContent = 'Failed to fetch earthquake data. Try again.';
    }
  }

  container.querySelector('#eq-fetch').addEventListener('click', fetchQuakes);

  container.querySelectorAll('.eq-select').forEach(sel => {
    sel.addEventListener('change', fetchQuakes);
  });

  fetchQuakes();
}
