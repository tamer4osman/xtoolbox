import { test, expect } from '@playwright/test';
import tools from '../src/data/tools.json' assert { type: 'json' };

test.describe('All Tools', () => {
  const implementedTools = tools.filter(tool => tool.status === 'done');
  for (const tool of implementedTools) {
    test(`${tool.name} - ${tool.id}`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.goto(`/tools/${tool.id}`);
      await page.waitForLoadState('networkidle');

      // Check page loaded
      await expect(page.locator('h1')).toBeVisible();

      // Check no critical errors (ignore network/font issues)
      const criticalErrors = errors.filter(e => 
        !e.includes('warning') && 
        !e.includes('Warning') &&
        !e.includes('deprecat') &&
        !e.includes('ERR_NETWORK') &&
        !e.includes('Failed to load resource') &&
        !e.includes('CORS') &&
        !e.includes('font') &&
        !e.includes('connection') &&
        !e.includes('Connection')
      );
      
      if (criticalErrors.length > 0) {
        console.log(`Errors for ${tool.id}:`, criticalErrors);
      }
      
      expect(criticalErrors).toHaveLength(0);
    });
  }
});
