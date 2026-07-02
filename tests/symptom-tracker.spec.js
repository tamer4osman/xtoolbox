import { test, expect } from '@playwright/test';

test('Symptom Tracker loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/symptom-tracker');
  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Symptom');

  const symptomName = page.locator('#symptom-name');
  await expect(symptomName).toBeVisible();

  const bodyPart = page.locator('#body-part');
  await expect(bodyPart).toBeVisible();

  const severity = page.locator('#severity');
  await expect(severity).toBeVisible();

  const addSymptomBtn = page.locator('#add-symptom-btn');
  await expect(addSymptomBtn).toBeVisible();
  await expect(addSymptomBtn).toHaveText('Log Symptom');

  console.log('✅ Symptom Tracker tool loads correctly');
});
