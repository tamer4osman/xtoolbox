import { test, expect } from '@playwright/test';

test('Security Headers Generator tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/security-headers-generator');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Security');

  const cspToggle = await page.locator('#shg-csp');
  await expect(cspToggle).toBeAttached();

  const hstsToggle = await page.locator('#shg-hsts');
  await expect(hstsToggle).toBeAttached();

  const output = await page.locator('#shg-output');
  await expect(output).toBeAttached();

  const copyBtn = await page.locator('#shg-copy');
  await expect(copyBtn).toBeAttached();

  console.log('✅ Security Headers Generator tool loads correctly');
});
