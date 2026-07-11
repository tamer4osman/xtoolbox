/**
 * Update page title and meta tags
 */
export function updatePageMeta({ title, description, url }) {
  if (title) {
    document.title = `${title} - XToolBox`;
    setMeta("property", "og:title", title);
  }
  if (description) {
    setMeta("name", "description", description);
    setMeta("property", "og:description", description);
  }
  if (url) {
    setMeta("property", "og:url", url);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }
}

function setMeta(attr, key, value) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

/**
 * Add JSON-LD structured data
 */
export function addStructuredData(data) {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}
