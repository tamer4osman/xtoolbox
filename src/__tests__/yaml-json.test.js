import { describe, it, expect } from "vitest";
import { toolConfig, parseYAMLValue, parseYAML } from "../tools/text/yaml-json.js";

describe("yaml-json", () => {
  describe("toolConfig", () => {
    it("has correct id, name, category", () => {
      expect(toolConfig.id).toBe("yaml-json");
      expect(toolConfig.name).toBe("YAML to JSON");
      expect(toolConfig.category).toBe("text");
    });
  });

  describe("parseYAMLValue", () => {
    it("parses arrays in brackets", () => {
      expect(parseYAMLValue("[a, b, c]")).toEqual(["a", "b", "c"]);
    });

    it("returns null for null", () => {
      expect(parseYAMLValue("null")).toBe(null);
    });

    it("returns true for true literal", () => {
      expect(parseYAMLValue("true")).toBe(true);
    });

    it("returns false for false literal", () => {
      expect(parseYAMLValue("false")).toBe(false);
    });

    it("parses numbers", () => {
      expect(parseYAMLValue("42")).toBe(42);
      expect(parseYAMLValue("3.14")).toBe(3.14);
    });

    it("returns trimmed strings for other values", () => {
      expect(parseYAMLValue("  hello  ")).toBe("hello");
      expect(parseYAMLValue('"quoted"')).toBe("quoted");
    });
  });

  describe("parseYAML", () => {
    it("parses simple key-value pairs", () => {
      const out = parseYAML("name: John\nage: 30");
      expect(out.name).toBe("John");
      expect(out.age).toBe(30);
    });

    it("handles nested objects", () => {
      const out = parseYAML("user:\n  name: John\n  age: 30");
      expect(out.user.name).toBe("John");
      expect(out.user.age).toBe(30);
    });

    it("handles arrays via dash syntax", () => {
      const out = parseYAML("skills:\n  - JavaScript\n  - Python");
      expect(out.skills).toBeDefined();
      expect(Array.isArray(out.skills)).toBe(true);
      expect(out.skills).toContain("JavaScript");
      expect(out.skills).toContain("Python");
      expect(out.skills.length).toBe(2);
    });

    it("skips comments and empty lines", () => {
      const out = parseYAML("# comment\nname: x\n\nage: y");
      expect(out.name).toBe("x");
      expect(out.age).toBe("y");
    });
  });
});
