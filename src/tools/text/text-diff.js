export const toolConfig = {
  id: 'text-diff',
  name: 'Text Diff',
  category: 'text',
  description: 'Compare two texts and see the differences.',
  icon: '🔀',
  status: 'done'
};

export function diffLines(oldText, newText) {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const result = [];

  let i = 0, j = 0;
  while (i < oldLines.length || j < newLines.length) {
    if (i >= oldLines.length) {
      result.push({ type: 'added', line: newLines[j++] });
    } else if (j >= newLines.length) {
      result.push({ type: 'removed', line: oldLines[i++] });
    } else if (oldLines[i] === newLines[j]) {
      result.push({ type: 'unchanged', line: oldLines[i++] });
      j++;
    } else {
      const foundInNew = newLines.indexOf(oldLines[i], j);
      const foundInOld = oldLines.indexOf(newLines[j], i);
      if (foundInNew !== -1 && (foundInOld === -1 || foundInNew - j <= foundInOld - i)) {
        result.push({ type: 'added', line: newLines[j++] });
      } else {
        result.push({ type: 'removed', line: oldLines[i++] });
      }
    }
  }
  return result;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderDiff(diff) {
  const typeClass = { added: 'diff-added', removed: 'diff-removed', unchanged: 'diff-unchanged' };
  const prefix = { added: '+ ', removed: '- ', unchanged: '  ' };
  return diff.map(d => `<div class="${typeClass[d.type]}">${prefix[d.type]}${escapeHtml(d.line)}</div>`).join('');
}

export function initTextDiff() {
  const leftInput = document.getElementById('left-input');
  const rightInput = document.getElementById('right-input');
  const output = document.getElementById('diff-output');
  const compareBtn = document.getElementById('compare-diff');

  if (!leftInput || !rightInput || !output) return;

  function compare() {
    const diff = diffLines(leftInput.value, rightInput.value);
    output.innerHTML = renderDiff(diff);
  }

  if (compareBtn) compareBtn.addEventListener('click', compare);
  if (leftInput && rightInput) {
    leftInput.addEventListener('input', () => { if (compareBtn) compare(); });
    rightInput.addEventListener('input', () => { if (compareBtn) compare(); });
  }
}