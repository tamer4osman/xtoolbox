import { describe, it, expect } from 'vitest';
import { toolConfig, parseNutriments, parseGrade, parseNutrientLevels } from '../tools/reference/food-nutrition-scanner.js';
import { testSimpleToolConfig } from './tool-config-test.js';

describe('food-nutrition-scanner', () => {
  testSimpleToolConfig(toolConfig, 'food-nutrition-scanner', 'Food Nutrition Scanner', 'reference');
});

describe('parseNutriments', () => {
  it('extracts nutrient values from product', () => {
    const product = {
      nutriments: {
        'energy-kcal_100g': 539,
        'proteins_100g': 6.3,
        'carbohydrates_100g': 57.5,
        'fat_100g': 30.9,
        'saturated-fat_100g': 10.6,
        'sugars_100g': 56.3,
        'fiber_100g': null,
        'salt_100g': 0.1075,
        'sodium_100g': 0.043
      }
    };
    const result = parseNutriments(product);
    expect(result).toHaveLength(9);
    expect(result[0].label).toBe('Energy');
    expect(result[0].value).toBe(539);
    expect(result[1].label).toBe('Protein');
    expect(result[1].value).toBe(6.3);
  });

  it('returns null for missing nutrients', () => {
    const product = { nutriments: {} };
    const result = parseNutriments(product);
    expect(result[0].value).toBeNull();
  });

  it('handles product without nutriments', () => {
    const product = {};
    const result = parseNutriments(product);
    expect(result).toHaveLength(9);
    expect(result.every(n => n.value === null)).toBe(true);
  });
});

describe('parseGrade', () => {
  it('returns nutrition grade', () => {
    expect(parseGrade({ nutrition_grades: 'e' })).toBe('e');
    expect(parseGrade({ nutrition_grades: 'A' })).toBe('a');
  });

  it('falls back to nutriscore_grade', () => {
    expect(parseGrade({ nutriscore_grade: 'b' })).toBe('b');
  });

  it('returns empty string when missing', () => {
    expect(parseGrade({})).toBe('');
  });
});

describe('parseNutrientLevels', () => {
  it('extracts nutrient levels', () => {
    const product = {
      nutrient_levels: {
        fat: 'high',
        'saturated-fat': 'high',
        sugars: 'high',
        salt: 'low'
      }
    };
    const result = parseNutrientLevels(product);
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ label: 'Fat', level: 'high' });
    expect(result[3]).toEqual({ label: 'Salt', level: 'low' });
  });

  it('filters out missing levels', () => {
    const product = { nutrient_levels: { fat: 'high' } };
    const result = parseNutrientLevels(product);
    expect(result).toHaveLength(1);
  });

  it('returns empty array when no levels', () => {
    const product = {};
    const result = parseNutrientLevels(product);
    expect(result).toHaveLength(0);
  });
});
