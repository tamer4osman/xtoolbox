import { diffLines, buildMergeResult } from './text-diff.js';

export const toolConfig = {
  id: 'diff-merge',
  name: 'Diff Viewer & Merge Tool',
  category: 'text',
  description: 'Compare two texts side-by-side and merge changes with accept/reject controls.',
  icon: '🔀',
  keywords: ['diff', 'merge', 'compare', 'text', 'changes'],
  accept: '.txt,.md,.json,.js,.py,.html,.css,.xml,.csv',
  maxSizeMB: 5
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <h1>${toolConfig.name}</h1>
      <p>${toolConfig.description}</p>
      <div id="diff-merge"></div>
    </div>
  `;

  const root = container.querySelector('#diff-merge');
  let leftText = '';
  let rightText = '';
  let currentDiff = null;
  const acceptedChanges = new Set();

  root.innerHTML = `
    <div class="diff-merge-layout" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);margin-bottom:var(--space-4);">
      <div class="diff-pane">
        <div style="font-weight:600;font-size:var(--text-sm);margin-bottom:var(--space-2);">Original / Left</div>
        <textarea id="diff-left" placeholder="Paste original text here..." style="width:100%;height:200px;padding:var(--space-2);border:var(--border-md);border-radius:var(--radius-md);font-family:monospace;font-size:var(--text-xs);resize:vertical;"></textarea>
      </div>
      <div class="diff-pane">
        <div style="font-weight:600;font-size:var(--text-sm);margin-bottom:var(--space-2);">Modified / Right</div>
        <textarea id="diff-right" placeholder="Paste modified text here..." style="width:100%;height:200px;padding:var(--space-2);border:var(--border-md);border-radius:var(--radius-md);font-family:monospace;font-size:var(--text-xs);resize:vertical;"></textarea>
      </div>
    </div>
    <div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-4);">
      <button class="btn btn-primary" id="compare-btn" style="flex:1;">Compare</button>
      <button class="btn btn-ghost" id="clear-btn">Clear</button>
    </div>
    <div id="diff-result-area" style="display:none;">
      <div style="font-weight:600;font-size:var(--text-sm);margin-bottom:var(--space-2);">Changes</div>
      <div id="diff-changes" style="max-height:300px;overflow-y:auto;background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-2);margin-bottom:var(--space-3);"></div>
      <div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-3);">
        <button class="btn btn-secondary" id="accept-all-btn">Accept All</button>
        <button class="btn btn-ghost" id="reject-all-btn">Reject All</button>
      </div>
      <div style="font-weight:600;font-size:var(--text-sm);margin-bottom:var(--space-2);">Merged Result</div>
      <textarea id="merged-result" readonly style="width:100%;height:150px;padding:var(--space-2);border:var(--border-md);border-radius:var(--radius-md);font-family:monospace;font-size:var(--text-xs);resize:vertical;margin-bottom:var(--space-3);"></textarea>
      <div style="display:flex;gap:var(--space-2);">
        <button class="btn btn-primary" id="download-btn" style="flex:1;">Download</button>
        <button class="btn btn-ghost" id="copy-btn">Copy</button>
      </div>
    </div>
  `;

  const leftInput = root.querySelector('#diff-left');
  const rightInput = root.querySelector('#diff-right');
  const compareBtn = root.querySelector('#compare-btn');
  const clearBtn = root.querySelector('#clear-btn');
  const diffResultArea = root.querySelector('#diff-result-area');
  const diffChanges = root.querySelector('#diff-changes');
  const acceptAllBtn = root.querySelector('#accept-all-btn');
  const rejectAllBtn = root.querySelector('#reject-all-btn');
  const mergedResult = root.querySelector('#merged-result');
  const downloadBtn = root.querySelector('#download-btn');
  const copyBtn = root.querySelector('#copy-btn');

  function renderChanges() {
    if (!currentDiff) return;
    diffChanges.innerHTML = '';
    let idx = 0;
    for (const d of currentDiff) {
      if (d.type === 'unchanged') continue;
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:var(--space-2);padding:var(--space-1);border-radius:var(--radius-sm);margin-bottom:var(--space-1);';
      const typeStyles = {
        added: 'background:rgba(76,175,80,0.15);border-left:3px solid #4caf50;',
        removed: 'background:rgba(244,67,54,0.15);border-left:3px solid #f44336;'
      };
      row.style.cssText += typeStyles[d.type];
      const isAccepted = acceptedChanges.has(idx);
      const prefix = d.type === 'added' ? '+ ' : '- ';
      const lineNum = document.createElement('span');
      lineNum.style.cssText = 'font-size:var(--text-xs);color:var(--color-text-muted);min-width:30px;';
      lineNum.textContent = (d.type === 'added' ? d.newIdx : d.oldIdx) + 1;
      const lineContent = document.createElement('span');
      lineContent.style.cssText = 'flex:1;font-family:monospace;font-size:var(--text-xs);word-break:break-all;';
      lineContent.textContent = prefix + d.line.substring(0, 100) + (d.line.length > 100 ? '...' : '');
      const btn = document.createElement('button');
      btn.style.cssText = 'padding:4px 8px;font-size:var(--text-xs);border-radius:var(--radius-sm);cursor:pointer;border:none;';
      if (isAccepted) {
        btn.style.cssText += 'background:#4caf50;color:#fff;';
        btn.textContent = 'Accepted';
      } else {
        btn.style.cssText += 'background:#757575;color:#fff;';
        btn.textContent = 'Rejected';
      }
      btn.addEventListener('click', () => {
        if (acceptedChanges.has(idx)) {
          acceptedChanges.delete(idx);
          btn.style.background = '#757575';
          btn.textContent = 'Rejected';
        } else {
          acceptedChanges.add(idx);
          btn.style.background = '#4caf50';
          btn.textContent = 'Accepted';
        }
        updateMerged();
      });
      row.appendChild(lineNum);
      row.appendChild(lineContent);
      row.appendChild(btn);
      diffChanges.appendChild(row);
      idx++;
    }
    if (diffChanges.children.length === 0) {
      diffChanges.innerHTML = '<div style="text-align:center;color:var(--color-text-muted);padding:var(--space-4);">No differences found</div>';
    }
  }

  function updateMerged() {
    if (!currentDiff) return;
    const merged = buildMergeResult(currentDiff, acceptedChanges);
    mergedResult.value = merged;
  }

  compareBtn.addEventListener('click', () => {
    leftText = leftInput.value;
    rightText = rightInput.value;
    if (!leftText && !rightText) return;
    currentDiff = diffLines(leftText, rightText);
    acceptedChanges.clear();
    for (let i = 0; i < currentDiff.length; i++) {
      if (currentDiff[i].type === 'added') {
        acceptedChanges.add(i);
      }
    }
    diffResultArea.style.display = 'block';
    renderChanges();
    updateMerged();
  });

  clearBtn.addEventListener('click', () => {
    leftInput.value = '';
    rightInput.value = '';
    currentDiff = null;
    acceptedChanges.clear();
    diffResultArea.style.display = 'none';
  });

  acceptAllBtn.addEventListener('click', () => {
    if (!currentDiff) return;
    let idx = 0;
    for (const d of currentDiff) {
      if (d.type !== 'unchanged') {
        acceptedChanges.add(idx);
      }
      idx++;
    }
    renderChanges();
    updateMerged();
  });

  rejectAllBtn.addEventListener('click', () => {
    if (!currentDiff) return;
    acceptedChanges.clear();
    renderChanges();
    updateMerged();
  });

  downloadBtn.addEventListener('click', () => {
    const content = mergedResult.value;
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  copyBtn.addEventListener('click', () => {
    mergedResult.select();
    navigator.clipboard.writeText(mergedResult.value).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
    }).catch(() => {});
  });
}

export function destroy() {}