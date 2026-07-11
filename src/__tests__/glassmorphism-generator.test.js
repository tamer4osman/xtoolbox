import { describe, it, expect } from "vitest";
import { toolConfig, render, destroy } from "../tools/css/glassmorphism-generator.js";
import { testToolConfig, testRenderAndDestroy, testSliderInteraction } from "./tool-config-test.js";

describe("glassmorphism-generator", () => {
  testToolConfig(toolConfig, {
    id: "glassmorphism-generator",
    name: "CSS Glassmorphism Studio",
    category: "css"
  });

  it("has icon", () => {
    expect(toolConfig.icon).toBe("🔮");
  });

  testRenderAndDestroy(render, destroy, [
    ".tool-layout",
    ".gg-studio",
    ".gg-controls",
    ".gg-preview-area",
    ".gg-card",
    "#gg-css",
    "#gg-copy",
    "#gg-blur",
    "#gg-opacity",
    "#gg-radius",
    "#gg-hue",
    "#gg-safari"
  ]);

  it("renders all background options", () => {
    const container = document.createElement("div");
    render(container);
    const select = container.querySelector("#gg-bg");
    expect(select).toBeTruthy();
    expect(select.options.length).toBe(8);
  });

  testSliderInteraction(render, "gg-blur", "gg-css", "20", "blur(20px)");
});
