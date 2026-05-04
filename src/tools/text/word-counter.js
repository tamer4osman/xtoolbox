export const toolConfig = {
  id: 'word-counter',
  name: 'Word Counter',
  category: 'text',
  description: 'Count words, characters, sentences, and paragraphs.',
  icon: '🔢',
  accept: null,
  maxSizeMB: null,
  keywords: ['word counter', 'count words', 'character count', 'text analyzer'],
  steps: ['Enter or paste text', 'Get counts']
};

export function render(container) {
  container.innerHTML = `
    <div class="counter-container">
      <textarea id="text-input" placeholder="Enter or paste your text here..."></textarea>
      <div class="counter-stats">
        <div class="stat">
          <span class="stat-value" id="words">0</span>
          <span class="stat-label">Words</span>
        </div>
        <div class="stat">
          <span class="stat-value" id="chars">0</span>
          <span class="stat-label">Characters</span>
        </div>
        <div class="stat">
          <span class="stat-value" id="lines">0</span>
          <span class="stat-label">Lines</span>
        </div>
        <div class="stat">
          <span class="stat-value" id="sentences">0</span>
          <span class="stat-label">Sentences</span>
        </div>
        <div class="stat">
          <span class="stat-value" id="paragraphs">0</span>
          <span class="stat-label">Paragraphs</span>
        </div>
        <div class="stat">
          <span class="stat-value" id="reading-time">0 min</span>
          <span class="stat-label">Reading Time</span>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .counter-container textarea { width: 100%; min-height: 200px; padding: var(--space-4); border: 2px solid #ddd; border-radius: var(--radius-md); font-size: var(--text-base); resize: vertical; background: #fff; }
    .counter-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); margin-top: var(--space-4); }
    .stat { text-align: center; padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius-lg); }
    .stat-value { display: block; font-size: var(--text-2xl); font-weight: bold; color: var(--color-primary); }
    .stat-label { font-size: var(--text-sm); color: var(--color-muted); }
  `;
  container.appendChild(style);

  const textInput = container.querySelector('#text-input');
  const wordsEl = container.querySelector('#words');
  const charsEl = container.querySelector('#chars');
  const linesEl = container.querySelector('#lines');
  const sentencesEl = container.querySelector('#sentences');
  const paragraphsEl = container.querySelector('#paragraphs');
  const readingTimeEl = container.querySelector('#reading-time');

  function count() {
    const text = textInput.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text ? text.split('\n').length : 0;
    const sentences = text ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0;
    const paragraphs = text ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
    const readingTime = Math.ceil(words / 200);

    wordsEl.textContent = words.toLocaleString();
    charsEl.textContent = chars.toLocaleString();
    linesEl.textContent = lines.toLocaleString();
    sentencesEl.textContent = sentences.toLocaleString();
    paragraphsEl.textContent = Math.max(1, paragraphs).toLocaleString();
    readingTimeEl.textContent = readingTime + ' min';
  }

  textInput.addEventListener('input', count);
  count();
}
