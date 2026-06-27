import { test, expect } from '@playwright/test';

test('debt-payoff-visualizer loads and calculates', async ({ page }) => {
  await page.goto('/#/tools/debt-payoff-visualizer');
  await expect(page.locator('h1')).toContainText('Debt Payoff Visualizer');
  await expect(page.locator('#add-debt-btn')).toBeVisible();
  await expect(page.locator('#calculate-btn')).toBeVisible();
  await page.click('#calculate-btn');
  await expect(page.locator('#results')).toBeVisible();
  await expect(page.locator('.strategy-card')).toHaveCount(2);
});

test('debt-payoff-visualizer adds and removes debts', async ({ page }) => {
  await page.goto('/#/tools/debt-payoff-visualizer');
  const initialRows = await page.locator('.debt-row').count();
  await page.click('#add-debt-btn');
  await expect(page.locator('.debt-row')).toHaveCount(initialRows + 1);
  await page.click('.btn-remove-debt >> nth=-1');
  await expect(page.locator('.debt-row')).toHaveCount(initialRows);
});
