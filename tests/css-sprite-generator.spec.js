import { test, expect } from '@playwright/test';

test('css-sprite-generator loads', async ({ page }) => {
  await page.goto('/#/tools/css-sprite-generator');
  await expect(page.locator('h1')).toContainText('CSS Sprite Sheet Generator');
});