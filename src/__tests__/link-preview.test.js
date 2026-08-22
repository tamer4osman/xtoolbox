import { describe, expect, it } from "vitest";
import {
  buildApiUrl,
  buildHtmlSnippet,
  cleanup,
  extractCardData,
  extractNoembed,
  isValidHttpUrl,
  PRESETS
} from "../tools/reference/link-preview.js";
import { testToolConfig } from "./helpers/tool-config-test.js";

testToolConfig(() => import("../tools/reference/link-preview.js"), {
  id: "link-preview",
  name: "Link Preview Generator",
  category: "reference"
});

describe("isValidHttpUrl", () => {
  it("accepts http and https URLs", () => {
    expect(isValidHttpUrl("https://example.com")).toBe(true);
    expect(isValidHttpUrl("http://example.com/a?b=1")).toBe(true);
  });

  it("rejects non-http protocols and garbage", () => {
    expect(isValidHttpUrl("ftp://example.com")).toBe(false);
    expect(isValidHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isValidHttpUrl("not a url")).toBe(false);
    expect(isValidHttpUrl("")).toBe(false);
  });
});

describe("buildApiUrl", () => {
  it("encodes the target and requests palette", () => {
    const url = buildApiUrl("https://example.com/post?a=1&b=2");
    expect(url).toContain("https://api.microlink.io?url=");
    expect(url).toContain(encodeURIComponent("https://example.com/post?a=1&b=2"));
    expect(url.endsWith("&palette=true")).toBe(true);
  });

  it("throws on empty input or unusable hosts", () => {
    expect(() => buildApiUrl("")).toThrow(/valid http/i);
    expect(() => buildApiUrl("   ")).toThrow(/valid http/i);
    expect(() => buildApiUrl("https://")).toThrow(/valid http/i);
  });

  it("preserves scheme-less targets by prefixing https", () => {
    const url = buildApiUrl("example.com");
    expect(url).toContain(encodeURIComponent("https://example.com"));
  });
});

describe("extractCardData", () => {
  it("normalizes a full microlink payload", () => {
    const card = extractCardData({
      data: {
        title: "T",
        description: "D",
        publisher: "Pub",
        image: { url: "img.png" },
        logo: { url: "logo.png" },
        url: "https://x",
        palette: ["#123456", "#654321"],
        lang: "en"
      }
    });
    expect(card).toEqual({
      title: "T",
      description: "D",
      publisher: "Pub",
      imageUrl: "img.png",
      logoUrl: "logo.png",
      url: "https://x",
      palette: "#123456",
      lang: "en"
    });
  });

  it("falls back gracefully on sparse payloads", () => {
    const card = extractCardData({ data: {} });
    expect(card.title).toBe("Untitled");
    expect(card.description).toBe("");
    expect(card.imageUrl).toBe("");
    expect(card.palette).toBeNull();
  });

  it("accepts string image fields", () => {
    const card = extractCardData({ data: { image: "a.png", logo: null } });
    expect(card.imageUrl).toBe("a.png");
    expect(card.logoUrl).toBe("");
  });
});

describe("buildHtmlSnippet", () => {
  it("renders anchor with optional img and description", () => {
    const full = buildHtmlSnippet({
      title: "T&D",
      description: "desc",
      imageUrl: "i.png",
      url: "https://x"
    });
    expect(full).toContain('<a href="https://x"');
    expect(full).toContain('<img src="i.png"');
    expect(full).toContain("<strong>T&amp;D</strong>");
    expect(full).toContain("<p>desc</p>");
  });

  it("omits empty parts", () => {
    const minimal = buildHtmlSnippet({
      title: "Only",
      description: "",
      imageUrl: "",
      url: "https://y"
    });
    expect(minimal).not.toContain("<img");
    expect(minimal).not.toContain("<p>");
    expect(minimal).toContain("Only");
  });
});

describe("extractNoembed", () => {
  it("normalizes a noembed payload", () => {
    const card = extractNoembed({
      title: "Video",
      provider_name: "YouTube",
      thumbnail_url: "t.jpg",
      url: "https://youtu.be/x"
    });
    expect(card).toMatchObject({ title: "Video", publisher: "YouTube", imageUrl: "t.jpg" });
    expect(card.description).toBe("");
  });

  it("throws on error payloads", () => {
    expect(() => extractNoembed({ error: "bad" })).toThrow(/noembed/);
    expect(() => extractNoembed(null)).toThrow(/noembed/);
  });
});

describe("misc", () => {
  it("ships three preset URLs that are all valid", () => {
    expect(PRESETS.length).toBeGreaterThanOrEqual(3);
    PRESETS.forEach(p => expect(isValidHttpUrl(p)).toBe(true));
  });

  it("cleanup is safe to call repeatedly", () => {
    expect(() => {
      cleanup();
      cleanup();
    }).not.toThrow();
  });
});
