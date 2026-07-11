import { test, expect } from "@playwright/test";

test("Pomodoro timer loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/pomodoro-timer");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Pomodoro");

  const timeDisplay = await page.locator("#pt-time");
  await expect(timeDisplay).toBeAttached();
  await expect(timeDisplay).toHaveText("25:00");

  const label = await page.locator("#pt-label");
  await expect(label).toHaveText("Work Session");

  const startBtn = await page.locator("#pt-start");
  await expect(startBtn).toBeAttached();
  await expect(startBtn).toHaveText("Start");

  const resetBtn = await page.locator("#pt-reset");
  await expect(resetBtn).toBeAttached();

  const pomodoroBtn = await page.locator('[data-mode="pomodoro"]');
  await expect(pomodoroBtn).toBeAttached();

  const shortBtn = await page.locator('[data-mode="shortBreak"]');
  await expect(shortBtn).toBeAttached();

  const longBtn = await page.locator('[data-mode="longBreak"]');
  await expect(longBtn).toBeAttached();

  const settingsBtn = await page.locator("#pt-settings-toggle");
  await expect(settingsBtn).toBeAttached();

  console.log("✅ Pomodoro timer loads correctly");
});

test("Pomodoro timer switches modes", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/pomodoro-timer");
  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  await page.locator('[data-mode="shortBreak"]').click();
  const timeAfterShort = await page.locator("#pt-time").textContent();
  expect(timeAfterShort).toBe("05:00");
  const labelShort = await page.locator("#pt-label").textContent();
  expect(labelShort).toBe("Short Break");

  await page.locator('[data-mode="longBreak"]').click();
  const timeAfterLong = await page.locator("#pt-time").textContent();
  expect(timeAfterLong).toBe("15:00");
  const labelLong = await page.locator("#pt-label").textContent();
  expect(labelLong).toBe("Long Break");

  await page.locator('[data-mode="pomodoro"]').click();
  const timeAfterPomo = await page.locator("#pt-time").textContent();
  expect(timeAfterPomo).toBe("25:00");

  console.log("✅ Mode switching works");
});

test("Pomodoro timer settings toggle", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/pomodoro-timer");
  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const settingsPanel = await page.locator("#pt-settings");
  await expect(settingsPanel).toBeHidden();

  await page.locator("#pt-settings-toggle").click();
  await expect(settingsPanel).toBeVisible();

  const pomodoroInput = await page.locator("#pt-dur-pomodoro");
  await expect(pomodoroInput).toHaveValue("25");

  const shortInput = await page.locator("#pt-dur-short");
  await expect(shortInput).toHaveValue("5");

  const longInput = await page.locator("#pt-dur-long");
  await expect(longInput).toHaveValue("15");

  console.log("✅ Settings panel works");
});
