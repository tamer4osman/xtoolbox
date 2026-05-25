import { test, expect } from '@playwright/test';

test('CSS Clamp Generator tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/css-clamp-generator');
  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Fluid Typography');

  const minVw = page.locator('#cc-min-vw');
  await expect(minVw).toBeAttached();
  await expect(minVw).toHaveValue('320');

  const maxVw = page.locator('#cc-max-vw');
  await expect(maxVw).toBeAttached();
  await expect(maxVw).toHaveValue('1200');

  const minSize = page.locator('#cc-min-size');
  await expect(minSize).toBeAttached();
  await expect(minSize).toHaveValue('16');

  const maxSize = page.locator('#cc-max-size');
  await expect(maxSize).toBeAttached();
  await expect(maxSize).toHaveValue('32');

  const cssOutput = page.locator('#cc-css');
  await expect(cssOutput).toBeAttached();

  const copyBtn = page.locator('#cc-copy');
  await expect(copyBtn).toBeAttached();

  const previewText = page.locator('#cc-preview-text');
  await expect(previewText).toBeAttached();

  console.log('✅ CSS Clamp Generator tool loads correctly');
});

test('CSS Clamp Generator produces valid output', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/css-clamp-generator');
  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const cssText = await page.locator('#cc-css').inputValue();
  expect(cssText).toContain('clamp(');
  expect(cssText).toContain('font-size:');
  expect(cssText).toContain('.fluid-text');
  expect(cssText).toContain('16px');
  expect(cssText).toContain('32px');

  console.log('✅ CSS Clamp Generator produces valid CSS');
});

test('CSS Clamp Generator updates on input change', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/css-clamp-generator');
  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const minSize = page.locator('#cc-min-size');
  await minSize.fill('24');
  await page.waitForTimeout(100);

  const cssText = await page.locator('#cc-css').inputValue();
  expect(cssText).toContain('clamp(24px');

  console.log('✅ CSS Clamp Generator updates correctly');
});
