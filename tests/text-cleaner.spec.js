import { test, expect } from "@playwright/test";

test("Text Cleaner tool loads and works", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/text-cleaner");
  await page.waitForSelector(".tool-container", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Text Cleaner");

  const input = page.locator("#input");
  const output = page.locator("#output");

  await input.fill("  hello   world  \n\n  ");
  await page.locator("#trimBtn").click();
  await expect(output).toHaveValue("hello   world");

  await input.fill("  hello    world  ");
  await page.locator("#removeExtraBtn").click();
  await expect(output).toHaveValue("hello world");

  await input.fill("a\n\nb");
  await page.locator("#removeLinesBtn").click();
  await expect(output).toHaveValue("a\nb");

  await input.fill("c\na\nb");
  await page.locator("#sortLinesBtn").click();
  await expect(output).toHaveValue("a\nb\nc");

  await input.fill("a\nb\na");
  await page.locator("#uniqueLinesBtn").click();
  await expect(output).toHaveValue("a\nb");

  console.log("✅ Text Cleaner tool works correctly");
});
