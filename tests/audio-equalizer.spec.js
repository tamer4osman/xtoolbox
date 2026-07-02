import { test, expect } from '@playwright/test';

test('audio-equalizer loads and displays tool name', async ({ page }) => {
  await page.goto('/#/tools/audio-equalizer');
  await expect(page.locator('h1')).toContainText('Audio Equalizer');
});
