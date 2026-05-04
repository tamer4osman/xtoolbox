export const toolConfig = {
  id: 'url-codec',
  name: 'URL Encoder',
  category: 'encoding',
  description: 'Encode and decode URL.',
  icon: '🔗',
  status: 'done'
};

export function initUrlCodec() {
  const input = document.getElementById('url-input');
  const output = document.getElementById('url-output');
  const encodeBtn = document.getElementById('encode-url');
  const decodeBtn = document.getElementById('decode-url');
  const copyBtn = document.getElementById('copy-url');
  const clearBtn = document.getElementById('clear-url');

  if (!input || !output) return;

  function encode() {
    try {
      output.value = encodeURIComponent(input.value);
    } catch (e) {
      output.value = 'Error encoding URL';
    }
  }

  function decode() {
    try {
      output.value = decodeURIComponent(input.value);
    } catch (e) {
      output.value = 'Error decoding URL';
    }
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