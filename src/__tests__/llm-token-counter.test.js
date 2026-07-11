import { describe, it, expect } from "vitest";
import {
  MODELS,
  CONTENT_TYPES,
  countChars,
  countWords,
  countLines,
  countSentences,
  detectContentType,
  estimateTokens,
  splitByTokens,
  calculateCost,
  formatUsd,
  compareAllModels,
  buildStatsSnapshot
} from "../tools/dev/llm-token-counter.js";

describe("llm-token-counter: MODELS", () => {
  it("contains 11 model entries including auto", () => {
    expect(MODELS.length).toBe(11);
    expect(MODELS.find(m => m.id === "auto")).toBeDefined();
  });

  it("every model has required fields", () => {
    for (const m of MODELS) {
      expect(m.id).toBeTypeOf("string");
      expect(m.name).toBeTypeOf("string");
      expect(m.provider).toBeTypeOf("string");
      expect(typeof m.inputPer1M).toBe("number");
      expect(typeof m.outputPer1M).toBe("number");
    }
  });

  it("non-auto models have non-zero prices", () => {
    for (const m of MODELS) {
      if (m.id === "auto") continue;
      expect(m.inputPer1M).toBeGreaterThan(0);
      expect(m.outputPer1M).toBeGreaterThan(0);
    }
  });

  it("output tokens cost more than input tokens for paid models", () => {
    for (const m of MODELS) {
      if (m.id === "auto") continue;
      expect(m.outputPer1M).toBeGreaterThanOrEqual(m.inputPer1M);
    }
  });

  it("includes the three major providers", () => {
    const providers = new Set(MODELS.map(m => m.provider));
    expect(providers.has("OpenAI")).toBe(true);
    expect(providers.has("Anthropic")).toBe(true);
    expect(providers.has("Google")).toBe(true);
  });
});

describe("llm-token-counter: CONTENT_TYPES", () => {
  it("has prose and code entries only (English app)", () => {
    expect(Object.keys(CONTENT_TYPES).sort()).toEqual(["code", "prose"]);
  });

  it("every content type has a positive tokensPerChar", () => {
    for (const ct of Object.values(CONTENT_TYPES)) {
      expect(ct.tokensPerChar).toBeGreaterThan(0);
    }
  });
});

describe("llm-token-counter: countChars", () => {
  it("returns 0 for empty input", () => {
    expect(countChars("")).toBe(0);
  });

  it("counts characters including spaces and newlines", () => {
    expect(countChars("hello")).toBe(5);
    expect(countChars("hello world")).toBe(11);
    expect(countChars("a\nb")).toBe(3);
  });
});

describe("llm-token-counter: countWords", () => {
  it("returns 0 for empty input", () => {
    expect(countWords("")).toBe(0);
  });

  it("counts words separated by whitespace", () => {
    expect(countWords("hello world")).toBe(2);
    expect(countWords("  multiple   spaces  ")).toBe(2);
    expect(countWords("one\ntwo\nthree")).toBe(3);
  });

  it("handles single word", () => {
    expect(countWords("solo")).toBe(1);
  });
});

describe("llm-token-counter: countLines", () => {
  it("returns 0 for empty input", () => {
    expect(countLines("")).toBe(0);
  });

  it("counts lines including trailing newline", () => {
    expect(countLines("a\nb\nc")).toBe(3);
    expect(countLines("a\nb\nc\n")).toBe(4);
  });

  it("returns 1 for single-line text without newline", () => {
    expect(countLines("hello")).toBe(1);
  });
});

describe("llm-token-counter: countSentences", () => {
  it("returns 0 for empty input", () => {
    expect(countSentences("")).toBe(0);
  });

  it("counts sentences terminated by . ! ?", () => {
    expect(countSentences("Hello world. How are you? Fine!")).toBe(3);
  });

  it("counts a sentence without terminal punctuation", () => {
    expect(countSentences("Hello world")).toBe(1);
  });

  it("counts multiple sentences across lines", () => {
    expect(countSentences("First. Second.\nThird!")).toBe(3);
  });
});

describe("llm-token-counter: detectContentType", () => {
  it("returns prose for empty input", () => {
    expect(detectContentType("")).toBe("prose");
  });

  it("detects code for high-symbol density", () => {
    expect(detectContentType("function foo() { return { a: 1, b: 2 }; }")).toBe("code");
  });

  it("detects code from code keywords", () => {
    expect(detectContentType("const x = 1;\nfunction foo() {\n  return x;\n}")).toBe("code");
  });

  it("returns prose for normal English", () => {
    expect(detectContentType("The quick brown fox jumps over the lazy dog.")).toBe("prose");
  });

  it("treats non-Latin text as prose (English app, no CJK mode)", () => {
    expect(detectContentType("你好世界")).toBe("prose");
  });
});

describe("llm-token-counter: estimateTokens", () => {
  it("returns 0 for empty text", () => {
    expect(estimateTokens("")).toBe(0);
  });

  it("estimates based on chars * tokensPerChar", () => {
    const text = "a".repeat(100);
    const prose = estimateTokens(text, "prose");
    const code = estimateTokens(text, "code");
    expect(prose).toBe(Math.ceil(100 * CONTENT_TYPES.prose.tokensPerChar));
    expect(code).toBeGreaterThan(prose);
  });

  it("auto-detects content type when none provided", () => {
    const codeText = "function f() { return 1; }";
    const tokens = estimateTokens(codeText);
    expect(tokens).toBeGreaterThan(codeText.length * CONTENT_TYPES.prose.tokensPerChar);
  });

  it("always returns at least 1 for non-empty text", () => {
    expect(estimateTokens("a")).toBe(1);
  });
});

