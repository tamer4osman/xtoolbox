import { test, expect } from "@playwright/test";

test("html-playground renders header and editor controls", async ({ page }) => {
  await page.goto("/#/tools/html-playground");
  await expect(page.locator("h1")).toContainText("HTML Playground");
  await expect(page.locator(".hp-tab")).toHaveCount(3);
  await expect(page.locator("#hp-frame")).toBeVisible();
  await expect(page.locator("#hp-share")).toBeVisible();
});

test("html-playground switches editor tabs and renders preview", async ({ page }) => {
  await page.goto("/#/tools/html-playground");
  await expect(page.locator("#hp-frame")).toBeVisible();

  await page.locator('.hp-tab[data-lang="css"]').click();
  await expect(page.locator('.hp-tab[data-lang="css"]')).toHaveClass(/active/);

  await page.locator('.hp-tab[data-lang="js"]').click();
  await expect(page.locator('.hp-tab[data-lang="js"]')).toHaveClass(/active/);

  await page.locator("#hp-console-toggle").click();
  await expect(page.locator("#hp-console")).toHaveClass(/visible/);
});

test("html-playground renders updated preview and bridges console messages", async ({ page }) => {
  await page.goto("/#/tools/html-playground");
  await expect(page.locator("#hp-frame")).toBeVisible();

  // Set HTML and JS through the CodeMirror instances (mount order: html, css, js)
  await page.evaluate(() => {
    const wraps = Array.from(document.querySelectorAll("#hp-editor .CodeMirror"));
    wraps[0].CodeMirror.setValue('<p id="probe">HELLO_PROBE</p>');
    wraps[2].CodeMirror.setValue('console.log("BRIDGE_CALL");');
    wraps[2].CodeMirror.save();
  });

  // Reveal the console so the assertion targets a visible entry
  await page.locator("#hp-console-toggle").click();

  // Debounced preview render reflects the new HTML inside the sandboxed iframe
  const frame = page.locator("#hp-frame");
  await expect(frame.contentFrame().locator("#probe")).toHaveText("HELLO_PROBE", {
    timeout: 10000
  });

  // Console-message bridge: user console.log reaches the parent _Console panel
  await expect(page.locator("#hp-console-out .hp-entry-info")).toContainText("BRIDGE_CALL", {
    timeout: 10000
  });
});
