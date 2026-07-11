import { test, expect } from "@playwright/test";

test("Offline Translator loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/offline-translator");
  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Translator");

  const srcLang = page.locator("#src-lang");
  await expect(srcLang).toBeVisible();

  const tgtLang = page.locator("#tgt-lang");
  await expect(tgtLang).toBeVisible();

  const srcText = page.locator("#src-text");
  await expect(srcText).toBeVisible();

  const translateBtn = page.locator("#translate-btn");
  await expect(translateBtn).toBeVisible();
  await expect(translateBtn).toHaveText("Translate");

  console.log("✅ Offline Translator tool loads correctly");
});
