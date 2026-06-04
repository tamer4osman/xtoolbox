import { test, expect } from '@playwright/test';

test('Gitignore Generator tool loads and generates output', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/gitignore-generator');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Gitignore Generator');

  await expect(page.locator('#gig-preset')).toBeAttached();
  await expect(page.locator('#gig-search')).toBeAttached();
  await expect(page.locator('#gig-output')).toBeAttached();
  await expect(page.locator('#gig-copy')).toBeAttached();
  await expect(page.locator('#gig-download')).toBeAttached();

  await page.locator('#gig-preset').selectOption({ index: 1 });
  await expect(page.locator('#gig-count')).toHaveText(/[1-9]\d*/);
  await expect(page.locator('#gig-output')).toContainText('node_modules/');

  await page.locator('#gig-custom').fill('secrets/\n*.local');
  await expect(page.locator('#gig-output')).toContainText('# Custom');
  await expect(page.locator('#gig-output')).toContainText('secrets/');

  await page.locator('#gig-clear').click();
  await expect(page.locator('#gig-count')).toHaveText('0');
  await expect(page.locator('#gig-output')).toContainText('Select templates');

  console.log('Gitignore Generator tool loads and reacts correctly');
});
