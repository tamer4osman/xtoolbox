export const toolConfig = {
  id: 'text-diff',
  name: 'Text Diff',
  category: 'text',
  description: 'Compare two texts and see the differences.',
  icon: '🔀',
  accept: null,
  maxSizeMB: null,
  keywords: ['text diff', 'compare text', 'diff tool', 'text compare'],
  steps: ['Enter text A', 'Enter text B', 'See differences']
};

export function render(container) {
  container.innerHTML = `
    <div class="diff-container">
      <div class="diff-inputs">
        <div class="diff-input">
          <h3>Original Text</h3>
          <textarea id="text-a" placeholder="Original text">The quick brown fox jumps over the lazy dog.</textarea>
        </div>
        <div class="diff-input">
          <h3>Changed Text</h3>
          <textarea id="text-b" placeholder="Changed text">The quick red fox jumps over the lazy cat.</textarea>
        </div>
      </div>
      <button id="compare-btn" class="btn btn-primary">Compare</button>
      <div id="diff-output" class="diff-output"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .diff-container { max-width: 900px; margin: 0 auto; }
    .diff-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4); }
    .diff-input textarea { width: 100%; min-height: 150px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .diff-input h3 { margin-bottom: var(--space-2); font-size: var(--text-sm); color: var(--color-muted); }
    .diff-output { margin-top: var(--space-4); padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius-md); font-family: monospace; white-space: pre-wrap; }
    .diff-added { background: #d4edda; color: #155724; }
    .diff-removed { background: #f8d7da; color: #721c24; text-decoration: line-through; }
  `;
  container.appendChild(style);

  const textA = container.querySelector('#text-a');
  const textB = container.querySelector('#text-b');
  const compareBtn = container.querySelector('#compare-btn');
  const output = container.querySelector('#diff-output');

  function diff(a, b) {
    const aLines = a.split('\n');
    const bLines = b.split('\n');
    const result = [];
    const maxLines = Math.max(aLines.length, bLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const al = aLines[i] || '';
      const bl = bLines[i] || '';
      
      if (al === bl) {
        result.push(al);
      } else if (!al) {
        result.push(`<span class="diff-added">+ ${bl}</span>`);
      } else if (!bl) {
        result.push(`<span class="diff-removed">- ${al}</span>`);
      } else {
        result.push(`<span class="diff-removed">- ${al}</span>`);
        result.push(`<span class="diff-added">+ ${bl}</span>`);
      }
    }
    return result.join('\n');
  }

  function compare() {
    output.innerHTML = diff(textA.value, textB.value);
  }

  compareBtn.addEventListener('click', compare);
  compare();
}
