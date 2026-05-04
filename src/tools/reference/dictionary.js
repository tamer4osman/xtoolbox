export const toolConfig = {
  id: 'dictionary',
  name: 'Dictionary',
  category: 'reference',
  description: 'Look up word definitions, phonetics, examples, and audio pronunciation.',
  icon: '📖',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-content">
        <div class="search-box">
          <input type="text" id="word-input" class="tool-input" placeholder="Enter a word..." />
          <button id="search-btn" class="tool-button primary">Look Up</button>
        </div>
        <div id="loading" class="loading hidden">Searching...</div>
        <div id="result" class="result hidden">
          <div class="word-header">
            <h2 id="word"></h2>
            <span id="phonetic" class="phonetic"></span>
          </div>
          <div id="meanings"></div>
          <button id="play-audio" class="tool-button secondary">🔊 Play Pronunciation</button>
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
    .tool-button.secondary { padding: var(--space-3) var(--space-6); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); cursor: pointer; }
    .loading, .error { text-align: center; padding: var(--space-8); color: var(--color-text-secondary); }
    .error { color: var(--color-error); }
    .result { animation: fadeIn 0.3s; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .word-header { text-align: center; margin-bottom: var(--space-6); }
    .word-header h2 { font-size: 2.5rem; margin-bottom: var(--space-2); }
    .phonetic { color: var(--color-text-secondary); font-size: var(--text-lg); }
    .meaning-section { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); margin-bottom: var(--space-4); }
    .part-of-speech { font-style: italic; color: var(--color-primary); font-weight: 600; margin-bottom: var(--space-3); }
    .definition { margin-bottom: var(--space-2); }
    .example { color: var(--color-text-secondary); font-style: italic; margin-top: var(--space-2); }
    .synonyms { margin-top: var(--space-3); font-size: var(--text-sm); }
    .synonym { display: inline-block; background: var(--color-primary); color: white; padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm); margin-right: var(--space-1); font-size: var(--text-sm); }
    .hidden { display: none !important; }
  `;
  container.appendChild(style);

  const searchBtn = container.querySelector('#search-btn');
  const wordInput = container.querySelector('#word-input');
  const loading = container.querySelector('#loading');
  const result = container.querySelector('#result');
  const error = container.querySelector('#error');
  const playBtn = container.querySelector('#play-audio');
  let audioUrl = null;

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
      document.getElementById('phonetic').textContent = entry.phonetic || '';
      
      const meaningsDiv = document.getElementById('meanings');
      meaningsDiv.innerHTML = '';
      
      audioUrl = entry.phonetics?.find(p => p.audio)?.audio || null;
      playBtn.classList.toggle('hidden', !audioUrl);

      entry.meanings.forEach(meaning => {
        const section = document.createElement('div');
        section.className = 'meaning-section';
        section.innerHTML = '<div class="part-of-speech">' + meaning.partOfSpeech + '</div>';
        
        meaning.definitions.slice(0, 3).forEach(def => {
          section.innerHTML += '<div class="definition">• ' + def.definition + '</div>';
          if (def.example) {
            section.innerHTML += '<div class="example">"' + def.example + '"</div>';
          }
        });
        
        if (meaning.synonyms?.length) {
          section.innerHTML += '<div class="synonyms">Synonyms: ' + meaning.synonyms.slice(0, 5).map(s => '<span class="synonym">' + s + '</span>').join('') + '</div>';
        }
        
        meaningsDiv.appendChild(section);
      });

      result.classList.remove('hidden');
    } catch (err) {
      error.textContent = 'Word not found. Please try another word.';
      error.classList.remove('hidden');
    } finally {
      loading.classList.add('hidden');
    }
  });

  playBtn.addEventListener('click', () => {
    if (audioUrl) {
      new Audio(audioUrl).play();
    }
  });

  wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchBtn.click();
  });

  }
