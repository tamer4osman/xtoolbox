import { createLookupTool } from "../shared/lookup-tool-factory.js";

const formatTime = iso =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const formatDuration = sec => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h + "h " + m + "m";
};

const { toolConfig, render } = createLookupTool({
  toolConfig: {
    id: "sunrise-sunset",
    name: "Sunrise & Sunset Times",
    category: "weather",
    description: "Calculate sunrise, sunset, golden hour, and day length for any location.",
    icon: "🌅",
    status: "done"
  },
  contentHTML: `
    <div class="search-box">
      <input type="text" id="location-input" class="tool-input" placeholder="Enter city or coordinates (lat,lon)..." />
      <button id="search-btn" class="tool-button primary">Get Times</button>
    </div>
  `,
  resultHTML: `
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
  `,
  extraCSS: `
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
  `,
  loadingText: "Calculating...",
  errorMessage: "Could not find location. Please try again.",
  validate: vals => (!vals["location-input"]?.trim() ? "Enter a location" : null),
  onSearch: async (vals, container) => {
    const location = vals["location-input"].trim();
    const geoRes = await fetch(
      "https://nominatim.openstreetmap.org/search?format=json&q=" +
        encodeURIComponent(location) +
        "&limit=1",
      { signal: AbortSignal.timeout(15000) }
    );
    const geoData = await geoRes.json();
    if (!geoData.length) throw new Error("Location not found");
    const coords = {
      lat: geoData[0].lat,
      lon: geoData[0].lon,
      name: geoData[0].display_name.split(",")[0]
    };

    const date = new Date().toISOString().split("T")[0];
    const res = await fetch(
      "https://api.sunrise-sunset.org/json?lat=" +
        coords.lat +
        "&lng=" +
        coords.lon +
        "&date=" +
        date +
        "&formatted=0",
      { signal: AbortSignal.timeout(15000) }
    );
    const data = await res.json();
    if (!data.results) throw new Error("Failed to get times");

    container.querySelector("#location-name").textContent = coords.name;
    container.querySelector("#result-date").textContent = new Date().toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    container.querySelector("#sunrise").textContent = formatTime(data.results.sunrise);
    container.querySelector("#sunset").textContent = formatTime(data.results.sunset);
    container.querySelector("#solar-noon").textContent = formatTime(data.results.solar_noon);
    container.querySelector("#day-length").textContent = formatDuration(data.results.day_length);
    const goldenMorning = data.results.golden_hour_morning;
    const goldenEvening = data.results.golden_hour_evening;
    container.querySelector("#golden-morning").textContent =
      goldenMorning && goldenMorning.trim() ? formatTime(goldenMorning) : "N/A";
    container.querySelector("#golden-evening").textContent =
      goldenEvening && goldenEvening.trim() ? formatTime(goldenEvening) : "N/A";
    container.querySelector("#dawn").textContent = formatTime(data.results.civil_twilight_begin);
    container.querySelector("#dusk").textContent = formatTime(data.results.civil_twilight_end);
  }
});

export { toolConfig, render };
