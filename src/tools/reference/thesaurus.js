export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <div class="tool-icon">📖</div>
        <h1>Thesaurus</h1>
        <p class="tool-description">Find synonyms, antonyms, and related words.</p>
      </div>
      <div class="tool-content">
        <div class="search-box">
          <input type="text" id="word-input" class="tool-input" placeholder="Enter a word..." />
          <button id="search-btn" class="tool-button primary">Find Words</button>
        </div>
        <div id="loading" class="loading hidden">Searching...</div>
        <div id="result" class="result hidden">
          <div class="word-header">
            <h2 id="word"></h2>
          </div>
          <div id="synonyms-section" class="word-section">
            <h3>Synonyms</h3>
            <div id="synonyms" class="word-list"></div>
          </div>
          <div id="antonyms-section" class="word-section">
            <h3>Antonyms</h3>
            <div id="antonyms" class="word-list"></div>
          </div>
        </div>
        <div id="error" class="error hidden"></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .tool-container { max-width: 600px; margin: 0 auto; }
    .tool-header { text-align: center; margin-bottom: var(--space-8); }
    .search-box { display: flex; gap: var(--space-3); margin-bottom: var(--space-6); }
    .tool-input { flex: 1; padding: var(--space-3) var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
    .tool-input:focus { border-color: var(--color-primary); outline: none; }
    .tool-button.primary { padding: var(--space-3) var(--space-6); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .loading, .error { text-align: center; padding: var(--space-8); color: var(--color-text-secondary); }
    .error { color: var(--color-error); }
    .result { animation: fadeIn 0.3s; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .word-header { text-align: center; margin-bottom: var(--space-6); }
    .word-header h2 { font-size: 2rem; }
    .word-section { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); margin-bottom: var(--space-4); }
    .word-section h3 { color: var(--color-primary); margin-bottom: var(--space-3); }
    .word-list { display: flex; flex-wrap: wrap; gap: var(--space-2); }
    .word-tag { background: var(--color-bg); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); font-size: var(--text-sm); cursor: pointer; transition: all 0.2s; }
    .word-tag:hover { background: var(--color-primary); color: white; }
    .hidden { display: none !important; }
  `;
  container.appendChild(style);

  const searchBtn = container.querySelector('#search-btn');
  const wordInput = container.querySelector('#word-input');
  const loading = container.querySelector('#loading');
  const result = container.querySelector('#result');
  const error = container.querySelector('#error');

  async function lookupWord(word) {
    const res = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + word);
    if (!res.ok) throw new Error('Word not found');
    return res.json();
  }

  searchBtn.addEventListener('click', async () => {
    const word = wordInput.value.trim();
    if (!word) { alert('Enter a word'); return; }

    loading.classList.remove('hidden');
    result.classList.add('hidden');
    error.classList.add('hidden');

    try {
      const data = await lookupWord(word);
      const entry = data[0];
      
      document.getElementById('word').textContent = entry.word;

      const synonyms = new Set();
      const antonyms = new Set();
      
      entry.meanings.forEach(meaning => {
        meaning.synonyms.forEach(s => synonyms.add(s));
        meaning.antonyms.forEach(a => antonyms.add(a));
        meaning.definitions.forEach(def => {
          def.synonyms?.forEach(s => synonyms.add(s));
          def.antonyms?.forEach(a => antonyms.add(a));
        });
      });

      const synDiv = document.getElementById('synonyms');
      const antDiv = document.getElementById('antonyms');
      
      synDiv.innerHTML = synonyms.size 
        ? Array.from(synonyms).slice(0, 20).map(s => '<span class="word-tag">' + s + '</span>').join('')
        : '<span style="color: var(--color-text-muted)">No synonyms found</span>';
      
      antDiv.innerHTML = antonyms.size
        ? Array.from(antonyms).slice(0, 20).map(a => '<span class="word-tag">' + a + '</span>').join('')
        : '<span style="color: var(--color-text-muted)">No antonyms found</span>';

      result.classList.remove('hidden');
    } catch (err) {
      error.textContent = 'Word not found. Please try another word.';
      error.classList.remove('hidden');
    } finally {
      loading.classList.add('hidden');
    }
  });

  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('word-tag')) {
      wordInput.value = e.target.textContent;
      searchBtn.click();
    }
  });

  wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchBtn.click();
  });

  }
