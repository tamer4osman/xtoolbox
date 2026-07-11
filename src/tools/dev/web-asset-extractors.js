function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function extractSvgs(doc) {
  const svgs = [];
  doc.querySelectorAll("svg").forEach((svg, i) => {
    const labels = [];
    if (svg.querySelector("circle")) labels.push("circle");
    if (svg.querySelector("rect")) labels.push("rect");
    if (svg.querySelector("path")) labels.push("path");
    if (svg.querySelector("polygon")) labels.push("polygon");
    const viewBox = svg.getAttribute("viewBox");
    const w = svg.getAttribute("width");
    const h = svg.getAttribute("height");
    const size = w && h ? w + "x" + h : viewBox || "unknown";
    svgs.push({
      label: `SVG #${i + 1} (${size})` + (labels.length ? ` \u2014 ${labels.join(", ")}` : ""),
      content: svg.outerHTML,
      download: true,
      filename: `svg-${i + 1}.svg`,
      type: "image/svg+xml"
    });
  });
  return svgs;
}

function extractImages(doc) {
  const images = [];
  doc.querySelectorAll("img").forEach((img, i) => {
    const src = img.getAttribute("src") || "";
    const alt = img.getAttribute("alt") || "";
    images.push({
      label: `Image #${i + 1}: ${alt || src.slice(0, 50)}`,
      content: src,
      url: src,
      download: false
    });
  });
  return images;
}

function extractStyles(doc) {
  const styles = [];
  doc.querySelectorAll('link[rel="stylesheet"]').forEach((link, i) => {
    const href = link.getAttribute("href") || "unknown";
    styles.push({
      label: `External CSS #${i + 1}: ${href}`,
      content: `<link rel="stylesheet" href="${escHtml(href)}">`,
      download: true,
      filename: `style-${i + 1}.html`,
      type: "text/html"
    });
  });
  doc.querySelectorAll("style").forEach((s, i) => {
    styles.push({
      label: `Inline Style #${i + 1}`,
      content: s.textContent,
      download: true,
      filename: `inline-style-${i + 1}.css`,
      type: "text/css"
    });
  });
  return styles;
}

function extractFonts(doc, html) {
  const fonts = [];
  const fontUrls = new Set();
  doc
    .querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]')
    .forEach(link => {
      const href = link.getAttribute("href");
      if (!fontUrls.has(href)) {
        fontUrls.add(href);
        fonts.push({
          label: `Google Font #${fonts.length + 1}`,
          content: `<link href="${escHtml(href)}" rel="stylesheet">`,
          download: true,
          filename: `font-${fonts.length + 1}.html`,
          type: "text/html"
        });
      }
    });
  const inlineFontMatches = html.match(/font-family\s*:\s*['"]?([^;'"}\s]+)['"]?/gi);
  if (inlineFontMatches) {
    const seen = new Set();
    const skip = [
      "sans-serif",
      "serif",
      "monospace",
      "cursive",
      "fantasy",
      "system-ui",
      "inherit",
      "initial"
    ];
    inlineFontMatches.forEach(m => {
      const name = m
        .replace(/font-family\s*:\s*['"]?/i, "")
        .replace(/['"]?\s*$/, "")
        .trim();
      if (name && !seen.has(name.toLowerCase()) && !skip.includes(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        fonts.push({
          label: `Font Family: ${name}`,
          content: `font-family: '${name.replace(/\\/g, "\\\\").replace(/'/g, "\\'}")}', sans-serif;`,
          download: false
        });
      }
    });
  }
  return fonts;
}

function extractScripts(doc) {
  const scripts = [];
  doc.querySelectorAll("script[src]").forEach((script, i) => {
    const src = script.getAttribute("src") || "unknown";
    scripts.push({
      label: `External Script #${i + 1}: ${src.slice(0, 60)}`,
      content: `<script src="${escHtml(src)}"><\/script>`,
      download: true,
      filename: `script-${i + 1}.html`,
      type: "text/html"
    });
  });
  doc.querySelectorAll("script:not([src])").forEach((script, i) => {
    if (script.textContent.trim()) {
      scripts.push({
        label: `Inline Script #${i + 1}`,
        content: script.textContent,
        download: true,
        filename: `inline-script-${i + 1}.js`,
        type: "application/javascript"
      });
    }
  });
  return scripts;
}

export function extractAssets(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return {
    svg: extractSvgs(doc),
    images: extractImages(doc),
    styles: extractStyles(doc),
    fonts: extractFonts(doc, html),
    scripts: extractScripts(doc)
  };
}
