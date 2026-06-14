import { test, expect } from '@playwright/test';

test('mock-data-generator loads', async ({ page }) => {
  await page.goto('/#/tools/mock-data-generator');
  await expect(page.locator('h1')).toContainText('Mock Data Generator');
});