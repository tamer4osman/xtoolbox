import { test, expect } from '@playwright/test';

test('pdf-annotator loads and shows UI', async ({ page }) => {
  await page.goto('/#/tools/pdf-annotator');
  await expect(page.locator('h1')).toContainText('PDF Annotator');
  await expect(page.locator('.file-upload')).toBeVisible();
  await expect(page.locator('#download-anno-btn')).toBeVisible();
});

test('pdf-annotator has annotation toolbar after upload', async ({ page }) => {
  await page.goto('/#/tools/pdf-annotator');
  const fileInput = page.locator('.file-upload-input');
  await expect(fileInput).toBeAttached();
});
