import { test, expect } from '@playwright/test';

test('llm-token-counter loads and renders', async ({ page }) => {
  await page.goto('/#/tools/llm-token-counter');
  await expect(page.locator('h1')).toContainText('LLM Token Counter');
  await expect(page.locator('#ltc-text')).toBeVisible();
  await expect(page.locator('#ltc-compare-body tr').first()).toBeVisible();
});

test('llm-token-counter: typing updates token count', async ({ page }) => {
  await page.goto('/#/tools/llm-token-counter');
  const ta = page.locator('#ltc-text');
  await ta.fill('The quick brown fox jumps over the lazy dog.');
  await expect(page.locator('#ltc-stats')).toContainText('Words');
  await expect(page.locator('#ltc-stats')).toContainText('Tokens');
  const stats = await page.locator('#ltc-stats').textContent();
  expect(stats).toMatch(/Tokens/);
});

test('llm-token-counter: model switch updates cost', async ({ page }) => {
  await page.goto('/#/tools/llm-token-counter');
  await page.locator('#ltc-text').fill('Hello world. '.repeat(50));
  await page.locator('#ltc-model').selectOption('gpt-4o');
  const cost1 = await page.locator('#ltc-cost-total').textContent();
  await page.locator('#ltc-model').selectOption('gemini-1.5-flash');
  const cost2 = await page.locator('#ltc-cost-total').textContent();
  expect(cost1).not.toBe(cost2);
});

test('llm-token-counter: load sample populates text', async ({ page }) => {
  await page.goto('/#/tools/llm-token-counter');
  await page.locator('#ltc-sample').click();
  const text = await page.locator('#ltc-text').inputValue();
  expect(text.length).toBeGreaterThan(50);
  expect(text).toContain('quick brown fox');
});
