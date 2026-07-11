import { describe, it, expect } from "vitest";
import { toolConfig } from "../tools/dev/sql-playground.js";

describe("sql-playground", () => {
  it("exports toolConfig with correct properties", () => {
    expect(toolConfig.id).toBe("sql-playground");
    expect(toolConfig.name).toBe("SQL Playground");
    expect(toolConfig.category).toBe("dev");
  });
});
