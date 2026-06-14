import { describe, it, expect } from 'vitest';
import { $ } from '../utils/dom-query.js';

describe('$', () => {
  it('queries element by selector', () => {
    document.body.innerHTML = '<div id="test">hi</div>';
    expect($('#test').textContent).toBe('hi');
  });

  it('queries within parent', () => {
    document.body.innerHTML = '<section><p class="para">text</p></section>';
    const section = document.querySelector('section');
    expect($('.para', section).textContent).toBe('text');
  });

  it('returns null for missing element', () => {
    expect($('#missing')).toBeNull();
  });
});
