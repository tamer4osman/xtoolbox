export const toolConfig = {
  id: 'unicode-explorer',
  name: 'Unicode Explorer',
  category: 'text',
  description: 'Explore Unicode characters. Search by name, code point, or browse categories.',
  icon: '🔤',
  accept: null,
  maxSizeMB: null,
  keywords: ['unicode', 'character explorer', 'unicode characters', 'symbol search'],
  steps: ['Search for a character', 'Copy to clipboard', 'View details']
};

import { CHAR_GRID_CSS } from '../shared/char-grid-css.js';

const charData = [
  { char: '→', name: 'Rightwards Arrow', category: 'arrows' },
  { char: '←', name: 'Leftwards Arrow', category: 'arrows' },
  { char: '↑', name: 'Upwards Arrow', category: 'arrows' },
  { char: '↓', name: 'Downwards Arrow', category: 'arrows' },
  { char: '↔', name: 'Left Right Arrow', category: 'arrows' },
  { char: '↕', name: 'Up Down Arrow', category: 'arrows' },
  { char: '⇒', name: 'Rightwards Double Arrow', category: 'arrows' },
  { char: '⇐', name: 'Leftwards Double Arrow', category: 'arrows' },
  { char: '⇑', name: 'Upwards Double Arrow', category: 'arrows' },
  { char: '⇓', name: 'Downwards Double Arrow', category: 'arrows' },
  { char: '❤', name: 'Red Heart', category: 'emoji' },
  { char: '★', name: 'Black Star', category: 'symbols' },
  { char: '✓', name: 'Check Mark', category: 'symbols' },
  { char: '✗', name: 'Ballot X', category: 'symbols' },
  { char: '♠', name: 'Spade Suit', category: 'symbols' },
  { char: '♣', name: 'Club Suit', category: 'symbols' },
  { char: '♥', name: 'Heart Suit', category: 'symbols' },
  { char: '♦', name: 'Diamond Suit', category: 'symbols' },
  { char: '©', name: 'Copyright Sign', category: 'symbols' },
  { char: '®', name: 'Registered Sign', category: 'symbols' },
  { char: '™', name: 'Trade Mark Sign', category: 'symbols' },
  { char: '°', name: 'Degree Sign', category: 'symbols' },
  { char: '±', name: 'Plus Minus Sign', category: 'math' },
  { char: '×', name: 'Multiplication Sign', category: 'math' },
  { char: '÷', name: 'Division Sign', category: 'math' },
  { char: '≠', name: 'Not Equal To', category: 'math' },
  { char: '≈', name: 'Almost Equal To', category: 'math' },
  { char: '∞', name: 'Infinity', category: 'math' },
  { char: 'π', name: 'Pi', category: 'math' },
  { char: 'Σ', name: 'Greek Capital Letter Sigma', category: 'greek' },
  { char: 'α', name: 'Greek Small Letter Alpha', category: 'greek' },
  { char: 'β', name: 'Greek Small Letter Beta', category: 'greek' },
  { char: 'γ', name: 'Greek Small Letter Gamma', category: 'greek' },
  { char: 'δ', name: 'Greek Small Letter Delta', category: 'greek' },
  { char: 'λ', name: 'Greek Small Letter Lambda', category: 'greek' },
  { char: 'Ω', name: 'Greek Capital Letter Omega', category: 'greek' },
  { char: 'ñ', name: 'Latin Small Letter N with Tilde', category: 'latin' },
  { char: 'ç', name: 'Latin Small Letter C with Cedilla', category: 'latin' },
  { char: 'ü', name: 'Latin Small Letter U with Diaeresis', category: 'latin' },
  { char: 'ö', name: 'Latin Small Letter O with Diaeresis', category: 'latin' },
  { char: 'ä', name: 'Latin Small Letter A with Diaeresis', category: 'latin' },
  { char: 'é', name: 'Latin Small Letter E with Acute', category: 'latin' },
  { char: '😀', name: 'Grinning Face', category: 'emoji' },
  { char: '😂', name: 'Face with Tears of Joy', category: 'emoji' },
  { char: '❤️', name: 'Red Heart', category: 'emoji' },
  { char: '👍', name: 'Thumbs Up', category: 'emoji' },
  { char: '🎉', name: 'Party Popper', category: 'emoji' },
  { char: '🔥', name: 'Fire', category: 'emoji' },
  { char: '💯', name: 'Hundred Points', category: 'emoji' },
];

