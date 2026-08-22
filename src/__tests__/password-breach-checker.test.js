import { beforeEach, describe, expect, it, vi } from "vitest";
import { RateLimitError } from "../utils/safe-fetch.js";

const mockSafeFetch = vi.fn();
vi.mock("../utils/safe-fetch.js", async importOriginal => {
  const actual = await importOriginal();
  return { ...actual, safeFetch: args => mockSafeFetch(args) };
});

const { buildRangeUrl, checkPassword, parseRangeResponse, sha1Hex, toolConfig, verdictFor } =
  await import("../tools/privacy/password-breach-checker.js");
const { testToolConfig } = await import("./helpers/tool-config-test.js");

testToolConfig(() => import("../tools/privacy/password-breach-checker.js"), {
  id: "password-breach-checker",
  name: "Password Breach Checker",
  category: "privacy"
});

describe("sha1Hex", () => {
  it("matches known SHA-1 vectors", async () => {
    expect(await sha1Hex("password")).toBe("5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8");
    expect(await sha1Hex("")).toBe("DA39A3EE5E6B4B0D3255BFEF95601890AFD80709");
  });
});

describe("buildRangeUrl", () => {
  it("uppercases a valid 5-char prefix", () => {
    expect(buildRangeUrl("5baa6")).toBe("https://api.pwnedpasswords.com/range/5BAA6");
  });

  it("rejects malformed prefixes", () => {
    expect(() => buildRangeUrl("abc")).toThrow(/5 hex/);
    expect(() => buildRangeUrl("5BAA6X")).toThrow(/5 hex/);
    expect(() => buildRangeUrl("")).toThrow(/5 hex/);
  });
});

describe("parseRangeResponse", () => {
  it("parses suffix:count lines and tolerates padding noise", () => {
    const map = parseRangeResponse("0018A45C4D1DEF816XXX: 2\nFE5BD1F1EED067214B6F: 104\n\n");
    expect(map.get("0018A45C4D1DEF816XXX")).toBe(2);
    expect(map.get("FE5BD1F1EED067214B6F")).toBe(104);
    expect(map.size).toBe(2);
  });

  it("skips malformed lines", () => {
    expect(parseRangeResponse("garbage\n:nocount\nGOOD:5").get("GOOD")).toBe(5);
  });
});

describe("checkPassword", () => {
  beforeEach(() => {
    mockSafeFetch.mockReset();
  });

  it("returns the matching count for a pwned password", async () => {
    mockSafeFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "1E4C9B93F3F0682250B6CF8331B7EE68FD8: 3730471"
    });
    const r = await checkPassword("password");
    expect(r.prefix).toBe("5BAA6");
    expect(r.suffix).toBe("1E4C9B93F3F0682250B6CF8331B7EE68FD8");
    expect(r.count).toBe(3730471);
    expect(mockSafeFetch).toHaveBeenCalledWith("https://api.pwnedpasswords.com/range/5BAA6");
  });

  it("returns zero for an unknown password", async () => {
    mockSafeFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF: 12"
    });
    const r = await checkPassword("definitely-not-in-corpus-xyz");
    expect(r.count).toBe(0);
  });

  it("surfaces HTTP failures", async () => {
    mockSafeFetch.mockResolvedValue({ ok: false, status: 503, text: async () => "" });
    await expect(checkPassword("x")).rejects.toThrow(/HTTP 503/);
  });
});

describe("verdictFor", () => {
  it("classifies safe, warn and critical bands", () => {
    expect(verdictFor(0).level).toBe("safe");
    expect(verdictFor(1).level).toBe("warn");
    expect(verdictFor(50).level).toBe("warn");
    expect(verdictFor(101).level).toBe("critical");
    expect(verdictFor(3730471).title).toMatch(/3,730,471 occurrences/);
  });
});

describe("misc", () => {
  it("RateLimitError import still intact for render path", () => {
    expect(new RateLimitError("d", 1000)).toBeInstanceOf(Error);
  });
});
