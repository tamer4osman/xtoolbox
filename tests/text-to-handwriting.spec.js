import { test, expect } from '@playwright/test';

test('Text to Handwriting tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/text-to-handwriting');

  await page.waitForSelector('.tool-header h1', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Text to Handwriting');

  const textInput = await page.locator('#text-input');
  await expect(textInput).toBeAttached();

  const fontSelect = await page.locator('#font-select');
  await expect(fontSelect).toBeAttached();

  const sizeSlider = await page.locator('#size-slider');
  await expect(sizeSlider).toBeAttached();

  const generateBtn = await page.locator('#generate-btn');
  await expect(generateBtn).toBeAttached();

  const downloadBtn = await page.locator('#download-btn');
  await expect(downloadBtn).toBeAttached();

  const preview = await page.locator('#preview');
  await expect(preview).toBeAttached();

  console.log('✅ Text to Handwriting tool loads correctly');
});
