import { describe, it, expect } from "vitest";
import { testToolConfig } from "./helpers/tool-config-test.js";
import { NAME_DATA, CULTURES, pickRandom, generateNames } from "../tools/fun/name-generator.js";

testToolConfig(() => import("../tools/fun/name-generator.js"), {
  id: "name-generator",
  name: "Name Generator",
  category: "fun"
});

describe("NAME_DATA", () => {
  it("has non-empty pools for every culture", () => {
    for (const key of CULTURES) {
      const set = NAME_DATA[key];
      expect(set.male.length).toBeGreaterThan(10);
      expect(set.female.length).toBeGreaterThan(10);
      expect(set.surnames.length).toBeGreaterThan(10);
    }
  });

  it("has no duplicate entries within a pool", () => {
    for (const key of CULTURES) {
      const set = NAME_DATA[key];
      expect(new Set(set.male).size).toBe(set.male.length);
      expect(new Set(set.female).size).toBe(set.female.length);
      expect(new Set(set.surnames).size).toBe(set.surnames.length);
    }
  });
});

describe("pickRandom", () => {
  it("returns null for empty or invalid input", () => {
    expect(pickRandom([])).toBeNull();
    expect(pickRandom(null)).toBeNull();
    expect(pickRandom(undefined)).toBeNull();
  });

  it("returns an element contained in the list", () => {
    const list = ["a", "b", "c"];
    for (let i = 0; i < 50; i++) {
      expect(list).toContain(pickRandom(list));
    }
  });
});

describe("generateNames", () => {
  it("generates the requested count of first+last names", () => {
    const names = generateNames({ culture: "english", gender: "any", count: 8 });
    expect(names).toHaveLength(8);
    names.forEach(n => {
      expect(n).toMatch(/^[A-Za-zÀ-ÿ' -]+ [A-Za-zÀ-ÿ' -]+$/);
    });
  });

  it("respects gender filtering", () => {
    const maleNames = new Set(NAME_DATA.english.male);
    const femaleNames = new Set(NAME_DATA.english.female);
    for (let i = 0; i < 20; i++) {
      const [first] = generateNames({ culture: "english", gender: "male", count: 1 })[0].split(" ");
      expect(maleNames.has(first)).toBe(true);
      expect(femaleNames.has(first)).toBe(false);
    }
  });

  it("clamps count between 1 and 20", () => {
    expect(generateNames({ count: -5 })).toHaveLength(1);
    expect(generateNames({ count: 9999 })).toHaveLength(20);
    expect(generateNames({ count: 3.9 })).toHaveLength(3);
  });

  it("returns empty array for unknown culture and defaults otherwise", () => {
    expect(generateNames({ culture: "atlantean" })).toEqual([]);
    expect(generateNames({})).toHaveLength(6);
  });

  it("produces variety across runs", () => {
    const seen = new Set();
    for (let i = 0; i < 5; i++) {
      generateNames({ culture: "fantasy", gender: "any", count: 6 }).forEach(n => seen.add(n));
    }
    expect(seen.size).toBeGreaterThan(6);
  });
});
