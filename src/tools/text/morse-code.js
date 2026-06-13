import { createCodecTool } from '../shared/codec-factory.js';

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

export const toolConfig = {
  id: 'morse-code',
  name: 'Morse Code',
  category: 'encoding',
  description: 'Morse code translator.',
  icon: '📡',
  status: 'done'
};

export const initMorseCode = createCodecTool({
  inputId: 'morse-input',
  outputId: 'morse-output',
  encodeId: 'encode-morse',
  decodeId: 'decode-morse',
  copyId: 'copy-morse',
  clearId: 'clear-morse',
  encode: (v) => v.toUpperCase().split('').map(c => morseCode[c] || c).join(' '),
  decode: (v) => v.split(' / ').map(w => w.split(' ').map(c => reverseMorse[c] || c).join('')).join(' ')
});