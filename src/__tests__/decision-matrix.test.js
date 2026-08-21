import { describe, it, expect } from "vitest";
import { testToolConfig } from "./helpers/tool-config-test.js";
import { createDraft, computeRankings } from "../tools/productivity/decision-matrix.js";

testToolConfig(() => import("../tools/productivity/decision-matrix.js"), {
  id: "decision-matrix",
  name: "Decision Matrix Maker",
  category: "productivity"
});

describe("createDraft", () => {
  it("creates a usable starter matrix", () => {
    const d = createDraft();
    expect(d.criteria).toHaveLength(2);
    expect(d.options).toHaveLength(2);
    expect(d.criteria[0].weight).toBeGreaterThanOrEqual(1);
    expect(d.criteria[0].weight).toBeLessThanOrEqual(5);
    const ids = new Set([...d.criteria.map(c => c.id), ...d.options.map(o => o.id)]);
    expect(ids.size).toBe(4);
  });
});

describe("computeRankings", () => {
  it("computes weighted totals and sorts descending", () => {
    const draft = {
      criteria: [
        { id: "c1", name: "Cost", weight: 2 },
        { id: "c2", name: "Ease", weight: 4 }
      ],
      options: [
        { id: "a", name: "A", scores: { c1: 5, c2: 3 } },
        { id: "b", name: "B", scores: { c1: 4, c2: 5 } }
      ]
    };
    const r = computeRankings(draft);
    expect(r[0].id).toBe("b");
    expect(r[0].total).toBe(28);
    expect(r[1].total).toBe(22);
    expect(r[0].pct).toBe(93);
  });

  it("defaults missing scores to neutral 3", () => {
    const draft = {
      criteria: [{ id: "c1", name: "Cost", weight: 2 }],
      options: [{ id: "a", name: "A", scores: {} }]
    };
    expect(computeRankings(draft)[0].total).toBe(6);
  });

  it("clamps out-of-range scores into 1-5", () => {
    const draft = {
      criteria: [{ id: "c1", name: "Cost", weight: 1 }],
      options: [
        { id: "a", name: "A", scores: { c1: 99 } },
        { id: "b", name: "B", scores: { c1: -7 } }
      ]
    };
    const r = computeRankings(draft);
    expect(r[0].total).toBe(5);
    expect(r[1].total).toBe(1);
  });

  it("ignores criteria with blank names", () => {
    const draft = {
      criteria: [
        { id: "c1", name: "", weight: 5 },
        { id: "c2", name: "Real", weight: 1 }
      ],
      options: [{ id: "a", name: "A", scores: { c1: 5, c2: 2 } }]
    };
    expect(computeRankings(draft)[0].total).toBe(2);
  });

  it("falls back to Untitled for blank option names and handles ties", () => {
    const draft = {
      criteria: [{ id: "c1", name: "X", weight: 1 }],
      options: [
        { id: "a", name: "   ", scores: { c1: 3 } },
        { id: "b", name: "", scores: { c1: 3 } }
      ]
    };
    const r = computeRankings(draft);
    expect(r.every(x => x.name === "Untitled")).toBe(true);
    expect(r[0].total).toBe(r[1].total);
  });
});
