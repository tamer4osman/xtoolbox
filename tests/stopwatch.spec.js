import { test, expect } from '@playwright/test';

test('Stopwatch tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/stopwatch');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Stopwatch');

  const desc = await page.locator('.tool-description').textContent();
  expect(desc).toContain('lap time tracking');

  const display = await page.locator('#sw-display');
  await expect(display).toBeAttached();
  await expect(display).toHaveText('00:00:00.000');

  const startBtn = await page.locator('#sw-start');
  await expect(startBtn).toBeAttached();
  await expect(startBtn).toHaveText('Start');

  const lapBtn = await page.locator('#sw-lap');
  await expect(lapBtn).toBeAttached();
  await expect(lapBtn).toBeDisabled();

  const resetBtn = await page.locator('#sw-reset');
  await expect(resetBtn).toBeAttached();

  console.log('✅ Stopwatch tool loads correctly');
});
