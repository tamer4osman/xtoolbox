import { createLookupTool } from '../shared/lookup-tool-factory.js';
import { escapeHtml } from '../../utils/escape-html.js';

const { toolConfig, render } = createLookupTool({
  toolConfig: {
    id: 'thesaurus',
    name: 'Thesaurus',
    category: 'reference',
    description: 'Find synonyms, antonyms, and related words.',
    icon: '📖',
    status: 'done'
  },
  contentHTML: `
    <div class="search-box">
      <input type="text" id="word-input" class="tool-input" placeholder="Enter a word..." />
      <button id="search-btn" class="tool-button primary">Find Words</button>
    </div>
  `,
  resultHTML: `
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
  `,
  extraCSS: `
    .word-header { text-align: center; margin-bottom: var(--space-6); }
    .word-header h2 { font-size: 2rem; }
    .word-section { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); margin-bottom: var(--space-4); }
    .word-section h3 { color: var(--color-primary); margin-bottom: var(--space-3); }
    .word-list { display: flex; flex-wrap: wrap; gap: var(--space-2); }
    .word-tag { background: var(--color-bg); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); font-size: var(--text-sm); cursor: pointer; transition: all 0.2s; }
    .word-tag:hover { background: var(--color-primary); color: white; }
  `,
  errorMessage: 'Word not found. Please try another word.',
  validate: (vals) => !vals['word-input']?.trim() ? 'Enter a word' : null,
  onSearch: async (vals, container) => {
    const word = vals['word-input'].trim();
    const res = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word));
    if (!res.ok) throw new Error('Word not found');
    const data = await res.json();
    const entry = data[0];

    container.querySelector('#word').textContent = entry.word;

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

    const renderTags = (set) => set.size
      ? Array.from(set).slice(0, 20).map(s => `<span class="word-tag">${escapeHtml(s)}</span>`).join('')
      : '<span style="color: var(--color-text-muted)">No matches found</span>';

    container.querySelector('#synonyms').innerHTML = renderTags(synonyms);
    container.querySelector('#antonyms').innerHTML = renderTags(antonyms);
  },
  init(container) {
    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('word-tag')) {
        const wordInput = container.querySelector('#word-input');
        wordInput.value = e.target.textContent;
        container.querySelector('#search-btn').click();
      }
    });
  }
});

export { toolConfig, render };
