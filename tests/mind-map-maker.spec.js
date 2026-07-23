import { test, expect } from "@playwright/test";

test("mind-map-maker loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/mind-map-maker");

  await page.waitForSelector(".tool-header h1", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Mind Map Maker");

  const svg = await page.locator("#mmm-svg");
  await expect(svg).toBeAttached();

  const addChildBtn = await page.locator("#mmm-add-child");
  await expect(addChildBtn).toBeAttached();

  const deleteBtn = await page.locator("#mmm-delete");
  await expect(deleteBtn).toBeAttached();

  const swatches = await page.locator(".mmm-color-swatch").count();
  expect(swatches).toBe(8);

  console.log("✅ Mind Map Maker tool loads correctly");
});
