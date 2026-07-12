import { escapeHtml } from "../../utils/escape-html.js";

const STORAGE_KEY = "xtoolbox-email-sig";
const SOCIAL_ICONS = {
  linkedin: `<svg fill="currentColor" viewBox="0 0 24 24" width="18" height="18"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  twitter: `<svg fill="currentColor" viewBox="0 0 24 24" width="18" height="18"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  github: `<svg fill="currentColor" viewBox="0 0 24 24" width="18" height="18"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
  instagram: `<svg fill="currentColor" viewBox="0 0 24 24" width="18" height="18"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`
};

function getDefaults() {
  return {
    name: "",
    title: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    linkedin: "",
    twitter: "",
    github: "",
    instagram: "",
    photoDataUrl: null,
    logoDataUrl: null,
    bannerDataUrl: null,
    textColor: "#333333",
    accentColor: "#0056b3",
    linkColor: "#0056b3",
    fontSize: "14",
    dividerStyle: "line",
    photoShape: "round",
    showPhoto: false,
    showLogo: false,
    showBanner: false,
    showAddress: false
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...getDefaults(), ...JSON.parse(raw) } : getDefaults();
  } catch {
    return getDefaults();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function renderPhoto(state) {
  if (!state.photoDataUrl || !state.showPhoto) return "";
  const radius = state.photoShape === "round" ? "50%" : "8px";
  return `<td style="padding:0 16px 0 0;vertical-align:top;width:72px;"><img src="${state.photoDataUrl}" alt="" style="display:block;width:72px;height:72px;border-radius:${radius};object-fit:cover;"></td>`;
}

function renderLogo(state) {
  if (!state.logoDataUrl || !state.showLogo) return "";
  return `<div style="margin-bottom:10px;"><img src="${state.logoDataUrl}" alt="" style="display:block;max-height:40px;max-width:200px;"></div>`;
}

function renderNameSection(state, nameSize, titleSize) {
  const nameHtml = state.name
    ? `<div style="font-size:${nameSize}px;font-weight:700;color:${state.textColor};line-height:1.3;margin:0;">${escapeHtml(state.name)}</div>`
    : "";

  const titleCompany = [state.title, state.company].filter(Boolean);
  const titleHtml = titleCompany.length
    ? `<div style="font-size:${titleSize}px;color:${state.textColor};line-height:1.4;margin:2px 0 0 0;">${titleCompany.map(escapeHtml).join(" &middot; ")}</div>`
    : "";

  return nameHtml + titleHtml;
}

function renderContactSection(state, smallSize) {
  const contactItems = [];
  if (state.email) {
    const mailHref = state.email.includes("@") ? "mailto:" + state.email : state.email;
    contactItems.push(
      `<a href="${escapeAttribute(mailHref)}" style="color:${escapeAttribute(state.linkColor)};text-decoration:none;font-size:${smallSize}px;">${escapeHtml(state.email)}</a>`
    );
  }
  if (state.phone)
    contactItems.push(
      `<span style="color:${escapeAttribute(state.textColor)};font-size:${smallSize}px;">${escapeHtml(state.phone)}</span>`
    );
  if (state.website)
    contactItems.push(
      `<a href="${escapeAttribute(normalizeUrl(state.website))}" target="_blank" rel="noopener noreferrer" style="color:${escapeAttribute(state.linkColor)};text-decoration:none;font-size:${smallSize}px;">${escapeHtml(state.website)}</a>`
    );

  if (contactItems.length === 0) return "";
  return `<div style="margin-top:6px;">${contactItems.join(" &nbsp;|&nbsp; ")}</div>`;
}

function renderSocialLinks(state) {
  const socialLinks = [];
  const socialEntries = [
    { key: "linkedin", url: state.linkedin },
    { key: "twitter", url: state.twitter },
    { key: "github", url: state.github },
    { key: "instagram", url: state.instagram }
  ];
  for (const s of socialEntries) {
    if (s.url && SOCIAL_ICONS[s.key]) {
      socialLinks.push(
        `<a href="${escapeAttribute(normalizeUrl(s.url))}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin:0 4px;color:${escapeAttribute(s.textColor || state.textColor)};text-decoration:none;">${SOCIAL_ICONS[s.key]}</a>`
      );
    }
  }

  if (socialLinks.length === 0) return "";
  return `<div style="margin-top:8px;">${socialLinks.join("")}</div>`;
}

function renderAddress(state, smallSize) {
  if (!state.address || !state.showAddress) return "";
  return `<div style="margin-top:4px;font-size:${smallSize}px;color:${state.textColor};">${escapeHtml(state.address)}</div>`;
}

function renderBanner(state) {
  if (!state.bannerDataUrl || !state.showBanner) return "";
  return `<div style="margin-top:10px;"><a href="${escapeAttribute(normalizeUrl(state.website || "#"))}" target="_blank" rel="noopener noreferrer"><img src="${state.bannerDataUrl}" alt="" style="display:block;max-width:500px;max-height:120px;border:0;"></a></div>`;
}

