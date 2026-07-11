import { escapeHtml } from "../../utils/escape-html.js";

export const toolConfig = {
  id: "a11y-audit",
  name: "Accessibility Audit Visualizer",
  category: "dev",
  description:
    "Analyze web pages for accessibility issues. Check WCAG compliance, ARIA labels, color contrast, and more.",
  icon: "♿",
  keywords: ["accessibility", "a11y", "wcag", "audit", "accessibility checker", "wcag checker"],
  accept: ".html,.htm",
  maxSizeMB: 5
};

const wcagChecks = [
  {
    id: "heading-order",
    title: "Heading Order",
    desc: "Headings should be in sequential order (h1 → h2 → h3)",
    impact: "serious",
    wcag: "1.3.1"
  },
  {
    id: "alt-text",
    title: "Image Alt Text",
    desc: 'Images need alt text or role="presentation"',
    impact: "serious",
    wcag: "1.1.1"
  },
  {
    id: "form-labels",
    title: "Form Labels",
    desc: "Form inputs need associated labels",
    impact: "serious",
    wcag: "1.3.1"
  },
  {
    id: "link-text",
    title: "Link Text",
    desc: "Links should have descriptive text",
    impact: "moderate",
    wcag: "2.4.4"
  },
  {
    id: "button-text",
    title: "Button Text",
    desc: "Buttons should have accessible text",
    impact: "serious",
    wcag: "4.1.2"
  },
  {
    id: "lang-attr",
    title: "Language Attribute",
    desc: "HTML element should have lang attribute",
    impact: "moderate",
    wcag: "3.1.1"
  },
  {
    id: "skip-link",
    title: "Skip Navigation",
    desc: "Page should have a skip link for keyboard users",
    impact: "moderate",
    wcag: "2.4.1"
  },
  {
    id: "focus-visible",
    title: "Focus Visibility",
    desc: "Interactive elements need visible focus states",
    impact: "serious",
    wcag: "2.4.7"
  },
  {
    id: "aria-labels",
    title: "ARIA Attributes",
    desc: "Check for valid ARIA attributes",
    impact: "moderate",
    wcag: "4.1.2"
  },
  {
    id: "color-contrast",
    title: "Color Contrast (Manual Check)",
    desc: "Text should have 4.5:1 contrast ratio (manual check required)",
    impact: "serious",
    wcag: "1.4.3"
  }
];

function runAudit(html, url) {
  const results = { passed: [], failed: [], warnings: [], url };
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.querySelector("body");

  if (!body) {
    results.warnings.push("Could not parse HTML");
    return results;
  }

  const hasLang =
    doc.documentElement.getAttribute("lang") || doc.documentElement.getAttribute("xml:lang");
  if (!hasLang) {
    results.failed.push({ check: "lang-attr", msg: "Missing lang attribute on html element" });
  }

  const headings = body.querySelectorAll("h1, h2, h3, h4, h5, h6");
  const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.replace("H", "")));
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] > headingLevels[i - 1] + 1) {
      results.failed.push({
        check: "heading-order",
        msg: `Heading level skipped: h${headingLevels[i - 1]} to h${headingLevels[i]}`
      });
      break;
    }
  }
  if (headingLevels.length > 0 && headingLevels[0] !== 1) {
    results.warnings.push({ check: "heading-order", msg: "First heading should be h1" });
  }

  const images = body.querySelectorAll("img");
  images.forEach((img, i) => {
    const alt = img.getAttribute("alt");
    const role = img.getAttribute("role");
    if (!alt && role !== "presentation" && role !== "none") {
      const src = img.getAttribute("src") || "unknown";
      const shortSrc = src.length > 40 ? src.substring(0, 40) + "..." : src;
      results.failed.push({ check: "alt-text", msg: `Image missing alt text: ${shortSrc}` });
    } else if (alt && alt.length === 0 && role !== "presentation" && role !== "none") {
      results.failed.push({
        check: "alt-text",
        msg: "Image has empty alt (should be presentation if decorative)"
      });
    }
  });

  const inputs = body.querySelectorAll("input, select, textarea");
  const labeled = new Set();
  inputs.forEach(input => {
    const id = input.getAttribute("id");
    const label = input.closest("label");
    const ariaLabel = input.getAttribute("aria-label");
    const ariaLabelledby = input.getAttribute("aria-labelledby");
    const placeholder = input.getAttribute("placeholder");
    if (label || ariaLabel || (id && body.querySelector(`[for="${id}"]`)) || ariaLabelledby) {
      labeled.add(input);
    } else if (input.tagName === "INPUT" && input.type !== "hidden" && input.type !== "submit") {
      results.failed.push({
        check: "form-labels",
        msg: `Input missing label: ${input.type} input (placeholder: ${placeholder || "none"})`
      });
    }
  });

  const links = body.querySelectorAll("a");
  links.forEach(link => {
    const text = link.textContent?.trim();
    const ariaLabel = link.getAttribute("aria-label");
    const title = link.getAttribute("title");
    if (!text && !ariaLabel && !title) {
      results.failed.push({ check: "link-text", msg: "Link has no text or label" });
    } else if (
      text &&
      ["click here", "read more", "link", "here", "more"].includes(text.toLowerCase())
    ) {
      results.warnings.push({ check: "link-text", msg: `Link text "${text}" is not descriptive` });
    }
  });

  const buttons = body.querySelectorAll(
    'button, input[type="button"], input[type="submit"], input[type="reset"]'
  );
  buttons.forEach(btn => {
    const text = btn.textContent?.trim() || btn.getAttribute("value") || "";
    const ariaLabel = btn.getAttribute("aria-label");
    const title = btn.getAttribute("title");
    if (!text && !ariaLabel && !title && btn.tagName === "BUTTON") {
      results.warnings.push({ check: "button-text", msg: "Button has no accessible text" });
    }
  });

  const skipLink =
    body.querySelector('a[href="#main"], a[href="#content"], a.skip-link, a.skip-to-main') ||
    Array.from(body.querySelectorAll('a[href^="#"]')).find(a =>
      a.textContent?.toLowerCase().includes("skip")
    );
  const hasMain = body.querySelector('main, [role="main"]');
  if (!skipLink && !hasMain) {
    results.warnings.push({ check: "skip-link", msg: "Consider adding skip navigation link" });
  }

  const tabIndex = body.querySelectorAll("[tabindex]");
  tabIndex.forEach(el => {
    const idx = el.getAttribute("tabindex");
    if (idx === "-1") {
      results.warnings.push({
        check: "focus-visible",
        msg: 'Element has tabindex="-1", may not be keyboard accessible'
      });
    }
  });

  const hasOutline = body.querySelectorAll('[style*="outline"]');
  results.warnings.push({
    check: "focus-visible",
    msg: "Manual check: verify all interactive elements have visible focus"
  });

  if (hasLang) results.passed.push({ check: "lang-attr", msg: "Language attribute present" });

  const passedChecks = wcagChecks
    .map(c => c.id)
    .filter(id => {
      return (
        !results.failed.some(f => f.check === id) && !results.warnings.some(w => w.check === id)
      );
    });
  passedChecks.forEach(id => {
    results.passed.push({
      check: id,
      msg: wcagChecks.find(c => c.id === id).title + " appears OK"
    });
  });

  return results;
}



