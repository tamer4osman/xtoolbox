export const toolConfig = {
  id: "my-ip",
  name: "My IP Address",
  category: "weather",
  description: "Show your public IP address, location, ISP, and timezone.",
  icon: "🌐",
  status: "done"
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <div class="tool-icon">🌐</div>
        <h1>My IP Address</h1>
        <p class="tool-description">Your public IP address, location, ISP, and timezone.</p>
      </div>
      <div class="tool-content">
        <button id="lookup-btn" class="tool-button primary">Look Up My IP</button>
        <div id="loading" class="loading hidden">Looking up your IP...</div>
        <div id="result" class="result hidden">
          <div class="ip-display">
            <div class="ip-label">Your Public IP</div>
            <div class="ip-value" id="ip-address"></div>
          </div>
          <div class="info-grid">
            <div class="info-card">
              <div class="info-icon">🏢</div>
              <div class="info-label">ISP</div>
              <div class="info-value" id="isp"></div>
            </div>
            <div class="info-card">
              <div class="info-icon">📍</div>
              <div class="info-label">City</div>
              <div class="info-value" id="city"></div>
            </div>
            <div class="info-card">
              <div class="info-icon">🗺️</div>
              <div class="info-label">Region</div>
              <div class="info-value" id="region"></div>
            </div>
            <div class="info-card">
              <div class="info-icon">🌍</div>
              <div class="info-label">Country</div>
              <div class="info-value" id="country"></div>
            </div>
            <div class="info-card">
              <div class="info-icon">🕐</div>
              <div class="info-label">Timezone</div>
              <div class="info-value" id="timezone"></div>
            </div>
            <div class="info-card">
              <div class="info-icon">📐</div>
              <div class="info-label">Coordinates</div>
              <div class="info-value" id="coords"></div>
            </div>
          </div>
        </div>
        <div id="error" class="error hidden"></div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .tool-container { max-width: 600px; margin: 0 auto; }
    .tool-header { text-align: center; margin-bottom: var(--space-8); }
    .tool-button.primary { display: block; margin: 0 auto var(--space-6); padding: var(--space-4) var(--space-8); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-size: var(--text-lg); font-weight: 600; cursor: pointer; }
    .loading, .error { text-align: center; padding: var(--space-8); color: var(--color-text-secondary); }
    .error { color: var(--color-error); }
    .result { animation: fadeIn 0.3s; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .ip-display { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; border-radius: var(--radius-xl); padding: var(--space-8); text-align: center; margin-bottom: var(--space-6); }
    .ip-label { font-size: var(--text-sm); opacity: 0.7; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: var(--space-2); }
    .ip-value { font-size: 2.5rem; font-weight: 700; font-family: monospace; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-3); }
    .info-card { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); text-align: center; }
    .info-icon { font-size: 1.5rem; margin-bottom: var(--space-2); }
    .info-label { font-size: var(--text-xs); color: var(--color-text-muted); text-transform: uppercase; margin-bottom: var(--space-1); }
    .info-value { font-weight: 600; }
    .hidden { display: none !important; }
  `;
  container.appendChild(style);

  const lookupBtn = container.querySelector("#lookup-btn");
  const loading = container.querySelector("#loading");
  const result = container.querySelector("#result");
  const error = container.querySelector("#error");

  lookupBtn.addEventListener("click", async () => {
    loading.classList.remove("hidden");
    result.classList.add("hidden");
    error.classList.add("hidden");

    try {
      const res = await fetch(
        "http://ip-api.com/json/?fields=status,message,country,region,city,isp,timezone,lat,lon,query"
      );
      const data = await res.json();

      if (data.status !== "success") throw new Error(data.message || "Failed to lookup IP");

      document.getElementById("ip-address").textContent = data.query;
      document.getElementById("isp").textContent = data.isp;
      document.getElementById("city").textContent = data.city;
      document.getElementById("region").textContent = data.region;
      document.getElementById("country").textContent = data.country;
      document.getElementById("timezone").textContent = data.timezone;
      document.getElementById("coords").textContent = data.lat + ", " + data.lon;

      result.classList.remove("hidden");
    } catch (err) {
      error.textContent = "Error: " + err.message;
      error.classList.remove("hidden");
    } finally {
      loading.classList.add("hidden");
    }
  });
}
