export function render(container) {
  container.innerHTML = `
    <div class="lorem-container">
      <h2>Lorem Ipsum Generator</h2>
      <div class="lorem-options">
        <div class="form-group">
          <label>Type</label>
          <select id="type">
            <option value="words">Words</option>
            <option value="sentences" selected>Sentences</option>
            <option value="paragraphs">Paragraphs</option>
          </select>
        </div>
        <div class="form-group">
          <label>Count</label>
          <input type="number" id="count" value="5" min="1" max="100" />
        </div>
        <button id="generate-btn" class="generate-btn">Generate</button>
      </div>
      <div class="lorem-output">
        <div class="output-header">
          <span>Generated Text</span>
          <button id="copy-btn">Copy</button>
        </div>
        <pre id="output"></pre>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .lorem-container { max-width: 700px; margin: 0 auto; }
    .lorem-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .lorem-options { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); margin-bottom: var(--space-4); display: flex; gap: var(--space-3); align-items: flex-end; flex-wrap: wrap; }
    .form-group { flex: 1; min-width: 120px; }
    .form-group label { display: block; font-weight: 500; margin-bottom: var(--space-2); font-size: var(--text-sm); }
    .form-group input, .form-group select { width: 100%; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .generate-btn { padding: var(--space-2) var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .lorem-output { background: var(--color-surface); border-radius: var(--radius-xl); overflow: hidden; }
    .output-header { display: flex; justify-content: space-between; padding: var(--space-3); background: var(--color-bg); font-weight: 600; font-size: var(--text-sm); }
    #copy-btn { padding: var(--space-1) var(--space-2); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; font-size: var(--text-xs); }
    #output { padding: var(--space-4); margin: 0; font-family: serif; line-height: 1.8; white-space: pre-wrap; min-height: 100px; }
  `;
  container.appendChild(style);

  const lipsum = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum';
  const words = lipsum.split(' ');

  function generate() {
    const type = container.querySelector('#type').value;
    const count = parseInt(container.querySelector('#count').value) || 5;
    let result = '';
    
    if (type === 'words') {
      for (let i = 0; i < count; i++) {
        result += (i > 0 ? ' ' : '') + words[Math.floor(Math.random() * words.length)];
      }
    } else if (type === 'sentences') {
      for (let i = 0; i < count; i++) {
        const len = 8 + Math.floor(Math.random() * 8);
        let sent = '';
        for (let j = 0; j < len; j++) sent += (j === 0 ? '' : ' ') + words[Math.floor(Math.random() * words.length)];
        result += (i > 0 ? ' ' : '') + sent.charAt(0).toUpperCase() + sent.slice(1) + '.';
      }
    } else {
      for (let i = 0; i < count; i++) {
        const sents = 3 + Math.floor(Math.random() * 4);
        let para = '';
        for (let j = 0; j < sents; j++) {
          const slen = 10 + Math.floor(Math.random() * 10);
          let sent = '';
          for (let k = 0; k < slen; k++) sent += (k === 0 ? '' : ' ') + words[Math.floor(Math.random() * words.length)];
          para += (j > 0 ? ' ' : '') + sent.charAt(0).toUpperCase() + sent.slice(1) + '. ';
        }
        result += (i > 0 ? '\\n\\n' : '') + para;
      }
    }
    
    container.querySelector('#output').textContent = result;
  }

  container.querySelector('#generate-btn').addEventListener('click', generate);
  container.querySelector('#copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#output').textContent);
    container.querySelector('#copy-btn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copy-btn').textContent = 'Copy', 2000);
  });
  
  generate();
  return container;
}
