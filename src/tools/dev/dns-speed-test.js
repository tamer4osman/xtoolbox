import { escapeHtml } from "../../utils/escape-html.js";

export const toolConfig = {
  id: "dns-speed-test",
  name: "DNS Speed Test",
  category: "dev",
  description: "Test DNS resolution speed against Cloudflare and Google DoH providers.",
  icon: "⚡",
  keywords: ["dns", "speed", "doh", "cloudflare", "google", "network"],
  accept: "",
  maxSizeMB: 0,
  status: "done"
};

const PROVIDERS = [
  {
    id: "cloudflare",
    name: "Cloudflare",
    url: "https://cloudflare-dns.com/dns-query",
    color: "#f38020"
  },
  { id: "google", name: "Google", url: "https://dns.google/resolve", color: "#4285f4" }
];

const TEST_DOMAINS = ["google.com", "github.com", "amazon.com", "wikipedia.org", "cloudflare.com"];

export async function testDnsProvider(provider, domain, signal) {
  const start = performance.now();
  let url;
  let headers = {};

  if (provider.id === "google") {
    url = provider.url + "?name=" + encodeURIComponent(domain) + "&type=A";
  } else {
    url = provider.url + "?name=" + encodeURIComponent(domain) + "&type=A";
    headers["accept"] = "application/dns-json";
  }

  const res = await fetch(url, { headers, signal });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  const elapsed = performance.now() - start;

  const answers = data.Answer || [];
  const ips = answers.filter(a => a.type === 1).map(a => a.data);

  return { provider: provider.name, domain, time: Math.round(elapsed), ips, status: "ok" };
}

export function calcStats(results) {
  const times = results.filter(r => r.status === "ok").map(r => r.time);
  if (!times.length) return { avg: 0, min: 0, max: 0, count: 0 };
  return {
    avg: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    min: Math.min(...times),
    max: Math.max(...times),
    count: times.length
  };
}

function barWidth(time, maxTime) {
  if (!maxTime || !time) return 0;
  return Math.max(5, Math.round((time / maxTime) * 100));
}

function speedRating(ms) {
  if (ms < 50) return { label: "Excellent", color: "#16a34a" };
  if (ms < 100) return { label: "Good", color: "#65a30d" };
  if (ms < 200) return { label: "Fair", color: "#ca8a04" };
  return { label: "Slow", color: "#dc2626" };
}

function renderResults(providerResults, testCount) {
  if (!providerResults.length) return "";

  const allTimes = providerResults.flatMap(p =>
    p.results.filter(r => r.status === "ok").map(r => r.time)
  );
  const maxTime = Math.max(...allTimes, 1);

  const rows = PROVIDERS.map(p => {
    const data = providerResults.find(r => r.provider === p.name);
    if (!data) return "";
    const stats = calcStats(data.results);
    const rating = speedRating(stats.avg);
    const bars = data.results
      .map(r => {
        const w = barWidth(r.time, maxTime);
        const ratingColor = speedRating(r.time).color;
        return `<div class="dns-bar" style="width:${w}%;background:${ratingColor}" title="${r.domain}: ${r.time}ms"></div>`;
      })
      .join("");

    return `
      <div class="dns-provider">
        <div class="dns-provider-header">
          <span class="dns-provider-name" style="color:${p.color}">${escapeHtml(p.name)}</span>
          <span class="dns-provider-avg">${stats.count > 0 ? stats.avg + "ms avg" : "Unavailable"}</span>
          ${stats.count > 0 ? `<span class="dns-provider-badge" style="background:${rating.color}">${rating.label}</span>` : '<span class="dns-provider-badge" style="background:#9ca3af">Failed</span>'}
        </div>
        <div class="dns-stats">
          <span>${stats.count > 0 ? "Min: " + stats.min + "ms" : ""}</span>
          <span>${stats.count > 0 ? "Max: " + stats.max + "ms" : ""}</span>
          <span>Tests: ${stats.count}/${testCount}</span>
        </div>
        <div class="dns-bars">${bars}</div>
      </div>
    `;
  }).join("");

  const fastest = PROVIDERS.map(p => {
    const data = providerResults.find(r => r.provider === p.name);
    if (!data) return null;
    const stats = calcStats(data.results);
    return stats.count > 0 ? { name: p.name, avg: stats.avg, color: p.color } : null;
  })
    .filter(Boolean)
    .sort((a, b) => a.avg - b.avg);

  if (!fastest.length) {
    return `<div class="dns-results"><div class="dns-winner">⚠️ All DNS providers failed. Check your network connection.</div>${rows}</div>`;
  }

  return `
    <div class="dns-results">
      <div class="dns-winner">
        🏆 Fastest: <strong style="color:${fastest[0]?.color || "#333"}">${fastest[0]?.name || "N/A"}</strong>
        at ${fastest[0]?.avg || 0}ms average
      </div>
      ${rows}
    </div>
  `;
}

