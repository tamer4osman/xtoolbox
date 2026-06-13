import { test, expect } from '@playwright/test';

test('Video Trimmer tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/trim-video');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Video Trimmer');

  const uploadArea = await page.locator('#upload-area');
  await expect(uploadArea).toBeAttached();

  const optionsArea = await page.locator('#options-area');
  await expect(optionsArea).toBeAttached();

  const startTime = await page.locator('#start-time');
  await expect(startTime).toBeAttached();

  const endTime = await page.locator('#end-time');
  await expect(endTime).toBeAttached();

  const actionBtn = await page.locator('#action-btn');
  await expect(actionBtn).toBeAttached();

  const processing = await page.locator('#processing');
  await expect(processing).toBeAttached();

  console.log('✅ Video Trimmer tool loads correctly');
});
