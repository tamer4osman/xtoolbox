import { test, expect } from '@playwright/test';

test('Add Border to Image tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/add-border-image');
  
  // Wait for tool to load
  await page.waitForSelector('.tool-layout', { timeout: 5000 });
  
  // Check title
  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Add Border to Image');
  
  // Check description
  const desc = await page.locator('.tool-description').textContent();
  expect(desc).toContain('Add customizable borders to images');
  
  // Check upload area exists
  const uploadArea = await page.locator('.tool-upload-area');
  await expect(uploadArea).toBeVisible();
  
  // Check download button exists
  const downloadBtn = await page.locator('#download-btn');
  await expect(downloadBtn).toBeAttached();
  await expect(downloadBtn).toHaveText('Download with Border');
  
  // Check border width slider exists
  const widthRange = await page.locator('#width-range');
  await expect(widthRange).toBeAttached();
  
  // Check border color picker exists
  const borderColor = await page.locator('#border-color');
  await expect(borderColor).toBeAttached();
  
  // Check corner radius slider exists
  const radiusRange = await page.locator('#radius-range');
  await expect(radiusRange).toBeAttached();
  
  // Check shadow toggle exists
  const shadowToggle = await page.locator('#shadow-toggle');
  await expect(shadowToggle).toBeAttached();
  
  // Check style buttons container exists
  const styleButtons = await page.locator('#style-buttons');
  await expect(styleButtons).toBeAttached();
  
  // Check preview area exists
  const previewArea = await page.locator('#preview-area');
  await expect(previewArea).toBeAttached();
  
  console.log('✅ Add Border to Image tool loads correctly');
});
