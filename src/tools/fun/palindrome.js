export function isPalindrome(str) {
  if (typeof str !== 'string') return false;
  const clean = str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return clean.length > 0 && clean === clean.split('').reverse().join('');
}

export function palindromeScore(str) {
  if (typeof str !== 'string') return 0;
  const clean = str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  if (clean.length === 0) return 0;
  let matches = 0;
  for (let i = 0; i < Math.floor(clean.length / 2); i++) {
    if (clean[i] === clean[clean.length - 1 - i]) matches++;
  }
  return Math.round((matches / Math.floor(clean.length / 2)) * 100);
}

export const toolConfig = {
  id: 'palindrome',
  name: 'Palindrome Checker',
  category: 'fun',
  description: 'Check if any word, phrase, or number is a palindrome. See the reversed version and a character comparison.',
  icon: '🔄',
  accept: null,
  maxSizeMB: null,
  keywords: ['palindrome', 'palindrome checker', 'reverse text', 'symmetrical text', 'word play'],
  steps: ['Enter any text, number, or phrase', 'See if it reads the same forwards and backwards', 'View the character-by-character comparison'],
  faqs: [
    { question: 'What is a palindrome?', answer: 'A word, phrase, or sequence that reads the same forwards and backwards (e.g., "racecar", "madam").' },
    { question: 'How is punctuation handled?', answer: 'Spaces, punctuation, and special characters are ignored. Only letters and numbers are compared.' }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div class="form-group">
        <label>Enter Text</label>
        <input type="text" id="pc-input" class="text-input" placeholder="racecar, A man a plan a canal panama, 12321" value="racecar" autofocus>
      </div>

      <div id="pc-result" style="margin:var(--space-4) 0;background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-4);text-align:center;">
        <div id="pc-badge" style="display:inline-block;padding:var(--space-1) var(--space-3);border-radius:999px;font-size:var(--text-sm);font-weight:700;text-transform:uppercase;">Yes</div>
        <div id="pc-reversed" style="font-size:var(--text-xl);font-weight:700;margin-top:var(--space-3);font-family:monospace;">racecar</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:var(--space-1);">Reversed</div>
        <div id="pc-score" style="margin-top:var(--space-3);">
          <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:var(--space-1);">Palindrome Score</div>
          <div style="width:100%;height:8px;background:var(--color-border);border-radius:999px;overflow:hidden;">
            <div id="pc-score-bar" style="height:100%;width:100%;border-radius:999px;transition:width .3s;"></div>
          </div>
          <div id="pc-score-label" style="font-size:var(--text-sm);font-weight:600;margin-top:var(--space-1);">100%</div>
        </div>
      </div>

      <div id="pc-compare" style="background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-4);">
        <div style="font-weight:600;margin-bottom:var(--space-2);">Character Comparison</div>
        <div id="pc-compare-grid" style="display:flex;flex-wrap:wrap;gap:var(--space-2);justify-content:center;font-family:monospace;"></div>
      </div>
    </div>
  `;

  const input = container.querySelector('#pc-input');
  const badge = container.querySelector('#pc-badge');
  const reversed = container.querySelector('#pc-reversed');
  const scoreBar = container.querySelector('#pc-score-bar');
  const scoreLabel = container.querySelector('#pc-score-label');
  const compareGrid = container.querySelector('#pc-compare-grid');

  function update() {
    const text = input.value;
    const clean = text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    if (!clean) {
      badge.textContent = '—';
      badge.style.background = 'var(--color-border)';
      badge.style.color = 'var(--color-text-muted)';
      reversed.textContent = '—';
      scoreBar.style.width = '0%';
      scoreBar.style.background = 'var(--color-border)';
      scoreLabel.textContent = '—';
      compareGrid.innerHTML = '<span style="color:var(--color-text-muted);">Enter text to compare</span>';
      return;
    }

    const palin = isPalindrome(text);
    const score = palindromeScore(text);

    if (palin) {
      badge.textContent = '✓ Palindrome';
      badge.style.background = 'var(--color-success, #22c55e)';
      badge.style.color = '#fff';
    } else {
      badge.textContent = '✗ Not a Palindrome';
      badge.style.background = 'var(--color-danger, #ef4444)';
      badge.style.color = '#fff';
    }

    const rev = text.split('').reverse().join('');
    reversed.textContent = rev;

    scoreBar.style.width = score + '%';
    scoreBar.style.background = score === 100 ? 'var(--color-success, #22c55e)' : score >= 50 ? '#eab308' : 'var(--color-danger, #ef4444)';
    scoreLabel.textContent = score + '%';

    compareGrid.innerHTML = '';
    for (let i = 0; i < clean.length; i++) {
      const j = clean.length - 1 - i;
      const char = clean[i];
      const match = i <= j ? clean[i] === clean[j] : true;
      const el = document.createElement('span');
      el.textContent = char;
      if (i < j) {
        el.style.cssText = `display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:4px;font-size:var(--text-sm);font-weight:700;background:${match ? 'var(--color-success, #22c55e)' : 'var(--color-danger, #ef4444)'};color:#fff;`;
      } else if (i === j) {
        el.style.cssText = `display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:4px;font-size:var(--text-sm);font-weight:700;background:#6366f1;color:#fff;`;
      }
      compareGrid.appendChild(el);
    }
  }

  input.addEventListener('input', update);
  update();
}

export function destroy() {}
