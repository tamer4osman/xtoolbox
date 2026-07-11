import { describe, it, expect } from "vitest";
import { toolConfig } from "../tools/business/resume-builder.js";

describe("resume-builder", () => {
  it("has correct toolConfig", () => {
    expect(toolConfig.id).toBe("resume-builder");
    expect(toolConfig.name).toBe("Resume Builder");
    expect(toolConfig.category).toBe("business");
    expect(toolConfig.icon).toBe("📋");
  });

  it("has resume-related keywords", () => {
    expect(toolConfig.keywords).toContain("resume");
    expect(toolConfig.keywords).toContain("cv");
    expect(toolConfig.keywords).toContain("pdf");
  });

  it("exports render function", async () => {
    const mod = await import("../tools/business/resume-builder.js");
    expect(typeof mod.render).toBe("function");
  });
});
