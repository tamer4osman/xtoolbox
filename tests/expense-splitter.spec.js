import { test, expect } from "@playwright/test";

test("expense-splitter loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/expense-splitter");

  await page.waitForSelector(".tool-header h1", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Expense Splitter");

  const privacy = await page.locator(".exs-privacy");
  await expect(privacy).toBeVisible();

  const personInput = await page.locator("#exs-person-input");
  await expect(personInput).toBeAttached();

  const addExpenseBtn = await page.locator("#exs-add-expense");
  await expect(addExpenseBtn).toBeAttached();

  console.log("✅ Expense Splitter tool loads correctly");
});
