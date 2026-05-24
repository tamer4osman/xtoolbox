import { test, expect } from '@playwright/test';

test('Round Image Cropper tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/round-image-cropper');
  
  // Wait for tool to load
  await page.waitForSelector('.tool-layout', { timeout: 5000 });
  
  // Check title
  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Round Image Cropper');
  
  // Check description
  const desc = await page.locator('.tool-description').textContent();
  expect(desc).toContain('Crop images into perfect circles');
  
  // Check upload area exists
  const uploadArea = await page.locator('.tool-upload-area');
  await expect(uploadArea).toBeVisible();
  
  // Check download button exists
  const downloadBtn = await page.locator('#download-btn');
  await expect(downloadBtn).toBeAttached();
  await expect(downloadBtn).toHaveText('Download Circle Crop');
  
  // Check size slider exists
  const sizeRange = await page.locator('#size-range');
  await expect(sizeRange).toBeAttached();
  
  // Check position sliders exist
  const posXRange = await page.locator('#pos-x-range');
  await expect(posXRange).toBeAttached();
  const posYRange = await page.locator('#pos-y-range');
  await expect(posYRange).toBeAttached();
  
  // Check zoom slider exists
  const zoomRange = await page.locator('#zoom-range');
  await expect(zoomRange).toBeAttached();
  
  // Check border controls exist
  const borderRange = await page.locator('#border-range');
  await expect(borderRange).toBeAttached();
  const borderColor = await page.locator('#border-color');
  await expect(borderColor).toBeAttached();
  
  // Check background selector exists
  const bgSelect = await page.locator('#bg-select');
  await expect(bgSelect).toBeAttached();
  
  // Check shadow toggle exists
  const shadowToggle = await page.locator('#shadow-toggle');
  await expect(shadowToggle).toBeAttached();
  
  // Check preview area exists
  const previewArea = await page.locator('#preview-area');
  await expect(previewArea).toBeAttached();
  
  console.log('✅ Round Image Cropper tool loads correctly');
});
