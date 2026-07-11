import { test, expect } from "@playwright/test";

test("Subnet Calculator tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/subnet-calculator");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("IP Subnet Calculator");

  const desc = await page.locator(".tool-description").textContent();
  expect(desc).toContain("network address");

  const input = await page.locator("#sc-input");
  await expect(input).toBeAttached();

  const calcBtn = await page.locator("#sc-calc");
  await expect(calcBtn).toBeAttached();

  const results = await page.locator("#sc-results");
  await expect(results).toBeAttached();

  console.log("✅ Subnet Calculator tool loads correctly");
});
