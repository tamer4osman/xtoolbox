import { test, expect } from "@playwright/test";

test("cURL Builder tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/curl-builder");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("cURL Command Builder");

  const desc = await page.locator(".tool-description").textContent();
  expect(desc).toContain("curl");

  await expect(page.locator("#cb-url")).toBeAttached();
  await expect(page.locator("#cb-output")).toBeAttached();
  await expect(page.locator("#cb-copy")).toBeAttached();
  await expect(page.locator("#cb-add-header")).toBeAttached();

  console.log("✅ cURL Builder tool loads correctly");
});
