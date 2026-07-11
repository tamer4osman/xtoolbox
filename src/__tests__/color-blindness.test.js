import { describe, it, expect } from "vitest";
import { toolConfig } from "../tools/image/color-blindness.js";
import { testToolConfig } from "./tool-config-test.js";

describe("color-blindness", () => {
  testToolConfig(toolConfig, {
    id: "color-blindness",
    name: "Color Blindness Simulator",
    category: "image"
  });

  it("has accept property", () => {
    expect(toolConfig.accept).toBe("image/*");
  });
});
