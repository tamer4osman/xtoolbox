import { test, expect } from "@playwright/test";

test("CSS Glassmorphism Studio tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/glassmorphism-generator");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Glassmorphism");

  const desc = await page.locator(".tool-description").textContent();
  expect(desc).toContain("glass");

  const preview = page.locator(".gg-preview-area");
  await expect(preview).toBeVisible();

  const card = page.locator(".gg-card");
  await expect(card).toBeVisible();

  const cssOutput = page.locator("#gg-css");
  await expect(cssOutput).toBeAttached();

  const copyBtn = page.locator("#gg-copy");
  await expect(copyBtn).toBeAttached();

  const blurSlider = page.locator("#gg-blur");
  await expect(blurSlider).toBeAttached();

  const opacitySlider = page.locator("#gg-opacity");
  await expect(opacitySlider).toBeAttached();

  const bgSelect = page.locator("#gg-bg");
  await expect(bgSelect).toBeAttached();

  const safariCheckbox = page.locator("#gg-safari");
  await expect(safariCheckbox).toBeChecked();

  console.log("✅ CSS Glassmorphism Studio tool loads correctly");
});

test("CSS Glassmorphism Studio updates CSS on slider change", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/glassmorphism-generator");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const blurSlider = page.locator("#gg-blur");
  await blurSlider.fill("25");
  await page.waitForTimeout(100);

  const cssText = await page.locator("#gg-css").inputValue();
  expect(cssText).toContain("blur(25px)");
  expect(cssText).toContain(".glass");
  expect(cssText).toContain("backdrop-filter");
  expect(cssText).toContain("-webkit-backdrop-filter");

  console.log("✅ CSS Glassmorphism Studio updates correctly");
});

test("CSS Glassmorphism Studio toggles Safari fallback", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/glassmorphism-generator");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const safariCheckbox = page.locator("#gg-safari");
  await expect(safariCheckbox).toBeChecked();

  await safariCheckbox.uncheck();
  await page.waitForTimeout(100);

  const cssText = await page.locator("#gg-css").inputValue();
  expect(cssText).not.toContain("-webkit-backdrop-filter");

  console.log("✅ CSS Glassmorphism Safari fallback toggle works");
});
