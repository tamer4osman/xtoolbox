import { test, expect } from '@playwright/test';

test('citation-generator loads and generates', async ({ page }) => {
  await page.goto('/#/tools/citation-generator');
  await expect(page.locator('h1')).toContainText('Citation Generator');

  await page.fill('#cit-author', 'Smith, John');
  await page.fill('#cit-title', 'Test Article');
  await page.fill('#cit-journal', 'Journal of Testing');
  await page.fill('#cit-year', '2024');

  const output = page.locator('#cit-output');
  await expect(output).toContainText('Smith, John');
  await expect(output).toContainText('2024');
});

test('citation-generator switches style', async ({ page }) => {
  await page.goto('/#/tools/citation-generator');
  await page.fill('#cit-author', 'Doe, Jane');
  await page.fill('#cit-title', 'My Book');
  await page.fill('#cit-year', '2023');
  await page.fill('#cit-publisher', 'Publisher Inc');

  await page.selectOption('#cit-type', 'book');
  await page.selectOption('#cit-style', 'mla');

  const output = page.locator('#cit-output');
  await expect(output).toContainText('Doe, Jane');
  await expect(output).toContainText('_My Book_');
});
