import { describe, it, expect } from "vitest";
import {
  toolConfig,
  escapeCell,
  parseDelimited,
  detectDelimiter,
  isMarkdownTable,
  parseMarkdownTable,
  generateMarkdown
} from "../tools/text/markdown-table-generator.js";

describe("markdown-table-generator", () => {
  describe("toolConfig", () => {
    it("has correct id, name, category", () => {
      expect(toolConfig.id).toBe("markdown-table-generator");
      expect(toolConfig.name).toBe("Markdown Table Generator");
      expect(toolConfig.category).toBe("text");
    });

    it("has keywords, steps, and faqs", () => {
      expect(toolConfig.keywords.length).toBeGreaterThan(3);
      expect(toolConfig.steps.length).toBeGreaterThan(2);
      expect(toolConfig.faqs.length).toBeGreaterThan(1);
    });
  });

  describe("escapeCell", () => {
    it("escapes pipe", () => {
      expect(escapeCell("a|b")).toBe("a\\|b");
    });

    it("replaces newlines with <br>", () => {
      expect(escapeCell("a\nb")).toBe("a<br>b");
      expect(escapeCell("a\r\nb")).toBe("a<br>b");
      expect(escapeCell("a\rb")).toBe("a<br>b");
    });

    it("handles both pipe and newline", () => {
      expect(escapeCell("a|b\nc")).toBe("a\\|b<br>c");
    });

    it("returns empty for null/undefined", () => {
      expect(escapeCell(null)).toBe("");
      expect(escapeCell(undefined)).toBe("");
    });

    it("returns plain string for normal text", () => {
      expect(escapeCell("hello world")).toBe("hello world");
    });
  });

  describe("parseDelimited", () => {
    it("parses basic CSV", () => {
      const r = parseDelimited("a,b,c\n1,2,3", ",");
      expect(r).toEqual([
        ["a", "b", "c"],
        ["1", "2", "3"]
      ]);
    });

    it("parses basic TSV", () => {
      const r = parseDelimited("a\tb\tc\n1\t2\t3", "tsv");
      expect(r).toEqual([
        ["a", "b", "c"],
        ["1", "2", "3"]
      ]);
    });

    it("parses basic pipe-delimited", () => {
      const r = parseDelimited("a|b|c\n1|2|3", "|");
      expect(r).toEqual([
        ["a", "b", "c"],
        ["1", "2", "3"]
      ]);
    });

    it("handles quoted CSV with embedded comma", () => {
      const r = parseDelimited('"a, b",c\n"x, y",z', ",");
      expect(r).toEqual([
        ["a, b", "c"],
        ["x, y", "z"]
      ]);
    });

    it("handles quoted CSV with escaped quotes", () => {
      const r = parseDelimited('"He said ""hi""",ok', ",");
      expect(r).toEqual([['He said "hi"', "ok"]]);
    });

    it("pads ragged rows in non-CSV mode", () => {
      const r = parseDelimited("a|b|c\n1|2", "|");
      expect(r).toEqual([
        ["a", "b", "c"],
        ["1", "2"]
      ]);
    });

    it("returns empty for empty input", () => {
      expect(parseDelimited("", ",")).toEqual([]);
      expect(parseDelimited(null, ",")).toEqual([]);
    });

    it("handles Windows line endings", () => {
      const r = parseDelimited("a,b\r\n1,2", ",");
      expect(r).toEqual([
        ["a", "b"],
        ["1", "2"]
      ]);
    });
  });

  describe("detectDelimiter", () => {
    it("returns pipe for pipe-heavy lines", () => {
      expect(detectDelimiter("a|b|c\n1|2|3")).toBe("|");
    });

    it("returns tsv for tab-heavy lines", () => {
      expect(detectDelimiter("a\tb\tc\n1\t2\t3")).toBe("tsv");
    });

    it("returns comma for comma-heavy lines", () => {
      expect(detectDelimiter("a,b,c\n1,2,3")).toBe(",");
    });

    it("returns comma for empty input", () => {
      expect(detectDelimiter("")).toBe(",");
    });
  });

  describe("isMarkdownTable", () => {
    it("detects a basic MD table", () => {
      expect(isMarkdownTable("| a | b |\n| --- | --- |\n| 1 | 2 |")).toBe(true);
    });

    it("detects a table without leading/trailing pipes", () => {
      expect(isMarkdownTable("a | b\n--- | ---\n1 | 2")).toBe(true);
    });

    it("rejects plain CSV", () => {
      expect(isMarkdownTable("a,b,c\n1,2,3")).toBe(false);
    });

    it("rejects single line", () => {
      expect(isMarkdownTable("| a | b |")).toBe(false);
    });

    it("rejects empty", () => {
      expect(isMarkdownTable("")).toBe(false);
      expect(isMarkdownTable(null)).toBe(false);
    });
  });

  describe("parseMarkdownTable", () => {
    it("parses basic MD table", () => {
      const r = parseMarkdownTable("| a | b |\n| --- | --- |\n| 1 | 2 |\n| 3 | 4 |");
      expect(r.headers).toEqual(["a", "b"]);
      expect(r.rows).toEqual([
        ["1", "2"],
        ["3", "4"]
      ]);
      expect(r.alignments).toEqual(["left", "left"]);
    });

    it("detects alignments from separator", () => {
      const r = parseMarkdownTable("| a | b | c |\n| :--- | :---: | ---: |\n| 1 | 2 | 3 |");
      expect(r.alignments).toEqual(["left", "center", "right"]);
    });

    it("pads ragged rows", () => {
      const r = parseMarkdownTable("| a | b | c |\n| --- | --- | --- |\n| 1 | 2 |");
      expect(r.rows).toEqual([["1", "2", ""]]);
    });

    it("handles missing leading/trailing pipes", () => {
      const r = parseMarkdownTable("a | b\n--- | ---\n1 | 2");
      expect(r.headers).toEqual(["a", "b"]);
      expect(r.rows).toEqual([["1", "2"]]);
    });

    it("returns empty object for non-MD input", () => {
      expect(parseMarkdownTable("").headers).toEqual([]);
      expect(parseMarkdownTable("just one line").headers).toEqual([]);
    });

    it("returns empty object for null/empty", () => {
      expect(parseMarkdownTable("").headers).toEqual([]);
      expect(parseMarkdownTable(null).headers).toEqual([]);
    });

    it("unescapes escaped pipes", () => {
      const r = parseMarkdownTable("| a | b |\n| --- | --- |\n| 1 | a \\| b |");
      expect(r.rows[0][1]).toBe("a | b");
    });
  });

  describe("generateMarkdown", () => {
    it("generates a basic table", () => {
      const md = generateMarkdown(
        ["a", "b"],
        [
          ["1", "2"],
          ["3", "4"]
        ],
        ["left", "left"]
      );
      expect(md).toBe("| a   | b   |\n| :--- | :--- |\n| 1   | 2   |\n| 3   | 4   |");
    });

    it("honors alignments", () => {
      const md = generateMarkdown(["a", "b", "c"], [["1", "2", "3"]], ["left", "center", "right"]);
      expect(md).toContain("| :--- | :---: | ---: |");
    });

    it("pads columns to match widest cell", () => {
      const md = generateMarkdown(["a", "b"], [["long", "x"]], ["left", "left"]);
      expect(md.split("\n")[0]).toBe("| a    | b   |");
    });

    it("escapes pipe characters in cells", () => {
      const md = generateMarkdown(["a"], [["x|y"]], ["left"]);
      expect(md).toContain("x\\|y");
    });

    it("returns empty string for no headers", () => {
      expect(generateMarkdown([], [], [])).toBe("");
    });

    it("treats null/undefined cells as empty", () => {
      const md = generateMarkdown(["a", "b"], [[null, undefined]], ["left", "left"]);
      expect(md.split("\n")[2]).toBe("|     |     |");
    });

    it("defaults missing alignments to left", () => {
      const md = generateMarkdown(["a", "b"], [["1", "2"]], []);
      expect(md).toContain("| :--- | :--- |");
    });

    it("handles single column", () => {
      const md = generateMarkdown(["a"], [["1"], ["2"]], ["left"]);
      expect(md).toBe("| a   |\n| :--- |\n| 1   |\n| 2   |");
    });

    it("round-trips with parseMarkdownTable", () => {
      const headers = ["Name", "Age", "City"];
      const rows = [
        ["Alice", "30", "NYC"],
        ["Bob", "25", "LA"]
      ];
      const md = generateMarkdown(headers, rows, ["left", "right", "center"]);
      const parsed = parseMarkdownTable(md);
      expect(parsed.headers).toEqual(headers);
      expect(parsed.rows).toEqual(rows);
      expect(parsed.alignments).toEqual(["left", "right", "center"]);
    });
  });
});
