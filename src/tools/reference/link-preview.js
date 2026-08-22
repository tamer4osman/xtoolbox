import { copyToClipboard } from "../../utils/clipboard.js";
import { escapeHtml } from "../../utils/escape-html.js";
import { RateLimitError, safeFetch } from "../../utils/safe-fetch.js";

const API_BASE = "https://api.microlink.io";

export function isValidHttpUrl(value) {
  try {
    const u = new URL(String(value).trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function buildApiUrl(target) {
  let trimmed = String(target).trim();
  if (!trimmed) throw new Error("Enter a valid http(s) URL");
  if (!/^https?:\/\//i.test(trimmed)) trimmed = "https://" + trimmed;
  if (!isValidHttpUrl(trimmed)) throw new Error("Enter a valid http(s) URL");
  return `${API_BASE}?url=${encodeURIComponent(trimmed)}&palette=true`;
}

function pickImage(obj) {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj.url || "";
}

export function extractCardData(apiJson) {
  const d = apiJson?.data ?? {};
  return {
    title: d.title || d.publisher || d.url || "Untitled",
    description: d.description || "",
    publisher: d.publisher || "",
    imageUrl: pickImage(d.image),
    logoUrl: pickImage(d.logo),
    url: d.url || "",
    palette: Array.isArray(d.palette) && d.palette.length ? d.palette[0] : null,
    lang: d.lang || ""
  };
}

export function extractNoembed(json) {
  if (!json || json.error) throw new Error("noembed failed");
  return {
    title: json.title || "Untitled",
    description: "",
    publisher: json.provider_name || "",
    imageUrl: json.thumbnail_url || "",
    logoUrl: "",
    url: json.url || "",
    palette: null,
    lang: ""
  };
}

export function buildHtmlSnippet(card) {
  const img = card.imageUrl ? `\n  <img src="${escapeHtml(card.imageUrl)}" alt="">` : "";
  const desc = card.description ? `\n  <p>${escapeHtml(card.description)}</p>` : "";
  return `<a href="${escapeHtml(card.url)}" rel="noopener">${img}\n  <strong>${escapeHtml(card.title)}</strong>${desc}\n</a>`;
}

export const PRESETS = [
  "https://github.com/microlinkhq",
  "https://en.wikipedia.org/wiki/Open_Graph_protocol",
  "https://news.ycombinator.com"
];

export const toolConfig = {
  id: "link-preview",
  name: "Link Preview Generator",
  category: "reference",
  description: "Generate Open Graph preview images for any URL.",
  icon: "🔗",
  keywords: ["link", "preview", "og", "social", "share"],
  steps: [
    "Paste any web page URL and press Preview.",
    "Review the generated Open Graph card: image, title, description, and publisher.",
    "Copy the ready-to-paste HTML snippet or the raw JSON metadata.",
    "Use the palette color as an accent when sharing the link."
  ],
  faqs: [
    {
      question: "Where does the metadata come from?",
      answer:
        "Primarily from the Microlink API, which extracts the page's Open Graph and meta tags. If a site blocks it, we fall back to the noembed.com oEmbed service (YouTube, Vimeo, and similar). No API key is required."
    },
    {
      question: "Why do some sites show no image?",
      answer:
        "The site has not defined og:image or similar meta tags, or blocks automated fetching. The card falls back to title and description only."
    },
    {
      question: "Are you uploading my links anywhere?",
      answer:
        "URLs are sent to api.microlink.io solely to extract their public metadata. Nothing else is stored or tracked by this page."
    }
  ]
};

let controller = null;
const objectUrls = [];

export function cleanup() {
  if (controller) controller.abort();
  controller = null;
  while (objectUrls.length) URL.revokeObjectURL(objectUrls.pop());
}

export function render(container) {
  cleanup();
  container.innerHTML = `
    <style>
      .lp-controls { display: flex; gap: var(--space-3); flex-wrap: wrap; margin: var(--space-4) 0 var(--space-2); }
      .lp-controls input[type="text"] { flex: 1 1 320px; padding: var(--space-2) var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); }
      .lp-presets { display: flex; gap: var(--space-2); flex-wrap: wrap; margin-bottom: var(--space-4); }
      .lp-preset { font-size: var(--text-xs); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 999px; padding: 4px 12px; cursor: pointer; }
      .lp-card { display: grid; grid-template-columns: minmax(0, 340px) 1fr; border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; background: var(--color-surface); max-width: 760px; }
      @media (max-width: 640px) { .lp-card { grid-template-columns: 1fr; } }
      .lp-img-wrap { background: rgba(127,127,127,.08); min-height: 160px; display: flex; align-items: center; justify-content: center; }
      .lp-img { width: 100%; height: 100%; object-fit: cover; display: block; max-height: 260px; }
      .lp-noimg { font-size: 40px; opacity: .35; }
      .lp-body { padding: var(--space-3) var(--space-4); display: flex; flex-direction: column; gap: var(--space-2); }
      .lp-title { margin: 0; font-size: var(--text-lg); line-height: 1.3; }
      .lp-desc { margin: 0; color: var(--color-text-muted, #666); font-size: var(--text-sm); line-height: 1.5; }
      .lp-meta { display: flex; align-items: center; gap: 8px; font-size: var(--text-xs); color: var(--color-text-muted, #888); margin-top: auto; }
      .lp-logo { width: 18px; height: 18px; border-radius: 4px; object-fit: contain; }
      .lp-actions { display: flex; gap: var(--space-2); flex-wrap: wrap; margin-top: var(--space-4); }
      .lp-error { border: 1px solid #dc2626; color: #dc2626; background: rgba(220,38,38,.06); border-radius: var(--radius-md); padding: var(--space-3); font-size: var(--text-sm); max-width: 760px; }
      .lp-loading { color: var(--color-text-muted, #888); font-size: var(--text-sm); padding: var(--space-3); }
      .lp-swatches { display: inline-flex; gap: 4px; vertical-align: middle; }
      .lp-swatch { width: 14px; height: 14px; border-radius: 3px; border: 1px solid rgba(0,0,0,.15); display: inline-block; }
    </style>
    <div class="lp-controls">
      <input type="text" id="lp-url" placeholder="https://example.com/article" spellcheck="false">
      <button type="button" class="btn-primary" id="lp-go">Preview</button>
    </div>
    <div class="lp-presets">
      ${PRESETS.map(p => `<button type="button" class="lp-preset" data-url="${escapeHtml(p)}">${escapeHtml(new URL(p).hostname)}</button>`).join("")}
    </div>
    <div id="lp-out"><p class="lp-loading">Paste a URL to see its Open Graph preview.</p></div>
  `;
  if (!container.isConnected) return;

  const $ = id => container.querySelector("#" + id);
  const outEl = $("lp-out");
  const urlEl = $("lp-url");

  function showError(msg) {
    outEl.innerHTML = `<div class="lp-error">${escapeHtml(msg)}</div>`;
  }

  function renderCard(card) {
    const accent = card.palette
      ? `<span class="lp-swatches"><span class="lp-swatch" style="background:${escapeHtml(card.palette)}"></span></span>`
      : "";
    const img = card.imageUrl
      ? `<img class="lp-img" alt="" referrerpolicy="no-referrer" data-src="${escapeHtml(card.imageUrl)}">`
      : `<span class="lp-noimg">🔗</span>`;
    const logo = card.logoUrl
      ? `<img class="lp-logo" src="${escapeHtml(card.logoUrl)}" alt="" referrerpolicy="no-referrer">`
      : "";
    outEl.innerHTML = `
      <div class="lp-card"${card.palette ? ` style="border-color:${escapeHtml(card.palette)}"` : ""}>
        <div class="lp-img-wrap">${img}</div>
        <div class="lp-body">
          <h3 class="lp-title">${escapeHtml(card.title)}</h3>
          ${card.description ? `<p class="lp-desc">${escapeHtml(card.description)}</p>` : ""}
          <div class="lp-meta">${logo}<span>${escapeHtml(card.publisher || new URL(card.url || "https://x.invalid").hostname)}</span> ${accent}</div>
        </div>
      </div>
      <div class="lp-actions">
        <button type="button" class="btn-secondary" id="lp-copyhtml">Copy HTML</button>
        <button type="button" class="btn-secondary" id="lp-copyjson">Copy JSON</button>
      </div>
    `;
    $("lp-copyhtml").addEventListener("click", async e =>
      copyToClipboard(buildHtmlSnippet(card), e.target)
    );
    $("lp-copyjson").addEventListener("click", async e =>
      copyToClipboard(JSON.stringify(card, null, 2), e.target)
    );
    const imgEl = outEl.querySelector(".lp-img");
    if (imgEl) {
      const dropToPlaceholder = () => {
        const wrap = outEl.querySelector(".lp-img-wrap");
        if (wrap) wrap.innerHTML = `<span class="lp-noimg">🔗</span>`;
      };
      imgEl.addEventListener("error", dropToPlaceholder);
      loadImage(imgEl).catch(dropToPlaceholder);
    }
    const logoEl = outEl.querySelector(".lp-logo");
    if (logoEl) {
      logoEl.addEventListener("error", () => {
        logoEl.style.display = "none";
      });
    }
  }

  async function loadImage(imgEl) {
    const raw = imgEl.dataset.src;
    if (!raw) return;
    try {
      const res = await safeFetch(raw);
      if (!res.ok) throw new Error("image fetch failed");
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      objectUrls.push(objUrl);
      imgEl.src = objUrl;
    } catch {
      imgEl.src = raw;
      if (imgEl.complete && imgEl.naturalWidth === 0) {
        const wrap = outEl.querySelector(".lp-img-wrap");
        if (wrap) wrap.innerHTML = `<span class="lp-noimg">🔗</span>`;
      }
    }
  }

  async function fetchNoembed(target) {
    const u = `https://noembed.com/embed?url=${encodeURIComponent(target)}`;
    const res = await safeFetch(u);
    return extractNoembed(await res.json());
  }

  async function run() {
    let target;
    try {
      target = String(urlEl.value).trim();
      if (!target) throw new Error("empty");
      if (!/^https?:\/\//i.test(target)) target = "https://" + target;
      if (!isValidHttpUrl(target)) throw new Error("invalid");
    } catch {
      showError("Enter a valid http(s) URL");
      return;
    }
    outEl.innerHTML = `<p class="lp-loading">Fetching metadata…</p>`;
    controller = new AbortController();
    try {
      const res = await safeFetch(buildApiUrl(target));
      const json = await res.json();
      if (res.ok && json.status === "success") {
        renderCard(extractCardData(json));
        return;
      }
      renderCard(extractNoembed(await fetchNoembed(target)));
    } catch (microlinkErr) {
      try {
        renderCard(extractNoembed(await fetchNoembed(target)));
      } catch {
        if (microlinkErr instanceof RateLimitError) {
          showError("Preview rate limit reached. " + microlinkErr.message);
        } else {
          showError(
            "Couldn't fetch metadata for that URL. The site may block automated requests, require JavaScript, or be offline. Try another link."
          );
        }
      }
    }
  }

  $("lp-go").addEventListener("click", run);
  urlEl.addEventListener("keydown", e => {
    if (e.key === "Enter") run();
  });
  container.querySelectorAll(".lp-preset").forEach(btn => {
    btn.addEventListener("click", () => {
      urlEl.value = btn.dataset.url;
      run();
    });
  });
}
