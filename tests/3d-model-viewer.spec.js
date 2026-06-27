import { test, expect } from '@playwright/test';

test('3D Model Viewer tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/3d-model-viewer');

  await page.waitForSelector('.tool-container', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('3D Model Viewer');

  const desc = await page.locator('.tool-header p').textContent();
  expect(desc).toContain('Drag-and-drop');

  const dropZone = await page.locator('#td-drop-zone');
  await expect(dropZone).toBeAttached();

  const placeholder = await page.locator('#td-placeholder');
  await expect(placeholder).toBeAttached();

  const wireframeBtn = await page.locator('#td-wireframe');
  await expect(wireframeBtn).toBeAttached();
  await expect(wireframeBtn).toHaveText('Wireframe');

  const resetBtn = await page.locator('#td-reset-camera');
  await expect(resetBtn).toBeAttached();

  const screenshotBtn = await page.locator('#td-screenshot');
  await expect(screenshotBtn).toBeAttached();

  console.log('✅ 3D Model Viewer tool loads correctly');
});