function renderDivider(accentColor) {
  return `<tr><td style="padding:0;font-size:1px;line-height:1px;height:4px;background:${accentColor};"><div style="height:4px;">&nbsp;</div></td></tr>`;
}

function renderBodyRows(photoHtml, header, contactHtml, socialHtml, addressHtml, bannerHtml) {
  const bodyRows = [];

  if (photoHtml) {
    bodyRows.push(
      `<tr><td style="padding:0;"><table cellpadding="0" cellspacing="0" border="0"><tr>${photoHtml}<td style="padding:0;vertical-align:top;">${header}${contactHtml}${socialHtml}${addressHtml}</td></tr></table></td></tr>`
    );
  } else {
    if (header) bodyRows.push(`<tr><td style="padding:0;">${header}</td></tr>`);
    if (contactHtml) bodyRows.push(`<tr><td style="padding:0;">${contactHtml}</td></tr>`);
    if (socialHtml) bodyRows.push(`<tr><td style="padding:0;">${socialHtml}</td></tr>`);
    if (addressHtml) bodyRows.push(`<tr><td style="padding:0;">${addressHtml}</td></tr>`);
  }
  if (bannerHtml) bodyRows.push(`<tr><td style="padding:0;">${bannerHtml}</td></tr>`);

  return bodyRows;
}

