import { describe, it, expect } from "vitest";
import { isPalindrome, palindromeScore, toolConfig } from "../tools/fun/palindrome.js";

describe("palindrome", () => {
  describe("isPalindrome", () => {
    it("detects basic palindromes", () => {
      expect(isPalindrome("racecar")).toBe(true);
      expect(isPalindrome("madam")).toBe(true);
      expect(isPalindrome("121")).toBe(true);
    });

    it("handles phrases with spaces and punctuation", () => {
      expect(isPalindrome("A man a plan a canal panama")).toBe(true);
      expect(isPalindrome("No lemon, no melon")).toBe(true);
      expect(isPalindrome("Was it a car or a cat I saw?")).toBe(true);
    });

    it("returns false for non-palindromes", () => {
      expect(isPalindrome("hello")).toBe(false);
      expect(isPalindrome("world")).toBe(false);
    });

    it("handles edge cases", () => {
      expect(isPalindrome("")).toBe(false);
      expect(isPalindrome("a")).toBe(true);
      expect(isPalindrome("ab")).toBe(false);
      expect(isPalindrome("aa")).toBe(true);
    });
  });

  describe("palindromeScore", () => {
    it("returns 100 for perfect palindromes", () => {
      expect(palindromeScore("racecar")).toBe(100);
      expect(palindromeScore("aa")).toBe(100);
    });

    it("returns partial score", () => {
      expect(palindromeScore("ab")).toBe(0);
      expect(palindromeScore("abc")).toBe(0);
      expect(palindromeScore("aba")).toBe(100);
    });

    it("returns 0 for empty", () => {
      expect(palindromeScore("")).toBe(0);
    });
  });

  it("has correct config", () => {
    expect(toolConfig.id).toBe("palindrome");
    expect(toolConfig.category).toBe("fun");
    expect(toolConfig.keywords.length).toBeGreaterThan(3);
  });
});
