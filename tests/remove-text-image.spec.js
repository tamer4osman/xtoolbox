import { test, expect } from '@playwright/test';

test('Remove Text from Image tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/remove-text-image');

  await page.waitForSelector('.tool-header h1', { timeout: 10000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Remove Text from Image');

  const uploadArea = await page.locator('.tool-upload-area');
  await expect(uploadArea).toBeAttached();

  const downloadBtn = await page.locator('#download-btn');
  await expect(downloadBtn).toBeAttached();

  const applyBtn = await page.locator('#apply-btn');
  await expect(applyBtn).toBeAttached();

  const clearBtn = await page.locator('#clear-selection-btn');
  await expect(clearBtn).toBeAttached();

  console.log('✅ Remove Text from Image tool loads correctly');
});
