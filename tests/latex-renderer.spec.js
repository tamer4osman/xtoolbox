import { test, expect } from "@playwright/test";

test("LaTeX Renderer tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/latex-renderer");

  await page.waitForSelector(".tool-header h1", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("LaTeX Renderer");

  const latexInput = await page.locator("#latex-input");
  await expect(latexInput).toBeAttached();

  const renderBtn = await page.locator("#render-btn");
  await expect(renderBtn).toBeAttached();

  const downloadBtn = await page.locator("#download-btn");
  await expect(downloadBtn).toBeAttached();

  const preview = await page.locator("#preview");
  await expect(preview).toBeAttached();

  console.log("✅ LaTeX Renderer tool loads correctly");
});
