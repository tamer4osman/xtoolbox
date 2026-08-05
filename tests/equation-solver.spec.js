import { test, expect } from "@playwright/test";

test("equation-solver loads with controls", async ({ page }) => {
  await page.goto("/#/tools/equation-solver");
  await expect(page.locator("h1")).toContainText("Equation Solver");
  await expect(page.locator("#es-mode")).toBeVisible();
  await expect(page.locator("#es-eq")).toBeVisible();
  await expect(page.locator("#es-solve")).toBeVisible();
});

test("equation-solver solves a linear equation", async ({ page }) => {
  await page.goto("/#/tools/equation-solver");
  await page.fill("#es-eq", "2x + 3 = 7");
  await page.click("#es-solve");
  await expect(page.locator(".es-answer-tex")).toContainText("x");
  await expect(page.locator(".es-answer-tex")).toContainText("2");
  await expect(page.locator(".es-work .es-step")).toHaveCount(5);
});

test("equation-solver applies a linear preset", async ({ page }) => {
  await page.goto("/#/tools/equation-solver");
  await page.selectOption("#es-preset", { label: "3x − 5 = x + 7" });
  await page.click("#es-solve");
  await expect(page.locator(".es-answer-tex")).toContainText("6");
});

test("equation-solver solves a quadratic equation", async ({ page }) => {
  await page.goto("/#/tools/equation-solver");
  await page.selectOption("#es-mode", "quadratic");
  await page.selectOption("#es-preset", { label: "x² − 5x + 6 = 0" });
  await page.click("#es-solve");
  await expect(page.locator(".es-answer-tex")).toContainText("x");
  await expect(page.locator(".es-work")).toContainText("Discriminant");
  await expect(page.locator(".es-work")).toContainText("Δ");
});

test("equation-solver handles complex roots", async ({ page }) => {
  await page.goto("/#/tools/equation-solver");
  await page.selectOption("#es-mode", "quadratic");
  await page.selectOption("#es-preset", { label: "x² + 1 = 0" });
  await page.click("#es-solve");
  await expect(page.locator(".es-answer-tex")).toContainText("x");
  await expect(page.locator(".es-answer-tex")).toContainText("i");
});

test("equation-solver solves a system of equations", async ({ page }) => {
  await page.goto("/#/tools/equation-solver");
  await page.selectOption("#es-mode", "system");
  await page.fill("#es-eq1", "x + y = 5");
  await page.fill("#es-eq2", "x - y = 1");
  await page.click("#es-solve");
  await expect(page.locator(".es-answer-tex")).toContainText(/x\s*=\s*3/);
  await expect(page.locator(".es-answer-tex")).toContainText(/y\s*=\s*2/);
  await expect(page.locator(".es-work")).toContainText("Cramer's rule");
});

test("equation-solver detects no solution for parallel lines", async ({ page }) => {
  await page.goto("/#/tools/equation-solver");
  await page.selectOption("#es-mode", "system");
  await page.selectOption("#es-preset", { label: "x + y = 4 and x + y = 7" });
  await page.click("#es-solve");
  await expect(page.locator(".es-answer-tex")).toContainText("No solution");
});

test("equation-solver shows an error for non-polynomial input", async ({ page }) => {
  await page.goto("/#/tools/equation-solver");
  await page.fill("#es-eq", "sin(x) = 0.5");
  await page.click("#es-solve");
  await expect(page.locator(".es-error")).toBeVisible();
  await expect(page.locator(".es-error")).toContainText("polynomial");
});

test("equation-solver enables copy LaTeX after solving", async ({ page }) => {
  await page.goto("/#/tools/equation-solver");
  await page.fill("#es-eq", "2x + 3 = 7");
  await page.click("#es-solve");
  await expect(page.locator("#es-copy")).toBeEnabled();
});
