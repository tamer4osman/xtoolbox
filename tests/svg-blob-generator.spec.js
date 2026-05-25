import { test, expect } from '@playwright/test';

test('SVG Blob Generator tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/svg-blob-generator');
  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('SVG Blob');

  const typeSelect = page.locator('#blob-type');
  await expect(typeSelect).toBeAttached();

  const color1 = page.locator('#blob-color1');
  await expect(color1).toBeAttached();

  const color2 = page.locator('#blob-color2');
  await expect(color2).toBeAttached();

  const randomizeBtn = page.locator('#blob-randomize');
  await expect(randomizeBtn).toBeAttached();

  const svgOutput = page.locator('#blob-css');
  await expect(svgOutput).toBeAttached();

  const svgWrap = page.locator('#blob-svg-wrap svg');
  await expect(svgWrap).toBeAttached();

  console.log('✅ SVG Blob Generator tool loads correctly');
});

test('SVG Blob Generator produces valid SVG output', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/svg-blob-generator');
  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const svgText = await page.locator('#blob-css').inputValue();
  expect(svgText).toContain('<svg');
  expect(svgText).toContain('</svg>');
  expect(svgText).toContain('linearGradient');
  expect(svgText).toContain('viewBox="0 0 400 400"');

  console.log('✅ SVG Blob Generator produces valid SVG');
});

test('SVG Blob Generator switches between blob and wave types', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/svg-blob-generator');
  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  await page.locator('#blob-type').selectOption('wave');
  await page.waitForTimeout(100);

  const svgText = await page.locator('#blob-css').inputValue();
  expect(svgText).toContain('viewBox="0 0 800 200"');

  await page.locator('#blob-type').selectOption('blob');
  await page.waitForTimeout(100);

  const svgText2 = await page.locator('#blob-css').inputValue();
  expect(svgText2).toContain('viewBox="0 0 400 400"');

  console.log('✅ SVG Blob Generator switches types correctly');
});