function buildSignatureHtml(state) {
  const fs = state.fontSize || 14;
  const nameSize = Math.round(fs * 1.35);
  const titleSize = Math.round(fs * 0.95);
  const smallSize = Math.round(fs * 0.82);

  const photoHtml = renderPhoto(state);
  const logoHtml = renderLogo(state);
  const header = logoHtml + renderNameSection(state, nameSize, titleSize);
  const contactHtml = renderContactSection(state, smallSize);
  const socialHtml = renderSocialLinks(state);
  const addressHtml = renderAddress(state, smallSize);
  const bannerHtml = renderBanner(state);

  const bodyRows = renderBodyRows(
    photoHtml,
    header,
    contactHtml,
    socialHtml,
    addressHtml,
    bannerHtml
  );
  if (bodyRows.length === 0) return "";

  const accentHtml = renderDivider(state.accentColor);

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;">
${accentHtml}
<tr><td style="padding:16px 0 0 0;">
<table cellpadding="0" cellspacing="0" border="0" width="100%">${bodyRows.join("")}</table>
</td></tr>
</table>
</body></html>`;
}

function escapeAttribute(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizeUrl(str) {
  if (!str) return "#";
  const s = str.trim();
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.includes("@") && !s.startsWith("mailto:")) return "mailto:" + s;
  return "https://" + s;
}

export const toolConfig = {
  id: "email-signature-generator",
  name: "Email Signature Generator",
  category: "productivity",
  description:
    "Create professional email signatures with photo, social links, and custom styling. Preview live and copy HTML for Gmail, Outlook, and more.",
  icon: "✉️",
  accept: ".jpg,.jpeg,.png,.gif,.webp",
  maxSizeMB: 2,
  keywords: [
    "email",
    "signature",
    "professional",
    "html",
    "gmail",
    "outlook",
    "template",
    "business"
  ],
  steps: [
    "Fill in your personal and company details",
    "Upload photo, logo, or banner image (optional)",
    "Customize colors to match your brand",
    "Preview the live signature on the right",
    "Copy HTML or download to use in your email client"
  ],
  faqs: [
    {
      question: "How do I add this to Gmail?",
      answer:
        'Copy the HTML, then go to Gmail Settings > See all settings > Signature. Paste the HTML using the "Insert signature" option in rich text mode.'
    },
    {
      question: "How do I add this to Outlook?",
      answer:
        "Copy the HTML, then go to Outlook > Settings > Compose and reply > Email signature. Create a new signature and paste the HTML."
    },
    {
      question: "Are my images embedded in the signature?",
      answer:
        "Yes! Images are converted to data URLs and embedded directly in the HTML, so you don't need external hosting."
    },
    {
      question: "Will it work on mobile?",
      answer:
        "Yes. The signature uses responsive inline styles that render well on all devices and dark mode."
    }
  ]
};

export function render(container) {
  const state = loadState();

  container.innerHTML = `
    <div class="tool-layout" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6);align-items:start;">
      <div style="display:flex;flex-direction:column;gap:var(--space-4);">
        <div class="card" style="padding:var(--space-4);">
          <h3 style="font-size:var(--text-sm);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--color-text-secondary);margin:0 0 var(--space-3);">Personal Info</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);">
            ${inputField("sig-name", "Name", state.name, "text")}
            ${inputField("sig-title", "Job Title", state.title, "text")}
            ${inputField("sig-company", "Company", state.company, "text")}
            ${inputField("sig-email", "Email", state.email, "email")}
            ${inputField("sig-phone", "Phone", state.phone, "tel")}
            ${inputField("sig-website", "Website", state.website, "url")}
          </div>
          <div style="margin-top:var(--space-2);">
            <label class="checkbox-label" style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);cursor:pointer;">
              <input type="checkbox" id="sig-show-address" ${state.showAddress ? "checked" : ""}> Show address
            </label>
          </div>
          <div id="sig-address-wrap" style="margin-top:var(--space-2);${state.showAddress ? "" : "display:none;"}">
            <textarea id="sig-address" class="input" rows="2" placeholder="Address">${escapeHtml(state.address)}</textarea>
          </div>
        </div>

        <div class="card" style="padding:var(--space-4);">
          <h3 style="font-size:var(--text-sm);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--color-text-secondary);margin:0 0 var(--space-3);">Social Links</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);">
            ${inputField("sig-linkedin", "LinkedIn URL", state.linkedin, "url")}
            ${inputField("sig-twitter", "Twitter / X URL", state.twitter, "url")}
            ${inputField("sig-github", "GitHub URL", state.github, "url")}
            ${inputField("sig-instagram", "Instagram URL", state.instagram, "url")}
          </div>
        </div>

        <div class="card" style="padding:var(--space-4);">
          <h3 style="font-size:var(--text-sm);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--color-text-secondary);margin:0 0 var(--space-3);">Media</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);">
            <div>
              <label style="font-size:var(--text-xs);color:var(--color-text-secondary);display:block;margin-bottom:var(--space-1);">Photo (avatar)</label>
              <label id="sig-photo-btn" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:var(--space-1);cursor:pointer;position:relative;">
                ${state.photoDataUrl ? "Change Photo" : "Upload Photo"}
                <input type="file" id="sig-photo-input" accept="image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer;">
              </label>
              ${state.photoDataUrl ? `<button class="btn btn-ghost btn-sm" id="sig-photo-remove" style="margin-left:var(--space-1);">✕</button>` : ""}
            </div>
            <div>
              <label style="font-size:var(--text-xs);color:var(--color-text-secondary);display:block;margin-bottom:var(--space-1);">Company Logo</label>
              <label class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:var(--space-1);cursor:pointer;position:relative;">
                ${state.logoDataUrl ? "Change Logo" : "Upload Logo"}
                <input type="file" id="sig-logo-input" accept="image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer;">
              </label>
              ${state.logoDataUrl ? `<button class="btn btn-ghost btn-sm" id="sig-logo-remove">✕</button>` : ""}
            </div>
          </div>
          <div style="margin-top:var(--space-3);">
            <label style="font-size:var(--text-xs);color:var(--color-text-secondary);display:block;margin-bottom:var(--space-1);">Banner Image (CTA)</label>
            <label class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:var(--space-1);cursor:pointer;position:relative;">
              ${state.bannerDataUrl ? "Change Banner" : "Upload Banner"}
              <input type="file" id="sig-banner-input" accept="image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer;">
            </label>
            ${state.bannerDataUrl ? `<button class="btn btn-ghost btn-sm" id="sig-banner-remove">✕</button>` : ""}
          </div>
        </div>

        <div class="card" style="padding:var(--space-4);">
          <h3 style="font-size:var(--text-sm);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--color-text-secondary);margin:0 0 var(--space-3);">Styling</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);">
            ${colorInput("sig-text-color", "Text Color", state.textColor)}
            ${colorInput("sig-accent-color", "Accent Color", state.accentColor)}
            ${colorInput("sig-link-color", "Link Color", state.linkColor)}
            <label style="font-size:var(--text-xs);color:var(--color-text-secondary);display:flex;flex-direction:column;gap:var(--space-1);">
              Font Size
              <select id="sig-font-size" class="input">
                ${[12, 13, 14, 15, 16, 18].map(v => `<option value="${v}" ${state.fontSize == v ? "selected" : ""}>${v}px</option>`).join("")}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:var(--space-3);position:sticky;top:var(--space-4);">
        <div class="card" style="padding:var(--space-3);background:var(--color-surface-secondary);border:1px solid var(--color-border);border-radius:var(--radius-lg);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3);">
            <h3 style="font-size:var(--text-sm);font-weight:600;margin:0;">Preview</h3>
            <div style="display:flex;gap:var(--space-1);">
              <button class="btn btn-primary btn-sm" id="sig-copy">📋 Copy HTML</button>
              <button class="btn btn-secondary btn-sm" id="sig-download">⬇ Download</button>
              <button class="btn btn-ghost btn-sm" id="sig-reset" style="color:var(--color-error);">Reset</button>
            </div>
          </div>
          <div id="sig-preview" style="background:#fff;border-radius:var(--radius-md);overflow:hidden;min-height:200px;max-height:600px;overflow-y:auto;box-shadow:0 1px 3px rgba(0,0,0,0.1);"></div>
        </div>
        <div id="sig-toast" style="display:none;padding:var(--space-2) var(--space-3);background:var(--color-success);color:#fff;border-radius:var(--radius-md);font-size:var(--text-sm);text-align:center;"></div>
      </div>
    </div>
  `;

  const previewEl = container.querySelector("#sig-preview");
  const toastEl = container.querySelector("#sig-toast");

  function updatePreview() {
    const html = buildSignatureHtml(state);
    previewEl.innerHTML =
      html ||
      '<div style="padding:40px;text-align:center;color:#999;font-size:13px;">Fill in your details to see the preview</div>';
    saveState(state);
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.style.display = "block";
    clearTimeout(window._sigToastTimer);
    window._sigToastTimer = setTimeout(() => {
      toastEl.style.display = "none";
    }, 2500);
  }

  function readFileAsDataUrl(file) {
    return new Promise(resolve => {
      if (!file) {
        resolve(null);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast("Image too large (max 2MB)");
        resolve(null);
        return;
      }
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => resolve(null);
      r.readAsDataURL(file);
    });
  }

  function bindInput(id, key) {
    const el = container.querySelector("#" + id);
    if (!el) return;
    el.addEventListener("input", () => {
      state[key] = el.value;
      updatePreview();
    });
  }

  function bindCheckbox(id, key) {
    const el = container.querySelector("#" + id);
    if (!el) return;
    el.addEventListener("change", () => {
      state[key] = el.checked;
      if (id === "sig-show-address") {
        const wrap = container.querySelector("#sig-address-wrap");
        wrap.style.display = el.checked ? "block" : "none";
      }
      updatePreview();
    });
  }

  bindInput("sig-name", "name");
  bindInput("sig-title", "title");
  bindInput("sig-company", "company");
  bindInput("sig-email", "email");
  bindInput("sig-phone", "phone");
  bindInput("sig-website", "website");
  bindInput("sig-linkedin", "linkedin");
  bindInput("sig-twitter", "twitter");
  bindInput("sig-github", "github");
  bindInput("sig-instagram", "instagram");
  bindInput("sig-address", "address");
  bindCheckbox("sig-show-address", "showAddress");

  const fontSizeEl = container.querySelector("#sig-font-size");
  fontSizeEl.addEventListener("change", () => {
    state.fontSize = parseInt(fontSizeEl.value);
    updatePreview();
  });

  [
    ["sig-text-color", "textColor"],
    ["sig-accent-color", "accentColor"],
    ["sig-link-color", "linkColor"]
  ].forEach(([id, key]) => {
    const el = container.querySelector("#" + id);
    el.addEventListener("input", () => {
      state[key] = el.value;
      updatePreview();
    });
  });

  const photoInput = container.querySelector("#sig-photo-input");
  photoInput.addEventListener("change", async () => {
    const url = await readFileAsDataUrl(photoInput.files[0]);
    if (url) {
      state.photoDataUrl = url;
      state.showPhoto = true;
      saveState(state);
      render(container);
      return;
    }
    photoInput.value = "";
  });

  const logoInput = container.querySelector("#sig-logo-input");
  logoInput.addEventListener("change", async () => {
    const url = await readFileAsDataUrl(logoInput.files[0]);
    if (url) {
      state.logoDataUrl = url;
      state.showLogo = true;
      saveState(state);
      render(container);
      return;
    }
    logoInput.value = "";
  });

  const bannerInput = container.querySelector("#sig-banner-input");
  bannerInput.addEventListener("change", async () => {
    const url = await readFileAsDataUrl(bannerInput.files[0]);
    if (url) {
      state.bannerDataUrl = url;
      state.showBanner = true;
      saveState(state);
      render(container);
      return;
    }
    bannerInput.value = "";
  });

  const photoRemove = container.querySelector("#sig-photo-remove");
  if (photoRemove)
    photoRemove.addEventListener("click", () => {
      state.photoDataUrl = null;
      state.showPhoto = false;
      saveState(state);
      render(container);
    });

  const logoRemove = container.querySelector("#sig-logo-remove");
  if (logoRemove)
    logoRemove.addEventListener("click", () => {
      state.logoDataUrl = null;
      state.showLogo = false;
      saveState(state);
      render(container);
    });

  const bannerRemove = container.querySelector("#sig-banner-remove");
  if (bannerRemove)
    bannerRemove.addEventListener("click", () => {
      state.bannerDataUrl = null;
      state.showBanner = false;
      saveState(state);
      render(container);
    });

  container.querySelector("#sig-copy").addEventListener("click", async () => {
    const html = buildSignatureHtml(state);
    if (!html) {
      showToast("Fill in some details first");
      return;
    }
    try {
      await navigator.clipboard.writeText(html);
      showToast("✅ Signature HTML copied to clipboard!");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = html;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("✅ Signature HTML copied to clipboard!");
    }
  });

  container.querySelector("#sig-download").addEventListener("click", () => {
    const html = buildSignatureHtml(state);
    if (!html) {
      showToast("Fill in some details first");
      return;
    }
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email-signature.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("✅ File downloaded");
  });

  container.querySelector("#sig-reset").addEventListener("click", () => {
    if (!confirm("Reset all fields?")) return;
    Object.assign(state, getDefaults());
    localStorage.removeItem(STORAGE_KEY);
    container.querySelectorAll("input, textarea, select").forEach(el => {
      el.value = "";
    });
    container.querySelector("#sig-text-color").value = "#333333";
    container.querySelector("#sig-accent-color").value = "#0056b3";
    container.querySelector("#sig-link-color").value = "#0056b3";
    container.querySelector("#sig-font-size").value = "14";
    container.querySelector("#sig-show-address").checked = false;
    container.querySelector("#sig-address-wrap").style.display = "none";
    updatePreview();
    showToast("Reset complete");
  });

  updatePreview();
}

function inputField(id, label, value, type) {
  return `<label style="font-size:var(--text-xs);color:var(--color-text-secondary);display:flex;flex-direction:column;gap:var(--space-1);">
    ${escapeHtml(label)}
    <input id="${escapeAttribute(id)}" type="${escapeAttribute(type)}" class="input" value="${escapeAttribute(value || "")}" placeholder="${escapeAttribute(label)}">
  </label>`;
}

function colorInput(id, label, value) {
  return `<label style="font-size:var(--text-xs);color:var(--color-text-secondary);display:flex;flex-direction:column;gap:var(--space-1);">
    ${escapeHtml(label)}
    <div style="display:flex;align-items:center;gap:var(--space-1);">
      <input id="${escapeAttribute(id)}" type="color" value="${escapeAttribute(value)}" style="width:36px;height:32px;padding:2px;border:1px solid var(--color-border);border-radius:var(--radius-sm);cursor:pointer;background:none;">
      <span id="${escapeAttribute(id)}-val" style="font-size:11px;font-family:monospace;color:var(--color-text-secondary);">${escapeHtml(value)}</span>
    </div>
  </label>`;
}
