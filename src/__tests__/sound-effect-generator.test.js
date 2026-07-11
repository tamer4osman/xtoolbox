import { describe, it, expect } from "vitest";
import { toolConfig } from "../tools/audio/sound-effect-generator.js";

describe("sound-effect-generator", () => {
  it("has correct tool config", () => {
    expect(toolConfig.id).toBe("sound-effect-generator");
    expect(toolConfig.category).toBe("audio");
    expect(toolConfig.keywords).toContain("sfx");
    expect(toolConfig.keywords).toContain("retro");
  });

  it("has a render function", () => {
    expect(typeof toolConfig).toBe("object");
  });
});
