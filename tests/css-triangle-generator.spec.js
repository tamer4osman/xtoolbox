import { test, expect } from "@playwright/test";

test("CSS Triangle Generator tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/css-triangle-generator");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Triangle");

  const dirBtns = await page.locator(".dir-btn");
  await expect(dirBtns).toHaveCount(4);

  const sizeSlider = await page.locator("#size");
  await expect(sizeSlider).toBeAttached();

  const colorPicker = await page.locator("#color");
  await expect(colorPicker).toBeAttached();

  const cssOutput = await page.locator("#cssOutput");
  await expect(cssOutput).toBeAttached();

  const copyBtn = await page.locator("#copyBtn");
  await expect(copyBtn).toBeAttached();

  console.log("✅ CSS Triangle Generator tool loads correctly");
});
