import { test, expect } from "@playwright/test";

test("Hash Generator tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/hash-generator");

  await page.waitForSelector(".tool-header h1", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Hash Generator");

  const input = await page.locator("#input");
  await expect(input).toBeAttached();

  const hashBtns = await page.locator(".hash-btn");
  await expect(hashBtns).toHaveCount(5);

  const output = await page.locator("#output");
  await expect(output).toBeAttached();

  const copyBtn = await page.locator("#copy-btn");
  await expect(copyBtn).toBeAttached();

  console.log("✅ Hash Generator tool loads correctly");
});
