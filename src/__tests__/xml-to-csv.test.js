import { describe, it, expect } from "vitest";
import { toolConfig, parseXmlToRows, rowsToCsv } from "../tools/text/xml-to-csv.js";
import { testSimpleToolConfig } from "./tool-config-test.js";

describe("xml-to-csv", () => {
  testSimpleToolConfig(toolConfig, "xml-to-csv", "XML to CSV Converter", "text");

  describe("parseXmlToRows", () => {
    it("parses XML with repeated elements into rows", () => {
      const xml = `<root>
        <person><name>Alice</name><age>30</age></person>
        <person><name>Bob</name><age>25</age></person>
      </root>`;
      const rows = parseXmlToRows(xml);
      expect(rows.length).toBeGreaterThanOrEqual(2);
      const names = rows.map(r => r.name || r["person.name"]).filter(Boolean);
      expect(names).toContain("Alice");
      expect(names).toContain("Bob");
    });

    it("returns empty array for XML with no data", () => {
      expect(parseXmlToRows("<root/>")).toEqual([]);
    });

    it("handles nested elements", () => {
      const xml = `<data><item><id>1</id><details><color>red</color></details></item></data>`;
      const rows = parseXmlToRows(xml);
      expect(rows.length).toBeGreaterThan(0);
    });

    it("handles invalid XML gracefully", () => {
      const rows = parseXmlToRows("not xml at all");
      expect(rows).toEqual([]);
    });
  });

  describe("rowsToCsv", () => {
    it("generates CSV with header and rows", () => {
      const csv = rowsToCsv([
        { name: "Alice", age: "30" },
        { name: "Bob", age: "25" }
      ]);
      const lines = csv.split("\n");
      expect(lines[0]).toBe("name,age");
      expect(lines[1]).toContain("Alice");
      expect(lines[2]).toContain("Bob");
    });

    it("returns empty string for empty rows", () => {
      expect(rowsToCsv([])).toBe("");
    });

    it("handles rows with missing keys", () => {
      const csv = rowsToCsv([{ a: "1" }, { a: "2", b: "3" }]);
      const lines = csv.split("\n");
      expect(lines[0]).toBe("a,b");
      expect(lines[1]).toBe("1,");
      expect(lines[2]).toBe("2,3");
    });
  });
});
