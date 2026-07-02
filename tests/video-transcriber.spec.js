import { test, expect } from '@playwright/test';

test('video-transcriber loads and displays upload', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/video-transcriber');
  await expect(page.locator('h1')).toContainText('Local Video Transcriber');
  await expect(page.locator('#upload-area')).toBeVisible();
  await expect(page.locator('#transcribe-btn')).toBeVisible();
});

test('video-transcriber language selector works', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/video-transcriber');
  await expect(page.locator('#lang-select')).toBeVisible();
  await page.selectOption('#lang-select', 'es-ES');
  await expect(page.locator('#lang-select')).toHaveValue('es-ES');
});
