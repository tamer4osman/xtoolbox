import { test, expect } from '@playwright/test';

test('Screen Recorder loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/screen-recorder');
  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Screen Recorder');

  const startBtn = page.locator('#start-btn');
  await expect(startBtn).toBeVisible();
  await expect(startBtn).toHaveText('Start Recording');

  const stopBtn = page.locator('#stop-btn');
  await expect(stopBtn).toBeVisible();
  await expect(stopBtn).toHaveText('Stop');

  const recTimer = page.locator('#rec-timer');
  await expect(recTimer).toBeVisible();
  await expect(recTimer).toHaveText('00:00:00');

  console.log('✅ Screen Recorder tool loads correctly');
});
