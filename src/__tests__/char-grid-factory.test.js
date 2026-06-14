import { describe, it, expect, beforeEach } from 'vitest';
import { createCharGrid } from '../tools/shared/char-grid-factory.js';

describe('char-grid-factory', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    return () => document.body.removeChild(container);
  });

  it('returns a render function', () => {
    const render = createCharGrid({
      filterItem: (item, query) => item.name.toLowerCase().includes(query)
    });
    expect(typeof render).toBe('function');
  });

  it('renders items using renderItem callback', () => {
    const render = createCharGrid({
      filterItem: (item, query) => item.name.toLowerCase().includes(query)
    });
    const data = [{ name: 'Alice' }, { name: 'Bob' }];
    render(container, data, (item) => `<div class="char-grid-item" data-index="0">${item.name}</div>`);
    expect(container.innerHTML).toContain('Alice');
    expect(container.innerHTML).toContain('Bob');
  });

  it('filters items based on search input', () => {
    const render = createCharGrid({
      filterItem: (item, query) => item.name.toLowerCase().includes(query)
    });
    const data = [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Alicia' }];
    render(container, data, (item, i) => `<div class="char-grid-item" data-index="${i}">${item.name}</div>`);
    const searchInput = container.querySelector('#search-input');
    searchInput.value = 'ali';
    searchInput.dispatchEvent(new Event('input'));
    const items = container.querySelectorAll('.char-grid-item');
    expect(items.length).toBe(2);
  });

  it('shows detail section when detailSection is true', () => {
    const render = createCharGrid({
      detailSection: true,
      renderDetail: (item) => `<div class="detail">${item.name}</div>`,
      filterItem: (item, query) => item.name.toLowerCase().includes(query)
    });
    const data = [{ name: 'Alice' }];
    render(container, data, (item, i) => `<div class="char-grid-item" data-index="${i}">${item.name}</div>`);
    const item = container.querySelector('.char-grid-item');
    item.click();
    expect(container.querySelector('.detail')).not.toBeNull();
    expect(container.querySelector('.detail').textContent).toBe('Alice');
  });

  it('calls onSelect when item is clicked', () => {
    let selected = null;
    const render = createCharGrid({
      onSelect: (item) => { selected = item; },
      filterItem: (item, query) => item.name.toLowerCase().includes(query)
    });
    const data = [{ name: 'Alice' }];
    render(container, data, (item, i) => `<div class="char-grid-item" data-index="${i}">${item.name}</div>`);
    container.querySelector('.char-grid-item').click();
    expect(selected).toEqual({ name: 'Alice' });
  });

  it('renders category select when categories provided', () => {
    const render = createCharGrid({
      categorySelect: true,
      categories: [{ value: 'cat1', label: 'Category 1' }],
      filterItem: (item, query) => item.name.toLowerCase().includes(query)
    });
    const data = [{ name: 'Alice', category: 'cat1' }];
    render(container, data, (item, i) => `<div class="char-grid-item" data-index="${i}">${item.name}</div>`);
    const select = container.querySelector('#category-select');
    expect(select).not.toBeNull();
    expect(select.options.length).toBe(2);
  });

  it('returns API object with filter and renderResults', () => {
    const render = createCharGrid({
      filterItem: (item, query) => item.name.toLowerCase().includes(query)
    });
    const api = render(container, [], () => '');
    expect(api.searchInput).not.toBeNull();
    expect(api.results).not.toBeNull();
    expect(typeof api.filter).toBe('function');
    expect(typeof api.renderResults).toBe('function');
  });
});
