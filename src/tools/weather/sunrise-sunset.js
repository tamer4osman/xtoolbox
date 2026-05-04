export const toolConfig = {
  id: 'sunrise-sunset',
  name: 'Sunrise & Sunset Times',
  category: 'weather',
  description: 'Calculate sunrise, sunset, golden hour, and day length for any location.',
  icon: '🌅',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-content">
        <div class="search-box">
          <input type="text" id="location-input" class="tool-input" placeholder="Enter city or coordinates (lat,lon)..." />
          <button id="search-btn" class="tool-button primary">Get Times</button>
        </div>
        <div id="loading" class="loading hidden">Calculating...</div>
        <div id="result" class="result hidden">
          <div class="location-header">
            <h2 id="location-name"></h2>
            <p id="result-date"></p>
          </div>
          <div class="times-grid">
            <div class="time-card sunrise">
              <div class="time-icon">🌅</div>
              <div class="time-label">Sunrise</div>
              <div class="time-value" id="sunrise"></div>
            </div>
            <div class="time-card sunset">
              <div class="time-icon">🌇</div>
              <div class="time-label">Sunset</div>
              <div class="time-value" id="sunset"></div>
            </div>
            <div class="time-card solar-noon">
              <div class="time-icon">☀️</div>
              <div class="time-label">Solar Noon</div>
              <div class="time-value" id="solar-noon"></div>
            </div>
            <div class="time-card day-length">
              <div class="time-icon">🕐</div>
              <div class="time-label">Day Length</div>
              <div class="time-value" id="day-length"></div>
            </div>
          </div>
          <div class="golden-hour">
            <h3>🌤️ Golden Hour</h3>
            <div class="golden-times">
              <div><span>Morning:</span><span id="golden-morning"></span></div>
              <div><span>Evening:</span><span id="golden-evening"></span></div>
            </div>
          </div>
          <div class="civil-twilight">
            <h3>🌑 Twilight</h3>
            <div class="twilight-times">
              <div><span>Civil Dawn:</span><span id="dawn"></span></div>
              <div><span>Civil Dusk:</span><span id="dusk"></span></div>
            </div>
          </div>
        </div>
        <div id="error" class="error hidden"></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .tool-container { max-width: 600px; margin: 0 auto; }
    .tool-header { text-align: center; margin-bottom: var(--space-8); }
    .search-box { display: flex; gap: var(--space-3); margin-bottom: var(--space-6); }
    .tool-input { flex: 1; padding: var(--space-3) var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
    .tool-input:focus { border-color: var(--color-primary); outline: none; }
    .tool-button.primary { padding: var(--space-3) var(--space-6); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .loading, .error { text-align: center; padding: var(--space-8); color: var(--color-text-secondary); }
    .error { color: var(--color-error); }
    .result { animation: fadeIn 0.3s; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .location-header { text-align: center; margin-bottom: var(--space-6); }
    .location-header h2 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
    .times-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3); margin-bottom: var(--space-6); }
    .time-card { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); text-align: center; }
    .time-icon { font-size: 2rem; margin-bottom: var(--space-2); }
    .time-label { font-size: var(--text-sm); color: var(--color-text-muted); margin-bottom: var(--space-1); }
    .time-value { font-size: var(--text-xl); font-weight: 700; }
    .golden-hour, .civil-twilight { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); margin-bottom: var(--space-3); }
    .golden-hour h3, .civil-twilight h3 { font-size: var(--text-base); margin-bottom: var(--space-3); }
    .golden-times, .twilight-times { display: flex; justify-content: space-between; }
    .golden-times div, .twilight-times div { display: flex; gap: var(--space-2); font-size: var(--text-sm); }
    .golden-times span:first-child, .twilight-times span:first-child { color: var(--color-text-muted); }
    .hidden { display: none !important; }
  `;
  container.appendChild(style);

  const searchBtn = container.querySelector('#search-btn');
  const locationInput = container.querySelector('#location-input');
  const loading = container.querySelector('#loading');
  const result = container.querySelector('#result');
  const error = container.querySelector('#error');

  async function getCoords(location) {
    const res = await fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(location) + '&limit=1');
    const data = await res.json();
    if (!data.length) throw new Error('Location not found');
    return { lat: data[0].lat, lon: data[0].lon, name: data[0].display_name.split(',')[0] };
  }

  searchBtn.addEventListener('click', async () => {
    const location = locationInput.value;
    if (!location) { alert('Enter a location'); return; }

    loading.classList.remove('hidden');
    result.classList.add('hidden');
    error.classList.add('hidden');

    try {
      const coords = await getCoords(location);
      const date = new Date().toISOString().split('T')[0];
      const res = await fetch('https://api.sunrise-sunset.org/json?lat=' + coords.lat + '&lng=' + coords.lon + '&date=' + date + '&formatted=0');
      const data = await res.json();

      if (!data.results) throw new Error('Failed to get times');

      const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const formatDuration = (sec) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        return h + 'h ' + m + 'm';
      };

      document.getElementById('location-name').textContent = coords.name;
      document.getElementById('result-date').textContent = new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      document.getElementById('sunrise').textContent = formatTime(data.results.sunrise);
      document.getElementById('sunset').textContent = formatTime(data.results.sunset);
      document.getElementById('solar-noon').textContent = formatTime(data.results.solar_noon);
      document.getElementById('day-length').textContent = formatDuration(data.results.day_length);
      const goldenMorning = data.results.golden_hour_morning;
      const goldenEvening = data.results.golden_hour_evening;
      document.getElementById('golden-morning').textContent = (goldenMorning && goldenMorning.trim()) ? formatTime(goldenMorning) : 'N/A';
      document.getElementById('golden-evening').textContent = (goldenEvening && goldenEvening.trim()) ? formatTime(goldenEvening) : 'N/A';
      document.getElementById('dawn').textContent = formatTime(data.results.civil_twilight_begin);
      document.getElementById('dusk').textContent = formatTime(data.results.civil_twilight_end);

      result.classList.remove('hidden');
    } catch (err) {
      error.textContent = err.message;
      error.classList.remove('hidden');
    } finally {
      loading.classList.add('hidden');
    }
  });

  }
