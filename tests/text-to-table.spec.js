import { test, expect } from '@playwright/test';

test('Text to Table tool loads and works', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/text-to-table');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Text to Table');

  const textarea = page.locator('#tt-input');
  await expect(textarea).toBeAttached();

  const copyHtml = page.locator('#tt-copy-html');
  await expect(copyHtml).toBeAttached();

  const delimiter = page.locator('#tt-delimiter');
  await expect(delimiter).toBeAttached();

  await textarea.fill('');
  await textarea.fill('Name\tAge\tCity\nAlice\t30\tNYC\nBob\t25\tLA');

  await page.waitForTimeout(200);

  const rows = await page.locator('#tt-table tbody tr').count();
  expect(rows).toBe(2);

  console.log('✅ Text to Table tool loads and parses correctly');
});
