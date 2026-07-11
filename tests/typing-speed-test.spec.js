import { test, expect } from "@playwright/test";

test("Typing Speed Test tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/typing-speed-test");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Typing Speed Test");

  const desc = await page.locator(".tool-description").textContent();
  expect(desc).toContain("typing speed");

  const startBtn = await page.locator("#ts-start");
  await expect(startBtn).toBeAttached();
  await expect(startBtn).toHaveText("Start Test");

  const textarea = await page.locator("#ts-input");
  await expect(textarea).toBeAttached();

  console.log("✅ Typing Speed Test tool loads correctly");
});
