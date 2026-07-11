import { test, expect } from "@playwright/test";

test("Diff Viewer & Merge Tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/diff-merge");

  await page.waitForSelector(".tool-container", { timeout: 5000 });

  const title = await page.locator("h1").textContent();
  expect(title).toContain("Diff Viewer");

  await expect(page.locator("#diff-left")).toBeAttached();
  await expect(page.locator("#diff-right")).toBeAttached();
  await expect(page.locator("#compare-btn")).toBeAttached();

  console.log("✅ Diff Viewer & Merge Tool loads correctly");
});
