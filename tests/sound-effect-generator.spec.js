import { test, expect } from '@playwright/test';

test('sound-effect-generator loads and plays', async ({ page }) => {
  await page.goto('/#/tools/sound-effect-generator');
  await expect(page.locator('h1')).toContainText('Sound Effect Generator');
  await expect(page.locator('.sfx-card')).toHaveCount(8);
  await page.click('.sfx-card >> nth=0');
  await expect(page.locator('#play-btn')).toBeVisible();
  await expect(page.locator('#export-btn')).toBeVisible();
  await expect(page.locator('#waveform-canvas')).toBeVisible();
});
