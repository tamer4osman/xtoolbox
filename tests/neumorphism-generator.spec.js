import { test, expect } from '@playwright/test';

test('CSS Neumorphism Studio tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/neumorphism-generator');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Neumorphism');

  const desc = await page.locator('.tool-description').textContent();
  expect(desc).toContain('neumorphic');

  const preview = page.locator('.neo-preview-area');
  await expect(preview).toBeVisible();

  const card = page.locator('.neo-card');
  await expect(card).toBeVisible();

  const cssOutput = page.locator('#neo-css');
  await expect(cssOutput).toBeAttached();

  const copyBtn = page.locator('#neo-copy');
  await expect(copyBtn).toBeAttached();

  const blurSlider = page.locator('#neo-blur');
  await expect(blurSlider).toBeAttached();

  const intensitySlider = page.locator('#neo-intensity');
  await expect(intensitySlider).toBeAttached();

  const distanceSlider = page.locator('#neo-distance');
  await expect(distanceSlider).toBeAttached();

  const radiusSlider = page.locator('#neo-radius');
  await expect(radiusSlider).toBeAttached();

  const bgSelect = page.locator('#neo-preset');
  await expect(bgSelect).toBeAttached();

  const shapeBtns = page.locator('.neo-shape-btn');
  await expect(shapeBtns).toHaveCount(3);

  console.log('✅ CSS Neumorphism Studio tool loads correctly');
});

test('CSS Neumorphism Studio updates CSS on slider change', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/neumorphism-generator');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const blurSlider = page.locator('#neo-blur');
  await blurSlider.fill('30');
  await page.waitForTimeout(100);

  const cssText = await page.locator('#neo-css').inputValue();
  expect(cssText).toContain('blur(30px)');
  expect(cssText).toContain('.neumorphic');
  expect(cssText).toContain('box-shadow');

  console.log('✅ CSS Neumorphism Studio updates correctly');
});

test('CSS Neumorphism Studio shape buttons toggle convex/concave/pressed', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/neumorphism-generator');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const convexBtn = page.locator('[data-shape="convex"]');
  await convexBtn.click();
  let cssText = await page.locator('#neo-css').inputValue();
  expect(cssText).not.toContain('inset');

  const concaveBtn = page.locator('[data-shape="concave"]');
  await concaveBtn.click();
  cssText = await page.locator('#neo-css').inputValue();
  expect(cssText).toContain('inset');

  const pressedBtn = page.locator('[data-shape="pressed"]');
  await pressedBtn.click();
  cssText = await page.locator('#neo-css').inputValue();
  expect(cssText).not.toContain('inset');

  console.log('✅ CSS Neumorphism Studio shape buttons work');
});

test('CSS Neumorphism Studio preset changes background', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/neumorphism-generator');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const presetSelect = page.locator('#neo-preset');
  await presetSelect.selectOption('1');
  await page.waitForTimeout(100);

  const bgColor = await page.locator('#neo-bg').inputValue();
  expect(bgColor).toBe('#2d2d2d');

  console.log('✅ CSS Neumorphism Studio preset works');
});