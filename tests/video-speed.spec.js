import { test, expect } from '@playwright/test';

test('Video Speed Changer tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/video-speed');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Video Speed');

  const uploadArea = await page.locator('#upload-area');
  await expect(uploadArea).toBeAttached();

  const optionsArea = await page.locator('#options-area');
  await expect(optionsArea).toBeAttached();

  const speedBtns = await page.locator('[data-speed]');
  await expect(speedBtns).toHaveCount(7);

  const actionBtn = await page.locator('#action-btn');
  await expect(actionBtn).toBeAttached();

  const processing = await page.locator('#processing');
  await expect(processing).toBeAttached();

  console.log('✅ Video Speed Changer tool loads correctly');
});
