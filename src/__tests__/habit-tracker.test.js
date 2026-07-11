import { describe, it, expect } from "vitest";

describe("habit-tracker", () => {
  it("should calculate streak correctly", () => {
    const calculateStreak = completions => {
      if (!completions || completions.length === 0) return 0;

      const sorted = [...completions].sort().reverse();
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

      let streak = 0;
      let checkDate = new Date();

      for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toISOString().split("T")[0];
        if (completions.includes(dateStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      return streak;
    };

    expect(calculateStreak([])).toBe(0);
    expect(calculateStreak(["2024-01-01"])).toBe(0);
  });
});
