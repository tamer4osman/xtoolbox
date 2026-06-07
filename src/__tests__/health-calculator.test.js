import { describe, it, expect, beforeEach } from 'vitest';
import { createHealthCalculator } from '../tools/health/health-calculator.js';
import { bodyFatPercent, classifyBodyFat } from '../tools/health/body-fat-calculator.js';
import { getRatios, adjustForGoal } from '../tools/health/macros-calculator.js';

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
