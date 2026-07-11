export const toolConfig = {
  id: "weather-forecast",
  name: "Weather Forecast",
  category: "weather",
  description: "Get current weather and 7-day forecast for any city.",
  icon: "🌤️",
  status: "done"
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <div class="tool-icon">🌤️</div>
        <h1>Weather Forecast</h1>
        <p class="tool-description">Get current weather and 7-day forecast for any city.</p>
      </div>
      <div class="tool-content">
        <div class="search-box">
          <input type="text" id="city-input" class="tool-input" placeholder="Enter city name..." />
          <button id="search-btn" class="tool-button primary">Search</button>
        </div>
        <div id="loading" class="loading hidden">Loading...</div>
        <div id="weather-display" class="weather-display hidden">
          <div class="current-weather">
            <div class="weather-main">
              <div id="weather-icon" class="weather-icon"></div>
              <div class="temp" id="temp"></div>
              <div class="condition" id="condition"></div>
            </div>
            <div class="weather-details">
              <div class="detail"><span>Humidity:</span><span id="humidity"></span></div>
              <div class="detail"><span>Wind:</span><span id="wind"></span></div>
              <div class="detail"><span>Feels like:</span><span id="feels-like"></span></div>
            </div>
          </div>
          <div class="location-info">
            <h3 id="location-name"></h3>
            <p id="local-time"></p>
          </div>
          <div class="forecast" id="forecast"></div>
        </div>
        <div id="error" class="error hidden"></div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .tool-container { max-width: 700px; margin: 0 auto; }
    .tool-header { text-align: center; margin-bottom: var(--space-8); }
    .search-box { display: flex; gap: var(--space-3); margin-bottom: var(--space-6); }
    .tool-input { flex: 1; padding: var(--space-3) var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-lg); font-size: var(--text-base); }
    .tool-input:focus { border-color: var(--color-primary); outline: none; }
    .tool-button.primary { padding: var(--space-3) var(--space-6); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .weather-display { animation: fadeIn 0.3s; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .current-weather { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: var(--radius-xl); padding: var(--space-8); text-align: center; margin-bottom: var(--space-4); }
    .weather-main { display: flex; align-items: center; justify-content: center; gap: var(--space-4); margin-bottom: var(--space-4); }
    .weather-main .weather-icon { font-size: 80px; line-height: 1; }
    .temp { font-size: 4rem; font-weight: 700; }
    .condition { font-size: var(--text-xl); opacity: 0.9; }
    .weather-details { display: flex; justify-content: center; gap: var(--space-6); flex-wrap: wrap; }
    .detail { display: flex; flex-direction: column; align-items: center; font-size: var(--text-sm); opacity: 0.9; }
    .detail span:first-child { opacity: 0.7; }
    .location-info { text-align: center; margin-bottom: var(--space-6); }
    .location-info h3 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
    .forecast { display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: var(--space-2); }
    .forecast-day { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-3); text-align: center; }
    .forecast-day .weather-icon { font-size: 40px; line-height: 1; margin: var(--space-2) 0; }
    .forecast-day .day { font-size: var(--text-sm); font-weight: 600; margin: var(--space-2) 0; }
    .forecast-day .temp { font-size: var(--text-lg); }
    .loading, .error { text-align: center; padding: var(--space-8); color: var(--color-text-secondary); }
    .error { color: var(--color-error); }
    .hidden { display: none !important; }
  `;
  container.appendChild(style);

  const cityInput = container.querySelector("#city-input");
  const searchBtn = container.querySelector("#search-btn");
  const loading = container.querySelector("#loading");
  const weatherDisplay = container.querySelector("#weather-display");
  const error = container.querySelector("#error");

  async function fetchWeather(city) {
    loading.classList.remove("hidden");
    weatherDisplay.classList.add("hidden");
    error.classList.add("hidden");

    try {
      const res = await fetch("https://wttr.in/" + encodeURIComponent(city) + "?format=j1");
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      displayWeather(data);
    } catch (err) {
      error.textContent = 'Could not find weather for "' + city + '". Please try another city.';
      error.classList.remove("hidden");
    } finally {
      loading.classList.add("hidden");
    }
  }

  function displayWeather(data) {
    const current = data.current_condition[0];
    container.querySelector("#temp").textContent = current.temp_C + "°C";
    container.querySelector("#condition").textContent = current.weatherDesc[0].value;
    container.querySelector("#humidity").textContent = current.humidity + "%";
    container.querySelector("#wind").textContent = current.windspeedKmph + " km/h";
    container.querySelector("#feels-like").textContent = current.FeelsLikeC + "°C";
    container.querySelector("#location-name").textContent =
      data.nearest_area?.[0]?.areaName?.[0]?.value || cityInput.value;
    container.querySelector("#local-time").textContent = new Date().toLocaleString();

    const icon = current.weatherCode ? getWeatherIcon(current.weatherCode) : "🌤️";
    container.querySelector("#weather-icon").textContent = icon;

    const forecast = container.querySelector("#forecast");
    forecast.innerHTML = "";
    if (data.weather) {
      data.weather.slice(0, 7).forEach(day => {
        const date = new Date(day.date);
        const div = document.createElement("div");
        div.className = "forecast-day";
        div.innerHTML = `
          <div class="day">${date.toLocaleDateString("en", { weekday: "short" })}</div>
          <div class="weather-icon">${getWeatherIcon(day.hourly?.[0]?.weatherCode || 0)}</div>
          <div class="temp">${day.avgtempC}°</div>
        `;
        forecast.appendChild(div);
      });
    }
    weatherDisplay.classList.remove("hidden");
  }

  function getWeatherIcon(code) {
    const icons = {
      113: "☀️",
      116: "⛅",
      119: "☁️",
      122: "☁️",
      176: "🌧️",
      200: "⛈️",
      263: "🌧️",
      353: "🌧️",
      362: "🌧️",
      365: "🌧️",
      389: "⛈️"
    };
    return icons[code] || "☁️";
  }

  searchBtn.addEventListener("click", () => fetchWeather(cityInput.value));
  cityInput.addEventListener("keypress", e => {
    if (e.key === "Enter") fetchWeather(cityInput.value);
  });
}
