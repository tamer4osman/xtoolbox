import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCssGenerator } from "../tools/css/css-generator-factory.js";

function makeContainer() {
  const c = document.createElement("div");
  document.body.appendChild(c);
  return c;
}

beforeEach(() => {
  document.body.innerHTML = "";
  if (!navigator.clipboard) {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue() },
      configurable: true
    });
  } else {
    navigator.clipboard.writeText = vi.fn().mockResolvedValue();
  }
});

function build(overrides = {}) {
  const container = makeContainer();
  const onUpdate =
    overrides.onUpdate ||
    vi.fn(({ cssOutput }) => {
      cssOutput.textContent = "border-radius: 0;";
    });
  const result = createCssGenerator({
    container,
    cssClass: "test-gen",
    controlsHTML: `
      <div class="control-row">
        <label>Width</label>
        <input type="range" id="width" min="0" max="100" value="20" />
        <span id="widthVal">20px</span>
      </div>
    `,
    onUpdate,
    ...overrides
  });
  return { container, result, onUpdate };
}

describe("createCssGenerator", () => {
  it("renders container with the provided CSS class", () => {
    const { container } = build();
    expect(container.querySelector(".test-gen")).toBeTruthy();
  });

  it("renders preview, controls, and output sections", () => {
    const { container } = build();
    expect(container.querySelector("#preview")).toBeTruthy();
    expect(container.querySelector(".controls")).toBeTruthy();
    expect(container.querySelector("#cssOutput")).toBeTruthy();
    expect(container.querySelector("#copyBtn")).toBeTruthy();
  });

  it("inserts the provided controlsHTML inside .controls", () => {
    const { container } = build();
    expect(container.querySelector("#width")).toBeTruthy();
  });

  it("applies the base CSS (container max-width, controls card, output row, copyBtn)", () => {
    const { container } = build();
    const style = container.querySelector("style").textContent;
    expect(style).toContain(".test-gen");
    expect(style).toContain("max-width");
    expect(style).toContain(".controls");
    expect(style).toContain(".output");
    expect(style).toContain("#copyBtn");
  });

  it("appends extraCSS after the base CSS", () => {
    const { container } = build({ extraCSS: ".preview { background: red; }" });
    const style = container.querySelector("style").textContent;
    expect(style).toContain(".preview { background: red; }");
  });

  it("onUpdate is called on control input events", () => {
    const { container, onUpdate } = build();
    onUpdate.mockClear();
    const input = container.querySelector("#width");
    input.value = "50";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(onUpdate).toHaveBeenCalled();
    const ctx = onUpdate.mock.calls[0][0];
    expect(ctx.values.width).toBe("50");
    expect(ctx.preview).toBeTruthy();
    expect(ctx.cssOutput).toBeTruthy();
    expect(ctx.container).toBeTruthy();
  });

  it("onUpdate is called once on init", () => {
    const { onUpdate } = build();
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it('copyBtn writes cssOutput text to clipboard and shows "Copied!"', async () => {
    const onUpdate = ({ cssOutput }) => {
      cssOutput.textContent = "border-radius: 20px;";
    };
    const { container } = build({ onUpdate });
    container.querySelector("#copyBtn").click();
    await new Promise(r => setTimeout(r, 0));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("border-radius: 20px;");
    expect(container.querySelector("#copyBtn").textContent).toBe("Copied!");
  });

  it('copyBtn text reverts to "Copy" after 1500ms', async () => {
    vi.useFakeTimers();
    const { container } = build();
    container.querySelector("#copyBtn").click();
    await vi.advanceTimersByTimeAsync(0);
    expect(container.querySelector("#copyBtn").textContent).toBe("Copied!");
    await vi.advanceTimersByTimeAsync(1500);
    expect(container.querySelector("#copyBtn").textContent).toBe("Copy");
    vi.useRealTimers();
  });

  it("accepts a custom preview element", () => {
    const { container } = build({
      previewHTML: '<div id="my-preview" class="custom-preview"></div>'
    });
    expect(container.querySelector("#my-preview")).toBeTruthy();
    expect(container.querySelector("#preview")).toBeFalsy();
  });

  it("fires onUpdate on select change too", () => {
    const { container, onUpdate } = build({
      controlsHTML:
        '<div class="control-row"><select id="shape"><option value="a">A</option><option value="b">B</option></select></div>',
      onUpdate: vi.fn()
    });
    onUpdate.mockClear();
    const select = container.querySelector("#shape");
    select.value = "b";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    expect(onUpdate).toHaveBeenCalled();
    expect(onUpdate.mock.calls[0][0].values.shape).toBe("b");
  });
});
