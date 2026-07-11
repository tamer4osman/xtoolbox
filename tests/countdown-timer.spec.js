import { test, expect } from "@playwright/test";

test("Countdown Timer tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/countdown-timer");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Countdown Timer");

  const desc = await page.locator(".tool-description").textContent();
  expect(desc).toContain("Count down to a specific date");

  const addBtn = await page.locator("#add-btn");
  await expect(addBtn).toBeAttached();
  await expect(addBtn).toHaveText("Start Countdown");

  const nameInput = await page.locator("#event-name");
  await expect(nameInput).toBeAttached();

  const dateInput = await page.locator("#event-date");
  await expect(dateInput).toBeAttached();

  console.log("✅ Countdown Timer tool loads correctly");
});
