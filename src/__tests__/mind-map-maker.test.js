import { describe, it, expect } from "vitest";
import { findNodeById } from "../tools/productivity/mind-map-maker.js";

const sampleNodes = [
  { id: "root", x: 400, y: 300, text: "Central Idea", color: "#3B82F6", parentId: null },
  { id: "child1", x: 550, y: 300, text: "Child 1", color: "#10B981", parentId: "root" },
  { id: "child2", x: 250, y: 300, text: "Child 2", color: "#F59E0B", parentId: "root" },
  { id: "grandchild", x: 700, y: 300, text: "Grandchild", color: "#EF4444", parentId: "child1" }
];

describe("mind-map-maker", () => {
  it("exports toolConfig and render", async () => {
    const mod = await import("../tools/productivity/mind-map-maker.js");
    expect(mod.toolConfig).toBeDefined();
    expect(mod.toolConfig.id).toBe("mind-map-maker");
    expect(mod.toolConfig.category).toBe("productivity");
    expect(typeof mod.render).toBe("function");
  });

  it("toolConfig has required fields", async () => {
    const mod = await import("../tools/productivity/mind-map-maker.js");
    expect(mod.toolConfig.name).toBeTruthy();
    expect(mod.toolConfig.description).toBeTruthy();
    expect(mod.toolConfig.icon).toBeTruthy();
    expect(Array.isArray(mod.toolConfig.keywords)).toBe(true);
    expect(Array.isArray(mod.toolConfig.steps)).toBe(true);
    expect(Array.isArray(mod.toolConfig.faqs)).toBe(true);
  });

  it("render creates DOM with toolbar and SVG", async () => {
    const mod = await import("../tools/productivity/mind-map-maker.js");
    const container = document.createElement("div");
    mod.render(container);

    expect(container.querySelector("#mmm-svg")).not.toBeNull();
    expect(container.querySelector("#mmm-add-child")).not.toBeNull();
    expect(container.querySelector("#mmm-delete")).not.toBeNull();
    expect(container.querySelector("#mmm-export-png")).not.toBeNull();
    expect(container.querySelector("#mmm-export-svg")).not.toBeNull();
    expect(container.querySelector("#mmm-clear")).not.toBeNull();
    expect(container.querySelector("#mmm-colors")).not.toBeNull();
    expect(container.querySelector("h1").textContent).toBe("Mind Map Maker");
  });

  it("renders default root node in SVG", async () => {
    localStorage.removeItem("mmm_v1");
    const mod = await import("../tools/productivity/mind-map-maker.js");
    const container = document.createElement("div");
    mod.render(container);

    const svg = container.querySelector("#mmm-svg");
    const nodes = svg.querySelectorAll("[data-node-id]");
    expect(nodes.length).toBe(1);
    expect(nodes[0].getAttribute("data-node-id")).toBe("root");
  });

  it("has 8 color swatches", async () => {
    const mod = await import("../tools/productivity/mind-map-maker.js");
    const container = document.createElement("div");
    mod.render(container);

    const swatches = container.querySelectorAll(".mmm-color-swatch");
    expect(swatches.length).toBe(8);
  });
});

describe("findNodeById", () => {
  it("finds root node", () => {
    const result = findNodeById(sampleNodes, "root");
    expect(result).toBeDefined();
    expect(result.text).toBe("Central Idea");
  });

  it("finds child node", () => {
    const result = findNodeById(sampleNodes, "child1");
    expect(result).toBeDefined();
    expect(result.text).toBe("Child 1");
    expect(result.parentId).toBe("root");
  });

  it("finds grandchild node", () => {
    const result = findNodeById(sampleNodes, "grandchild");
    expect(result).toBeDefined();
    expect(result.text).toBe("Grandchild");
    expect(result.parentId).toBe("child1");
  });

  it("returns undefined for nonexistent id", () => {
    const result = findNodeById(sampleNodes, "nonexistent");
    expect(result).toBeUndefined();
  });

  it("returns undefined for empty array", () => {
    const result = findNodeById([], "root");
    expect(result).toBeUndefined();
  });
});
