import { test, expect } from "@playwright/test";

test("JWT Decoder tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/jwt-decoder");

  await page.waitForSelector(".tool-header h1", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("JWT Decoder");

  const jwtInput = await page.locator("#jwt-input");
  await expect(jwtInput).toBeAttached();

  const jwtOutput = await page.locator("#jwt-output");
  await expect(jwtOutput).toBeAttached();

  const sections = await page.locator(".jwt-section");
  await expect(sections).toHaveCount(3);

  console.log("✅ JWT Decoder tool loads correctly");
});
