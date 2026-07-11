import { describe, it, expect } from "vitest";
import { toolConfig } from "../tools/productivity/3d-model-viewer.js";

describe("3d-model-viewer", () => {
  it("has correct tool config", () => {
    expect(toolConfig.id).toBe("3d-model-viewer");
    expect(toolConfig.name).toBe("3D Model Viewer");
    expect(toolConfig.category).toBe("productivity");
    expect(toolConfig.accept).toContain(".gltf");
    expect(toolConfig.accept).toContain(".glb");
    expect(toolConfig.accept).toContain(".obj");
    expect(toolConfig.accept).toContain(".stl");
  });

  it("has keywords", () => {
    expect(toolConfig.keywords).toContain("3d");
    expect(toolConfig.keywords).toContain("gltf");
    expect(toolConfig.keywords).toContain("stl");
  });

  it("has steps array", () => {
    expect(Array.isArray(toolConfig.steps)).toBe(true);
    expect(toolConfig.steps.length).toBeGreaterThan(0);
  });

  it("has faqs array", () => {
    expect(Array.isArray(toolConfig.faqs)).toBe(true);
    expect(toolConfig.faqs.length).toBeGreaterThan(0);
  });
});
