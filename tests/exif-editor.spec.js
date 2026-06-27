import { test, expect } from '@playwright/test';

test('exif-editor loads and shows upload', async ({ page }) => {
  await page.goto('/#/tools/exif-editor');
  await expect(page.locator('h1')).toContainText('EXIF Data Editor');
  await expect(page.locator('.tool-upload-area')).toBeVisible();
});
