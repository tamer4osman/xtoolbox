import { describe, it, expect, beforeEach } from 'vitest';
import { createHealthCalculator } from '../tools/health/health-calculator.js';
import { bodyFatPercent, classifyBodyFat, scaleBarPercent } from '../tools/health/body-fat-calculator.js';
import { getRatios, adjustForGoal } from '../tools/health/macros-calculator.js';
import { feetInchesToCm } from '../tools/health/bmi-calculator.js';

function makeContainer() {
  const c = document.createElement('div');
  document.body.appendChild(c);
  return c;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('createHealthCalculator', () => {
  it('renders form fields and calc button', () => {
    const container = makeContainer();
    const { resultEl } = createHealthCalculator({
      container,
      containerClass: 'test-c',
      calcButtonLabel: 'Go',
      fields: [
        { id: 'a', label: 'A', value: 10, min: 1, max: 100 },
        { id: 'b', type: 'select', label: 'B', options: [
          { value: 'x', label: 'X', selected: true },
          { value: 'y', label: 'Y' }
        ]}
      ],
      onCalculate: () => {}
    });
    expect(container.querySelector('#hc-calc-btn').textContent).toBe('Go');
    expect(container.querySelector('#a').value).toBe('10');
    expect(container.querySelector('#b').value).toBe('x');
    expect(resultEl.classList.contains('hidden')).toBe(false);
  });

  it('calls onCalculate on initial render and exposes result', () => {
    const container = makeContainer();
    let captured = null;
    const { resultEl } = createHealthCalculator({
      container,
      containerClass: 'test-c',
      fields: [{ id: 'n', label: 'N', value: 5 }],
      onCalculate: (c, r) => {
        const n = parseInt(c.querySelector('#n').value);
        r.innerHTML = `<div class="out">${n * 2}</div>`;
        captured = n * 2;
      }
    });
    expect(captured).toBe(10);
    expect(resultEl.querySelector('.out').textContent).toBe('10');
  });

  it('re-runs onCalculate when calc button clicked', () => {
    const container = makeContainer();
    let count = 0;
    createHealthCalculator({
      container,
      containerClass: 'test-c',
      fields: [{ id: 'n', label: 'N', value: 1 }],
      onCalculate: () => { count++; }
    });
    const before = count;
    container.querySelector('#hc-calc-btn').click();
    expect(count).toBe(before + 1);
  });

  it('re-runs onCalculate when input changes (autoCalc)', () => {
    const container = makeContainer();
    let count = 0;
    createHealthCalculator({
      container,
      containerClass: 'test-c',
      fields: [{ id: 'n', label: 'N', value: 1 }],
      onCalculate: () => { count++; }
    });
    const before = count;
    const input = container.querySelector('#n');
    input.value = '99';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(count).toBe(before + 1);
  });

  it('does not re-run on input when autoCalc=false', () => {
    const container = makeContainer();
    let count = 0;
    createHealthCalculator({
      container,
      containerClass: 'test-c',
      autoCalc: false,
      fields: [{ id: 'n', label: 'N', value: 1 }],
      onCalculate: () => { count++; }
    });
    const before = count;
    const input = container.querySelector('#n');
    input.value = '99';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(count).toBe(before);
  });

  it('supports custom field type with raw HTML', () => {
    const container = makeContainer();
    createHealthCalculator({
      container,
      containerClass: 'test-c',
      fields: [{ type: 'custom', html: '<div class="custom-thing">hi</div>' }],
      onCalculate: () => {}
    });
    expect(container.querySelector('.custom-thing').textContent).toBe('hi');
  });

  it('injects scoped style element with extraCSS', () => {
    const container = makeContainer();
    createHealthCalculator({
      container,
      containerClass: 'test-c',
      extraCSS: '.test-c .marker { color: red; }',
      fields: [],
      onCalculate: () => {}
    });
    const style = container.querySelector('style');
    expect(style.textContent).toContain('.test-c');
    expect(style.textContent).toContain('.marker');
  });

  it('returns run function that can be invoked manually', () => {
    const container = makeContainer();
    let count = 0;
    const { run } = createHealthCalculator({
      container,
      containerClass: 'test-c',
      autoCalc: false,
      fields: [],
      onCalculate: () => { count++; }
    });
    const before = count;
    run();
    run();
    expect(count).toBe(before + 2);
  });
});

describe('createHealthCalculator XSS protection', () => {
  it('escapes HTML in field.label', () => {
    const container = makeContainer();
    createHealthCalculator({
      container,
      containerClass: 'test-c',
      fields: [{ id: 'a', label: '<img src=x onerror=alert(1)>', value: 1 }],
      onCalculate: () => {}
    });
    const label = container.querySelector('label');
    expect(label.innerHTML).toBe('&lt;img src=x onerror=alert(1)&gt;');
    expect(label.querySelector('img')).toBeNull();
  });

  it('escapes HTML in field.id', () => {
    const container = makeContainer();
    createHealthCalculator({
      container,
      containerClass: 'test-c',
      fields: [{ id: 'a"><script>alert(1)</script>', label: 'A', value: 1 }],
      onCalculate: () => {}
    });
    expect(container.querySelector('script')).toBeNull();
    expect(container.innerHTML).not.toContain('<script>alert(1)</script>');
  });

  it('escapes HTML in field.value', () => {
    const container = makeContainer();
    createHealthCalculator({
      container,
      containerClass: 'test-c',
      fields: [{ id: 'a', label: 'A', value: '"><script>alert(1)</script>' }],
      onCalculate: () => {}
    });
    expect(container.querySelector('script')).toBeNull();
  });

  it('escapes HTML in select options', () => {
    const container = makeContainer();
    createHealthCalculator({
      container,
      containerClass: 'test-c',
      fields: [{ id: 's', type: 'select', label: 'S', options: [
        { value: 'v', label: '<img onerror=alert(1)>' }
      ]}],
      onCalculate: () => {}
    });
    const opt = container.querySelector('option');
    expect(opt.innerHTML).toContain('&lt;img');
    expect(container.querySelector('img')).toBeNull();
  });

  it('escapes HTML in calcButtonLabel', () => {
    const container = makeContainer();
    createHealthCalculator({
      container,
      containerClass: 'test-c',
      calcButtonLabel: '<script>alert(1)</script>',
      fields: [],
      onCalculate: () => {}
    });
    const btn = container.querySelector('#hc-calc-btn');
    expect(btn.textContent).toBe('<script>alert(1)</script>');
    expect(btn.innerHTML).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(container.querySelector('script')).toBeNull();
  });

  it('rejects containerClass with HTML-injection characters', () => {
    const container = makeContainer();
    expect(() => createHealthCalculator({
      container,
      containerClass: 'evil"><script>alert(1)</script>',
      fields: [],
      onCalculate: () => {}
    })).toThrow(/containerClass/);
  });

  it('rejects containerClass starting with digit or hyphen', () => {
    const container = makeContainer();
    expect(() => createHealthCalculator({
      container,
      containerClass: '1bad',
      fields: [],
      onCalculate: () => {}
    })).toThrow(/containerClass/);
    expect(() => createHealthCalculator({
      container,
      containerClass: '-bad',
      fields: [],
      onCalculate: () => {}
    })).toThrow(/containerClass/);
  });

  it('accepts valid containerClass names with hyphens and underscores', () => {
    const container = makeContainer();
    expect(() => createHealthCalculator({
      container,
      containerClass: 'bf-container_v2',
      fields: [],
      onCalculate: () => {}
    })).not.toThrow();
  });

  it('skips min/max attribute when not a number', () => {
    const container = makeContainer();
    createHealthCalculator({
      container,
      containerClass: 'test-c',
      fields: [{ id: 'a', label: 'A', value: 1, min: '<script>alert(1)</script>', max: '">' }],
      onCalculate: () => {}
    });
    const input = container.querySelector('#a');
    expect(input.hasAttribute('min')).toBe(false);
    expect(input.hasAttribute('max')).toBe(false);
    expect(container.querySelector('script')).toBeNull();
  });

  it('keeps min/max attribute when numeric', () => {
    const container = makeContainer();
    createHealthCalculator({
      container,
      containerClass: 'test-c',
      fields: [{ id: 'a', label: 'A', value: 1, min: 0, max: 100 }],
      onCalculate: () => {}
    });
    const input = container.querySelector('#a');
    expect(input.getAttribute('min')).toBe('0');
    expect(input.getAttribute('max')).toBe('100');
  });
});

describe('feetInchesToCm', () => {
  it('converts 5 feet 7 inches to ~170 cm', () => {
    expect(feetInchesToCm(5, 7)).toBeCloseTo(170.18, 2);
  });

  it('converts 6 feet 0 inches to ~183 cm', () => {
    expect(feetInchesToCm(6, 0)).toBeCloseTo(182.88, 2);
  });

  it('converts 0 feet 0 inches to 0 cm', () => {
    expect(feetInchesToCm(0, 0)).toBe(0);
  });

  it('treats inches as 0-11, not 12+ (no overflow)', () => {
    expect(feetInchesToCm(5, 12)).toBeCloseTo(feetInchesToCm(6, 0), 2);
  });
});

describe('body-fat math', () => {
  it('classifies male in athletes range', () => {
    const bf = bodyFatPercent({ gender: 'male', height: 175, neck: 38, waist: 80, hip: 0 });
    expect(bf).toBeGreaterThan(5);
    expect(bf).toBeLessThan(15);
  });

  it('returns female BF in different range than male for similar inputs', () => {
    const male = bodyFatPercent({ gender: 'male', height: 170, neck: 38, waist: 85, hip: 0 });
    const female = bodyFatPercent({ gender: 'female', height: 170, neck: 38, waist: 85, hip: 95 });
    expect(female).toBeGreaterThan(male);
  });

  it('clamps to [2, 60]', () => {
    const low = bodyFatPercent({ gender: 'male', height: 200, neck: 50, waist: 50, hip: 0 });
    const high = bodyFatPercent({ gender: 'male', height: 150, neck: 20, waist: 200, hip: 0 });
    expect(low).toBeGreaterThanOrEqual(2);
    expect(high).toBeLessThanOrEqual(60);
  });

  it('classifyBodyFat returns [name, color]', () => {
    const [name, color] = classifyBodyFat('male', 12);
    expect(name).toBe('Athletes');
    expect(color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('scaleBarPercent is 0 at 0% body fat', () => {
    expect(scaleBarPercent(0)).toBe(0);
  });

  it('scaleBarPercent is 100 at 40% body fat', () => {
    expect(scaleBarPercent(40)).toBe(100);
  });

  it('scaleBarPercent caps at 100 for body fat > 40% (no overflow)', () => {
    expect(scaleBarPercent(50)).toBe(100);
    expect(scaleBarPercent(60)).toBe(100);
  });

  it('scaleBarPercent scales linearly below 40%', () => {
    expect(scaleBarPercent(10)).toBe(25);
    expect(scaleBarPercent(20)).toBe(50);
    expect(scaleBarPercent(30)).toBe(75);
  });
});

describe('macros math', () => {
  it('returns default 30/40/30 for balanced preference', () => {
    expect(getRatios('balanced')).toEqual([30, 40, 30]);
  });

  it('returns correct ratios for highprotein', () => {
    expect(getRatios('highprotein')).toEqual([40, 30, 30]);
  });

  it('adjusts for lose goal: +10 protein, -10 fat', () => {
    const adjusted = adjustForGoal([30, 40, 30], 'lose');
    expect(adjusted).toEqual([40, 40, 20]);
  });

  it('adjusts for gain goal: +5 protein, +10 carbs, -15 fat', () => {
    const adjusted = adjustForGoal([30, 40, 30], 'gain');
    expect(adjusted).toEqual([35, 50, 15]);
  });

  it('returns ratios unchanged for maintain', () => {
    const adjusted = adjustForGoal([30, 40, 30], 'maintain');
    expect(adjusted).toEqual([30, 40, 30]);
  });
});
