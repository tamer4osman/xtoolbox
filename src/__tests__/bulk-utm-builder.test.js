import { describe, it, expect } from "vitest";
import { toolConfig } from "../tools/seo/bulk-utm-builder.js";
import { testSimpleToolConfig } from "./tool-config-test.js";

describe("bulk-utm-builder", () => {
  testSimpleToolConfig(toolConfig, "bulk-utm-builder", toolConfig.name, "seo");

  it("has icon and status", () => {
    expect(toolConfig.icon).toBe("🔗");
    expect(toolConfig.status).toBe("done");
  });

  it("exports render function", async () => {
    const mod = await import("../tools/seo/bulk-utm-builder.js");
    expect(typeof mod.render).toBe("function");
  });
});
