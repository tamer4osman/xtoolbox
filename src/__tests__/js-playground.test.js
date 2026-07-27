import { describe, it, expect } from "vitest";
import { toolConfig, formatArg, formatDir, renderTable } from "../tools/dev/js-playground.js";

describe("js-playground", () => {
  it("exports toolConfig with correct properties", () => {
    expect(toolConfig.id).toBe("js-playground");
    expect(toolConfig.name).toBe("JavaScript Playground");
    expect(toolConfig.category).toBe("dev");
    expect(toolConfig.icon).toBe("⚡");
  });

  describe("formatArg", () => {
    it("formats null", () => {
      expect(formatArg(null)).toBe("null");
    });

    it("formats undefined", () => {
      expect(formatArg(undefined)).toBe("undefined");
    });

    it("formats strings", () => {
      expect(formatArg("hello")).toBe("hello");
    });

    it("formats numbers", () => {
      expect(formatArg(42)).toBe("42");
    });

    it("formats booleans", () => {
      expect(formatArg(true)).toBe("true");
    });

    it("formats objects as JSON", () => {
      expect(formatArg({ a: 1 })).toBe('{\n  "a": 1\n}');
    });

    it("formats arrays as JSON", () => {
      expect(formatArg([1, 2])).toBe("[\n  1,\n  2\n]");
    });
  });

  describe("formatDir", () => {
    it("formats objects as pretty JSON", () => {
      expect(formatDir({ key: "value" })).toBe('{\n  "key": "value"\n}');
    });

    it("formats primitives as strings", () => {
      expect(formatDir(42)).toBe("42");
    });
  });

  describe("renderTable", () => {
    it("renders array of objects as HTML table", () => {
      const data = [{ name: "Alice", age: 30 }];
      const html = renderTable(data);
      expect(html).toContain("<table");
      expect(html).toContain("name");
      expect(html).toContain("Alice");
      expect(html).toContain("30");
    });

    it("renders empty table message for empty array", () => {
      expect(renderTable([])).toContain("empty table");
    });

    it("renders raw for non-array data", () => {
      const html = renderTable("not an array");
      expect(html).toContain("jp-table-raw");
    });
  });
});
