import { describe, it, expect } from "vitest";
import { testToolConfig } from "./helpers/tool-config-test.js";
import {
  weekStart,
  getWeekKey,
  sumEntries,
  formatDuration,
  computeDailyTotals,
  toLocalInputValue,
  toCsv
} from "../tools/productivity/timesheet-tracker.js";

const HOUR = 3600000;
const DAY = 86400000;

function mondayAt(hours) {
  const d = new Date(2026, 7, 3, hours, 0, 0);
  return d.getTime();
}

testToolConfig(() => import("../tools/productivity/timesheet-tracker.js"), {
  id: "timesheet-tracker",
  name: "Timesheet Tracker",
  category: "productivity"
});

describe("weekStart", () => {
  it("returns Monday 00:00 for any day of the week", () => {
    const wed = new Date(2026, 7, 5, 15, 42);
    const ws = weekStart(wed);
    expect(ws.getDay()).toBe(1);
    expect(ws.getHours()).toBe(0);
    expect(ws.getMinutes()).toBe(0);
    expect(ws.getDate()).toBe(3);
  });

  it("maps Sunday back into the same ISO week", () => {
    const sun = new Date(2026, 7, 9, 10);
    expect(weekStart(sun).getDate()).toBe(3);
  });
});

describe("getWeekKey", () => {
  it("formats as YYYY-Wnn", () => {
    expect(getWeekKey(new Date(2026, 7, 5))).toMatch(/^2026-W\d{2}$/);
  });
});

describe("sumEntries", () => {
  it("sums closed entries", () => {
    const total = sumEntries([
      { in: mondayAt(9), out: mondayAt(12) },
      { in: mondayAt(13), out: mondayAt(14) }
    ]);
    expect(total).toBe(4 * HOUR);
  });

  it("treats an open entry as running until now", () => {
    const total = sumEntries([{ in: Date.now() - HOUR, out: null }]);
    expect(total).toBeGreaterThanOrEqual(HOUR - 5000);
  });
});

describe("formatDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatDuration(2 * HOUR + 45 * 60000)).toBe("2h 45m");
    expect(formatDuration(HOUR)).toBe("1h");
    expect(formatDuration(0)).toBe("0h");
    expect(formatDuration(-5)).toBe("0h");
  });
});

describe("computeDailyTotals", () => {
  it("splits an entry crossing midnight between two days", () => {
    const inMs = mondayAt(23);
    const totals = computeDailyTotals([{ in: inMs, out: inMs + 2 * HOUR }], new Date(2026, 7, 3));
    expect(totals[0]).toBe(HOUR);
    expect(totals[1]).toBe(HOUR);
    expect(totals.slice(2).every(t => t === 0)).toBe(true);
  });

  it("ignores open entries", () => {
    const totals = computeDailyTotals([{ in: mondayAt(9), out: null }], new Date(2026, 7, 3));
    expect(totals.every(t => t === 0)).toBe(true);
  });
});

describe("toCsv", () => {
  it("escapes quotes in notes and computes hours", () => {
    const csv = toCsv([{ in: mondayAt(9), out: mondayAt(17), note: 'said "hi"' }]);
    expect(csv).toContain('""hi""');
    expect(csv).toContain("8.00");
  });

  it("sorts by clock-in ascending", () => {
    const csv = toCsv([
      { in: mondayAt(14), out: mondayAt(15) },
      { in: mondayAt(9), out: mondayAt(10) }
    ]);
    const lines = csv.split("\n");
    expect(lines[1]).toContain("T09:");
  });
});

describe("toLocalInputValue", () => {
  it("produces datetime-local format", () => {
    expect(toLocalInputValue(new Date(2026, 7, 3, 9, 5).getTime())).toBe("2026-08-03T09:05");
  });
});
