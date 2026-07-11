import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../utils/file.js", async () => {
  const actual = await vi.importActual("../utils/file.js");
  return {
    ...actual,
    downloadBlob: vi.fn(),
    formatFileSize: actual.formatFileSize
  };
});

import { createPdfConverter } from "../tools/pdf/pdf-converter-factory.js";
import { downloadBlob } from "../utils/file.js";

function makeContainer() {
  const c = document.createElement("div");
  document.body.appendChild(c);
  return c;
}

beforeEach(() => {
  document.body.innerHTML = "";
  downloadBlob.mockClear();
});

function build(overrides = {}) {
  const container = makeContainer();
  const convert =
    overrides.convert || vi.fn(async () => new Blob(["x"], { type: "application/octet-stream" }));
  const result = createPdfConverter({
    container,
    toolId: "test-pdf",
    accept: ".pdf",
    maxSizeMB: 50,
    convertButtonText: "Convert to Format",
    progressMessage: "Converting...",
    successMessage: "Converted!",
    outputExt: "fmt",
    outputMime: "application/octet-stream",
    convert,
    ...overrides
  });
  return { container, result, convert };
}

describe("createPdfConverter", () => {
  it("renders the scaffold with upload area, file panel, convert button, processing", () => {
    const { container } = build();
    expect(container.querySelector("#test-pdf-upload-area")).toBeTruthy();
    expect(container.querySelector("#test-pdf-file-panel")).toBeTruthy();
    expect(container.querySelector("#test-pdf-convert-btn")).toBeTruthy();
    expect(container.querySelector("#test-pdf-processing")).toBeTruthy();
    expect(container.querySelector("#test-pdf-progress-pct")).toBeTruthy();
  });

  it("hides file panel, convert button, processing initially", () => {
    const { container } = build();
    expect(container.querySelector("#test-pdf-file-panel").style.display).toBe("none");
    expect(container.querySelector("#test-pdf-convert-btn").style.display).toBe("none");
    expect(container.querySelector("#test-pdf-processing").style.display).toBe("none");
  });

  it("inserts extraHTML before the convert button area", () => {
    const { container } = build({ extraHTML: '<div class="info-box">A note</div>' });
    expect(container.querySelector(".info-box")).toBeTruthy();
    expect(container.querySelector(".info-box").textContent).toBe("A note");
  });

  it("file selection shows panel, button, and populates file name/size", async () => {
    const { container } = build();
    const file = new File(["x"], "test.pdf", { type: "application/pdf" });
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { files: [file] },
      configurable: true
    });
    container.querySelector(".file-upload-dropzone").dispatchEvent(dropEvent);
    await new Promise(r => setTimeout(r, 30));

    expect(container.querySelector("#test-pdf-file-panel").style.display).toBe("block");
    expect(container.querySelector("#test-pdf-convert-btn").style.display).toBe("inline-flex");
    expect(container.querySelector("#test-pdf-file-name").textContent).toBe("test.pdf");
  });

  it("on convert click, calls convert with file and a progress helper, then downloads blob", async () => {
    const convert = vi.fn(async (file, onProgress) => {
      onProgress(50);
      return new Blob(["result"], { type: "application/octet-stream" });
    });
    const { container } = build({ convert });
    const file = new File(["x"], "mydoc.pdf", { type: "application/pdf" });
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { files: [file] },
      configurable: true
    });
    container.querySelector(".file-upload-dropzone").dispatchEvent(dropEvent);
    await new Promise(r => setTimeout(r, 30));

    container.querySelector("#test-pdf-convert-btn").click();
    await new Promise(r => setTimeout(r, 30));

    expect(convert).toHaveBeenCalledTimes(1);
    const [passedFile, onProgress] = convert.mock.calls[0];
    expect(passedFile).toBe(file);
    expect(typeof onProgress).toBe("function");
    onProgress(75);
    expect(container.querySelector("#test-pdf-progress-pct").textContent).toBe("75");
  });

  it("uses the configured outputExt for the downloaded filename", async () => {
    const { container } = build({ outputExt: "docx" });
    const file = new File(["x"], "doc.pdf", { type: "application/pdf" });
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { files: [file] },
      configurable: true
    });
    container.querySelector(".file-upload-dropzone").dispatchEvent(dropEvent);
    await new Promise(r => setTimeout(r, 30));

    container.querySelector("#test-pdf-convert-btn").click();
    await new Promise(r => setTimeout(r, 30));

    expect(downloadBlob).toHaveBeenCalled();
    expect(downloadBlob.mock.calls[0][1]).toBe("doc.docx");
  });

  it("shows processing and hides button/panel during convert", async () => {
    let resolveConvert;
    const convert = vi.fn(
      () =>
        new Promise(r => {
          resolveConvert = r;
        })
    );
    const { container } = build({ convert });
    const file = new File(["x"], "x.pdf", { type: "application/pdf" });
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { files: [file] },
      configurable: true
    });
    container.querySelector(".file-upload-dropzone").dispatchEvent(dropEvent);
    await new Promise(r => setTimeout(r, 30));

    container.querySelector("#test-pdf-convert-btn").click();
    await new Promise(r => setTimeout(r, 10));

    expect(container.querySelector("#test-pdf-processing").style.display).toBe("block");
    expect(container.querySelector("#test-pdf-convert-btn").style.display).toBe("none");
    expect(container.querySelector("#test-pdf-file-panel").style.display).toBe("none");

    resolveConvert(new Blob(["x"]));
    await new Promise(r => setTimeout(r, 30));
    expect(container.querySelector("#test-pdf-processing").style.display).toBe("none");
  });
});
