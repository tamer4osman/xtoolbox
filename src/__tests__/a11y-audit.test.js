import { describe, it, expect } from "vitest";

function runAuditSimple(html) {
  const results = { passed: [], failed: [], warnings: [], url: "" };
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
    results.failed.push({ check: "lang-attr", msg: "Missing lang attribute" });
  }

  const images = body.querySelectorAll("img");
  images.forEach(img => {
    const alt = img.getAttribute("alt");
    const role = img.getAttribute("role");
    if (!alt && role !== "presentation") {
      results.failed.push({ check: "alt-text", msg: "Image missing alt text" });
    }
  });

  return results;
}

describe("a11y-audit", () => {
  it("detects missing lang attribute", () => {
    const html = "<html><body></body></html>";
    const results = runAuditSimple(html);
    const hasLangFailure = results.failed.some(f => f.check === "lang-attr");
    expect(hasLangFailure).toBe(true);
  });

  it("detects images without alt text", () => {
    const html = '<html lang="en"><body><img src="test.jpg"></body></html>';
    const results = runAuditSimple(html);
    const hasAltFailure = results.failed.some(f => f.check === "alt-text");
    expect(hasAltFailure).toBe(true);
  });

  it("passes valid html structure", () => {
    const html = '<html lang="en"><body><h1>Title</h1></body></html>';
    const results = runAuditSimple(html);
    expect(results.failed.length).toBe(0);
  });
});
