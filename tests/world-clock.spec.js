import { test, expect } from "@playwright/test";

test("World Clock & Time Zone Converter tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/world-clock");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("World Clock");

  const desc = await page.locator(".tool-description").textContent();
  expect(desc).toContain("Compare current times across multiple time zones");

  const input = await page.locator("#wc-input");
  await expect(input).toBeAttached();

  const addBtn = await page.locator("#wc-add");
  await expect(addBtn).toBeAttached();
  await expect(addBtn).toHaveText("Add");

  const resetBtn = await page.locator("#wc-reset");
  await expect(resetBtn).toBeAttached();

  const baseSelect = await page.locator("#wc-base");
  await expect(baseSelect).toBeAttached();

  const dateInput = await page.locator("#wc-date");
  await expect(dateInput).toBeAttached();

  const timeInput = await page.locator("#wc-time");
  await expect(timeInput).toBeAttached();

  const nowBtn = await page.locator("#wc-now");
  await expect(nowBtn).toBeAttached();

  const rows = await page.locator(".wc-row");
  await expect(rows.first()).toBeAttached();

  const converterOut = await page.locator("#wc-converter-out");
  await expect(converterOut).toBeAttached();

  const quickPicks = await page.locator(".wc-quick");
  const quickCount = await quickPicks.count();
  expect(quickCount).toBeGreaterThan(0);

  console.log("✅ World Clock tool loads correctly");
});
