import { test, expect } from "@playwright/test";

test("SVG Icon Editor tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/svg-icon-editor");

  await page.waitForSelector(".tool-container", { timeout: 5000 });

  const title = await page.locator("h1").textContent();
  expect(title).toContain("SVG");

  await expect(page.locator("#icon-editor")).toBeAttached();
  await expect(page.locator("#svg-file-input")).toBeAttached();
  await expect(page.locator("#svg-paste-input")).toBeAttached();

  console.log("✅ SVG Icon Editor tool loads correctly");
});
