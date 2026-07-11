import { extractAssets } from "./web-asset-extractors.js";
import { WAE_STYLES, WAE_DEMO } from "./web-asset-constants.js";

export const toolConfig = {
  id: "web-asset-extractor",
  name: "Website Asset Extractor",
  category: "dev",
  description:
    "Extract SVG nodes, image links, stylesheets, and custom web fonts from pasted raw HTML code.",
  icon: "📦",
  status: "done"
};

function createItemElement(item, index, tab) {
  const div = document.createElement("div");
  div.className = "wae-item";

  const header = document.createElement("div");
  header.className = "wae-item-header";

  const label = document.createElement("span");
  label.className = "wae-item-label";
  label.textContent = item.label || `${tab} #${index + 1}`;
  header.appendChild(label);

  const actions = document.createElement("div");
  actions.className = "wae-item-actions";

  const copyBtn = document.createElement("button");
  copyBtn.textContent = "Copy";
  copyBtn.addEventListener("click", () => {
    navigator.clipboard
      .writeText(item.content)
      .then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 1500);
      })
      .catch(() => {
        copyBtn.textContent = "Failed";
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 1500);
      });
  });
  actions.appendChild(copyBtn);

  if (item.download) {
    const dlBtn = document.createElement("button");
    dlBtn.textContent = "Download";
    dlBtn.addEventListener("click", () => {
      const blob = new Blob([item.content], { type: item.type || "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.filename || `asset-${index + 1}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
    actions.appendChild(dlBtn);
  }

  header.appendChild(actions);
  div.appendChild(header);

  if (tab === "images" && item.url) {
    const img = document.createElement("img");
    img.src = item.url;
    img.alt = item.label;
    img.onerror = () => {
      img.style.display = "none";
    };
    div.appendChild(img);
  }

  const pre = document.createElement("pre");
  pre.textContent = item.content;
  div.appendChild(pre);

  return div;
}

function renderTabContent(container, items, tab) {
  const content = container.querySelector("#wae-tab-content");
  content.textContent = "";
  if (!items || items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "wae-empty";
    empty.textContent = `No ${tab} found`;
    content.appendChild(empty);
    return;
  }
  const list = document.createElement("div");
  list.className = "wae-list";
  items.forEach((item, i) => list.appendChild(createItemElement(item, i, tab)));
  content.appendChild(list);
}

function renderStats(container, data) {
  const stats = container.querySelector("#wae-stats");
  stats.textContent = "";
  [
    { label: "SVGs", count: data.svg.length },
    { label: "Images", count: data.images.length },
    { label: "Styles", count: data.styles.length },
    { label: "Fonts", count: data.fonts.length },
    { label: "Scripts", count: data.scripts.length }
  ].forEach(s => {
    const badge = document.createElement("span");
    badge.className = "wae-stat";
    const num = document.createElement("span");
    num.className = "num";
    num.textContent = s.count;
    badge.appendChild(num);
    badge.appendChild(document.createTextNode(` ${s.label}`));
    stats.appendChild(badge);
  });
}

export function render(container) {
  let currentData = { svg: [], images: [], styles: [], fonts: [], scripts: [] };
  let activeTab = "svg";

  container.innerHTML = `
    <div class="wae-container">
      <div class="wae-input-section">
        <textarea id="wae-input" placeholder="Paste raw HTML source code here...&#10;&#10;Example: paste the HTML from View Source (Ctrl+U) of any website."></textarea>
        <div class="wae-actions">
          <button id="wae-extract" class="wae-btn wae-btn-primary">Extract Assets</button>
          <button id="wae-load-demo" class="wae-btn wae-btn-ghost">Load Demo</button>
          <button id="wae-clear" class="wae-btn wae-btn-ghost">Clear</button>
        </div>
      </div>
      <div class="wae-results" id="wae-results" style="display:none">
        <div class="wae-stats" id="wae-stats"></div>
        <div class="wae-tabs">
          <button class="wae-tab active" data-tab="svg">SVGs</button>
          <button class="wae-tab" data-tab="images">Images</button>
          <button class="wae-tab" data-tab="styles">Styles</button>
          <button class="wae-tab" data-tab="fonts">Fonts</button>
          <button class="wae-tab" data-tab="scripts">Scripts</button>
        </div>
        <div class="wae-tab-content" id="wae-tab-content"></div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = WAE_STYLES;
  container.appendChild(style);

  container.querySelector("#wae-load-demo").addEventListener("click", () => {
    container.querySelector("#wae-input").value = WAE_DEMO;
  });

  container.querySelectorAll(".wae-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      container.querySelectorAll(".wae-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeTab = tab.dataset.tab;
      renderTabContent(container, currentData[activeTab], activeTab);
    });
  });

  container.querySelector("#wae-extract").addEventListener("click", () => {
    const html = container.querySelector("#wae-input").value.trim();
    if (!html) return;
    try {
      currentData = extractAssets(html);
      renderStats(container, currentData);
      container.querySelector("#wae-results").style.display = "block";
      renderTabContent(container, currentData[activeTab], activeTab);
    } catch (e) {
      container.querySelector("#wae-results").style.display = "block";
      container.querySelector("#wae-stats").textContent = "";
      const tabContent = container.querySelector("#wae-tab-content");
      tabContent.textContent = "";
      const empty = document.createElement("div");
      empty.className = "wae-empty";
      empty.textContent = "Error: " + e.message;
      tabContent.appendChild(empty);
    }
  });

  container.querySelector("#wae-clear").addEventListener("click", () => {
    container.querySelector("#wae-input").value = "";
    container.querySelector("#wae-results").style.display = "none";
  });
}