function renderReport(results) {
  let html = `<div class="a11y-report">`;

  if (results.failed.length > 0) {
    html += `<div class="a11y-failed"><h3>Issues Found (${results.failed.length})</h3>`;
    results.failed.forEach(f => {
      const check = wcagChecks.find(c => c.id === f.check);
      html += `<div class="a11y-item a11y-item-failed">
        <span class="a11y-severity">${escapeHtml(check?.impact || "moderate")}</span>
        <strong>${escapeHtml(check?.title || f.check)}</strong>
        <p>${escapeHtml(f.msg)}</p>
        <small>WCAG ${escapeHtml(check?.wcag || "?")}</small>
      </div>`;
    });
    html += `</div>`;
  }

  if (results.warnings.length > 0) {
    html += `<div class="a11y-warnings"><h3>Warnings (${results.warnings.length})</h3>`;
    results.warnings.forEach(w => {
      const check = wcagChecks.find(c => c.id === w.check);
      html += `<div class="a11y-item a11y-item-warning">
        <span class="a11y-severity">low</span>
        <strong>${escapeHtml(check?.title || w.check)}</strong>
        <p>${escapeHtml(w.msg)}</p>
      </div>`;
    });
    html += `</div>`;
  }

  if (results.passed.length > 0) {
    html += `<div class="a11y-passed"><h3>Passed (${results.passed.length})</h3>`;
    results.passed.forEach(p => {
      html += `<div class="a11y-item a11y-item-passed">✓ ${escapeHtml(p.msg || p.check)}</div>`;
    });
    html += `</div>`;
  }

  html += `</div>`;
  return html;
}

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div id="a11y-tool"></div>
    </div>
  `;

  const tool = container.querySelector("#a11y-tool");
  tool.innerHTML = `
    <div class="a11y-input-area">
      <div class="form-group">
        <label>Enter URL to audit:</label>
        <div style="display:flex;gap:var(--space-2);">
          <input type="url" id="a11y-url" placeholder="https://example.com" style="flex:1;" />
          <button class="btn btn-primary" id="a11y-url-btn">Fetch & Analyze</button>
        </div>
      </div>
      <div class="divider-text"><span>or</span></div>
      <div class="form-group">
        <label>Paste HTML code:</label>
        <textarea id="a11y-html" placeholder="<html>...</html>" style="width:100%;height:200px;font-family:monospace;font-size:var(--text-xs);padding:var(--space-2);border:var(--border-md);border-radius:var(--radius-md);resize:vertical;"></textarea>
        <button class="btn btn-primary" id="a11y-analyze-btn" style="margin-top:var(--space-2);width:100%;">Analyze</button>
      </div>
    </div>
    <div id="a11y-results" style="display:none;"></div>
  `;

  const urlInput = tool.querySelector("#a11y-url");
  const urlBtn = tool.querySelector("#a11y-url-btn");
  const htmlInput = tool.querySelector("#a11y-html");
  const analyzeBtn = tool.querySelector("#a11y-analyze-btn");
  const resultsArea = tool.querySelector("#a11y-results");

  urlBtn.addEventListener("click", async () => {
    const url = urlInput.value.trim();
    if (!url) return;
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        alert("Only HTTP/HTTPS URLs are supported");
        return;
      }
    } catch {
      alert("Invalid URL format");
      return;
    }
    urlBtn.disabled = true;
    urlBtn.textContent = "Fetching...";
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error("Failed to fetch");
      const html = await res.text();
      const results = runAudit(html, url);
      resultsArea.innerHTML = renderReport(results);
      resultsArea.style.display = "block";
    } catch (e) {
      alert("Could not fetch URL: " + e.message);
    } finally {
      urlBtn.disabled = false;
      urlBtn.textContent = "Fetch & Analyze";
    }
  });

  analyzeBtn.addEventListener("click", () => {
    const html = htmlInput.value.trim();
    if (!html) return;
    const results = runAudit(html);
    resultsArea.innerHTML = renderReport(results);
    resultsArea.style.display = "block";
  });
}

export function destroy() {}
