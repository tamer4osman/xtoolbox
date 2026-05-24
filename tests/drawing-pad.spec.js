import { test, expect } from '@playwright/test';

test('Drawing Pad tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/drawing-pad');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Drawing Pad');

  const desc = await page.locator('.tool-description').textContent();
  expect(desc).toContain('Freehand drawing canvas');

  const canvas = await page.locator('#dp-canvas');
  await expect(canvas).toBeAttached();

  const exportBtn = await page.locator('#dp-export');
  await expect(exportBtn).toBeAttached();
  await expect(exportBtn).toHaveText('Export PNG');

  const clearBtn = await page.locator('#dp-clear');
  await expect(clearBtn).toBeAttached();

  const colorInput = await page.locator('#dp-color');
  await expect(colorInput).toBeAttached();

  console.log('✅ Drawing Pad tool loads correctly');
});
