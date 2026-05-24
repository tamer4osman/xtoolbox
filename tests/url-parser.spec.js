import { test, expect } from '@playwright/test';

test('URL Parser tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/url-parser');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('URL Parser');

  await expect(page.locator('#up-input')).toBeAttached();
  await expect(page.locator('#up-parse')).toBeAttached();
  await expect(page.locator('#up-result')).toBeAttached();

  console.log('✅ URL Parser tool loads correctly');
});
