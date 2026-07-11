import { describe, it, expect } from "vitest";
import { toolConfig } from "../tools/dev/database-schema-designer.js";

describe("database-schema-designer", () => {
  it("exports toolConfig with correct properties", () => {
    expect(toolConfig.id).toBe("database-schema-designer");
    expect(toolConfig.name).toBe("Database Schema Designer");
    expect(toolConfig.category).toBe("dev");
  });
});
