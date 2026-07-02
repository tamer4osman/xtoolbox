import { test, expect } from '@playwright/test';

test('Meeting Cost Calculator loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/meeting-cost-calculator');
  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Meeting Cost');

  const nameInput = page.locator('#name-input');
  await expect(nameInput).toBeVisible();

  const salaryInput = page.locator('#salary-input');
  await expect(salaryInput).toBeVisible();

  const addBtn = page.locator('#add-btn');
  await expect(addBtn).toBeVisible();
  await expect(addBtn).toHaveText('Add');

  const startBtn = page.locator('#start-btn');
  await expect(startBtn).toBeVisible();

  const resetBtn = page.locator('#reset-btn');
  await expect(resetBtn).toBeVisible();

  console.log('✅ Meeting Cost Calculator tool loads correctly');
});
