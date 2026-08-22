import { escapeHtml } from "../../utils/escape-html.js";
import { RateLimitError, safeFetch } from "../../utils/safe-fetch.js";

export const RANGE_API = "https://api.pwnedpasswords.com/range/";

export async function sha1Hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-1", data);
  return [...new Uint8Array(digest)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export function buildRangeUrl(prefix) {
  if (!/^[0-9A-F]{5}$/i.test(String(prefix))) throw new Error("Prefix must be 5 hex characters");
  return RANGE_API + String(prefix).toUpperCase();
}

export function parseRangeResponse(text) {
  const map = new Map();
  for (const line of String(text).split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf(":");
    if (idx <= 0) continue;
    const suffix = trimmed.slice(0, idx).trim().toUpperCase();
    const count = parseInt(trimmed.slice(idx + 1).replace(/[^0-9]/g, ""), 10);
    map.set(suffix, Number.isFinite(count) ? count : 0);
  }
  return map;
}

export async function checkPassword(password) {
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  const res = await safeFetch(buildRangeUrl(prefix));
  if (!res.ok) throw new Error(`Pwned Passwords API returned HTTP ${res.status}`);
  const map = parseRangeResponse(await res.text());
  return { prefix, suffix, count: map.get(suffix) ?? 0 };
}

export function verdictFor(count) {
  if (count <= 0) {
    return {
      level: "safe",
      icon: "✅",
      title: "Good news — no known breaches",
      detail:
        "This password does not appear in the Pwned Passwords corpus of over a billion real-world leaked credentials."
    };
  }
  const severity = count > 100 ? "critical" : "warn";
  const seen =
    count === 1
      ? "seen exactly once in known data breaches"
      : `seen ${count.toLocaleString("en-US")} times in known data breaches`;
  return {
    level: severity,
    icon: severity === "critical" ? "⛔" : "⚠️",
    title: `Pwned! ${count.toLocaleString("en-US")} ${count === 1 ? "occurrence" : "occurrences"}`,
    detail:
      severity === "critical"
        ? `This password was ${seen}. It is heavily used and attackers try it first. Change it everywhere it is used immediately.`
        : `This password was ${seen}. Reusing it puts any account at risk — pick something unique.`
  };
}

export const toolConfig = {
  id: "password-breach-checker",
  name: "Password Breach Checker",
  category: "privacy",
  description: "Check if a password has appeared in known data breaches.",
  icon: "🔐",
  keywords: ["password", "breach", "hibp", "security", "leak"],
  steps: [
    "Type or paste the password you want to investigate.",
    "Press Check — the browser hashes it with SHA-1 and sends only the first 5 characters.",
    "Read the verdict: either zero matches or how many times it appeared in real breaches.",
    "If it is pwned, change it on every account where it is reused."
  ],
  faqs: [
    {
      question: "Is my password sent anywhere?",
      answer:
        "No. The password never leaves your browser. It is hashed locally with SHA-1 and only the first 5 characters of that hash are sent to the Pwned Passwords API using k-anonymity, so the full password — and even its full hash — stays private."
    },
    {
      question: "What is k-anonymity?",
      answer:
        "The API returns every breached-hash suffix sharing your 5-character prefix (hundreds of unrelated entries). Your browser checks for a match locally, so the service learns nothing about which password you actually checked."
    },
    {
      question: "Where does the breach data come from?",
      answer:
        "From Have I Been Pwned's free Pwned Passwords corpus, aggregated from real data breaches and constantly updated."
    },
    {
      question: "My strong random password showed up as pwned — how?",
      answer:
        "That would be extremely unusual for genuinely random passwords. Double-check for typos or trailing spaces; if the input matches what you use, change it right away."
    }
  ]
};

export function cleanup() {}

export function render(container) {
  container.innerHTML = `
    <style>
      .pbc-controls { display: flex; gap: var(--space-3); flex-wrap: wrap; margin: var(--space-4) 0; max-width: 640px; }
      .pbc-wrap { position: relative; flex: 1 1 320px; }
      .pbc-wrap input { width: 100%; padding: var(--space-2) 44px var(--space-2) var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); box-sizing: border-box; font-family: ui-monospace, monospace; }
      .pbc-eye { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; }
      .pbc-note { max-width: 640px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-2) var(--space-3); font-size: var(--text-xs); color: var(--color-text-muted, #888); margin-bottom: var(--space-3); }
      .pbc-verdict { max-width: 640px; border-radius: var(--radius-md); padding: var(--space-4); display: flex; gap: var(--space-3); align-items: flex-start; }
      .pbc-verdict.safe { background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.45); }
      .pbc-verdict.warn { background: rgba(217,119,6,.1); border: 1px solid rgba(217,119,6,.5); }
      .pbc-verdict.critical { background: rgba(220,38,38,.08); border: 1px solid rgba(220,38,38,.55); }
      .pbc-icon { font-size: 30px; line-height: 1; }
      .pbc-title { margin: 0 0 4px; font-size: var(--text-lg); }
      .pbc-detail { margin: 0; font-size: var(--text-sm); color: var(--color-text-muted, #666); line-height: 1.5; }
      .pbc-hash { font-family: ui-monospace, monospace; font-size: var(--text-xs); opacity: .8; }
      .pbc-loading { color: var(--color-text-muted, #888); font-size: var(--text-sm); }
    </style>
    <div class="pbc-controls">
      <div class="pbc-wrap">
        <input type="password" id="pbc-input" placeholder="Password to check" autocomplete="off" spellcheck="false">
        <button type="button" class="pbc-eye" id="pbc-eye" title="Show / hide">👁️</button>
      </div>
      <button type="button" class="btn-primary" id="pbc-go">Check</button>
    </div>
    <div class="pbc-note">🔒 Hashed locally — only the 5-character prefix below ever leaves this page.</div>
    <div id="pbc-out"><p class="pbc-loading">Enter a password and press Check.</p></div>
  `;
  const $ = id => container.querySelector("#" + id);
  const outEl = $("pbc-out");
  const inputEl = $("pbc-input");

  $("pbc-eye").addEventListener("click", () => {
    const hidden = inputEl.type === "password";
    inputEl.type = hidden ? "text" : "password";
    $("pbc-eye").textContent = hidden ? "🙈" : "👁️";
  });

  function showVerdict(result) {
    const v = verdictFor(result.count);
    outEl.innerHTML = `
      <div class="pbc-verdict ${v.level}">
        <span class="pbc-icon">${v.icon}</span>
        <div>
          <h3 class="pbc-title">${escapeHtml(v.title)}</h3>
          <p class="pbc-detail">${escapeHtml(v.detail)}</p>
          <p class="pbc-detail pbc-hash">SHA-1 prefix sent: ${escapeHtml(result.prefix)}…</p>
        </div>
      </div>`;
  }

  async function run() {
    const value = inputEl.value;
    if (!value) {
      outEl.innerHTML = `<p class="pbc-loading">Type a password first.</p>`;
      return;
    }
    outEl.innerHTML = `<p class="pbc-loading">Hashing &amp; checking…</p>`;
    try {
      showVerdict(await checkPassword(value));
    } catch (err) {
      outEl.innerHTML = `<div class="pbc-verdict critical"><span class="pbc-icon">❓</span><div><h3 class="pbc-title">Check failed</h3><p class="pbc-detail">${
        err instanceof RateLimitError
          ? escapeHtml(err.message)
          : "Could not reach the Pwned Passwords API. Check your connection and try again."
      }</p></div></div>`;
    }
  }

  $("pbc-go").addEventListener("click", run);
  inputEl.addEventListener("keydown", e => {
    if (e.key === "Enter") run();
  });
}
