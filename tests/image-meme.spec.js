import { test, expect } from '@playwright/test';

test('image-meme loads and shows upload area', async ({ page }) => {
  await page.goto('/#/tools/image-meme');
  await expect(page.locator('h1, .tool-title')).toContainText('Meme Generator');
  await expect(page.locator('input[type="file"]')).toBeVisible();
});
