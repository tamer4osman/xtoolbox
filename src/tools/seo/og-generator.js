import { escapeHtml } from "../../utils/escape-html.js";

export const toolConfig = {
  id: "og-generator",
  name: "Open Graph Generator",
  category: "seo",
  description: "Generate Open Graph tags for social media sharing.",
  icon: "🔗",
  status: "done",
  keywords: [
    "open graph",
    "og tags",
    "meta tags",
    "social preview",
    "facebook preview",
    "twitter card"
  ],
  steps: [
    "Enter your page URL, title, description, and image URL",
    "OG and Twitter meta tags are generated in real-time",
    "Switch between Facebook, X/Twitter, LinkedIn, and Slack preview tabs",
    "Copy the generated meta tags with one click"
  ],
  faqs: [
    {
      question: "What are Open Graph tags?",
      answer:
        "Open Graph (OG) tags are HTML meta tags that control how your web pages appear when shared on social media platforms like Facebook, X/Twitter, LinkedIn, and Slack."
    },
    {
      question: "What image size should I use?",
      answer:
        "The recommended image size is 1200×630 pixels with a 1.91:1 aspect ratio. This ensures your link previews display correctly across all major platforms."
    }
  ]
};

let _style = null;

export function render(container) {
  container.innerHTML = `
    <div class="og-container">
      <div class="og-form">
        <input type="text" id="url" placeholder="Page URL (https://example.com/page)">
        <input type="text" id="title" placeholder="Title (60-70 chars)">
        <textarea id="desc" placeholder="Description (150-160 chars)"></textarea>
        <input type="text" id="image" placeholder="Image URL (1200x630 recommended)">
        <select id="type">
          <option value="website">website</option>
          <option value="article">article</option>
          <option value="product">product</option>
          <option value="video">video</option>
        </select>
        <label class="toggle-label">
          <input type="checkbox" id="toggle-preview" checked>
          Show social previews
        </label>
        <button id="generateBtn" class="generate-btn">Generate Meta Tags</button>
        <div class="output"><pre id="result"></pre><button id="copyBtn">Copy</button></div>
      </div>
      <div class="og-previews" id="og-previews">
        <h3>Social Media Previews</h3>
        <div class="preview-tabs">
          <button class="preview-tab active" data-platform="facebook">Facebook</button>
          <button class="preview-tab" data-platform="twitter">X (Twitter)</button>
          <button class="preview-tab" data-platform="linkedin">LinkedIn</button>
          <button class="preview-tab" data-platform="slack">Slack</button>
        </div>
        <div id="facebook-preview" class="preview-panel active"></div>
        <div id="twitter-preview" class="preview-panel"></div>
        <div id="linkedin-preview" class="preview-panel"></div>
        <div id="slack-preview" class="preview-panel"></div>
      </div>
    </div>
  `;

  _style = document.createElement("style");
  _style.textContent = `
    .og-container { max-width: 800px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); }
    @media (max-width: 768px) { .og-container { grid-template-columns: 1fr; } }
    .og-form { display: flex; flex-direction: column; gap: var(--space-3); }
    .og-form h2 { text-align: center; margin-bottom: var(--space-4); }
    .og-form input, .og-form textarea, .og-form select { width: 100%; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); }
    .og-form textarea { min-height: 60px; resize: vertical; }
    .generate-btn { padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .generate-btn:hover { background: var(--color-primary-hover); }
    .toggle-label { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); cursor: pointer; }
    .output { display: flex; gap: var(--space-2); background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); }
    .output pre { flex: 1; margin: 0; font-family: monospace; font-size: var(--text-xs); white-space: pre-wrap; word-break: break-all; max-height: 300px; overflow-y: auto; }
    #copyBtn { padding: var(--space-2) var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; align-self: flex-start; }
    #copyBtn:hover { background: var(--color-primary-hover); }
    .og-previews h3 { margin-bottom: var(--space-3); font-size: var(--text-lg); }
    .preview-tabs { display: flex; gap: var(--space-1); margin-bottom: var(--space-3); }
    .preview-tab { padding: var(--space-1) var(--space-3); border: 1px solid var(--color-border); background: var(--color-surface); border-radius: var(--radius-md) var(--radius-md) 0 0; cursor: pointer; font-size: var(--text-sm); }
    .preview-tab.active { background: white; border-bottom-color: white; font-weight: 600; }
    .preview-panel { display: none; }
    .preview-panel.active { display: block; }

    .fb-card { font-family: 'Helvetica', Arial, sans-serif; background: white; border: 1px solid #dddfe2; border-radius: 8px; overflow: hidden; }
    .fb-card-img { width: 100%; height: 168px; background: #f0f2f5; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .fb-card-img img { width: 100%; height: 100%; object-fit: cover; }
    .fb-card-img .placeholder { color: #90949c; font-size: var(--text-sm); }
    .fb-card-body { padding: 10px 12px; }
    .fb-card-domain { font-size: 11px; color: #606770; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .fb-card-title { font-size: 15px; font-weight: 600; color: #1d2129; line-height: 1.3; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .fb-card-desc { font-size: 13px; color: #606770; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    .tw-card { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; border: 1px solid #e1e8ed; border-radius: 16px; overflow: hidden; }
    .tw-card-img { width: 100%; height: 200px; background: #f5f8fa; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .tw-card-img img { width: 100%; height: 100%; object-fit: cover; }
    .tw-card-img .placeholder { color: #8899a6; font-size: var(--text-sm); }
    .tw-card-body { padding: 12px 14px; }
    .tw-card-domain { font-size: 13px; color: #8899a6; margin-bottom: 2px; }
    .tw-card-title { font-size: 15px; font-weight: 600; color: #0f1419; line-height: 1.3; margin-bottom: 2px; }
    .tw-card-desc { font-size: 14px; color: #536471; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    .li-card { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
    .li-card-img { width: 100%; height: 180px; background: #f3f6f8; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .li-card-img img { width: 100%; height: 100%; object-fit: cover; }
    .li-card-img .placeholder { color: #86888a; font-size: var(--text-sm); }
    .li-card-body { padding: 14px 16px; }
    .li-card-domain { font-size: 12px; color: #86888a; margin-bottom: 4px; }
    .li-card-title { font-size: 16px; font-weight: 600; color: #191919; line-height: 1.3; margin-bottom: 4px; }
    .li-card-desc { font-size: 13px; color: #666; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    .slack-card { font-family: 'Noto Sans', -apple-system, sans-serif; background: white; border: 1px solid #e8e8e8; border-radius: 6px; overflow: hidden; border-left: 4px solid #4a154b; }
    .slack-card-img { width: 100%; height: 140px; background: #f8f8f8; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .slack-card-img img { width: 100%; height: 100%; object-fit: cover; }
    .slack-card-img .placeholder { color: #aaa; font-size: var(--text-sm); }
    .slack-card-body { padding: 8px 12px; }
    .slack-card-domain { font-size: 11px; color: #aaa; margin-bottom: 2px; }
    .slack-card-title { font-size: 14px; font-weight: 700; color: #1d1c1d; line-height: 1.3; margin-bottom: 2px; }
    .slack-card-desc { font-size: 13px; color: #555; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    .empty-preview { padding: var(--space-8); text-align: center; color: var(--color-text-muted); font-size: var(--text-sm); }
  `;
  container.appendChild(_style);

  const urlInput = container.querySelector("#url");
  const titleInput = container.querySelector("#title");
  const descInput = container.querySelector("#desc");
  const imgInput = container.querySelector("#image");
  const typeSelect = container.querySelector("#type");
  const togglePreview = container.querySelector("#toggle-preview");
  const previewsSection = container.querySelector("#og-previews");
  const generateBtn = container.querySelector("#generateBtn");
  const resultEl = container.querySelector("#result");
  const copyBtn = container.querySelector("#copyBtn");

  function getFormData() {
    return {
      url: urlInput.value,
      title: titleInput.value,
      desc: descInput.value,
      image: imgInput.value,
      type: typeSelect.value
    };
  }

  function renderPreview(platform) {
    const { url, title, desc, image } = getFormData();
    let domain = "example.com";
    if (url) {
      try {
        domain = new URL(url).hostname.replace("www.", "");
      } catch {
        /* incomplete URL during typing */
      }
    }
    const hasImage = image && (image.startsWith("http") || image.startsWith("/"));
    const imgTag = hasImage
      ? `<img src="${escapeHtml(image)}" alt="" onerror="this.parentElement.innerHTML='<span class=placeholder>No image</span>'">`
      : '<span class="placeholder">Add image URL for preview</span>';

    if (!title && !desc) {
      return '<div class="empty-preview">Fill in title and description to see preview</div>';
    }

    const prefix = { facebook: "fb", twitter: "tw", linkedin: "li", slack: "slack" }[platform];
    if (!prefix) return '<div class="empty-preview">Unknown platform</div>';

    return `<div class="${prefix}-card"><div class="${prefix}-card-img">${imgTag}</div><div class="${prefix}-card-body"><div class="${prefix}-card-domain">${escapeHtml(domain)}</div><div class="${prefix}-card-title">${escapeHtml(title || "Title")}</div><div class="${prefix}-card-desc">${escapeHtml(desc || "Description")}</div></div></div>`;
  }

  function updateAllPreviews() {
    container.querySelector("#facebook-preview").innerHTML = renderPreview("facebook");
    container.querySelector("#twitter-preview").innerHTML = renderPreview("twitter");
    container.querySelector("#linkedin-preview").innerHTML = renderPreview("linkedin");
    container.querySelector("#slack-preview").innerHTML = renderPreview("slack");
  }

  const inputs = [urlInput, titleInput, descInput, imgInput];
  inputs.forEach(input => input.addEventListener("input", updateAllPreviews));
  typeSelect.addEventListener("change", updateAllPreviews);

  togglePreview.addEventListener("change", () => {
    previewsSection.style.display = togglePreview.checked ? "block" : "none";
  });

  container.querySelectorAll(".preview-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      container.querySelectorAll(".preview-tab").forEach(t => t.classList.remove("active"));
      container.querySelectorAll(".preview-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      const panel = container.querySelector(`#${tab.dataset.platform}-preview`);
      if (panel) panel.classList.add("active");
    });
  });

  generateBtn.addEventListener("click", () => {
    const { url, title, desc, image, type } = getFormData();
    let tags = "<!-- Open Graph -->\n";
    if (url) tags += `<meta property="og:url" content="${escapeHtml(url)}">\n`;
    if (title) tags += `<meta property="og:title" content="${escapeHtml(title)}">\n`;
    if (desc) tags += `<meta property="og:description" content="${escapeHtml(desc)}">\n`;
    if (image) tags += `<meta property="og:image" content="${escapeHtml(image)}">\n`;
    tags += `<meta property="og:type" content="${type}">\n`;
    tags += "\n<!-- Twitter -->\n";
    tags += '<meta name="twitter:card" content="summary_large_image">\n';
    if (title) tags += `<meta name="twitter:title" content="${escapeHtml(title)}">\n`;
    if (desc) tags += `<meta name="twitter:description" content="${escapeHtml(desc)}">\n`;
    if (image) tags += `<meta name="twitter:image" content="${escapeHtml(image)}">\n`;
    resultEl.textContent = tags;
  });

  copyBtn.addEventListener("click", () => {
    navigator.clipboard
      .writeText(resultEl.textContent)
      .then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
      })
      .catch(() => {
        copyBtn.textContent = "Failed";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
      });
  });

  updateAllPreviews();
}

export function destroy() {
  if (_style) _style.remove();
}
