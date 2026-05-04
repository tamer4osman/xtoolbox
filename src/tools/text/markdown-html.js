export const toolConfig = {
  id: 'markdown-html',
  name: 'Markdown to HTML',
  category: 'text',
  description: 'Convert Markdown to HTML with live preview.',
  icon: '📄',
  status: 'done'
};

import { marked } from 'marked';

export function initMarkdownHtml() {
  const textarea = document.getElementById('markdown-input');
  const output = document.getElementById('html-output');
  const copyBtn = document.getElementById('copy-html');
  const clearBtn = document.getElementById('clear-markdown');

  if (!textarea || !output) return;

  marked.setOptions({
    breaks: true,
    gfm: true
  });

  function convert() {
    const markdown = textarea.value;
    output.innerHTML = marked.parse(markdown);
  }

  textarea.addEventListener('input', convert);

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const html = output.innerHTML;
      navigator.clipboard.writeText(html).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy HTML', 2000);
      });
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      textarea.value = '';
      output.innerHTML = '';
      textarea.focus();
    });
  }
}