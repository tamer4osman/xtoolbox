import { test, expect } from '@playwright/test';

test('food-nutrition-scanner loads and has input', async ({ page }) => {
  await page.goto('/#/tools/food-nutrition-scanner');
  await expect(page.locator('h1')).toContainText('Food Nutrition Scanner');
  await expect(page.locator('#barcode-input')).toBeVisible();
  await expect(page.locator('#lookup-btn')).toBeVisible();
});
