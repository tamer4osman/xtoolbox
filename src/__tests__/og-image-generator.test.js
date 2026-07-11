import { describe, it, expect } from "vitest";
import { toolConfig } from "../tools/image/og-image-generator.js";

describe("og-image-generator", () => {
  it("has correct tool config", () => {
    expect(toolConfig.id).toBe("og-image-generator");
    expect(toolConfig.category).toBe("image");
    expect(toolConfig.keywords).toContain("og");
    expect(toolConfig.keywords).toContain("open-graph");
  });

  it("has a render function", () => {
    expect(typeof toolConfig).toBe("object");
  });
});
