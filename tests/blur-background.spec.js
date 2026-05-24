import { test, expect } from '@playwright/test';

test('Blur Background tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/blur-background');
  
  // Wait for tool to load
  await page.waitForSelector('.tool-layout', { timeout: 5000 });
  
  // Check title
  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Blur Background');
  
  // Check description
  const desc = await page.locator('.tool-description').textContent();
  expect(desc).toContain('Apply blur effects to images');
  
  // Check upload area exists
  const uploadArea = await page.locator('.tool-upload-area');
  await expect(uploadArea).toBeVisible();
  
  // Check download button exists
  const downloadBtn = await page.locator('#download-btn');
  await expect(downloadBtn).toBeAttached();
  await expect(downloadBtn).toHaveText('Download Blurred Image');
  
  // Check blur intensity slider exists
  const blurRange = await page.locator('#blur-range');
  await expect(blurRange).toBeAttached();
  
  // Check mode buttons container exists
  const modeButtons = await page.locator('#mode-buttons');
  await expect(modeButtons).toBeAttached();
  
  // Check preview area exists
  const previewArea = await page.locator('#preview-area');
  await expect(previewArea).toBeAttached();
  
  console.log('✅ Blur Background tool loads correctly');
});
