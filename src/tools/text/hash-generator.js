export function initHashGenerator() {
  const input = document.getElementById('hash-input');
  const algorithmSelect = document.getElementById('hash-algorithm');
  const output = document.getElementById('hash-output');
  const generateBtn = document.getElementById('generate-hash');
  const copyBtn = document.getElementById('copy-hash');

  if (!output) return;

  async function generate() {
    const text = input ? input.value : '';
    const algorithm = algorithmSelect ? algorithmSelect.value : 'SHA-256';
    
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest(algorithm, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      output.value = hashHex;
    } catch (e) {
      output.value = 'Error generating hash';
    }
  }

  if (generateBtn) generateBtn.addEventListener('click', generate);
  if (input) input.addEventListener('input', generate);
  
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy', 2000);
      });
    });
  }

  if (algorithmSelect) algorithmSelect.addEventListener('change', generate);
  
  generate();
}