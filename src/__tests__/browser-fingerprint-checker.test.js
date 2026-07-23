import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("browser-fingerprint-checker", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.stubGlobal("crypto", {
      subtle: {
        digest: vi.fn(async () => new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]))
      },
      getRandomValues: arr => arr
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("exports toolConfig and render", async () => {
    const mod = await import(
      "../../src/tools/privacy/browser-fingerprint-checker.js"
    );
    expect(mod.toolConfig).toBeDefined();
    expect(mod.toolConfig.id).toBe("browser-fingerprint-checker");
    expect(mod.toolConfig.category).toBe("privacy");
    expect(typeof mod.render).toBe("function");
  });

  it("toolConfig has required fields", async () => {
    const mod = await import(
      "../../src/tools/privacy/browser-fingerprint-checker.js"
    );
    expect(mod.toolConfig.name).toBeTruthy();
    expect(mod.toolConfig.description).toBeTruthy();
    expect(mod.toolConfig.icon).toBeTruthy();
    expect(Array.isArray(mod.toolConfig.keywords)).toBe(true);
    expect(Array.isArray(mod.toolConfig.steps)).toBe(true);
    expect(Array.isArray(mod.toolConfig.faqs)).toBe(true);
  });

  it("render creates DOM with privacy notice and run button", async () => {
    const mod = await import(
      "../../src/tools/privacy/browser-fingerprint-checker.js"
    );
    const container = document.createElement("div");
    mod.render(container);

    expect(container.querySelector("#bfc-run")).not.toBeNull();
    expect(container.querySelector("#bfc-results").style.display).toBe(
      "none"
    );
    expect(container.querySelector(".bfc-privacy")).not.toBeNull();
    expect(container.querySelector("h1").textContent).toBe(
      "Browser Fingerprint Checker"
    );
  });

  it("clicking run button reveals results with hash and table", async () => {
    const mod = await import(
      "../../src/tools/privacy/browser-fingerprint-checker.js"
    );
    const container = document.createElement("div");
    mod.render(container);

    const btn = container.querySelector("#bfc-run");
    btn.click();
    await new Promise(r => setTimeout(r, 50));

    const results = container.querySelector("#bfc-results");
    expect(results.style.display).not.toBe("none");

    const hash = container.querySelector("#bfc-hash-value").textContent;
    expect(hash.length).toBe(16);
    expect(/^[0-9a-f]+$/.test(hash)).toBe(true);

    const rows = container.querySelectorAll("#bfc-table-body tr");
    expect(rows.length).toBeGreaterThan(10);
  });

  it("fingerprint contains expected properties", async () => {
    const mod = await import(
      "../../src/tools/privacy/browser-fingerprint-checker.js"
    );
    const container = document.createElement("div");
    mod.render(container);

    container.querySelector("#bfc-run").click();
    await new Promise(r => setTimeout(r, 50));

    const labels = Array.from(
      container.querySelectorAll("#bfc-table-body td:first-child")
    ).map(td => td.textContent);

    expect(labels).toContain("userAgent");
    expect(labels).toContain("language");
    expect(labels).toContain("platform");
    expect(labels).toContain("screenResolution");
    expect(labels).toContain("timezone");
    expect(labels).toContain("canvasHash");
    expect(labels).toContain("fontsDetected");
  });

  it("button text changes to Run Again after first run", async () => {
    const mod = await import(
      "../../src/tools/privacy/browser-fingerprint-checker.js"
    );
    const container = document.createElement("div");
    mod.render(container);

    const btn = container.querySelector("#bfc-run");
    expect(btn.textContent).toBe("Run Fingerprint Check");

    btn.click();
    await new Promise(r => setTimeout(r, 50));

    expect(btn.textContent).toBe("Run Again");
  });

  it("can run multiple times without errors", async () => {
    const mod = await import(
      "../../src/tools/privacy/browser-fingerprint-checker.js"
    );
    const container = document.createElement("div");
    mod.render(container);

    container.querySelector("#bfc-run").click();
    await new Promise(r => setTimeout(r, 50));
    container.querySelector("#bfc-run").click();
    await new Promise(r => setTimeout(r, 50));

    const rows = container.querySelectorAll("#bfc-table-body tr");
    expect(rows.length).toBeGreaterThan(10);
  });
});