describe("llm-token-counter: splitByTokens", () => {
  it("returns empty array for empty text", () => {
    expect(splitByTokens("")).toEqual([]);
  });

  it("splits prose into word-like tokens", () => {
    const tokens = splitByTokens("Hello, world!", "prose");
    expect(tokens.length).toBeGreaterThan(1);
    expect(tokens.join("").replace(/\s+/g, "")).toBe("Hello,world!");
  });

  it("splits code by code punctuation", () => {
    const tokens = splitByTokens("foo();", "code");
    expect(tokens.length).toBeGreaterThan(1);
  });
});

describe("llm-token-counter: calculateCost", () => {
  it("returns zero cost for zero tokens", () => {
    const c = calculateCost(0, 0.5, 2.5, 10);
    expect(c.inputTokens).toBe(0);
    expect(c.outputTokens).toBe(0);
    expect(c.totalCost).toBe(0);
  });

  it("splits input and output by ratio", () => {
    const c = calculateCost(1000, 0.3, 2.5, 10);
    expect(c.inputTokens).toBe(300);
    expect(c.outputTokens).toBe(700);
  });

  it("handles 100% input ratio", () => {
    const c = calculateCost(1000, 1.0, 2.5, 10);
    expect(c.inputTokens).toBe(1000);
    expect(c.outputTokens).toBe(0);
  });

  it("handles 0% input ratio", () => {
    const c = calculateCost(1000, 0, 2.5, 10);
    expect(c.inputTokens).toBe(0);
    expect(c.outputTokens).toBe(1000);
  });

  it("calculates total cost correctly", () => {
    const c = calculateCost(1_000_000, 0.5, 2.5, 10);
    expect(c.inputCost).toBe(1.25);
    expect(c.outputCost).toBe(5);
    expect(c.totalCost).toBe(6.25);
  });
});

describe("llm-token-counter: formatUsd", () => {
  it("formats zero as $0.00", () => {
    expect(formatUsd(0)).toBe("$0.00");
  });

  it("formats sub-cent amounts with < prefix", () => {
    expect(formatUsd(0.00001)).toBe("<$0.0001");
  });

  it("formats sub-dollar with 4 decimals", () => {
    expect(formatUsd(0.0123)).toBe("$0.0123");
  });

  it("formats regular amounts with 2 decimals", () => {
    expect(formatUsd(5.5)).toBe("$5.50");
  });

  it("formats >= 100 with no decimals", () => {
    expect(formatUsd(150)).toBe("$150");
  });
});

describe("llm-token-counter: compareAllModels", () => {
  it("returns one row per non-auto model", () => {
    const rows = compareAllModels(1000);
    expect(rows.length).toBe(MODELS.length - 1);
  });

  it("sorts by total cost ascending", () => {
    const rows = compareAllModels(100_000);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].totalCost).toBeGreaterThanOrEqual(rows[i - 1].totalCost);
    }
  });

  it("cheapest model is Gemini 1.5 Flash for a given token count", () => {
    const rows = compareAllModels(1_000_000);
    expect(rows[0].model.id).toBe("gemini-1.5-flash");
  });
});

describe("llm-token-counter: buildStatsSnapshot", () => {
  it("produces a complete stats object", () => {
    const snap = buildStatsSnapshot("Hello world", "gpt-4o", 0.5);
    expect(snap.text_length_chars).toBe(11);
    expect(snap.words).toBe(2);
    expect(snap.model).toBe("GPT-4o");
    expect(snap.provider).toBe("OpenAI");
    expect(snap.estimated_tokens).toBeGreaterThan(0);
    expect(snap.input_tokens + snap.output_tokens).toBe(snap.estimated_tokens);
    expect(snap.total_cost_usd).toBeCloseTo(snap.input_cost_usd + snap.output_cost_usd, 6);
    expect(snap.note).toContain("heuristic");
  });

  it("handles empty text", () => {
    const snap = buildStatsSnapshot("", "gpt-4o", 0.5);
    expect(snap.estimated_tokens).toBe(0);
    expect(snap.total_cost_usd).toBe(0);
  });
});

describe("llm-token-counter: end-to-end sanity", () => {
  it("1000-char English paragraph yields reasonable token estimate", () => {
    const text = "The quick brown fox jumps over the lazy dog. ".repeat(28);
    const tokens = estimateTokens(text, "prose");
    expect(text.length).toBeGreaterThan(1000);
    expect(tokens).toBeGreaterThan(100);
    expect(tokens).toBeLessThan(2000);
  });

  it("code text produces more tokens per char than prose", () => {
    const codeText = "function foo(a, b) { return a + b; }";
    const codeTokens = estimateTokens(codeText, "code");
    const proseTokens = estimateTokens(codeText, "prose");
    expect(codeTokens).toBeGreaterThan(proseTokens);
  });
});
