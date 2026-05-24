import { test, expect } from '@playwright/test';

test('CSS Animation Generator tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/css-animation-generator');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('CSS Animation');

  const desc = await page.locator('.tool-description').textContent();
  expect(desc).toContain('keyframes');

  const preset = await page.locator('#cag-preset');
  await expect(preset).toBeAttached();

  const cssOutput = await page.locator('#cag-css');
  await expect(cssOutput).toBeAttached();

  const copyBtn = await page.locator('#cag-copy');
  await expect(copyBtn).toBeAttached();

  const previewBox = await page.locator('#cag-preview-box');
  await expect(previewBox).toBeAttached();

  console.log('✅ CSS Animation Generator tool loads correctly');
});
