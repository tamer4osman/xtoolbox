import { test, expect } from "@playwright/test";

test("Palindrome Checker tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/palindrome");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Palindrome Checker");

  await expect(page.locator("#pc-input")).toBeAttached();
  await expect(page.locator("#pc-result")).toBeAttached();
  await expect(page.locator("#pc-compare")).toBeAttached();

  console.log("✅ Palindrome Checker tool loads correctly");
});
