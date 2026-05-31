import { test, expect } from '@playwright/test';

test('SRT / VTT Subtitle Sync Shifter tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/subtitle-time-shifter');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Subtitle Sync Shifter');

  const desc = await page.locator('.tool-description').textContent();
  expect(desc).toContain('subtitle');

  const fileInput = page.locator('#sts-file');
  await expect(fileInput).toBeAttached();

  const offsetSlider = page.locator('#sts-offset-slider');
  await expect(offsetSlider).toBeAttached();

  const offsetInput = page.locator('#sts-offset-input');
  await expect(offsetInput).toBeAttached();

  const preview = page.locator('#sts-preview');
  await expect(preview).toBeHidden();

  const info = page.locator('#sts-info');
  await expect(info).toBeHidden();

  console.log('✅ SRT / VTT Subtitle Sync Shifter tool loads correctly');
});

test('SRT / VTT Subtitle Sync Shifter shows preview after file upload', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/subtitle-time-shifter');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  // Create a test SRT file
  const srtContent = `1
00:00:01,000 --> 00:00:04,000
Hello world

2
00:00:05,000 --> 00:00:08,000
Second subtitle`;

  // Upload file
  const fileInput = page.locator('#sts-file');
  await fileInput.setInputFiles({
    name: 'test.srt',
    mimeType: 'text/plain',
    buffer: Buffer.from(srtContent)
  });

  await page.waitForTimeout(500);

  const preview = page.locator('#sts-preview');
  await expect(preview).toBeVisible();

  const info = page.locator('#sts-info');
  await expect(info).toBeVisible();

  const format = page.locator('#sts-format');
  await expect(format).toContainText('SRT');

  const count = page.locator('#sts-count');
  await expect(count).toContainText('2');

  console.log('✅ SRT / VTT Subtitle Sync Shifter shows preview after upload');
});