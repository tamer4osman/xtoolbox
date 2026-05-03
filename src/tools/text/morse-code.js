export function initMorseCode() {
  const input = document.getElementById('morse-input');
  const output = document.getElementById('morse-output');
  const encodeBtn = document.getElementById('encode-morse');
  const decodeBtn = document.getElementById('decode-morse');
  const copyBtn = document.getElementById('copy-morse');
  const clearBtn = document.getElementById('clear-morse');

  if (!input || !output) return;

  const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
    '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    ' ': '/'
  };

  const reverseMorse = Object.fromEntries(Object.entries(morseCode).map(([k, v]) => [v, k]));

  function encode() {
    const text = input.value.toUpperCase();
    const result = text.split('').map(c => morseCode[c] || c).join(' ');
    output.value = result;
  }

  function decode() {
    const words = input.value.split(' / ');
    const result = words.map(word => {
      return word.split(' ').map(code => reverseMorse[code] || code).join('');
    }).join(' ');
    output.value = result;
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