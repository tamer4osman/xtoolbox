import { describe, it, expect, beforeEach, vi } from "vitest";
import { createCodecTool } from "../tools/text/codec-factory.js";

describe("codec-factory", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    container.innerHTML = `
      <textarea id="input"></textarea>
      <textarea id="output"></textarea>
      <button id="encode-btn">Encode</button>
      <button id="decode-btn">Decode</button>
      <button id="copy-btn">Copy</button>
      <button id="clear-btn">Clear</button>
    `;
    document.body.appendChild(container);
    return () => document.body.removeChild(container);
  });

  it("returns an init function", () => {
    const init = createCodecTool({
      inputId: "input",
      outputId: "output",
      encodeId: "encode-btn",
      decodeId: "decode-btn",
      copyId: "copy-btn",
      clearId: "clear-btn",
      encode: s => s.toUpperCase(),
      decode: s => s.toLowerCase()
    });
    expect(typeof init).toBe("function");
  });

  it("encodes input on encode button click", () => {
    const init = createCodecTool({
      inputId: "input",
      outputId: "output",
      encodeId: "encode-btn",
      decodeId: "decode-btn",
      copyId: "copy-btn",
      clearId: "clear-btn",
      encode: s => s.toUpperCase(),
      decode: s => s.toLowerCase()
    });
    init();
    container.querySelector("#input").value = "hello";
    container.querySelector("#encode-btn").click();
    expect(container.querySelector("#output").value).toBe("HELLO");
  });

  it("decodes input on decode button click", () => {
    const init = createCodecTool({
      inputId: "input",
      outputId: "output",
      encodeId: "encode-btn",
      decodeId: "decode-btn",
      copyId: "copy-btn",
      clearId: "clear-btn",
      encode: s => s.toUpperCase(),
      decode: s => s.toLowerCase()
    });
    init();
    container.querySelector("#input").value = "HELLO";
    container.querySelector("#decode-btn").click();
    expect(container.querySelector("#output").value).toBe("hello");
  });

  it("shows error when encode throws", () => {
    const init = createCodecTool({
      inputId: "input",
      outputId: "output",
      encodeId: "encode-btn",
      decodeId: "decode-btn",
      copyId: "copy-btn",
      clearId: "clear-btn",
      encode: () => {
        throw new Error("bad input");
      },
      decode: s => s
    });
    init();
    container.querySelector("#input").value = "x";
    container.querySelector("#encode-btn").click();
    expect(container.querySelector("#output").value).toBe("Error: bad input");
  });

  it("clears input and output on clear button click", () => {
    const init = createCodecTool({
      inputId: "input",
      outputId: "output",
      encodeId: "encode-btn",
      decodeId: "decode-btn",
      copyId: "copy-btn",
      clearId: "clear-btn",
      encode: s => s,
      decode: s => s
    });
    init();
    container.querySelector("#input").value = "test";
    container.querySelector("#output").value = "result";
    container.querySelector("#clear-btn").click();
    expect(container.querySelector("#input").value).toBe("");
    expect(container.querySelector("#output").value).toBe("");
  });

  it("auto-encodes on input when onInput is not decode", () => {
    const init = createCodecTool({
      inputId: "input",
      outputId: "output",
      encodeId: "encode-btn",
      decodeId: "decode-btn",
      copyId: "copy-btn",
      clearId: "clear-btn",
      encode: s => s.toUpperCase(),
      decode: s => s.toLowerCase(),
      onInput: "encode"
    });
    init();
    const input = container.querySelector("#input");
    input.value = "abc";
    input.dispatchEvent(new Event("input"));
    expect(container.querySelector("#output").value).toBe("ABC");
  });

  it("auto-decodes on input when onInput is decode", () => {
    const init = createCodecTool({
      inputId: "input",
      outputId: "output",
      encodeId: "encode-btn",
      decodeId: "decode-btn",
      copyId: "copy-btn",
      clearId: "clear-btn",
      encode: s => s.toUpperCase(),
      decode: s => s.toLowerCase(),
      onInput: "decode"
    });
    init();
    const input = container.querySelector("#input");
    input.value = "ABC";
    input.dispatchEvent(new Event("input"));
    expect(container.querySelector("#output").value).toBe("abc");
  });

  it("returns early when elements are missing", () => {
    const init = createCodecTool({
      inputId: "nonexistent",
      outputId: "nonexistent",
      encodeId: null,
      decodeId: null,
      copyId: null,
      clearId: null,
      encode: s => s,
      decode: s => s
    });
    expect(() => init()).not.toThrow();
  });
});
