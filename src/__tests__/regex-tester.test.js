import { describe, it, expect } from "vitest";
import {
  tokenizeRegex,
  explainRegex,
  escapeHtml,
  highlightMatches,
  getGroupMatches
} from "../tools/dev/regex-tester.js";

describe("tokenizeRegex", () => {
  it("tokenizes simple literal", () => {
    const tokens = tokenizeRegex("abc");
    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toEqual({ type: "literal", value: "a" });
  });

  it("tokenizes character classes", () => {
    const tokens = tokenizeRegex("\\d");
    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toEqual({ type: "class", value: "\\d" });
  });

  it("tokenizes quantifiers", () => {
    const tokens = tokenizeRegex("a+");
    expect(tokens).toHaveLength(2);
    expect(tokens[1]).toEqual({ type: "quantifier", value: "+" });
  });

  it("tokenizes lazy quantifiers", () => {
    const tokens = tokenizeRegex("a+?");
    expect(tokens[1]).toEqual({ type: "quantifier", value: "+?" });
  });

  it("tokenizes groups", () => {
    const tokens = tokenizeRegex("(abc)");
    expect(tokens[0]).toEqual({ type: "group-start", groupType: "group", value: "(" });
    expect(tokens[4]).toEqual({ type: "group-end", value: ")" });
  });

  it("tokenizes non-capturing groups", () => {
    const tokens = tokenizeRegex("(?:abc)");
    expect(tokens[0]).toEqual({ type: "group-start", groupType: "noncapture", value: "(?:" });
  });

  it("tokenizes lookahead", () => {
    const tokens = tokenizeRegex("(?=abc)");
    expect(tokens[0]).toEqual({ type: "group-start", groupType: "lookahead", value: "(?=" });
  });

  it("tokenizes negative lookahead", () => {
    const tokens = tokenizeRegex("(?!abc)");
    expect(tokens[0]).toEqual({ type: "group-start", groupType: "neglookahead", value: "(?!" });
  });

  it("tokenizes anchors", () => {
    const tokens = tokenizeRegex("^abc$");
    expect(tokens[0]).toEqual({ type: "anchor", value: "^" });
    expect(tokens[4]).toEqual({ type: "anchor", value: "$" });
  });

  it("tokenizes alternation", () => {
    const tokens = tokenizeRegex("a|b");
    expect(tokens[1]).toEqual({ type: "alternation", value: "|" });
  });

  it("tokenizes dot", () => {
    const tokens = tokenizeRegex(".");
    expect(tokens[0]).toEqual({ type: "class", value: "." });
  });

  it("tokenizes quantifier with braces", () => {
    const tokens = tokenizeRegex("a{3}");
    expect(tokens[1]).toEqual({ type: "quantifier", value: "{3}" });
  });

  it("tokenizes quantifier with range", () => {
    const tokens = tokenizeRegex("a{2,5}");
    expect(tokens[1]).toEqual({ type: "quantifier", value: "{2,5}" });
  });

  it("tokenizes character class brackets", () => {
    const tokens = tokenizeRegex("[abc]");
    expect(tokens[0]).toEqual({ type: "class", value: "[abc]" });
  });

  it("tokenizes negated character class", () => {
    const tokens = tokenizeRegex("[^abc]");
    expect(tokens[0]).toEqual({ type: "class", value: "[^abc]" });
  });
});

