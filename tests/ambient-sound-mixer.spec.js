import { test, expect } from "@playwright/test";

test("Ambient Sound Mixer tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/ambient-sound-mixer");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Ambient");

  const grid = await page.locator("#amb-grid");
  await expect(grid).toBeAttached();

  const timer = await page.locator("#amb-timer");
  await expect(timer).toBeAttached();

  const master = await page.locator("#amb-master");
  await expect(master).toBeAttached();

  const cards = await page.locator(".amb-card");
  await expect(cards).toHaveCount(8);

  console.log("✅ Ambient Sound Mixer tool loads correctly");
});
