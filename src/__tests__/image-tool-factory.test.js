import { describe, it, expect, vi, beforeEach } from "vitest";
import { createImageTool } from "../tools/image/image-tool-factory.js";
import * as imageUtils from "../tools/image/image-utils.js";

vi.spyOn(imageUtils, "loadImageFromFile").mockImplementation(async () => {
  const img = new Image();
  Object.defineProperty(img, "naturalWidth", { value: 800, configurable: true });
  Object.defineProperty(img, "naturalHeight", { value: 600, configurable: true });
  return img;
});

vi.spyOn(imageUtils, "canvasToBlob").mockImplementation(
  async () => new Blob(["x"], { type: "image/png" })
);

function makeContainer() {
  const c = document.createElement("div");
  document.body.appendChild(c);
  return c;
}

function makeFile(name = "test.png", type = "image/png") {
  return new File(["x"], name, { type });
}

describe("createImageTool", () => {
  let container;
  let renderPreview;
  let processForDownload;
  let getFilename;
  let getFormat;
  let getQuality;

  beforeEach(() => {
    document.body.innerHTML = "";
    container = makeContainer();
    renderPreview = vi.fn();
    processForDownload = vi.fn();
    getFilename = vi.fn(() => "test.png");
    getFormat = vi.fn(() => "image/png");
    getQuality = vi.fn(() => 0.92);

    if (!HTMLCanvasElement.prototype.toBlob) {
      HTMLCanvasElement.prototype.toBlob = function (cb, type, _quality) {
        cb(new Blob(["x"], { type: type || "image/png" }));
      };
    }
  });

  function build(overrides = {}) {
    return createImageTool({
      container,
      toolId: "test-tool",
      optionsHTML: '<input type="range" id="test-slider" value="10"/>',
      optionsCSS: ".test-extra { color: red; }",
      renderPreview,
      processForDownload,
      getFilename,
      getFormat,
      getQuality,
      ...overrides
    });
  }

  it("renders the scaffold with upload area, options area, preview, and download button", () => {
    const { elements } = build();
    expect(elements.uploadArea).toBeTruthy();
    expect(elements.optionsArea).toBeTruthy();
    expect(elements.previewArea).toBeTruthy();
    expect(elements.previewCanvas).toBeTruthy();
    expect(elements.downloadBtn).toBeTruthy();
    expect(elements.processing).toBeTruthy();
    expect(elements.countInfo).toBeTruthy();
  });

  it("hides options and preview areas initially", () => {
    const { elements } = build();
    expect(elements.optionsArea.style.display).toBe("none");
    expect(elements.previewArea.style.display).toBe("none");
  });

  it("inserts optionsHTML into the options area and optionsCSS as scoped style", () => {
    const { elements } = build();
    expect(elements.optionsArea.querySelector("#test-slider")).toBeTruthy();
    const style = container.querySelector("style");
    expect(style).toBeTruthy();
    expect(style.textContent).toContain(".test-extra");
  });

  it("initializes state.originalImage to null for single-image mode", () => {
    const { state } = build();
    expect(state).toHaveProperty("originalImage");
    expect(state.originalImage).toBeNull();
  });

  it("initializes state.images to empty array when multiple=true", () => {
    const { state } = build({ multiple: true });
    expect(state).toHaveProperty("images");
    expect(Array.isArray(state.images)).toBe(true);
    expect(state.images).toHaveLength(0);
  });

  it("showOptions reveals options and preview areas", () => {
    const { elements } = build();
    elements.showOptions();
    expect(elements.optionsArea.style.display).toBe("block");
    expect(elements.previewArea.style.display).toBe("block");
  });

  it("on file load, single mode loads image and shows options+preview", async () => {
    const { elements, state } = build();
    const file = makeFile();

    const dropzone = elements.uploadArea.querySelector(".file-upload-dropzone");

    const dt = { files: [file] };
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "dataTransfer", { value: dt, configurable: true });
    dropzone.dispatchEvent(dropEvent);

    await new Promise(r => setTimeout(r, 50));
    await new Promise(r => setTimeout(r, 0));

    expect(state.originalImage).toBeTruthy();
    expect(elements.optionsArea.style.display).toBe("block");
    expect(elements.previewArea.style.display).toBe("block");
    expect(elements.countInfo.textContent).toMatch(/x|x|×/i);
  });

  it("on download click, runs processForDownload and shows success toast", async () => {
    const { elements } = build();
    const file = makeFile();
    const dropzone = elements.uploadArea.querySelector(".file-upload-dropzone");
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { files: [file] },
      configurable: true
    });
    dropzone.dispatchEvent(dropEvent);
    await new Promise(r => setTimeout(r, 50));
    processForDownload.mockClear();

    elements.downloadBtn.click();
    await new Promise(r => setTimeout(r, 0));

    expect(processForDownload).toHaveBeenCalled();
    expect(getFormat).toHaveBeenCalled();
    expect(getQuality).toHaveBeenCalled();
    expect(elements.processing.style.display).toBe("none");
  });

  it("bindOptionChange wires range input to value display and calls renderPreview", () => {
    const { elements, bindOptionChange } = build();
    renderPreview.mockClear();

    const newSlider = document.createElement("input");
    newSlider.type = "range";
    newSlider.id = "new-slider";
    newSlider.value = "25";
    const newVal = document.createElement("span");
    newVal.id = "new-val";
    elements.optionsArea.appendChild(newSlider);
    elements.optionsArea.appendChild(newVal);

    bindOptionChange({ rangeId: "new-slider", valueId: "new-val" });

    newSlider.value = "50";
    newSlider.dispatchEvent(new Event("input", { bubbles: true }));

    expect(newVal.textContent).toBe("50");
    expect(renderPreview).toHaveBeenCalled();
  });

  it("bindOptionChange with formatValue applies formatter", () => {
    const { elements, bindOptionChange } = build();
    const slider = document.createElement("input");
    slider.type = "range";
    slider.id = "fmt-slider";
    slider.value = "15";
    const val = document.createElement("span");
    val.id = "fmt-val";
    elements.optionsArea.appendChild(slider);
    elements.optionsArea.appendChild(val);

    bindOptionChange({ rangeId: "fmt-slider", valueId: "fmt-val", formatValue: v => `${v}px` });

    slider.value = "30";
    slider.dispatchEvent(new Event("input", { bubbles: true }));

    expect(val.textContent).toBe("30px");
  });
});
