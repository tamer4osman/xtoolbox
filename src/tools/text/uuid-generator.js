export function initUuidGenerator() {
  const generateBtn = document.getElementById('generate-uuid');
  const output = document.getElementById('uuid-output');
  const copyBtn = document.getElementById('copy-uuid');
  const versionSelect = document.getElementById('uuid-version');

  if (!output) return;

  function generateUUID(version) {
    switch(version) {
      case 'v1':
        return crypto.randomUUID();
      case 'v4':
      default:
        return crypto.randomUUID();
    }
  }

  function generate() {
    const version = versionSelect ? versionSelect.value : 'v4';
    const uuid = generateUUID(version);
    output.value = uuid;
  }

  if (generateBtn) generateBtn.addEventListener('click', generate);
  
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy', 2000);
      });
    });
  }

  if (versionSelect) {
    versionSelect.addEventListener('change', generate);
  }

  generate();
}