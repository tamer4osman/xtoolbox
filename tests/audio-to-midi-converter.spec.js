import { expect, test } from "@playwright/test";

test("audio-to-midi-converter renders controls and gates analysis", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/audio-to-midi-converter");
  await expect(page.locator(".tool-header h1")).toHaveText("Audio to MIDI Converter");

  await expect(page.locator("#atm-analyze")).toBeDisabled();
  await expect(page.locator("#atm-download")).toBeDisabled();
  await expect(page.locator("#atm-status")).toContainText("Load a file to begin");
  await expect(page.locator("#atm-file")).toHaveAttribute("accept", "audio/*");
});
