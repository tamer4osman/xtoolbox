export function render(container) {
  container.innerHTML = `
    <div class="lorem-container">
      <h2>Lorem Ipsum Generator</h2>
      <div class="controls">
        <div class="control-row">
          <label>Words</label>
          <input type="number" id="count" value="50" min="1" max="500">
        </div>
        <div class="control-row">
          <label>Type</label>
          <select id="type">
            <option value="words">Words</option>
            <option value="sentences">Sentences</option>
            <option value="paragraphs">Paragraphs</option>
          </select>
        </div>
        <button id="generateBtn" class="generate-btn">Generate</button>
      </div>
      <div class="output"><pre id="result"></pre><button id="copyBtn">Copy</button></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .lorem-container { max-width: 700px; margin: 0 auto; }
    .lorem-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .controls { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); margin-bottom: var(--space-4); }
    .control-row { display: flex; gap: var(--space-3); margin-bottom: var(--space-3); align-items: center; }
    .control-row label { width: 80px; font-weight: 500; }
    .control-row input, .control-row select { flex: 1; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .generate-btn { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .output { display: flex; gap: var(--space-2); background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); }
    .output pre { flex: 1; margin: 0; font-size: var(--text-sm); white-space: pre-wrap; }
    #copyBtn { padding: var(--space-2) var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
  `;
  container.appendChild(style);

  const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'in', 'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'];

  function generate() {
    const count = parseInt(container.querySelector('#count').value) || 50;
    const type = container.querySelector('#type').value;
    let result = '';
    if (type === 'words') {
      for (let i = 0; i < count; i++) result += words[Math.floor(Math.random() * words.length)] + ' ';
    } else if (type === 'sentences') {
      const sentenceCount = Math.max(1, Math.floor(count / 8));
      for (let i = 0; i < sentenceCount; i++) {
        const len = Math.floor(Math.random() * 10) + 5;
        let sentence = '';
        for (let j = 0; j < len; j++) sentence += words[Math.floor(Math.random() * words.length)] + ' ';
        result += sentence.charAt(0).toUpperCase() + sentence.slice(1).trim() + '. ';
      }
    } else {
      const paraCount = Math.max(1, Math.floor(count / 5));
      for (let p = 0; p < paraCount; p++) {
        let para = '';
        for (let s = 0; s < 5; s++) {
          const len = Math.floor(Math.random() * 10) + 8;
          let sentence = '';
          for (let j = 0; j < len; j++) sentence += words[Math.floor(Math.random() * words.length)] + ' ';
          para += sentence.charAt(0).toUpperCase() + sentence.slice(1).trim() + '. ';
        }
        result += para.trim() + '\n\n';
      }
    }
    container.querySelector('#result').textContent = result.trim();
  }

  container.querySelector('#generateBtn').addEventListener('click', generate);
  container.querySelector('#copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#result').textContent);
    container.querySelector('#copyBtn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copyBtn').textContent = 'Copy', 1500);
  });
  generate();
}
