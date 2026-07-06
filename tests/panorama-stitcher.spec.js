import { test, expect } from '@playwright/test';

test('panorama-stitcher loads and renders', async ({ page }) => {
  await page.goto('/#/tools/panorama-stitcher');
  await expect(page.locator('h1')).toContainText('Panorama Stitcher');
  await expect(page.locator('text=Upload')).toBeVisible();
});