describe("explainRegex", () => {
  it("explains simple literal", () => {
    const result = explainRegex("abc");
    expect(result).toContain('"a"');
    expect(result).toContain('"b"');
    expect(result).toContain('"c"');
  });

  it("explains digit class", () => {
    const result = explainRegex("\\d");
    expect(result).toContain("a digit");
  });

  it("explains word class", () => {
    const result = explainRegex("\\w");
    expect(result).toContain("a word character");
  });

  it("explains whitespace class", () => {
    const result = explainRegex("\\s");
    expect(result).toContain("whitespace");
  });

  it("explains dot", () => {
    const result = explainRegex(".");
    expect(result).toContain("any character");
  });

  it("explains anchors", () => {
    const result = explainRegex("^");
    expect(result).toContain("start of the string");
  });

  it("explains end anchor", () => {
    const result = explainRegex("$");
    expect(result).toContain("end of the string");
  });

  it("explains quantifiers", () => {
    expect(explainRegex("a*")).toContain("zero or more times");
    expect(explainRegex("a+")).toContain("one or more times");
    expect(explainRegex("a?")).toContain("optionally");
  });

  it("explains lazy quantifiers", () => {
    expect(explainRegex("a*?")).toContain("lazy");
    expect(explainRegex("a+?")).toContain("lazy");
  });

  it("explains brace quantifiers", () => {
    expect(explainRegex("a{3}")).toContain("exactly 3 times");
    expect(explainRegex("a{2,}")).toContain("2 or more times");
    expect(explainRegex("a{2,5}")).toContain("between 2 and 5 times");
  });

  it("explains capturing group", () => {
    const result = explainRegex("(abc)");
    expect(result).toContain("capturing group #1");
  });

  it("explains non-capturing group", () => {
    const result = explainRegex("(?:abc)");
    expect(result).toContain("non-capturing group");
  });

  it("explains alternation", () => {
    const result = explainRegex("a|b");
    expect(result).toContain("or");
  });

  it("explains word boundary", () => {
    expect(explainRegex("\\b")).toContain("word boundary");
    expect(explainRegex("\\B")).toContain("non-word boundary");
  });

  it("returns empty pattern message", () => {
    expect(explainRegex("")).toBe("Empty pattern");
  });
});

describe("escapeHtml", () => {
  it("escapes ampersand", () => {
    expect(escapeHtml("a&b")).toBe("a&amp;b");
  });

  it("escapes less than", () => {
    expect(escapeHtml("a<b")).toBe("a&lt;b");
  });

  it("escapes greater than", () => {
    expect(escapeHtml("a>b")).toBe("a&gt;b");
  });

  it("escapes double quote", () => {
    expect(escapeHtml('a"b')).toBe("a&quot;b");
  });

  it("handles multiple escapes", () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toContain("&lt;script&gt;");
  });
});

describe("highlightMatches", () => {
  it("highlights matches in text", () => {
    const regex = /\b\w+\b/g;
    const result = highlightMatches("hello world", regex);
    expect(result).toContain("<mark");
    expect(result).toContain("hello");
    expect(result).toContain("world");
  });

  it("returns escaped text when no matches", () => {
    const regex = /xyz/g;
    const result = highlightMatches("hello", regex);
    expect(result).toBe("hello");
  });

  it("handles empty text", () => {
    const regex = /a/g;
    expect(highlightMatches("", regex)).toBe("");
  });

  it("handles null regex", () => {
    expect(highlightMatches("hello", null)).toBe("hello");
  });
});

describe("getGroupMatches", () => {
  it("extracts capturing groups", () => {
    const regex = /(\w+)@(\w+)/g;
    const results = getGroupMatches("alice@bob", regex);
    expect(results).toHaveLength(1);
    expect(results[0].full).toBe("alice@bob");
    expect(results[0].groups).toHaveLength(2);
    expect(results[0].groups[0].value).toBe("alice");
    expect(results[0].groups[1].value).toBe("bob");
  });

  it("returns empty for no matches", () => {
    const regex = /xyz/g;
    expect(getGroupMatches("hello", regex)).toHaveLength(0);
  });

  it("returns empty for empty text", () => {
    const regex = /a/g;
    expect(getGroupMatches("", regex)).toHaveLength(0);
  });

  it("handles multiple matches", () => {
    const regex = /(\d+)/g;
    const results = getGroupMatches("12 and 34", regex);
    expect(results).toHaveLength(2);
    expect(results[0].groups[0].value).toBe("12");
    expect(results[1].groups[0].value).toBe("34");
  });

  it("marks undefined groups", () => {
    const regex = /(a)?(b)/g;
    const results = getGroupMatches("b", regex);
    expect(results[0].groups[0].value).toBe("(undefined)");
    expect(results[0].groups[1].value).toBe("b");
  });
});
