import { test, expect } from '@playwright/test';

test('bpm-key-detector loads and displays tool name', async ({ page }) => {
  await page.goto('/#/tools/bpm-key-detector');
  await expect(page.locator('h1')).toContainText('BPM & Key Detector');
});
