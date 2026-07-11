import { describe, it, expect } from "vitest";
import { toolConfig } from "../tools/dev/mock-data-generator.js";

describe("mock-data-generator", () => {
  it("exports toolConfig with correct properties", () => {
    expect(toolConfig.id).toBe("mock-data-generator");
    expect(toolConfig.name).toBe("Mock Data Generator");
    expect(toolConfig.category).toBe("dev");
  });
});
