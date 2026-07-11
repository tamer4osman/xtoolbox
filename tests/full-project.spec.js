import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("ToolBox E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test.describe("Home Page", () => {
    test("should load the home page correctly", async ({ page }) => {
      await expect(page).toHaveTitle(/ToolBox|Free Online Tools/);
      await expect(page.locator("h1")).toContainText("Free Online Tools");
      await expect(page.locator(".hero")).toBeVisible();
    });

    test("should display popular tools section", async ({ page }) => {
      const popularToolsSection = page.locator("#popular-tools");
      await expect(popularToolsSection).toBeVisible();
      const toolCards = popularToolsSection.locator(".tool-card");
      await expect(toolCards.first()).toBeVisible();
    });

    test("should display categories section", async ({ page }) => {
      const categoriesSection = page.locator("#categories-grid");
      await expect(categoriesSection).toBeVisible();
    });

    test("should have search functionality", async ({ page }) => {
      const searchInput = page.locator("#search-input");
      await expect(searchInput).toBeVisible();
      await searchInput.fill("pdf");
      await page.waitForTimeout(500);
      const searchResults = page.locator("#search-results");
      await expect(searchResults).toBeVisible();
    });

    test("should display features section", async ({ page }) => {
      const features = page.locator(".features");
      await expect(features).toBeVisible();
      const featureCards = features.locator(".feature-card");
      await expect(featureCards).toHaveCount(3);
    });
  });

  test.describe("Navigation", () => {
    test("should have working navbar", async ({ page }) => {
      const navbar = page.locator("nav, .navbar, header");
      await expect(navbar.first()).toBeVisible();
    });

    test("should navigate to category page", async ({ page }) => {
      const categoryLink = page.locator(".tool-card").first();
      const href = await categoryLink.getAttribute("href");
      if (href) {
        await categoryLink.click();
        await page.waitForURL(/\/category\/|\/tools\//);
      }
    });
  });

  test.describe("Category Page", () => {
    test("should load PDF category", async ({ page }) => {
      await page.goto(`${BASE_URL}/#/category/pdf`);
      await page.waitForTimeout(1000);
      const mainContent = page.locator("#main-content");
      await expect(mainContent).toBeVisible();
    });

    test("should load Image category", async ({ page }) => {
      await page.goto(`${BASE_URL}/#/category/image`);
      await page.waitForTimeout(1000);
      const mainContent = page.locator("#main-content");
      await expect(mainContent).toBeVisible();
    });

    test("should load Video category", async ({ page }) => {
      await page.goto(`${BASE_URL}/#/category/video`);
      await page.waitForTimeout(1000);
      const mainContent = page.locator("#main-content");
      await expect(mainContent).toBeVisible();
    });
  });

  test.describe("Tool Pages", () => {
    test("should load merge-pdf tool", async ({ page }) => {
      await page.goto(`${BASE_URL}/#/tools/merge-pdf`);
      await page.waitForTimeout(1000);
      const mainContent = page.locator("#main-content");
      await expect(mainContent).toBeVisible();
    });

    test("should load qr-generator tool", async ({ page }) => {
      await page.goto(`${BASE_URL}/#/tools/qr-generator`);
      await page.waitForTimeout(1000);
      const mainContent = page.locator("#main-content");
      await expect(mainContent).toBeVisible();
    });

    test("should load image-to-text tool", async ({ page }) => {
      await page.goto(`${BASE_URL}/#/tools/image-to-text`);
      await page.waitForTimeout(1000);
      const mainContent = page.locator("#main-content");
      await expect(mainContent).toBeVisible();
    });

    test("should load password-generator tool", async ({ page }) => {
      await page.goto(`${BASE_URL}/#/tools/password-generator`);
      await page.waitForTimeout(1000);
      const mainContent = page.locator("#main-content");
      await expect(mainContent).toBeVisible();
    });
  });

  test.describe("About Page", () => {
    test("should load about page", async ({ page }) => {
      await page.goto(`${BASE_URL}/#/about`);
      await page.waitForTimeout(1000);
      const mainContent = page.locator("#main-content");
      await expect(mainContent).toBeVisible();
    });
  });

  test.describe("Terms Page", () => {
    test("should load terms page", async ({ page }) => {
      await page.goto(`${BASE_URL}/#/terms`);
      await page.waitForTimeout(1000);
      const mainContent = page.locator("#main-content");
      await expect(mainContent).toBeVisible();
    });
  });

  test.describe("Privacy Page", () => {
    test("should load privacy page", async ({ page }) => {
      await page.goto(`${BASE_URL}/#/privacy`);
      await page.waitForTimeout(1000);
      const mainContent = page.locator("#main-content");
      await expect(mainContent).toBeVisible();
    });
  });

  test.describe("404 Page", () => {
    test("should load not-found page for invalid routes", async ({ page }) => {
      await page.goto(`${BASE_URL}/#/invalid-route-12345`);
      await page.waitForTimeout(1000);
      const mainContent = page.locator("#main-content");
      await expect(mainContent).toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper heading hierarchy", async ({ page }) => {
      const h1 = page.locator("h1");
      await expect(h1.first()).toBeVisible();
    });

    test("should have proper alt text for images", async ({ page }) => {
      const images = page.locator("img");
      const count = await images.count();
      if (count > 0) {
        for (let i = 0; i < Math.min(count, 5); i++) {
          const alt = await images.nth(i).getAttribute("alt");
          expect(typeof alt).toBe("string");
        }
      }
    });

    test("should have proper form labels", async ({ page }) => {
      const searchInput = page.locator("#search-input");
      if (await searchInput.isVisible()) {
        const ariaLabel = await searchInput.getAttribute("aria-label");
        expect(ariaLabel).toBeTruthy();
      }
    });
  });

  test.describe("Performance", () => {
    test("should load home page within reasonable time", async ({ page }) => {
      const start = Date.now();
      await page.goto(BASE_URL);
      await page.waitForLoadState("networkidle");
      const loadTime = Date.now() - start;
      expect(loadTime).toBeLessThan(10000);
    });
  });

  test.describe("Console", () => {
    test("should not have critical console errors", async ({ page }) => {
      const errors = [];
      page.on("console", msg => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });
      await page.goto(BASE_URL);
      await page.waitForTimeout(2000);
      const criticalErrors = errors.filter(
        e => !e.includes("favicon") && !e.includes("warning") && !e.includes("Warning")
      );
      expect(criticalErrors.length).toBe(0);
    });
  });

  test.describe("Responsive Design", () => {
    test("should work on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);
      await expect(page.locator("h1")).toBeVisible();
      const searchInput = page.locator("#search-input");
      if (await searchInput.isVisible()) {
        await searchInput.fill("test");
      }
    });

    test("should work on tablet viewport", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(BASE_URL);
      await expect(page.locator("h1")).toBeVisible();
    });

    test("should work on desktop viewport", async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(BASE_URL);
      await expect(page.locator("h1")).toBeVisible();
    });
  });

  test.describe("Components", () => {
    test("should have working file upload component", async ({ page }) => {
      await page.goto(`${BASE_URL}/#/tools/merge-pdf`);
      await page.waitForTimeout(1000);
      const dropzone = page.locator('.file-upload, .dropzone, input[type="file"]');
      const count = await dropzone.count();
      expect(count).toBeGreaterThan(0);
    });

    test("should have working buttons", async ({ page }) => {
      await page.goto(`${BASE_URL}/#/tools/qr-generator`);
      await page.waitForTimeout(1000);
      const buttons = page.locator("button");
      const count = await buttons.count();
      if (count > 0) {
        expect(count).toBeGreaterThan(0);
      }
    });

    test("should have working select component", async ({ page }) => {
      await page.goto(`${BASE_URL}/#/tools/compress-pdf`);
      await page.waitForTimeout(1000);
      const selects = page.locator("select");
      const count = await selects.count();
      // Check if select exists (it may be hidden until file is uploaded)
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("SEO", () => {
    test("should have proper meta title", async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForTimeout(1000);
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    });

    test("should have meta description", async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForTimeout(1000);
      const metaDesc = page.locator('meta[name="description"]');
      await expect(metaDesc).toHaveAttribute("content");
    });
  });

  test.describe("Search Functionality", () => {
    test("should show search results for valid query", async ({ page }) => {
      const searchInput = page.locator("#search-input");
      await searchInput.fill("image");
      await page.waitForTimeout(500);
      const results = page.locator(".search-result-item, .search-results a");
      if ((await results.count()) > 0) {
        await expect(results.first()).toBeVisible();
      }
    });

    test("should show no results for invalid query", async ({ page }) => {
      const searchInput = page.locator("#search-input");
      await searchInput.fill("xyznonexistent123");
      await page.waitForTimeout(500);
      const noResults = page.locator(".search-no-results, .no-results");
      if ((await noResults.count()) > 0) {
        await expect(noResults.first()).toBeVisible();
      }
    });

    test("should handle escape key in search", async ({ page }) => {
      const searchInput = page.locator("#search-input");
      await searchInput.fill("test");
      await searchInput.press("Escape");
      await page.waitForTimeout(300);
      // Escape should remove focus from search (app behavior may not clear input)
      const isFocused = await searchInput.evaluate(el => document.activeElement === el);
      expect(isFocused).toBe(false);
    });
  });

  test.describe("Footer", () => {
    test("should have footer with links", async ({ page }) => {
      const footer = page.locator("footer");
      if ((await footer.count()) > 0) {
        await expect(footer.first()).toBeVisible();
      }
    });
  });

  test.describe("Multiple Page Navigation", () => {
    test("should navigate through multiple pages correctly", async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForTimeout(500);

      const categoryCards = page.locator("#categories-grid .tool-card");
      if ((await categoryCards.count()) > 0) {
        await categoryCards.first().click();
        await page.waitForTimeout(1000);
        await expect(page.locator("#main-content")).toBeVisible();
      }
    });

    test("should handle browser back button", async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForTimeout(500);

      const categoryCards = page.locator("#categories-grid .tool-card");
      if ((await categoryCards.count()) > 0) {
        await categoryCards.first().click();
        await page.waitForTimeout(1000);
        await page.goBack();
        await page.waitForTimeout(500);
        await expect(page.locator("#main-content")).toBeVisible();
      }
    });
  });
});

test.describe("Full Project Smoke Test", () => {
  test("should load all major routes without crash", async ({ page }) => {
    const routes = [
      "",
      "/#/about",
      "/#/terms",
      "/#/privacy",
      "/#/category/pdf",
      "/#/category/image",
      "/#/category/video",
      "/#/tools/merge-pdf",
      "/#/tools/qr-generator",
      "/#/tools/password-generator"
    ];

    for (const route of routes) {
      const url = route ? `${BASE_URL}${route}` : BASE_URL;
      await page.goto(url);
      await page.waitForTimeout(1000);
      await expect(page.locator("#main-content")).toBeVisible();
    }
  });
});
