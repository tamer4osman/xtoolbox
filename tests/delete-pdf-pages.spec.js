import { test, expect } from '@playwright/test';

test('Delete PDF Pages tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/delete-pdf-pages');
  
  // Wait for tool to load
  await page.waitForSelector('.tool-layout', { timeout: 5000 });
  
  // Check title
  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Delete PDF Pages');
  
  // Check description
  const desc = await page.locator('.tool-description').textContent();
  expect(desc).toContain('Remove specific pages from a PDF with visual selector');
  
  // Check upload area exists
  const uploadArea = await page.locator('.tool-upload-area');
  await expect(uploadArea).toBeVisible();
  
  // Check delete button exists (hidden until file selected)
  const deleteBtn = await page.locator('#convert-btn');
  await expect(deleteBtn).toBeAttached();
  await expect(deleteBtn).toHaveText('Delete Selected Pages');
  
  // Check select all/none buttons exist
  const selectAllBtn = await page.locator('#select-all-btn');
  await expect(selectAllBtn).toBeAttached();
  await expect(selectAllBtn).toHaveText('Select All');
  
  const selectNoneBtn = await page.locator('#select-none-btn');
  await expect(selectNoneBtn).toBeAttached();
  await expect(selectNoneBtn).toHaveText('Select None');
  
  // Check thumbnails grid exists
  const thumbnails = await page.locator('#thumbnails');
  await expect(thumbnails).toBeAttached();
  
  console.log('✅ Delete PDF Pages tool loads correctly');
});
