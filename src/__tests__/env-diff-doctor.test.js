import { describe, expect, it } from "vitest";
import {
  analyzePair,
  buildMarkdownReport,
  cleanup,
  maskValue,
  parseEnv,
  toolConfig
} from "../tools/dev/env-diff-doctor.js";
import { testToolConfig } from "./helpers/tool-config-test.js";

testToolConfig(() => import("../tools/dev/env-diff-doctor.js"), {
  id: "env-diff-doctor",
  name: "Env Diff & Doctor",
  category: "dev"
});

describe("parseEnv", () => {
  it("parses plain, quoted, export and comment forms", () => {
    const { entries, errors } = parseEnv(
      [
        "# comment",
        "A=1",
        'B="two words"',
        "C='literal \\n stays'",
        "export D=4",
        "URL=https://x.com#frag",
        "E=1 # trailing"
      ].join("\n")
    );
    expect(errors).toEqual([]);
    const map = Object.fromEntries(entries.map(e => [e.key, e.value]));
    expect(map.A).toBe("1");
    expect(map.B).toBe("two words");
    expect(map.C).toBe("literal \\n stays");
    expect(map.D).toBe("4");
    expect(map.URL).toBe("https://x.com#frag");
    expect(map.E).toBe("1");
  });

  it("processes double-quote escapes", () => {
    const { entries } = parseEnv('N="a\\nb"\nB="C:\\\\path"');
    const map = Object.fromEntries(entries.map(e => [e.key, e.value]));
    expect(map.N).toBe("a\nb");
    expect(map.B).toBe("C:\\path");
  });

  it("supports multi-line quoted values and records start line", () => {
    const src = ['M="line1', "line2", 'line3"', "AFTER=ok"].join("\n");
    const { entries, errors } = parseEnv(src);
    expect(errors).toEqual([]);
    expect(entries[0].key).toBe("M");
    expect(entries[0].value).toBe("line1\nline2\nline3");
    expect(entries[0].line).toBe(1);
    expect(entries[1].key).toBe("AFTER");
  });

  it("flags syntax errors without aborting the rest of the file", () => {
    const { entries, errors } = parseEnv("NOEQUALSHERE\nGOOD=1\nBAD KEY=2");
    expect(errors).toHaveLength(2);
    expect(errors[0]).toMatchObject({ line: 1 });
    expect(Object.keys(Object.fromEntries(entries.map(e => [e.key, 1])))).toEqual(["GOOD"]);
  });

  it("flags unclosed quotes as syntax errors", () => {
    const { errors } = parseEnv('X="never closed');
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/Unclosed/);
  });
});

describe("analyzePair", () => {
  const REF = [
    "COMMON=same",
    "ONLY_REF=1",
    "CHANGED=a",
    "STRIPE_SECRET_KEY=sk_live_abcdef123456"
  ].join("\n");
  const TGT = [
    "COMMON=same",
    "CHANGED=b",
    "EXTRA_ONLY=9",
    "STRIPE_SECRET_KEY=sk_live_abcdef123456",
    "JWT_SECRET=changeme",
    "DB_PASSWORD=",
    "LOG=info",
    "LOG=debug",
    "SPACED=my cool app",
    "lower_key=x",
    "USES_MISSING=${NOT_DEFINED_ANYWHERE}",
    "BROKEN LINE"
  ].join("\n");

  it("computes missing, extra and changed sets", () => {
    const r = analyzePair(REF, TGT);
    expect(r.missing).toEqual(["ONLY_REF"]);
    expect(r.extra).toEqual(expect.arrayContaining(["EXTRA_ONLY", "JWT_SECRET", "DB_PASSWORD", "LOG"]));
    expect(r.extra.every(k => !["COMMON", "CHANGED"].includes(k))).toBe(true);
    expect(r.changed).toEqual([{ key: "CHANGED", refValue: "a", tgtValue: "b" }]);
    expect(r.sameCount).toBe(2);
  });

  it("detects shared secrets between files", () => {
    const r = analyzePair(REF, TGT);
    expect(r.issues.some(i => i.rule === "shared-secret" && i.key === "STRIPE_SECRET_KEY")).toBe(
      true
    );
  });

  it("detects weak secrets, duplicates, spaces, lowercase and unresolved interpolation", () => {
    const r = analyzePair(REF, TGT);
    const rules = r.issues.map(i => `${i.rule}:${i.key ?? i.message}`);
    expect(rules).toContain("weak-secret:JWT_SECRET");
    expect(rules).toContain("weak-secret:DB_PASSWORD");
    expect(rules.some(s => s.startsWith("duplicate-key:"))).toBe(true);
    expect(rules.some(s => s.startsWith("unquoted-space:"))).toBe(true);
    expect(rules.some(s => s.startsWith("lowercase-key:"))).toBe(true);
    expect(rules.some(s => s.startsWith("unresolved-interp:"))).toBe(true);
    expect(rules.some(s => s.startsWith("syntax:"))).toBe(true);
  });

  it("sorts issues error-first then by line", () => {
    const r = analyzePair(REF, TGT);
    const order = { error: 0, warn: 1, info: 2 };
    for (let i = 1; i < r.issues.length; i++) {
      expect(order[r.issues[i - 1].severity]).toBeLessThanOrEqual(order[r.issues[i].severity]);
    }
  });

  it("reports clean sync for identical healthy files", () => {
    const GOOD = "APP=ok\nPORT=3000";
    const r = analyzePair(GOOD, GOOD);
    expect(r.missing).toEqual([]);
    expect(r.extra).toEqual([]);
    expect(r.changed).toEqual([]);
    expect(r.issues).toEqual([]);
  });
});

describe("maskValue + report", () => {
  it("masks values with capped bullets and labels empties", () => {
    expect(maskValue("")).toBe("(empty)");
    expect(maskValue("abc")).toMatch(/^•{4}$/);
    expect(maskValue("a".repeat(50))).toMatch(/^•{12}$/);
  });

  it("builds a markdown report covering every section", () => {
    const r = analyzePair("A=1\nSECRET_KEY=aaaaaaaaaa", "A=2\nSECRET_KEY=bbbbbbbbbb\nEXTRA=9\nTOKEN=changeme");
    const md = buildMarkdownReport(r, { masked: true });
    expect(md).toContain("# Env Diff & Doctor Report");
    expect(md).toContain("- Missing in target: **0**");
    expect(md).toContain("| A |");
    expect(md).toContain("`••••`");
    expect(md).toContain("[error]");
    const revealed = buildMarkdownReport(r, { masked: false });
    expect(revealed).toContain('"aaaaaaaaaa"');
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
