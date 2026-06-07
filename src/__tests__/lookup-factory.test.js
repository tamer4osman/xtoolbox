import { describe, it, expect, beforeEach, vi } from 'vitest';
import { wireLookupSearch, escapeHtml } from '../tools/shared/lookup.js';

function makeContainer(html) {
  const c = document.createElement('div');
  c.innerHTML = html;
  document.body.appendChild(c);
  return c;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('wireLookupSearch', () => {
  it('shows loading, then result on success', async () => {
    const container = makeContainer(`
      <button id="search-btn">Go</button>
      <input id="city" value="NYC" />
      <div id="loading" class="hidden">Loading</div>
      <div id="result" class="hidden"><span id="r-text"></span></div>
      <div id="error" class="hidden"></div>
    `);
    const onSearch = vi.fn(async () => {
      container.querySelector('#r-text').textContent = 'found';
    });
    wireLookupSearch({
      container,
      searchButtonId: 'search-btn',
      inputSelector: 'input',
      onSearch
    });
    container.querySelector('#search-btn').click();
    expect(container.querySelector('#loading').classList.contains('hidden')).toBe(false);
    await new Promise(r => setTimeout(r, 0));
    expect(container.querySelector('#loading').classList.contains('hidden')).toBe(true);
    expect(container.querySelector('#result').classList.contains('hidden')).toBe(false);
    expect(container.querySelector('#error').classList.contains('hidden')).toBe(true);
    expect(container.querySelector('#r-text').textContent).toBe('found');
  });

  it('shows error when onSearch throws', async () => {
    const container = makeContainer(`
      <button id="search-btn">Go</button>
      <input id="q" />
      <div id="loading" class="hidden">Loading</div>
      <div id="result" class="hidden"></div>
      <div id="error" class="hidden"></div>
    `);
    const onSearch = vi.fn(async () => { throw new Error('boom'); });
    wireLookupSearch({
      container,
      searchButtonId: 'search-btn',
      onSearch,
      errorMessage: 'Failed: see console'
    });
    container.querySelector('#search-btn').click();
    await new Promise(r => setTimeout(r, 0));
    expect(container.querySelector('#error').classList.contains('hidden')).toBe(false);
    expect(container.querySelector('#error').textContent).toBe('Failed: see console');
    expect(container.querySelector('#result').classList.contains('hidden')).toBe(true);
  });

  it('hides previous result and error before new search', async () => {
    const container = makeContainer(`
      <button id="search-btn">Go</button>
      <input id="q" />
      <div id="loading" class="hidden">Loading</div>
      <div id="result" class="hidden">old result</div>
      <div id="error" class="hidden">old error</div>
    `);
    const onSearch = vi.fn(async () => {});
    wireLookupSearch({
      container,
      searchButtonId: 'search-btn',
      onSearch
    });
    container.querySelector('#result').classList.remove('hidden');
    container.querySelector('#error').classList.remove('hidden');
    container.querySelector('#search-btn').click();
    expect(container.querySelector('#result').classList.contains('hidden')).toBe(true);
    expect(container.querySelector('#error').classList.contains('hidden')).toBe(true);
  });

  it('calls validate and shows error if it returns a message', () => {
    const container = makeContainer(`
      <button id="search-btn">Go</button>
      <input id="q" value="" />
      <div id="loading" class="hidden"></div>
      <div id="result" class="hidden"></div>
      <div id="error" class="hidden"></div>
    `);
    const onSearch = vi.fn(async () => {});
    wireLookupSearch({
      container,
      searchButtonId: 'search-btn',
      validate: (vals) => !vals.q ? 'Required' : null,
      onSearch
    });
    container.querySelector('#search-btn').click();
    expect(onSearch).not.toHaveBeenCalled();
    expect(container.querySelector('#error').textContent).toBe('Required');
  });

  it('triggers search on Enter key in input', async () => {
    const container = makeContainer(`
      <button id="search-btn">Go</button>
      <input id="q" value="x" />
      <div id="loading" class="hidden"></div>
      <div id="result" class="hidden"></div>
      <div id="error" class="hidden"></div>
    `);
    const onSearch = vi.fn(async () => {});
    wireLookupSearch({
      container,
      searchButtonId: 'search-btn',
      onSearch
    });
    const input = container.querySelector('input');
    input.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', bubbles: true }));
    await new Promise(r => setTimeout(r, 0));
    expect(onSearch).toHaveBeenCalledTimes(1);
  });
});

describe('escapeHtml', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });
  it('handles ampersands', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });
  it('handles null and undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
  it('preserves safe text', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });
});
