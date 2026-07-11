import { describe, it, expect } from "vitest";
import { toolConfig, render, destroy } from "../tools/pdf/textbook-splitter.js";
import { testToolConfig, testRenderAndDestroy } from "./tool-config-test.js";

describe("textbook-splitter", () => {
  testToolConfig(toolConfig, {
    id: "textbook-splitter",
    name: "Page Textbook Splitter",
    category: "pdf"
  });

  it("has icon and config", () => {
    expect(toolConfig.icon).toBe("📖");
    expect(toolConfig.accept).toBe(".pdf");
    expect(toolConfig.maxSizeMB).toBe(100);
  });

  testRenderAndDestroy(render, destroy, [
    ".tool-layout",
    ".tool-upload-area",
    ".tool-options",
    ".tool-processing",
    "#split-btn"
  ]);

  it("render injects style element", () => {
    const container = document.createElement("div");
    render(container);
    const style = container.querySelector("style");
    expect(style).toBeTruthy();
    expect(style.textContent).toContain(".splitter-page-card");
  });
});
