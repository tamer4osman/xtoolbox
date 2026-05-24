import { test, expect } from '@playwright/test';

test('Collage Maker tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/collage-maker');
  
  // Wait for tool to load
  await page.waitForSelector('.tool-layout', { timeout: 5000 });
  
  // Check title
  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Collage Maker');
  
  // Check description
  const desc = await page.locator('.tool-description').textContent();
  expect(desc).toContain('Create beautiful photo collages');
  
  // Check upload area exists
  const uploadArea = await page.locator('.tool-upload-area');
  await expect(uploadArea).toBeVisible();
  
  // Check download button exists (hidden until files selected)
  const downloadBtn = await page.locator('#download-btn');
  await expect(downloadBtn).toBeAttached();
  await expect(downloadBtn).toHaveText('Download Collage');
  
  // Check preview area exists
  const previewArea = await page.locator('#preview-area');
  await expect(previewArea).toBeAttached();
  
  // Check spacing slider exists
  const spacingRange = await page.locator('#spacing-range');
  await expect(spacingRange).toBeAttached();
  
  // Check border radius slider exists
  const radiusRange = await page.locator('#radius-range');
  await expect(radiusRange).toBeAttached();
  
  console.log('✅ Collage Maker tool loads correctly');
});
