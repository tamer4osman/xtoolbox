import { test, expect } from "@playwright/test";

test("Sentiment Heatmap loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/sentiment-heatmap");
  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Sentiment");

  const inputText = page.locator("#input-text");
  await expect(inputText).toBeVisible();

  const analyzeBtn = page.locator("#analyze-btn");
  await expect(analyzeBtn).toBeVisible();
  await expect(analyzeBtn).toHaveText("Analyze Sentiment");

  console.log("✅ Sentiment Heatmap tool loads correctly");
});
