import { describe, it, expect } from "vitest";
import { toolConfig, generateUsername, generatePassword } from "../tools/privacy/temp-email.js";

describe("temp-email", () => {
  describe("toolConfig", () => {
    it("has correct id, name, category", () => {
      expect(toolConfig.id).toBe("temp-email");
      expect(toolConfig.name).toBe("Temp Email");
      expect(toolConfig.category).toBe("privacy");
    });

    it("has keywords, steps, and faqs", () => {
      expect(toolConfig.keywords.length).toBeGreaterThan(3);
      expect(toolConfig.steps.length).toBeGreaterThan(2);
      expect(toolConfig.faqs.length).toBeGreaterThan(1);
    });

    it("has an icon", () => {
      expect(toolConfig.icon).toBeTruthy();
    });
  });

  describe("generateUsername", () => {
    it("returns a 10-character string", () => {
      const username = generateUsername();
      expect(typeof username).toBe("string");
      expect(username).toHaveLength(10);
    });

    it("only contains lowercase letters and digits", () => {
      const username = generateUsername();
      expect(username).toMatch(/^[a-z0-9]+$/);
    });

    it("generates different values on successive calls", () => {
      const results = new Set();
      for (let i = 0; i < 20; i++) {
        results.add(generateUsername());
      }
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe("generatePassword", () => {
    it("returns a 16-character string", () => {
      const password = generatePassword();
      expect(typeof password).toBe("string");
      expect(password).toHaveLength(16);
    });

    it("contains valid characters from charset", () => {
      const password = generatePassword();
      expect(password).toHaveLength(16);
      expect(password).toMatch(/^[A-Za-z0-9!@#$%]+$/);
    });

    it("generates different values on successive calls", () => {
      const results = new Set();
      for (let i = 0; i < 20; i++) {
        results.add(generatePassword());
      }
      expect(results.size).toBeGreaterThan(1);
    });
  });
});
