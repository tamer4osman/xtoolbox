import { test, expect } from '@playwright/test';

test('stem-separator loads', async ({ page }) => {
  await page.goto('/#/tools/stem-separator');
  await expect(page.locator('h1')).toContainText('Vocal / Stem Separator');
  await expect(page.locator('.upload-zone')).toBeVisible();
  await expect(page.locator('#separate-btn')).toBeVisible();
});
