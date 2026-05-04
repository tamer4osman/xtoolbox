export const toolConfig = {
  id: 'html-entity-codec',
  name: 'HTML Entity Encoder',
  category: 'encoding',
  description: 'Encode HTML entities.',
  icon: '🏷️',
  status: 'done'
};

export function initHtmlEntityCodec() {
  const input = document.getElementById('html-entity-input');
  const output = document.getElementById('html-entity-output');
  const encodeBtn = document.getElementById('encode-html-entity');
  const decodeBtn = document.getElementById('decode-html-entity');
  const copyBtn = document.getElementById('copy-html-entity');
  const clearBtn = document.getElementById('clear-html-entity');

  if (!input || !output) return;

  function encode() {
    const div = document.createElement('div');
    div.textContent = input.value;
    output.value = div.innerHTML;
  }

  function decode() {
    const div = document.createElement('div');
    div.innerHTML = input.value;
    output.value = div.textContent;
  }

  if (encodeBtn) encodeBtn.addEventListener('click', encode);
  if (decodeBtn) decodeBtn.addEventListener('click', decode);
  
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy', 2000);
      });
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      output.value = '';
      input.focus();
    });
  }

  input.addEventListener('input', encode);
}