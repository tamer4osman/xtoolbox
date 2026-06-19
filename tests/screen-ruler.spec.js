import { test, expect } from '@playwright/test';

test.describe('Screen Ruler & Color Picker', () => {
  test('loads the tool page', async ({ page }) => {
    await page.goto('http://localhost:3000/#/tools/screen-ruler');
    await expect(page.locator('.sr-container')).toBeVisible();
  });

  test('shows activate button initially', async ({ page }) => {
    await page.goto('http://localhost:3000/#/tools/screen-ruler');
    const toggleBtn = page.locator('#sr-toggle');
    await expect(toggleBtn).toBeVisible();
    await expect(toggleBtn).toHaveText('Activate Ruler');
  });

  test('hides controls initially', async ({ page }) => {
    await page.goto('http://localhost:3000/#/tools/screen-ruler');
    const controls = page.locator('#sr-controls');
    await expect(controls).toBeHidden();
  });

  test('activates overlay on button click', async ({ page }) => {
    await page.goto('http://localhost:3000/#/tools/screen-ruler');
    await page.locator('#sr-toggle').click();
    const overlay = page.locator('#sr-overlay');
    await expect(overlay).toBeVisible();
    await expect(page.locator('#sr-controls')).toBeVisible();
    await expect(page.locator('#sr-toggle')).toBeHidden();
  });

  test('shows unit selector', async ({ page }) => {
    await page.goto('http://localhost:3000/#/tools/screen-ruler');
    await page.locator('#sr-toggle').click();
    const select = page.locator('#sr-unit');
    await expect(select).toBeVisible();
    await expect(select).toHaveValue('px');
  });

  test('deactivates on Escape key', async ({ page }) => {
    await page.goto('http://localhost:3000/#/tools/screen-ruler');
    await page.locator('#sr-toggle').click();
    await expect(page.locator('#sr-overlay')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#sr-overlay')).toBeHidden();
    await expect(page.locator('#sr-toggle')).toBeVisible();
  });

  test('deactivates on deactivate button', async ({ page }) => {
    await page.goto('http://localhost:3000/#/tools/screen-ruler');
    await page.locator('#sr-toggle').click();
    await page.locator('#sr-deactivate').click();
    await expect(page.locator('#sr-overlay')).toBeHidden();
    await expect(page.locator('#sr-toggle')).toBeVisible();
  });

  test('toggles unit selection', async ({ page }) => {
    await page.goto('http://localhost:3000/#/tools/screen-ruler');
    await page.locator('#sr-toggle').click();
    await page.locator('#sr-unit').selectOption('cm');
    await expect(page.locator('#sr-unit')).toHaveValue('cm');
    await page.locator('#sr-unit').selectOption('in');
    await expect(page.locator('#sr-unit')).toHaveValue('in');
  });

  test('shows position display', async ({ page }) => {
    await page.goto('http://localhost:3000/#/tools/screen-ruler');
    await page.locator('#sr-toggle').click();
    const pos = page.locator('#sr-pos');
    await expect(pos).toBeVisible();
    await expect(pos).toHaveText('Move mouse to measure');
  });
});
