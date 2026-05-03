export function initLoremGenerator() {
  const generateBtn = document.getElementById('generate-lorem');
  const output = document.getElementById('lorem-output');
  const countInput = document.getElementById('lorem-count');
  const typeSelect = document.getElementById('lorem-type');
  const copyBtn = document.getElementById('copy-lorem');

  if (!output) return;

  const loremWords = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'];

  const sentences = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.',
    'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.',
    'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
    'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.',
    'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis.',
    'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis.'
  ];

  function generate() {
    const count = countInput ? parseInt(countInput.value) || 5 : 5;
    const type = typeSelect ? typeSelect.value : 'paragraphs';
    let result = '';

    if (type === 'words') {
      const words = [];
      for (let i = 0; i < count; i++) {
        words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
      }
      result = words.join(' ');
    } else if (type === 'sentences') {
      for (let i = 0; i < count; i++) {
        result += sentences[Math.floor(Math.random() * sentences.length)] + ' ';
      }
    } else {
      for (let i = 0; i < count; i++) {
        const paraLength = Math.floor(Math.random() * 3) + 2;
        for (let j = 0; j < paraLength; j++) {
          result += sentences[Math.floor(Math.random() * sentences.length)] + ' ';
        }
        result += '\n\n';
      }
    }

    output.value = result.trim();
  }

  if (generateBtn) generateBtn.addEventListener('click', generate);
  if (countInput) countInput.addEventListener('input', generate);
  if (typeSelect) typeSelect.addEventListener('change', generate);
  
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy', 2000);
      });
    });
  }

  generate();
}