import { escapeHtml } from "../../utils/escape-html.js";
import { safeFetch } from "../../utils/safe-fetch.js";

export const toolConfig = {
  id: "crypto-prices",
  name: "Crypto Price Tracker",
  category: "finance",
  description: "Track live prices of top 50 cryptocurrencies.",
  icon: "₿",
  status: "done"
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <div class="tool-icon">₿</div>
        <h1>Crypto Price Tracker</h1>
        <p class="tool-description">Track live prices of top cryptocurrencies.</p>
      </div>
      <div class="tool-content">
        <button id="refresh-btn" class="tool-button secondary">🔄 Refresh Prices</button>
        <div id="loading" class="loading">Loading...</div>
        <div id="result" class="result hidden">
          <div class="crypto-grid" id="crypto-list"></div>
        </div>
        <div id="error" class="error hidden"></div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .tool-container { max-width: 800px; margin: 0 auto; }
    .tool-header { text-align: center; margin-bottom: var(--space-6); }
    .tool-button.secondary { display: block; margin: 0 auto var(--space-6); padding: var(--space-3) var(--space-6); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); cursor: pointer; }
    .loading { text-align: center; padding: var(--space-8); color: var(--color-text-secondary); }
    .error { text-align: center; padding: var(--space-8); color: var(--color-error); }
    .crypto-grid { display: grid; gap: var(--space-4); }
    .crypto-card { display: flex; align-items: center; justify-content: space-between; background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); }
    .crypto-info { display: flex; align-items: center; gap: var(--space-3); }
    .crypto-icon { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.crypto-fallback { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: var(--color-primary); color: white; font-weight: 700; font-size: 14px; }
    .crypto-name { font-weight: 600; }
    .crypto-symbol { color: var(--color-text-muted); font-size: var(--text-sm); }
    .crypto-price { text-align: right; }
    .price-value { font-size: var(--text-xl); font-weight: 700; }
    .price-change { font-size: var(--text-sm); }
    .positive { color: #10b981; }
    .negative { color: #ef4444; }
    .hidden { display: none !important; }
  `;
  container.appendChild(style);

  const refreshBtn = container.querySelector("#refresh-btn");
  const loading = container.querySelector("#loading");
  const result = container.querySelector("#result");
  const error = container.querySelector("#error");

  async function fetchPrices() {
    loading.classList.remove("hidden");
    result.classList.add("hidden");
    error.classList.add("hidden");

    try {
      const res = await safeFetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false"
      );
      const data = await res.json();

      container.querySelector("#crypto-list").innerHTML = data
        .map(
          coin => `
        <div class="crypto-card">
          <div class="crypto-info">
            <img class="crypto-icon" src="${escapeHtml(coin.image || "")}" alt="${escapeHtml(coin.name)}" onerror="this.style.display='none'" />
            <div>
              <div class="crypto-name">${escapeHtml(coin.name)}</div>
              <div class="crypto-symbol">${escapeHtml(coin.symbol.toUpperCase())}</div>
            </div>
          </div>
          <div class="crypto-price">
            <div class="price-value">$${coin.current_price.toLocaleString()}</div>
            <div class="price-change ${coin.price_change_percentage_24h >= 0 ? "positive" : "negative"}">
              ${coin.price_change_percentage_24h >= 0 ? "↑" : "↓"} ${Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%
            </div>
          </div>
        </div>
      `
        )
        .join("");

      result.classList.remove("hidden");
    } catch (e) {
      error.textContent = "Failed to load crypto prices";
      error.classList.remove("hidden");
    } finally {
      loading.classList.add("hidden");
    }
  }

  refreshBtn.addEventListener("click", fetchPrices);
  fetchPrices();
}
