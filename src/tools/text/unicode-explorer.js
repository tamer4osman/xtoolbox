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

export function render(container) {
  container.innerHTML = `
    <div class="unicode-container">
      <div class="unicode-search">
        <input type="text" id="search-input" placeholder="Search by name (e.g., 'arrow', 'heart', 'emoji')...">
        <select id="category-select">
          <option value="">All Categories</option>
          <option value="arrows">Arrows</option>
          <option value="symbols">Symbols</option>
          <option value="emoji">Emoji</option>
          <option value="math">Math</option>
          <option value="greek">Greek</option>
          <option value="latin">Latin Extended</option>
        </select>
      </div>
      <div id="results" class="unicode-results"></div>
      <div id="details" class="unicode-details"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .unicode-container { max-width: 800px; margin: 0 auto; }
    .unicode-search { display: flex; gap: var(--space-3); margin-bottom: var(--space-4); }
    .unicode-search input { flex: 1; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .unicode-search select { padding: var(--space-3); border-radius: var(--radius-md); }
    .unicode-results { 
      display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); 
      gap: var(--space-2); max-height: 400px; overflow-y: auto;
      padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-lg);
    }
    .unicode-char { 
      aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
      font-size: 1.5em; cursor: pointer; border-radius: var(--radius-md);
      transition: background 0.2s;
    }
    .unicode-char:hover { background: var(--color-primary); color: white; }
    .unicode-char.selected { background: var(--color-primary); color: white; }
    .unicode-details { 
      margin-top: var(--space-4); padding: var(--space-4); 
      background: var(--color-surface); border-radius: var(--radius-lg);
      display: none;
    }
    .unicode-details.visible { display: block; }
    .unicode-details h3 { margin-bottom: var(--space-2); }
    .unicode-details .detail-row { display: flex; gap: var(--space-4); margin: var(--space-2) 0; }
    .unicode-details .detail-label { font-weight: 600; min-width: 100px; }
  `;
  container.appendChild(style);

  const searchInput = container.querySelector('#search-input');
  const categorySelect = container.querySelector('#category-select');
  const results = container.querySelector('#results');
  const details = container.querySelector('#details');

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

  function renderResults(chars) {
    results.innerHTML = chars.map((c, i) => 
      `<div class="unicode-char" data-index="${i}">${c.char}</div>`
    ).join('');
    
    results.querySelectorAll('.unicode-char').forEach(el => {
      el.addEventListener('click', () => {
        results.querySelectorAll('.unicode-char').forEach(x => x.classList.remove('selected'));
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
    details.classList.add('visible');
    
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
    details.classList.remove('visible');
  }

  searchInput.addEventListener('input', filter);
  categorySelect.addEventListener('change', filter);

  renderResults(charData);
}
