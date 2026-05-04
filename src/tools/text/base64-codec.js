export const toolConfig = {
  id: 'base64-codec',
  name: 'Base64 Codec',
  category: 'encoding',
  description: 'Encode and decode Base64.',
  icon: '🔤',
  status: 'done'
};

export function initBase64Codec() {
  const input = document.getElementById('base64-input');
  const output = document.getElementById('base64-output');
  const encodeBtn = document.getElementById('encode-base64');
  const decodeBtn = document.getElementById('decode-base64');
  const copyBtn = document.getElementById('copy-base64');
  const clearBtn = document.getElementById('clear-base64');

  if (!input || !output) return;

  function encode() {
    try {
      output.value = btoa(input.value);
    } catch (e) {
      output.value = 'Error: Invalid input for Base64 encoding';
    }
  }

  function decode() {
    try {
      output.value = atob(input.value);
    } catch (e) {
      output.value = 'Error: Invalid Base64 string';
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

  input.addEventListener('input', () => {
    if (encodeBtn) encode();
  });
}