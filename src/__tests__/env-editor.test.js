import { describe, it, expect } from "vitest";
import {
  DEFAULT_FILE_TEMPLATES,
  FILE_TABS,
  PRESETS,
  parseEnv,
  validateEnv,
  buildEnvFromVars,
  toJson,
  toYaml,
  toShell,
  toDockerArgs,
  stats
} from "../tools/dev/env-editor.js";

describe("env-editor: DEFAULT_FILE_TEMPLATES", () => {
  it("has .env and .env.example as defaults", () => {
    expect(Object.keys(DEFAULT_FILE_TEMPLATES).sort()).toEqual([".env", ".env.example"]);
  });

  it("default .env includes NODE_ENV and PORT", () => {
    const env = DEFAULT_FILE_TEMPLATES[".env"];
    expect(env).toContain("NODE_ENV=development");
    expect(env).toContain("PORT=3000");
  });

  it("default .env.example has empty values", () => {
    const ex = DEFAULT_FILE_TEMPLATES[".env.example"];
    expect(ex).toContain("NODE_ENV=");
    expect(ex).not.toContain("development");
  });
});

describe("env-editor: FILE_TABS", () => {
  it("includes the four common .env file names", () => {
    expect(FILE_TABS).toContain(".env");
    expect(FILE_TABS).toContain(".env.example");
    expect(FILE_TABS).toContain(".env.production");
    expect(FILE_TABS).toContain(".env.development");
  });
});

