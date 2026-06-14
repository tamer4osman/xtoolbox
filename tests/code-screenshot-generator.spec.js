import { test, expect } from '@playwright/test';

test('code-screenshot-generator loads', async ({ page }) => {
  await page.goto('/#/tools/code-screenshot-generator');
  await expect(page.locator('h1')).toContainText('Code Screenshot Generator');
});