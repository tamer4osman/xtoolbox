import { describe, expect, it } from "vitest";
import {
  analyzeMatch,
  buildMarkdownReport,
  cleanup,
  extractJobTerms,
  SAMPLE_JD,
  SAMPLE_RESUME,
  tokenize
} from "../tools/business/resume-job-matcher.js";
import { testToolConfig } from "./helpers/tool-config-test.js";

testToolConfig(() => import("../tools/business/resume-job-matcher.js"), {
  id: "resume-job-matcher",
  name: "Resume Job Matcher",
  category: "business"
});

describe("tokenize", () => {
  it("lowercases, splits, drops stopwords and numbers", () => {
    expect(tokenize("The Senior React Developer built 5 Apps")).toEqual([
      "senior",
      "react",
      "developer",
      "built",
      "app"
    ]);
  });

  it("folds simple plurals but protects ss/us/is endings", () => {
    const toks = tokenize("apps pipelines status analysis bus");
    expect(toks).toContain("app");
    expect(toks).toContain("pipeline");
    expect(toks).toContain("status");
    expect(toks).toContain("analysis");
    expect(toks).toContain("bus");
    expect(toks).not.toContain("bu");
  });

  it("preserves tech tokens with # + .", () => {
    const toks = tokenize("C# F# node.js vue.js e2e");
    expect(toks).toContain("c#");
    expect(toks).toContain("node.js");
    expect(toks).toContain("vue.js");
    expect(toks).toContain("e2e");
    expect(toks).toContain("f#");
  });

  it("keeps hyphen and slash compounds whole, drops version noise", () => {
    const toks = tokenize("end-to-end CI/CD WCAG 2.1 AA pipelines v2.0 2020-2022");
    expect(toks).toContain("end-to-end");
    expect(toks).toContain("ci/cd");
    expect(toks).toContain("wcag");
    expect(toks).not.toContain("end");
    expect(toks).not.toContain("ci");
    expect(toks).not.toContain("cd");
    expect(toks.some(t => /^[\d./-]+$/.test(t))).toBe(false);
  });
});

describe("extractJobTerms", () => {
  it("ranks by capped frequency and respects limit", () => {
    const terms = extractJobTerms(
      "react react react typescript typescript kubernetes graphql api",
      3
    );
    expect(terms[0]).toMatchObject({ term: "react", weight: 3 });
    expect(terms[1]).toMatchObject({ term: "typescript", weight: 2 });
    expect(terms).toHaveLength(3);
    expect(terms.every(t => t.weight <= terms[0].weight)).toBe(true);
  });
});

describe("analyzeMatch", () => {
  const JD =
    "Build React interfaces. React and TypeScript required. Kubernetes plus GraphQL experience needed.";
  const RESUME_PARTIAL = "React developer with some TypeScript";

  it("scores identical texts at 100", () => {
    const r = analyzeMatch(JD, JD);
    expect(r.score).toBe(100);
    expect(r.missing).toHaveLength(0);
    expect(r.matched.map(m => m.term)).toEqual(
      expect.arrayContaining(["react", "typescript", "kubernetes", "graphql"])
    );
  });

  it("penalizes missing terms and lists heavier ones first", () => {
    const r = analyzeMatch(RESUME_PARTIAL, JD);
    expect(r.score).toBeGreaterThan(0);
    expect(r.score).toBeLessThan(100);
    const weights = r.missing.map(m => m.weight);
    expect([...weights].sort((a, b) => b - a)).toEqual(weights);
    expect(r.missing.some(m => m.term === "graphql")).toBe(true);
    expect(r.matched.some(m => m.term === "react")).toBe(true);
  });

  it("handles empty resume gracefully", () => {
    const r = analyzeMatch("", JD);
    expect(r.score).toBe(0);
    expect(r.stats.words).toBe(0);
    expect(r.stats.email).toBe("");
  });

  it("extracts the actual email and phone values", () => {
    const r = analyzeMatch(SAMPLE_RESUME, SAMPLE_JD);
    expect(r.stats.email).toBe("jane@example.com");
    expect(r.stats.phone).toContain("(555)");
  });

  it("returns zero score for empty job description", () => {
    expect(analyzeMatch(SAMPLE_RESUME, "").score).toBe(0);
  });
});

describe("buildMarkdownReport", () => {
  it("includes score, missing list and health stats", () => {
    const r = analyzeMatch(SAMPLE_RESUME, SAMPLE_JD);
    const md = buildMarkdownReport(r);
    expect(md).toContain(`**${r.score}%**`);
    expect(md).toContain("Missing keywords");
    expect(md).toContain("Action verbs detected:");
  });
});

describe("cleanup", () => {
  it("is safe to call repeatedly", () => {
    expect(() => {
      cleanup();
      cleanup();
    }).not.toThrow();
  });
});
