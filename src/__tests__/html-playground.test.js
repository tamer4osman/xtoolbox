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
  it("builds a full html document from html, css, and a script src", () => {
    const doc = composeDocument({ html: "<p>hi</p>", css: "p{color:red}", scriptSrc: "blob:xyz" });
    expect(doc).toContain("<!DOCTYPE html>");
    expect(doc).toContain("<p>hi</p>");
    expect(doc).toContain("p{color:red}");
    expect(doc).toContain('<script src="blob:xyz">');
  });

  it("omits the script element when no scriptSrc or js is given", () => {
    const doc = composeDocument({ html: "<p>hi</p>", css: "" });
    expect(doc).not.toContain("<script");
  });

  it("embeds inline js block only when js is provided and no scriptSrc", () => {
    const doc = composeDocument({ html: "", css: "", js: "throw new Error('boom')" });
    expect(doc).toContain("throw new Error('boom')");
  });

  it("handles missing css field via string coercion", () => {
    const doc = composeDocument({ html: "<b>x</b>", css: undefined });
    expect(doc).toContain("<style></style>");
  });
});

describe("buildScript", () => {
  it("prepends the listener source to the user js", () => {
    const out = buildScript("console.log(1)", "LIST;");
    expect(out).toBe("LIST;\nconsole.log(1)");
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