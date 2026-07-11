import { describe, it, expect } from "vitest";
import {
  toolConfig,
  formatXml,
  validateXml,
  highlightXml,
  render,
  destroy
} from "../tools/text/xml-formatter.js";
import { testToolConfig, testRenderAndDestroy } from "./tool-config-test.js";

describe("xml-formatter", () => {
  testToolConfig(toolConfig, {
    id: "xml-formatter",
    name: "XML Formatter & Validator",
    category: "text"
  });

  it("has icon", () => {
    expect(toolConfig.icon).toBe("📝");
  });

  describe("formatXml", () => {
    it("formats simple XML", () => {
      const xml = "<root><name>John</name><age>30</age></root>";
      const formatted = formatXml(xml);
      expect(formatted).toContain("<root>");
      expect(formatted).toContain("  <name>");
      expect(formatted).toContain("  <age>");
    });

    it("handles self-closing tags", () => {
      const xml = "<root><br/></root>";
      const formatted = formatXml(xml);
      expect(formatted).toContain("<br/>");
    });

    it("handles XML declaration", () => {
      const xml = '<?xml version="1.0"?><root/>';
      const formatted = formatXml(xml);
      // XML declaration may be removed by serializer, but should not throw
      expect(formatted).toContain("<root/>");
    });
  });

  describe("validateXml", () => {
    it("validates correct XML", () => {
      const xml = "<root><name>John</name></root>";
      const result = validateXml(xml);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it("detects invalid XML", () => {
      const xml = "<root><name>John</root>";
      const result = validateXml(xml);
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it("detects mismatched tags", () => {
      const xml = "<root><name>John</age></root>";
      const result = validateXml(xml);
      expect(result.valid).toBe(false);
    });
  });

  describe("highlightXml", () => {
    it("produces well-formed DOM that parses without error", () => {
      const xml = '<root attr="value">text</root>';
      const fragment = highlightXml(xml);
      const container = document.createElement("div");
      container.appendChild(fragment);
      expect(container.textContent).toContain("root");
      expect(container.textContent).toContain("attr");
      expect(container.textContent).toContain("value");
      expect(container.textContent).toContain("text");
    });

    it("does not produce broken or nested span tags", () => {
      const xml = '<root attr="value">text &amp; more</root>';
      const fragment = highlightXml(xml);
      const container = document.createElement("div");
      container.appendChild(fragment);
      const spans = container.querySelectorAll("span");
      expect(spans.length).toBeGreaterThan(0);
      spans.forEach(span => {
        expect(span.querySelectorAll("span").length).toBe(0);
      });
    });

    it("highlights tag names", () => {
      const xml = "<root>text</root>";
      const fragment = highlightXml(xml);
      const container = document.createElement("div");
      container.appendChild(fragment);
      const spans = Array.from(container.querySelectorAll("span"));
      const tagSpan = spans.find(s => s.textContent.includes("root"));
      expect(tagSpan).toBeTruthy();
      expect(tagSpan.style.color).toBeTruthy();
    });

    it("highlights attribute names", () => {
      const xml = '<root attr="value">';
      const fragment = highlightXml(xml);
      const container = document.createElement("div");
      container.appendChild(fragment);
      const spans = Array.from(container.querySelectorAll("span"));
      const attrSpan = spans.find(s => s.textContent.includes("attr"));
      expect(attrSpan).toBeTruthy();
      expect(attrSpan.style.color).toBeTruthy();
    });

    it("highlights attribute values", () => {
      const xml = '<root attr="value">';
      const fragment = highlightXml(xml);
      const container = document.createElement("div");
      container.appendChild(fragment);
      const spans = Array.from(container.querySelectorAll("span"));
      const valSpan = spans.find(s => s.textContent.includes('"value"'));
      expect(valSpan).toBeTruthy();
      expect(valSpan.style.color).toBeTruthy();
    });

    it("preserves text content with special characters", () => {
      const xml = "<root>a &amp; b</root>";
      const fragment = highlightXml(xml);
      const container = document.createElement("div");
      container.appendChild(fragment);
      expect(container.textContent).toContain("a &amp; b");
    });
  });

  testRenderAndDestroy(render, destroy, [
    ".tool-layout",
    "#xf-input",
    "#xf-output",
    "#xf-format",
    "#xf-validate",
    "#xf-minify",
    "#xf-clear",
    "#xf-copy",
    "#xf-download",
    "#xf-status"
  ]);

  it("minify preserves whitespace inside text content and CDATA", () => {
    const container = document.createElement("div");
    render(container);
    const input = container.querySelector("#xf-input");
    const output = container.querySelector("#xf-output");
    const minifyBtn = container.querySelector("#xf-minify");

    const xml = "<root><msg>hello   world</msg><data><![CDATA[x   y   z]]></data></root>";
    input.value = xml;
    minifyBtn.click();

    expect(output.textContent).toBe(
      "<root><msg>hello   world</msg><data><![CDATA[x   y   z]]></data></root>"
    );
  });
});