describe("env-editor: PRESETS", () => {
  it("has 14 presets", () => {
    expect(PRESETS.length).toBe(14);
  });

  it("every preset has a name, icon, and a non-empty vars array", () => {
    for (const p of PRESETS) {
      expect(p.id).toBeTypeOf("string");
      expect(p.name).toBeTypeOf("string");
      expect(p.icon).toBeTypeOf("string");
      expect(Array.isArray(p.vars)).toBe(true);
      expect(p.vars.length).toBeGreaterThan(0);
    }
  });

  it("every preset var has a key", () => {
    for (const p of PRESETS) {
      for (const v of p.vars) {
        expect(v.key, `preset ${p.id} var`).toBeTypeOf("string");
        expect(v.key.length).toBeGreaterThan(0);
      }
    }
  });

  it("preset ids are unique", () => {
    const ids = PRESETS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("env-editor: parseEnv", () => {
  it("returns one blank entry for empty input", () => {
    expect(parseEnv("")).toEqual([{ type: "blank", line: "", num: 1 }]);
  });

  it("classifies blank lines", () => {
    const r = parseEnv("\n\n");
    expect(r).toHaveLength(3);
    expect(r.every(e => e.type === "blank")).toBe(true);
  });

  it("classifies comment lines", () => {
    const r = parseEnv("# hello\n# world");
    expect(r[0].type).toBe("comment");
    expect(r[0].value).toBe("# hello");
    expect(r[1].value).toBe("# world");
  });

  it("parses simple KEY=VALUE", () => {
    const r = parseEnv("FOO=bar");
    expect(r[0].type).toBe("kv");
    expect(r[0].key).toBe("FOO");
    expect(r[0].value).toBe("bar");
    expect(r[0].quote).toBe(null);
  });

  it("parses values with double quotes", () => {
    const r = parseEnv('GREETING="hello world"');
    expect(r[0].type).toBe("kv");
    expect(r[0].value).toBe("hello world");
    expect(r[0].quote).toBe('"');
  });

  it("parses values with single quotes", () => {
    const r = parseEnv("SECRET='has #hash'");
    expect(r[0].value).toBe("has #hash");
    expect(r[0].quote).toBe("'");
  });

  it("handles empty values", () => {
    const r = parseEnv("EMPTY=");
    expect(r[0].type).toBe("kv");
    expect(r[0].value).toBe("");
  });

  it("handles values containing =", () => {
    const r = parseEnv("URL=https://x.com/?a=1&b=2");
    expect(r[0].value).toBe("https://x.com/?a=1&b=2");
  });

  it('strips leading "export " keyword', () => {
    const r = parseEnv("export FOO=bar");
    expect(r[0].type).toBe("kv");
    expect(r[0].key).toBe("FOO");
    expect(r[0].value).toBe("bar");
  });

  it("flags unclosed quotes", () => {
    const r = parseEnv('FOO="missing end');
    expect(r[0].type).toBe("kv");
    expect(r[0].unclosedQuote).toBe(true);
  });

  it("flags invalid lines (no =)", () => {
    const r = parseEnv("NO_EQUALS_HERE");
    expect(r[0].type).toBe("invalid");
    expect(r[0].reason).toContain("missing =");
  });

  it("flags invalid keys (start with digit)", () => {
    const r = parseEnv("1FOO=bar");
    expect(r[0].type).toBe("invalid");
  });

  it("preserves line numbers 1-indexed", () => {
    const r = parseEnv("\nA=1\nB=2");
    expect(r[0].num).toBe(1);
    expect(r[1].num).toBe(2);
    expect(r[2].num).toBe(3);
  });

  it("handles CRLF line endings", () => {
    const r = parseEnv("A=1\r\nB=2");
    expect(r).toHaveLength(2);
    expect(r[0].key).toBe("A");
    expect(r[1].key).toBe("B");
  });
});

describe("env-editor: validateEnv", () => {
  it("returns no issues for a clean file", () => {
    const r = validateEnv(parseEnv("A=1\nB=2\n# comment\n"));
    expect(r).toEqual([]);
  });

  it("detects duplicate keys", () => {
    const r = validateEnv(parseEnv("A=1\nA=2"));
    expect(r.some(i => /duplicate/.test(i.message))).toBe(true);
  });

  it("detects unclosed quote", () => {
    const r = validateEnv(parseEnv('FOO="missing end'));
    expect(r.some(i => /unclosed quote/.test(i.message))).toBe(true);
    expect(r[0].severity).toBe("error");
  });

  it("detects whitespace-padded values", () => {
    const r = validateEnv(parseEnv("FOO=  bar  "));
    expect(r.some(i => /whitespace/.test(i.message))).toBe(true);
  });

  it("detects invalid lines", () => {
    const r = validateEnv(parseEnv("NO_EQUALS"));
    expect(r.some(i => i.severity === "error")).toBe(true);
  });

  it("includes line numbers in issues", () => {
    const r = validateEnv(parseEnv("\n\nA=1\nA=2"));
    const dup = r.find(i => /duplicate/.test(i.message));
    expect(dup.line).toBe(4);
  });
});

describe("env-editor: buildEnvFromVars", () => {
  it("emits each var as KEY=VALUE", () => {
    const out = buildEnvFromVars([
      { key: "A", value: "1" },
      { key: "B", value: "2" }
    ]);
    expect(out).toContain("A=1");
    expect(out).toContain("B=2");
  });

  it("quotes values that contain spaces", () => {
    const out = buildEnvFromVars([{ key: "G", value: "hello world" }]);
    expect(out).toContain('G="hello world"');
  });

  it("quotes values that contain #", () => {
    const out = buildEnvFromVars([{ key: "G", value: "a#b" }]);
    expect(out).toContain('G="a#b"');
  });

  it("skips vars with empty keys", () => {
    const out = buildEnvFromVars([
      { key: "", value: "x" },
      { key: "A", value: "1" }
    ]);
    expect(out).not.toContain("=x");
    expect(out).toContain("A=1");
  });

  it("includes header comment when provided", () => {
    const out = buildEnvFromVars([{ key: "A", value: "1" }], "My header");
    expect(out).toContain("# My header");
    expect(out.indexOf("# My header")).toBeLessThan(out.indexOf("A=1"));
  });

  it("ends with a newline", () => {
    const out = buildEnvFromVars([{ key: "A", value: "1" }]);
    expect(out.endsWith("\n")).toBe(true);
  });
});

describe("env-editor: toJson", () => {
  it("emits a JSON object with all KV pairs", () => {
    const out = toJson(parseEnv("A=1\nB=hello world"));
    const parsed = JSON.parse(out);
    expect(parsed).toEqual({ A: "1", B: "hello world" });
  });

  it("ignores comments, blanks, and invalid lines", () => {
    const out = toJson(parseEnv("# c\n\nA=1\nBOGUS"));
    const parsed = JSON.parse(out);
    expect(parsed).toEqual({ A: "1" });
  });
});

describe("env-editor: toYaml", () => {
  it("emits a YAML map", () => {
    const out = toYaml(parseEnv("A=1\nB=hello"));
    expect(out).toContain('A: "1"');
    expect(out).toContain("B: hello");
  });

  it("quotes values that look like booleans or numbers", () => {
    const out = toYaml(parseEnv("A=true\nB=42"));
    expect(out).toContain('A: "true"');
    expect(out).toContain('B: "42"');
  });

  it("quotes values containing # or :", () => {
    const out = toYaml(parseEnv("A=has#hash\nB=has:colon"));
    expect(out).toContain('A: "has#hash"');
    expect(out).toContain('B: "has:colon"');
  });
});

describe("env-editor: toShell", () => {
  it("emits one `export KEY=value` per line", () => {
    const out = toShell(parseEnv("A=1\nB=hello"));
    expect(out).toContain("export A='1'");
    expect(out).toContain("export B='hello'");
  });

  it("starts with a shebang and a comment", () => {
    const out = toShell(parseEnv("A=1"));
    expect(out.startsWith("#!/usr/bin/env sh")).toBe(true);
    expect(out).toContain("# Generated by XToolBox Environment Editor");
  });

  it("escapes single quotes in values", () => {
    const out = toShell(parseEnv("A=it's"));
    expect(out).toContain("A='it'\\''s'");
  });
});

describe("env-editor: toDockerArgs", () => {
  it("emits one --env per line", () => {
    const out = toDockerArgs(parseEnv("A=1\nB=hello"));
    expect(out).toContain("--env A=1");
    expect(out).toContain("--env B=hello");
  });

  it("starts with a comment", () => {
    const out = toDockerArgs(parseEnv("A=1"));
    expect(out.startsWith("# Pass these to: docker run")).toBe(true);
  });
});

describe("env-editor: stats", () => {
  it("counts vars, comments, blanks, invalid", () => {
    const s = stats(parseEnv("# c\nA=1\nB=2\n\nBOGUS"));
    expect(s).toEqual({ vars: 2, comments: 1, blanks: 1, invalid: 1, total: 5 });
  });

  it("returns zeros for empty input", () => {
    expect(stats([])).toEqual({ vars: 0, comments: 0, blanks: 0, invalid: 0, total: 0 });
  });
});

describe("env-editor: round-trip", () => {
  it("parse -> toJson -> parse structure remains stable", () => {
    const env = 'NODE_ENV=production\nPORT=3000\nGREETING="hello world"';
    const entries = parseEnv(env);
    const json = JSON.parse(toJson(entries));
    expect(json).toEqual({ NODE_ENV: "production", PORT: "3000", GREETING: "hello world" });
  });
});
