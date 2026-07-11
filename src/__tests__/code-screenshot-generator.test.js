import { describe, it, expect } from "vitest";
import { toolConfig } from "../tools/dev/code-screenshot-generator.js";

describe("code-screenshot-generator", () => {
  it("exports toolConfig with correct properties", () => {
    expect(toolConfig.id).toBe("code-screenshot-generator");
    expect(toolConfig.name).toBe("Code Screenshot Generator");
    expect(toolConfig.category).toBe("dev");
  });
});
