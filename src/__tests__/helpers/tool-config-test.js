import { describe, it, expect } from "vitest";

export function testToolConfig(importFn, expected) {
  describe(expected.id, () => {
    it("has correct config", async () => {
      const { toolConfig } = await importFn();
      expect(toolConfig.id).toBe(expected.id);
      expect(toolConfig.name).toBe(expected.name);
      expect(toolConfig.category).toBe(expected.category);
      expect(toolConfig.keywords.length).toBeGreaterThan(3);
    });
    it("has faqs and steps", async () => {
      const { toolConfig } = await importFn();
      expect(toolConfig.faqs.length).toBeGreaterThan(1);
      expect(toolConfig.steps.length).toBeGreaterThan(2);
    });
  });
}