export function render(container) {
  container.innerHTML = `
    <div class="dns-container">
      <div class="dns-input-section">
        <div class="dns-input-row">
          <input type="text" id="dns-domain" class="dns-input" placeholder="Enter domain (e.g., google.com)" value="google.com" />
          <select id="dns-count" class="dns-select">
            <option value="3">3 tests</option>
            <option value="5" selected>5 tests</option>
            <option value="10">10 tests</option>
          </select>
          <button id="dns-start" class="dns-btn dns-btn-primary">Start Test</button>
        </div>
        <div class="dns-quick-domains">
          <span class="dns-quick-label">Quick test:</span>
          ${TEST_DOMAINS.map(d => `<button class="dns-quick-btn" data-domain="${d}">${d}</button>`).join("")}
        </div>
      </div>
      <div id="dns-status" class="dns-status"></div>
      <div id="dns-progress" class="dns-progress" style="display:none">
        <div class="dns-progress-bar"><div id="dns-progress-fill" class="dns-progress-fill"></div></div>
        <span id="dns-progress-text">0%</span>
      </div>
      <div id="dns-results" class="dns-results-wrap"></div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .dns-container { max-width: 700px; margin: 0 auto; }
    .dns-input-section { margin-bottom: var(--space-4); }
    .dns-input-row { display: flex; gap: var(--space-3); }
    .dns-input { flex: 1; padding: var(--space-3); border: 2px solid var(--color-border); border-radius: var(--radius-lg); font-size: var(--text-base); background: var(--color-surface); }
    .dns-input:focus { outline: none; border-color: var(--color-primary); }
    .dns-select { padding: var(--space-3); border: 2px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface); }
    .dns-btn { padding: var(--space-3) var(--space-4); border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; white-space: nowrap; }
    .dns-btn-primary { background: var(--color-primary); color: white; }
    .dns-btn-primary:hover { filter: brightness(0.9); }
    .dns-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .dns-quick-domains { display: flex; align-items: center; gap: var(--space-2); margin-top: var(--space-3); flex-wrap: wrap; }
    .dns-quick-label { font-size: var(--text-sm); color: var(--color-text-muted); }
    .dns-quick-btn { padding: 4px 10px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); cursor: pointer; font-size: var(--text-xs); }
    .dns-quick-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
    .dns-status { text-align: center; padding: var(--space-3); color: var(--color-text-secondary); }
    .dns-progress { margin: var(--space-3) 0; display: flex; align-items: center; gap: var(--space-3); }
    .dns-progress-bar { flex: 1; height: 8px; background: var(--color-border); border-radius: 4px; overflow: hidden; }
    .dns-progress-fill { height: 100%; background: var(--color-primary); border-radius: 4px; transition: width 0.2s; width: 0; }
    .dns-progress-text { font-size: var(--text-sm); color: var(--color-text-muted); min-width: 36px; }
    .dns-results { margin-top: var(--space-4); }
    .dns-winner { text-align: center; padding: var(--space-4); background: var(--color-bg-alt); border-radius: var(--radius-xl); margin-bottom: var(--space-4); font-size: var(--text-lg); }
    .dns-provider { padding: var(--space-4); border: 2px solid var(--color-border); border-radius: var(--radius-xl); margin-bottom: var(--space-3); background: var(--color-surface); }
    .dns-provider-header { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2); }
    .dns-provider-name { font-weight: 700; font-size: var(--text-lg); }
    .dns-provider-avg { font-weight: 600; }
    .dns-provider-badge { padding: 2px 10px; border-radius: var(--radius-md); color: white; font-size: var(--text-xs); font-weight: 600; }
    .dns-stats { display: flex; gap: var(--space-4); font-size: var(--text-sm); color: var(--color-text-muted); margin-bottom: var(--space-2); }
    .dns-bars { display: flex; flex-direction: column; gap: 3px; }
    .dns-bar { height: 6px; border-radius: 3px; transition: width 0.3s; }
    @media (max-width: 600px) { .dns-input-row { flex-direction: column; } }
  `;
  container.appendChild(style);

  const status = container.querySelector("#dns-status");
  const progress = container.querySelector("#dns-progress");
  const progressFill = container.querySelector("#dns-progress-fill");
  const progressText = container.querySelector("#dns-progress-text");
  const results = container.querySelector("#dns-results");
  const startBtn = container.querySelector("#dns-start");
  const domainInput = container.querySelector("#dns-domain");
  const countSelect = container.querySelector("#dns-count");
  let abortController = null;

  function setStatus(msg) {
    status.textContent = msg;
  }

  container.querySelectorAll(".dns-quick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      domainInput.value = btn.dataset.domain;
    });
  });

  startBtn.addEventListener("click", async () => {
    const domain = domainInput.value
      .trim()
      .replace(/^https?:\/\//, "")
      .split("/")[0];
    if (!domain) {
      setStatus("Enter a domain to test");
      return;
    }
    const testCount = parseInt(countSelect.value);

    startBtn.disabled = true;
    abortController = new AbortController();
    results.innerHTML = "";
    setStatus("Testing DNS resolution...");
    progress.style.display = "";

    const providerResults = [];
    const totalTests = PROVIDERS.length * testCount;
    let completed = 0;

    for (const provider of PROVIDERS) {
      const providerData = { provider: provider.name, results: [] };
      for (let i = 0; i < testCount; i++) {
        try {
          const result = await testDnsProvider(provider, domain, abortController.signal);
          providerData.results.push(result);
        } catch {
          providerData.results.push({
            provider: provider.name,
            domain,
            time: 0,
            ips: [],
            status: "error"
          });
        }
        completed++;
        const pct = Math.round((completed / totalTests) * 100);
        progressFill.style.width = pct + "%";
        progressText.textContent = pct + "%";
        setStatus(`Testing ${provider.name} (${i + 1}/${testCount})...`);
      }
      providerResults.push(providerData);
    }

    progress.style.display = "none";
    setStatus("");
    startBtn.disabled = false;
    results.innerHTML = renderResults(providerResults, testCount);
  });

  domainInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !startBtn.disabled) startBtn.click();
  });
}
