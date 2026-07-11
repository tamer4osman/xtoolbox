import { test, expect } from "@playwright/test";

test("Image Filter Gallery tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/image-filters");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Image Filter Gallery");

  const desc = await page.locator(".tool-description").textContent();
  expect(desc).toContain("filter");

  const uploadArea = await page.locator(".tool-upload-area");
  await expect(uploadArea).toBeAttached();

  console.log("✅ Image Filter Gallery tool loads correctly");
});
