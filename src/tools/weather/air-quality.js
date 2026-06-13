import { createLookupTool } from '../shared/lookup-tool-factory.js';

function getAQIColor(aqi) {
  if (aqi <= 50) return { bg: '#10b981', label: 'Good', desc: 'Air quality is satisfactory.' };
  if (aqi <= 100) return { bg: '#f59e0b', label: 'Moderate', desc: 'Acceptable.' };
  if (aqi <= 150) return { bg: '#f97316', label: 'Unhealthy for Sensitive', desc: 'Sensitive groups may experience effects.' };
  if (aqi <= 200) return { bg: '#ef4444', label: 'Unhealthy', desc: 'Everyone may experience effects.' };
  if (aqi <= 300) return { bg: '#7c3aed', label: 'Very Unhealthy', desc: 'Health warnings of emergency conditions.' };
  return { bg: '#7f1d1d', label: 'Hazardous', desc: 'Health alert: serious effects.' };
}

const { toolConfig, render } = createLookupTool({
  toolConfig: {
    id: 'air-quality',
    name: 'Air Quality Index',
    category: 'weather',
    description: 'Check air quality index and pollutant levels for any location.',
    icon: '🌬️',
    status: 'done'
  },
  contentHTML: `
    <div class="search-box">
      <input type="text" id="city-input" class="tool-input" placeholder="Enter city name..." />
      <button id="search-btn" class="tool-button primary">Check AQI</button>
    </div>
  `,
  resultHTML: `
    <div class="aqi-display">
      <div class="aqi-circle" id="aqi-circle">
        <span id="aqi-value"></span>
      </div>
      <div class="aqi-label" id="aqi-label"></div>
      <div class="aqi-desc" id="aqi-desc"></div>
    </div>
    <div class="pollutants">
      <h3>Pollutant Levels</h3>
      <div class="pollutant-grid">
        <div class="pollutant"><span class="pollutant-name">PM2.5</span><span class="pollutant-value" id="pm25"></span></div>
        <div class="pollutant"><span class="pollutant-name">PM10</span><span class="pollutant-value" id="pm10"></span></div>
        <div class="pollutant"><span class="pollutant-name">O₃</span><span class="pollutant-value" id="o3"></span></div>
        <div class="pollutant"><span class="pollutant-name">NO₂</span><span class="pollutant-value" id="no2"></span></div>
        <div class="pollutant"><span class="pollutant-name">SO₂</span><span class="pollutant-value" id="so2"></span></div>
        <div class="pollutant"><span class="pollutant-name">CO</span><span class="pollutant-value" id="co"></span></div>
      </div>
    </div>
    <div class="location-info">
      <span id="station-name"></span>
    </div>
  `,
  extraCSS: `
    .aqi-display { text-align: center; padding: var(--space-8); background: var(--color-surface); border-radius: var(--radius-xl); margin-bottom: var(--space-4); }
    .aqi-circle { width: 150px; height: 150px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-4); font-size: 3rem; font-weight: 700; color: white; }
    .aqi-label { font-size: var(--text-2xl); font-weight: 700; margin-bottom: var(--space-2); }
    .aqi-desc { color: var(--color-text-secondary); }
    .pollutants { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); margin-bottom: var(--space-4); }
    .pollutants h3 { font-size: var(--text-base); margin-bottom: var(--space-4); }
    .pollutant-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); }
    .pollutant { text-align: center; padding: var(--space-3); background: var(--color-bg); border-radius: var(--radius-md); }
    .pollutant-name { display: block; font-size: var(--text-sm); color: var(--color-text-muted); margin-bottom: var(--space-1); }
    .pollutant-value { font-size: var(--text-lg); font-weight: 700; }
    .location-info { text-align: center; color: var(--color-text-muted); font-size: var(--text-sm); }
  `,
  errorMessage: 'Could not find AQI for the specified city.',
  validate: (vals) => !vals['city-input']?.trim() ? 'Enter a city' : null,
  onSearch: async (vals, container) => {
    const city = vals['city-input'].trim();
    const res = await fetch('https://api.waqi.info/feed/' + encodeURIComponent(city) + '/?token=demo');
    const data = await res.json();
    if (data.status !== 'ok') throw new Error('City not found');

    const aqi = data.data.aqi;
    const color = getAQIColor(aqi);
    container.querySelector('#aqi-circle').style.background = color.bg;
    container.querySelector('#aqi-value').textContent = aqi;
    container.querySelector('#aqi-label').textContent = color.label;
    container.querySelector('#aqi-desc').textContent = color.desc;

    const iaqi = data.data.iaqi;
    container.querySelector('#pm25').textContent = iaqi.pm25?.v || '-';
    container.querySelector('#pm10').textContent = iaqi.pm10?.v || '-';
    container.querySelector('#o3').textContent = iaqi.o3?.v || '-';
    container.querySelector('#no2').textContent = iaqi.no2?.v || '-';
    container.querySelector('#so2').textContent = iaqi.so2?.v || '-';
    container.querySelector('#co').textContent = iaqi.co?.v || '-';
    container.querySelector('#station-name').textContent = data.data.city?.name || city;
  }
});

export { toolConfig, render };
