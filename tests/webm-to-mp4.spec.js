import { test, expect } from '@playwright/test';

test('WEBM to MP4 tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/webm-to-mp4');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('WEBM to MP4');

  const desc = await page.locator('.tool-description').textContent();
  expect(desc).toContain('Convert WEBM videos to MP4');

  const uploadArea = await page.locator('.tool-upload-area');
  await expect(uploadArea).toBeVisible();

  const convertBtn = await page.locator('#convert-btn');
  await expect(convertBtn).toBeAttached();
  await expect(convertBtn).toHaveText('Convert to MP4');

  const processing = await page.locator('#processing');
  await expect(processing).toBeAttached();

  console.log('✅ WEBM to MP4 tool loads correctly');
});
