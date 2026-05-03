export const toolConfig = {
  id: 'markdown-html',
  name: 'Markdown to HTML',
  category: 'text',
  description: 'Convert Markdown to HTML with live preview.',
  icon: '📄',
  accept: '.md,.markdown',
  maxSizeMB: 1,
  keywords: ['markdown to html', 'md converter', 'markdown parser'],
  steps: ['Enter Markdown', 'Get HTML']
};

export function render(container) {
  container.innerHTML = `
    <div class="md-container">
      <div class="md-input">
        <h3>Markdown</h3>
        <textarea id="md-input" placeholder="# Hello World&#10;&#10;**Bold** and *italic*"># Hello World

**Bold** and *italic*

- List item 1
- List item 2

[Link](https://example.com)</textarea>
      </div>
      <div class="md-output">
        <h3>HTML</h3>
        <pre id="html-output"></pre>
        <button id="copy-btn" class="btn btn-secondary">Copy HTML</button>
      </div>
    </div>
    <div class="md-preview">
      <h3>Preview</h3>
      <div id="preview"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .md-container { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .md-input textarea, .md-output pre { width: 100%; min-height: 300px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-family: monospace; font-size: 14px; }
    .md-output pre { background: var(--color-surface); overflow: auto; }
    .md-preview { margin-top: var(--space-4); padding: var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .md-preview h3 { margin-bottom: var(--space-3); }
    .md-input h3, .md-output h3 { margin-bottom: var(--space-2); font-size: var(--text-sm); color: var(--color-muted); }
    #copy-btn { margin-top: var(--space-2); }
    .md-preview img { max-width: 100%; }
    .md-preview code { background: var(--color-surface); padding: 2px 6px; border-radius: var(--radius-sm); }
    .md-preview pre code { display: block; padding: var(--space-3); overflow: auto; }
  `;
  container.appendChild(style);

  const mdInput = container.querySelector('#md-input');
  const htmlOutput = container.querySelector('#html-output');
  const preview = container.querySelector('#preview');
  const copyBtn = container.querySelector('#copy-btn');

  const simpleMd = (md) => {
    let html = md
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n\n/g, '<br>');
    return html;
  };

  function convert() {
    const md = mdInput.value;
    const html = simpleMd(md);
    htmlOutput.textContent = html;
    preview.innerHTML = html;
  }

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(htmlOutput.textContent);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy HTML', 1500);
  });

  mdInput.addEventListener('input', convert);
  convert();
}
