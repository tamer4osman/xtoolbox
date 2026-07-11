import { describe, it, expect, beforeEach, vi } from "vitest";
import { render as renderQr } from "../tools/qr/qr-scanner.js";
import { render as renderBarcode } from "../tools/qr/barcode-scanner.js";

function makeContainer() {
  const c = document.createElement("div");
  document.body.appendChild(c);
  return c;
}

function makeFile(name = "test.png", type = "image/png") {
  return new File(["x"], name, { type });
}

beforeEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("qr-scanner scan flow", () => {
  it("does not call URL.createObjectURL during scan (no canvas fallback)", async () => {
    const createObjectURLSpy = vi.spyOn(URL, "createObjectURL");
    const container = makeContainer();
    const { Html5Qrcode } = await import("html5-qrcode");
    const scanFileSpy = vi
      .spyOn(Html5Qrcode.prototype, "scanFile")
      .mockRejectedValue(new Error("No code"));
    const consoleErr = vi.spyOn(console, "error").mockImplementation(() => {});

    renderQr(container);
    const input = container.querySelector("#qr-scanner-file-input");
    Object.defineProperty(input, "files", { value: [makeFile()], configurable: true });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise(r => setTimeout(r, 50));

    expect(createObjectURLSpy).not.toHaveBeenCalled();
    expect(scanFileSpy).toHaveBeenCalledTimes(1);
    expect(container.querySelector("#qr-scanner-error-message").textContent).toMatch(/no qr code/i);
    consoleErr.mockRestore();
  });
});

describe("barcode-scanner scan flow", () => {
  it("shows decoded text and format name on successful scan", async () => {
    const container = makeContainer();
    const readerEl = document.createElement("div");
    readerEl.id = "barcode-scanner-reader";
    document.body.appendChild(readerEl);
    const { Html5Qrcode } = await import("html5-qrcode");
    vi.spyOn(Html5Qrcode.prototype, "scanFileV2").mockResolvedValue({
      decodedText: "012345678905",
      result: { text: "012345678905", format: { formatName: "EAN_13" } }
    });

    renderBarcode(container);
    const input = container.querySelector("#barcode-scanner-file-input");
    Object.defineProperty(input, "files", { value: [makeFile()], configurable: true });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise(r => setTimeout(r, 50));

    expect(container.querySelector("#barcode-scanner-result-content").textContent).toBe(
      "012345678905"
    );
    expect(container.querySelector("#barcode-scanner-result-format").textContent).toBe(
      "Format: EAN_13"
    );
    expect(container.querySelector("#barcode-scanner-result").classList.contains("hidden")).toBe(
      false
    );
  });

  it("shows error when scan fails", async () => {
    const container = makeContainer();
    const readerEl = document.createElement("div");
    readerEl.id = "barcode-scanner-reader";
    document.body.appendChild(readerEl);
    const { Html5Qrcode } = await import("html5-qrcode");
    vi.spyOn(Html5Qrcode.prototype, "scanFileV2").mockRejectedValue(new Error("No code"));

    renderBarcode(container);
    const input = container.querySelector("#barcode-scanner-file-input");
    Object.defineProperty(input, "files", { value: [makeFile()], configurable: true });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise(r => setTimeout(r, 50));

    expect(container.querySelector("#barcode-scanner-error-message").textContent).toMatch(
      /no barcode/i
    );
  });
});
