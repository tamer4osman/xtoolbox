import { describe, it, expect } from "vitest";
import { toolConfig } from "../tools/css/css-triangle-generator.js";
import { testSimpleToolConfig } from "./tool-config-test.js";

describe("css-triangle-generator", () => {
  testSimpleToolConfig(toolConfig, "css-triangle-generator", toolConfig.name, "css");

  it("has icon and status", () => {
    expect(toolConfig.icon).toBe("🔺");
    expect(toolConfig.status).toBe("done");
  });

  it("exports render function", async () => {
    const mod = await import("../tools/css/css-triangle-generator.js");
    expect(typeof mod.render).toBe("function");
  });
});
