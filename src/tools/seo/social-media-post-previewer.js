const CORS_PROXIES = [
  url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
];

async function fetchWithProxy(url) {
  for (const makeProxy of CORS_PROXIES) {
    try {
      const proxyUrl = makeProxy(url);
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
      if (res.ok) return await res.text();
    } catch {}
  }
  throw new Error("Could not fetch URL (all CORS proxies failed)");
}

function parseMeta(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const get = sel => doc.querySelector(sel)?.getAttribute("content") || "";

  return {
    title: get('meta[property="og:title"]') || get('meta[name="twitter:title"]') || doc.title || "",
    description:
      get('meta[property="og:description"]') ||
      get('meta[name="twitter:description"]') ||
      get('meta[name="description"]') ||
      "",
    image: get('meta[property="og:image"]') || get('meta[name="twitter:image"]') || "",
    url: get('meta[property="og:url"]') || url,
    siteName: get('meta[property="og:site_name"]') || "",
    type: get('meta[property="og:type"]') || "website"
  };
}

function truncate(str, max) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max - 1) + "\u2026" : str;
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function renderTwitterCard(meta, imageUrl) {
  return `
    <div class="preview-card twitter-card">
      <div class="preview-label">X (Twitter)</div>
      <div class="twitter-card-inner">
        ${imageUrl ? `<img class="twitter-img" src="${imageUrl}" alt="" onerror="this.style.display='none'">` : ""}
        <div class="twitter-text">
          <div class="twitter-title">${truncate(meta.title, 70)}</div>
          <div class="twitter-desc">${truncate(meta.description, 200)}</div>
          <div class="twitter-url"><span class="twitter-domain">${getDomain(meta.url)}</span></div>
        </div>
      </div>
    </div>
  `;
}

function renderFacebookCard(meta, imageUrl) {
  return `
    <div class="preview-card facebook-card">
      <div class="preview-label">Facebook</div>
      ${imageUrl ? `<img class="fb-img" src="${imageUrl}" alt="" onerror="this.style.display='none'">` : ""}
      <div class="fb-text">
        <div class="fb-url">${getDomain(meta.url).toUpperCase()}</div>
        <div class="fb-title">${truncate(meta.title, 100)}</div>
        <div class="fb-desc">${truncate(meta.description, 200)}</div>
      </div>
    </div>
  `;
}

function renderLinkedInCard(meta, imageUrl) {
  return `
    <div class="preview-card linkedin-card">
      <div class="preview-label">LinkedIn</div>
      ${imageUrl ? `<img class="li-img" src="${imageUrl}" alt="" onerror="this.style.display='none'">` : ""}
      <div class="li-text">
        <div class="li-title">${truncate(meta.title, 70)}</div>
        <div class="li-desc">${truncate(meta.description, 200)}</div>
        <div class="li-url">${getDomain(meta.url)}</div>
      </div>
    </div>
  `;
}

function renderInstagramCard(meta, imageUrl) {
  return `
    <div class="preview-card instagram-card">
      <div class="preview-label">Instagram</div>
      <div class="ig-header">
        <div class="ig-avatar"></div>
        <div class="ig-user">${meta.siteName || getDomain(meta.url)}</div>
      </div>
      ${imageUrl ? `<img class="ig-img" src="${imageUrl}" alt="" onerror="this.style.display='none'">` : '<div class="ig-placeholder">No image</div>'}
      <div class="ig-actions">♡ 💬 ↗</div>
      <div class="ig-likes">0 likes</div>
      <div class="ig-caption"><strong>${meta.siteName || getDomain(meta.url)}</strong> ${truncate(meta.description, 200)}</div>
    </div>
  `;
}

function renderMetaTags(meta) {
  const tags = [
    { label: "og:title", value: meta.title },
    { label: "og:description", value: meta.description },
    { label: "og:image", value: meta.image },
    { label: "og:url", value: meta.url },
    { label: "og:type", value: meta.type },
    { label: "og:site_name", value: meta.siteName }
  ];
  return tags
    .map(
      t =>
        `<div class="meta-tag"><span class="meta-key">${t.label}</span><span class="meta-val">${truncate(t.value, 80) || "<em>missing</em>"}</span></div>`
    )
    .join("");
}

