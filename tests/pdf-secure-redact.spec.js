import { test, expect } from "@playwright/test";

test("PDF Secure Destructive Redactor tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/pdf-secure-redact");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("PDF Visual Redactor");

  const uploadArea = await page.locator(".tool-upload-area");
  await expect(uploadArea).toBeVisible();

  const applyBtn = await page.locator("#apply-redact-btn");
  await expect(applyBtn).toBeAttached();
  await expect(applyBtn).toHaveText("Apply Redactions");

  console.log("✅ PDF Secure Destructive Redactor tool loads correctly");
});
