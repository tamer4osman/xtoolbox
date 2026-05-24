import { test, expect } from '@playwright/test';

test('ASCII Art tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/ascii-art');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('ASCII Art Generator');

  const desc = await page.locator('.tool-description').textContent();
  expect(desc).toContain('text to figlet-style');

  const input = await page.locator('#aa-input');
  await expect(input).toBeAttached();

  const fontSelect = await page.locator('#aa-font');
  await expect(fontSelect).toBeAttached();

  const generateBtn = await page.locator('#aa-generate');
  await expect(generateBtn).toBeAttached();

  const output = await page.locator('#aa-output');
  await expect(output).toBeAttached();

  const copyBtn = await page.locator('#aa-copy');
  await expect(copyBtn).toBeAttached();

  console.log('✅ ASCII Art tool loads correctly');
});