const categories = [
  { value: 'arrows', label: 'Arrows' },
  { value: 'symbols', label: 'Symbols' },
  { value: 'emoji', label: 'Emoji' },
  { value: 'math', label: 'Math' },
  { value: 'greek', label: 'Greek' },
  { value: 'latin', label: 'Latin Extended' },
];

const detailsCss = `
  .unicode-details { 
    margin-top: var(--space-4); padding: var(--space-4); 
    background: var(--color-surface); border-radius: var(--radius-lg);
  }
  .unicode-details h3 { margin-bottom: var(--space-2); }
  .unicode-details .detail-row { display: flex; gap: var(--space-4); margin: var(--space-2) 0; }
  .unicode-details .detail-label { font-weight: 600; min-width: 100px; }
  .unicode-char.selected { background: var(--color-primary); color: white; }
`;

export function render(container) {
  container.innerHTML = `
    <div class="char-grid-container">
      <div class="char-grid-search">
        <input type="text" id="search-input" placeholder="Search by name (e.g., 'arrow', 'heart', 'emoji')...">
        <select id="category-select">
          <option value="">All Categories</option>
          ${categories.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}
        </select>
      </div>
      <div id="results" class="char-grid-results"></div>
      <div id="details" class="unicode-details"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = CHAR_GRID_CSS + detailsCss;
  container.appendChild(style);

  const searchInput = container.querySelector('#search-input');
  const categorySelect = container.querySelector('#category-select');
  const results = container.querySelector('#results');
  const details = container.querySelector('#details');

  function renderResults(chars) {
    results.innerHTML = chars.map((c, i) => 
      `<div class="char-grid-item unicode-char" data-index="${i}">${c.char}</div>`
    ).join('');
    
    results.querySelectorAll('.char-grid-item').forEach(el => {
      el.addEventListener('click', () => {
        results.querySelectorAll('.char-grid-item').forEach(x => x.classList.remove('selected'));
        el.classList.add('selected');
        const idx = parseInt(el.dataset.index);
        showDetails(chars[idx]);
      });
    });
  }

  function showDetails(char) {
    const codePoint = char.char.codePointAt(0);
    details.innerHTML = `
      <h3>${char.char}</h3>
      <div class="detail-row"><span class="detail-label">Name:</span><span>${char.name}</span></div>
      <div class="detail-row"><span class="detail-label">Category:</span><span>${char.category}</span></div>
      <div class="detail-row"><span class="detail-label">Unicode:</span><span>U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}</span></div>
      <div class="detail-row"><span class="detail-label">HTML Entity:</span><span>&amp;#${codePoint};</span></div>
      <button class="btn btn-primary copy-btn">Copy Character</button>
    `;
    
    details.querySelector('.copy-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(char.char);
      details.querySelector('.copy-btn').textContent = 'Copied!';
      setTimeout(() => details.querySelector('.copy-btn').textContent = 'Copy Character', 1500);
    });
  }

  function filter() {
    const query = searchInput.value.toLowerCase();
    const category = categorySelect.value;
    
    let filtered = charData;
    
    if (query) {
      filtered = filtered.filter(c => c.name.toLowerCase().includes(query) || c.char.includes(query));
    }
    if (category) {
      filtered = filtered.filter(c => c.category === category);
    }
    
    renderResults(filtered);
  }

  searchInput.addEventListener('input', filter);
  categorySelect.addEventListener('change', filter);

  renderResults(charData);
}