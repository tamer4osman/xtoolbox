import { test, expect } from '@playwright/test';

test('Add Subtitles to Video tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/add-subtitles');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Add Subtitles to Video');

  const desc = await page.locator('.tool-description').textContent();
  expect(desc).toContain('Burn SRT or VTT subtitle files');

  const uploadArea = await page.locator('.tool-upload-area');
  await expect(uploadArea).toBeVisible();

  const convertBtn = await page.locator('#convert-btn');
  await expect(convertBtn).toBeAttached();
  await expect(convertBtn).toHaveText('Burn Subtitles');

  const processing = await page.locator('#processing');
  await expect(processing).toBeAttached();

  console.log('✅ Add Subtitles to Video tool loads correctly');
});
