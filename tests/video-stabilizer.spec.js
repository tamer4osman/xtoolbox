import { test, expect } from "@playwright/test";

test("Video Stabilizer tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/video-stabilizer");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Video Stabilizer");

  const uploadArea = await page.locator("#upload-area");
  await expect(uploadArea).toBeAttached();

  const optionsArea = await page.locator("#options-area");
  await expect(optionsArea).toBeAttached();

  const shakinessInput = await page.locator("#shakiness");
  await expect(shakinessInput).toBeAttached();
  await expect(shakinessInput).toHaveAttribute("min", "1");
  await expect(shakinessInput).toHaveAttribute("max", "10");
  await expect(shakinessInput).toHaveAttribute("value", "5");

  const smoothingInput = await page.locator("#smoothing");
  await expect(smoothingInput).toBeAttached();
  await expect(smoothingInput).toHaveAttribute("min", "1");
  await expect(smoothingInput).toHaveAttribute("max", "30");
  await expect(smoothingInput).toHaveAttribute("value", "10");

  const stabilizeBtn = await page.locator("#stabilize-btn");
  await expect(stabilizeBtn).toBeAttached();
  await expect(stabilizeBtn).toContainText("Stabilize Video");

  const resultArea = await page.locator("#result-area");
  await expect(resultArea).toBeAttached();

  const processing = await page.locator("#processing");
  await expect(processing).toBeAttached();

  console.log("✅ Video Stabilizer tool loads correctly");
});

test("Video Stabilizer slider values update on input", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/video-stabilizer");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  await page.locator("#shakiness").fill("8");
  const shakinessVal = await page.locator("#shakiness-val").textContent();
  expect(shakinessVal).toBe("8");

  await page.locator("#smoothing").fill("20");
  const smoothingVal = await page.locator("#smoothing-val").textContent();
  expect(smoothingVal).toBe("20");

  console.log("✅ Slider values update correctly");
});