export const toolConfig = {
  id: "social-media-post-previewer",
  name: "Social Media Post Previewer",
  category: "seo",
  description: "Preview how content will look when shared on X, Facebook, LinkedIn, and Instagram.",
  icon: "👁️",
  keywords: ["social", "media", "preview", "twitter", "facebook", "linkedin", "og"],
  accept: "",
  maxSizeMB: 5
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <h1>${toolConfig.name}</h1>
      <p class="tool-description">See how your link will appear across social platforms before sharing.</p>

      <div class="tool-ui">
        <div class="input-group">
          <label for="url-input">Enter URL to preview</label>
          <div class="url-row">
            <input type="url" id="url-input" placeholder="https://example.com/your-page" class="input-field">
            <button type="button" id="fetch-btn" class="btn-primary">Fetch & Preview</button>
          </div>
        </div>

        <div id="status" class="status-msg" style="display:none"></div>

        <div id="preview-grid" class="preview-grid" style="display:none"></div>

        <div id="meta-panel" class="meta-panel" style="display:none">
          <h3>Detected Meta Tags</h3>
          <div id="meta-tags"></div>
          <h3>Warnings</h3>
          <div id="warnings"></div>
        </div>
      </div>
    </div>
  `;

  const urlInput = container.querySelector("#url-input");
  const fetchBtn = container.querySelector("#fetch-btn");
  const status = container.querySelector("#status");
  const previewGrid = container.querySelector("#preview-grid");
  const metaPanel = container.querySelector("#meta-panel");
  const metaTags = container.querySelector("#meta-tags");
  const warnings = container.querySelector("#warnings");

  function showStatus(msg, type) {
    status.style.display = "block";
    status.textContent = msg;
    status.className = `status-msg status-${type}`;
  }

  fetchBtn.addEventListener("click", async () => {
    let url = urlInput.value.trim();
    if (!url) {
      showStatus("Please enter a URL", "error");
      return;
    }
    if (!url.startsWith("http")) url = "https://" + url;
    urlInput.value = url;

    showStatus("Fetching page...", "loading");
    fetchBtn.disabled = true;
    previewGrid.style.display = "none";
    metaPanel.style.display = "none";

    try {
      const html = await fetchWithProxy(url);
      const meta = parseMeta(html);

      showStatus("Page fetched successfully", "success");

      const imageUrl = meta.image || "";
      previewGrid.innerHTML = `
        ${renderTwitterCard(meta, imageUrl)}
        ${renderFacebookCard(meta, imageUrl)}
        ${renderLinkedInCard(meta, imageUrl)}
        ${renderInstagramCard(meta, imageUrl)}
      `;
      previewGrid.style.display = "grid";

      metaTags.innerHTML = renderMetaTags(meta);

      const warns = [];
      if (!meta.title)
        warns.push({
          level: "error",
          msg: "Missing og:title — platforms will use page title or show blank"
        });
      else if (meta.title.length > 60)
        warns.push({
          level: "warning",
          msg: `og:title is ${meta.title.length} chars — may be truncated on Twitter (60 chars optimal)`
        });

      if (!meta.description)
        warns.push({
          level: "error",
          msg: "Missing og:description — platforms will auto-extract or show blank"
        });
      else if (meta.description.length > 160)
        warns.push({
          level: "warning",
          msg: `og:description is ${meta.description.length} chars — may be truncated (160 optimal)`
        });

      if (!meta.image)
        warns.push({
          level: "error",
          msg: "Missing og:image — link will share without a preview image"
        });

      if (meta.image && meta.image.startsWith("/"))
        warns.push({
          level: "error",
          msg: "og:image uses a relative path — will break when shared (must be absolute URL)"
        });

      warnings.innerHTML =
        warns.length > 0
          ? warns.map(w => `<div class="warn warn-${w.level}">${w.msg}</div>`).join("")
          : '<div class="warn warn-ok">No issues found</div>';

      metaPanel.style.display = "block";
    } catch (e) {
      showStatus(`Error: ${e.message}`, "error");
    } finally {
      fetchBtn.disabled = false;
    }
  });

  urlInput.addEventListener("keydown", e => {
    if (e.key === "Enter") fetchBtn.click();
  });
}
