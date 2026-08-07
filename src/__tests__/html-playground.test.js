import { describe, it, expect } from "vitest";
import {
  composeDocument,
  buildScript,
  toScriptSrc,
  formatConsoleMessage,
  encodePayload,
  decodePayload
} from "../tools/dev/html-playground.js";

describe("composeDocument", () => {
  it("builds a full html document from html, css, and script srcs", () => {
    const doc = composeDocument({
      html: "<p>hi</p>",
      css: "p{color:red}",
      scripts: ["blob:1", "blob:2"]
    });
    expect(doc).toContain("<!DOCTYPE html>");
    expect(doc).toContain("<p>hi</p>");
    expect(doc).toContain("p{color:red}");
    expect(doc).toContain('<script src="blob:1">');
    expect(doc).toContain('<script src="blob:2">');
  });

  it("emits one script element per src, in order", () => {
    const doc = composeDocument({ html: "", css: "", scripts: ["blob:listener", "blob:user"] });
    expect(doc.indexOf('<script src="blob:listener">')).toBeLessThan(
      doc.indexOf('<script src="blob:user">')
    );
  });

  it("omits the script elements when no scripts are given", () => {
    const doc = composeDocument({ html: "<p>hi</p>", css: "" });
    expect(doc).not.toContain("<script");
  });

  it("handles missing css field via string coercion", () => {
    const doc = composeDocument({ html: "<b>x</b>", css: undefined });
    expect(doc).toContain("<style></style>");
  });
});

describe("buildScript", () => {
  it("returns the user js as-is", () => {
    expect(buildScript("console.log(1)")).toBe("console.log(1)");
  });

  it("returns empty string for no js", () => {
    expect(buildScript("")).toBe("");
    expect(buildScript(undefined)).toBe("");
  });
});

describe("toScriptSrc", () => {
  it("creates an object url from a blob of script code", () => {
    const original = URL.createObjectURL;
    URL.createObjectURL = () => "blob:mock";
    expect(toScriptSrc("x")).toBe("blob:mock");
    if (original) {
      URL.createObjectURL = original;
    } else {
      delete URL.createObjectURL;
    }
  });
});

describe("formatConsoleMessage", () => {
  it("returns the string for a string message", () => {
    expect(formatConsoleMessage("boom")).toBe("boom");
  });

  it("returns a friendly placeholder for empty/null messages", () => {
    expect(formatConsoleMessage("")).toBe("(empty message)");
    expect(formatConsoleMessage(null)).toBe("(empty message)");
  });

  it("serializes objects as pretty json", () => {
    expect(formatConsoleMessage({ a: 1 })).toBe('{\n  "a": 1\n}');
  });

  it("falls back to String for unserializable objects", () => {
    const circular = {};
    circular.self = circular;
    expect(formatConsoleMessage(circular)).toBe(String(circular));
  });
});

describe("encodePayload / decodePayload", () => {
  it("round-trips an object", () => {
    const value = { html: "<div>", css: "a{}", js: "let x=1" };
    expect(decodePayload(encodePayload(value))).toEqual(value);
  });

  it("handles unicode characters", () => {
    const value = { html: "<p>héllo 🌐</p>", css: "", js: "" };
    expect(decodePayload(encodePayload(value))).toEqual(value);
  });

  it("throws on invalid base64", () => {
    expect(() => decodePayload("not-valid!!")).toThrow();
  });
});
