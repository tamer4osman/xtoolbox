import { test, expect } from "@playwright/test";

test("Legal Clause Simplifier loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/legal-clause-simplifier");
  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Legal");

  const legalText = page.locator("#legal-text");
  await expect(legalText).toBeVisible();

  const simplifyBtn = page.locator("#simplify-btn");
  await expect(simplifyBtn).toBeVisible();
  await expect(simplifyBtn).toHaveText("Simplify");

  const plainText = page.locator("#plain-text");
  await expect(plainText).toBeVisible();

  console.log("✅ Legal Clause Simplifier tool loads correctly");
});
