import { test, expect } from "@playwright/test";

test("kanban-board loads with default columns and toolbar", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/kanban-board");

  await page.waitForSelector(".tool-header h1", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Kanban Board");

  await expect(page.locator("#kanban-board-add-column")).toBeAttached();
  await expect(page.locator("#kanban-board-reset")).toBeAttached();

  const columns = await page.locator(".kanban-column").count();
  expect(columns).toBe(3);

  await page.evaluate(() => localStorage.clear());
  console.log("? Kanban Board loads with default columns");
});

test("kanban-board can add a card and it persists", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/kanban-board");
  await page.waitForSelector(".kanban-column", { timeout: 5000 });

  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector(".kanban-column", { timeout: 5000 });

  await page.locator(".kanban-column").first().locator(".kanban-add-card").click();

  const cardCount = await page.locator(".kanban-card").count();
  expect(cardCount).toBe(1);

  const cardTitle = page.locator(".kanban-card [data-card-title]").first();
  await cardTitle.fill("Test Task");
  await cardTitle.press("Enter");

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("kanban_v1")));
  expect(stored.columns[0].cards[0].title).toBe("Test Task");
  console.log("? Kanban Board adds and persists a card");
});

test("kanban-board move-select moves a card to another column", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/kanban-board");
  await page.waitForSelector(".kanban-column", { timeout: 5000 });

  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector(".kanban-column", { timeout: 5000 });

  await page.locator(".kanban-column").first().locator(".kanban-add-card").click();
  const moveSelect = page.locator(".kanban-move-select").first();
  await moveSelect.selectOption("col-done");

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("kanban_v1")));
  const doneCol = stored.columns.find(c => c.id === "col-done");
  expect(doneCol.cards.length).toBe(1);
  console.log("? Kanban Board moves cards via select");
});
