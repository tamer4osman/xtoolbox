import { test, expect } from '@playwright/test';

test('Archive Repair & Recovery loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/archive-repair');

  await page.waitForSelector('.tool-container', { timeout: 5000 });

  const title = await page.locator('h1').textContent();
  expect(title).toContain('Archive Repair');

  await expect(page.locator('#ar-drop-zone')).toBeAttached();
  await expect(page.locator('#ar-file-input')).toBeAttached();
  await expect(page.locator('#ar-status')).toBeAttached();

  console.log('✅ Archive Repair & Recovery loads correctly');
});
