export function initTextDiff() {
  const leftInput = document.getElementById('left-input');
  const rightInput = document.getElementById('right-input');
  const output = document.getElementById('diff-output');
  const compareBtn = document.getElementById('compare-diff');
  const sideBySide = document.getElementById('side-by-side');

  if (!leftInput || !rightInput || !output) return;

  function diffLines(oldText, newText) {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const result = [];
    
    let i = 0, j = 0;
    while (i < oldLines.length || j < newLines.length) {
      if (i >= oldLines.length) {
        result.push({ type: 'added', line: newLines[j] });
        j++;
      } else if (j >= newLines.length) {
        result.push({ type: 'removed', line: oldLines[i] });
        i++;
      } else if (oldLines[i] === newLines[j]) {
        result.push({ type: 'unchanged', line: oldLines[i] });
        i++; j++;
      } else {
        const foundInNew = newLines.indexOf(oldLines[i], j);
        const foundInOld = oldLines.indexOf(newLines[j], i);
        
        if (foundInNew !== -1 && (foundInOld === -1 || foundInNew - j <= foundInOld - i)) {
          result.push({ type: 'added', line: newLines[j] });
          j++;
        } else {
          result.push({ type: 'removed', line: oldLines[i] });
          i++;
        }
      }
    }
    return result;
  }

  function renderDiff(diff) {
    return diff.map(d => {
      const cls = d.type === 'added' ? 'diff-added' : d.type === 'removed' ? 'diff-removed' : 'diff-unchanged';
      const prefix = d.type === 'added' ? '+ ' : d.type === 'removed' ? '- ' : '  ';
      return `<div class="${cls}">${prefix}${escapeHtml(d.line)}</div>`;
    }).join('');
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

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