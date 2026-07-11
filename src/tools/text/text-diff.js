import { escapeHtml } from "../../utils/escape-html.js";

export const toolConfig = {
  id: "text-diff",
  name: "Text Diff",
  category: "text",
  description: "Compare two texts side-by-side, see differences, and merge changes.",
  icon: "🔀",
  status: "done"
};

export function diffLines(oldText, newText) {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const result = [];

  let i = 0,
    j = 0;
  while (i < oldLines.length || j < newLines.length) {
    if (i >= oldLines.length) {
      result.push({ type: "added", line: newLines[j++], oldIdx: null, newIdx: j - 1 });
    } else if (j >= newLines.length) {
      result.push({ type: "removed", line: oldLines[i++], oldIdx: i - 1, newIdx: null });
    } else if (oldLines[i] === newLines[j]) {
      result.push({ type: "unchanged", line: oldLines[i], oldIdx: i, newIdx: j });
      i++;
      j++;
    } else {
      const foundInNew = newLines.indexOf(oldLines[i], j);
      const foundInOld = oldLines.indexOf(newLines[j], i);
      if (foundInNew !== -1 && (foundInOld === -1 || foundInNew - j <= foundInOld - i)) {
        result.push({ type: "added", line: newLines[j++], oldIdx: null, newIdx: j - 1 });
      } else {
        result.push({ type: "removed", line: oldLines[i++], oldIdx: i - 1, newIdx: null });
      }
    }
  }
  return result;
}

export function buildMergeResult(diff, accepted) {
  const lines = [];
  for (let i = 0; i < diff.length; i++) {
    const d = diff[i];
    if (d.type === "unchanged") {
      lines.push(d.line);
    } else if (d.type === "added") {
      if (accepted.has(i)) lines.push(d.line);
    } else if (d.type === "removed") {
      if (!accepted.has(i)) lines.push(d.line);
    }
  }
  return lines.join("\n");
}

function renderDiff(diff, accepted) {
  const lines = [];
  for (let i = 0; i < diff.length; i++) {
    const d = diff[i];
    const typeClass = { added: "diff-added", removed: "diff-removed", unchanged: "diff-unchanged" };
    const prefix = { added: "+ ", removed: "- ", unchanged: "  " };
    const isAccepted =
      d.type === "unchanged" ||
      (d.type === "added" && accepted.has(i)) ||
      (d.type === "removed" && !accepted.has(i));
    const dimClass = d.type !== "unchanged" && !isAccepted ? " diff-dim" : "";
    const checkAttr = d.type !== "unchanged" ? ` data-idx="${i}"` : "";
    lines.push(
      `<div class="${typeClass[d.type]}${dimClass}"${checkAttr}>${prefix[d.type]}${escapeHtml(d.line)}</div>`
    );
  }
  return lines.join("");
}

export function render(container) {
  container.innerHTML = `
    <div class="diff-container">
      <h2>Text Diff & Merge</h2>
      <div class="diff-panels">
        <div class="diff-panel">
          <label>Original (A)</label>
          <textarea id="left-input" class="diff-textarea" placeholder="Paste original text here..."></textarea>
        </div>
        <div class="diff-panel">
          <label>Modified (B)</label>
          <textarea id="right-input" class="diff-textarea" placeholder="Paste modified text here..."></textarea>
        </div>
      </div>
      <div class="diff-actions">
        <button id="compare-diff" class="btn btn-primary">Compare</button>
        <button id="diff-swap" class="btn btn-secondary">Swap A ↔ B</button>
        <button id="diff-clear" class="btn btn-ghost">Clear</button>
      </div>
      <div id="diff-stats" class="diff-stats"></div>
      <div class="diff-output-wrap">
        <div class="diff-output" id="diff-output"></div>
      </div>
      <div class="diff-merge-section" id="merge-section" style="display:none">
        <div class="diff-merge-header">
          <span>Merge: click +/- lines to toggle, or use quick actions:</span>
          <button id="accept-all" class="btn btn-sm btn-ghost">Accept All B</button>
          <button id="reject-all" class="btn btn-sm btn-ghost">Reject All B</button>
        </div>
        <div class="diff-merge-preview-label">Merged result:</div>
        <textarea id="merge-output" class="diff-textarea diff-merge-output" readonly></textarea>
        <div class="diff-merge-actions">
          <button id="copy-merge" class="btn btn-secondary">Copy Merged</button>
          <button id="download-merge" class="btn btn-secondary">Download Merged</button>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .diff-container { max-width: 1100px; margin: 0 auto; }
    .diff-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .diff-panels { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .diff-panel label { display: block; font-weight: 600; margin-bottom: var(--space-2); color: var(--color-text-secondary); }
    .diff-textarea {
      width: 100%; height: 200px; padding: var(--space-3); border: 2px solid var(--color-border);
      border-radius: var(--radius-xl); background: var(--color-surface); font-family: 'Fira Code', monospace;
      font-size: var(--text-sm); resize: vertical; box-sizing: border-box;
    }
    .diff-textarea:focus { outline: none; border-color: var(--color-primary); }
    .diff-actions { display: flex; gap: var(--space-3); margin: var(--space-4) 0; justify-content: center; }
    .diff-stats { text-align: center; font-weight: 600; margin-bottom: var(--space-3); }
    .diff-stats .added-count { color: #16a34a; }
    .diff-stats .removed-count { color: #dc2626; }
    .diff-output-wrap { margin-bottom: var(--space-4); }
    .diff-output {
      padding: var(--space-4); border: 2px solid var(--color-border); border-radius: var(--radius-xl);
      background: var(--color-surface); font-family: 'Fira Code', monospace; font-size: var(--text-sm);
      overflow: auto; max-height: 400px; white-space: pre; line-height: 1.6;
    }
    .diff-added { background: #dcfce7; color: #166534; display: block; cursor: pointer; padding: 2px 8px; }
    .diff-removed { background: #fee2e2; color: #991b1b; display: block; cursor: pointer; padding: 2px 8px; }
    .diff-unchanged { display: block; padding: 2px 8px; }
    .diff-dim { opacity: 0.35; text-decoration: line-through; }
    .diff-merge-section { margin-top: var(--space-4); padding: var(--space-4); border: 2px solid var(--color-primary); border-radius: var(--radius-xl); background: var(--color-surface); }
    .diff-merge-header { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; margin-bottom: var(--space-3); font-size: var(--text-sm); color: var(--color-text-secondary); }
    .diff-merge-preview-label { font-weight: 600; margin-bottom: var(--space-2); }
    .diff-merge-output { height: 150px; background: #f0fdf4; }
    .diff-merge-actions { display: flex; gap: var(--space-3); margin-top: var(--space-3); }
    @media (max-width: 768px) { .diff-panels { grid-template-columns: 1fr; } }
  `;
  container.appendChild(style);

  const leftInput = container.querySelector("#left-input");
  const rightInput = container.querySelector("#right-input");
  const output = container.querySelector("#diff-output");
  const stats = container.querySelector("#diff-stats");
  const mergeSection = container.querySelector("#merge-section");
  const mergeOutput = container.querySelector("#merge-output");

  let currentDiff = [];
  let accepted = new Set();

  function compare() {
    currentDiff = diffLines(leftInput.value, rightInput.value);
    accepted = new Set();
    for (let i = 0; i < currentDiff.length; i++) {
      if (currentDiff[i].type === "added") accepted.add(i);
    }

    const added = currentDiff.filter(d => d.type === "added").length;
    const removed = currentDiff.filter(d => d.type === "removed").length;
    stats.innerHTML =
      added || removed
        ? `<span class="added-count">+${added}</span> · <span class="removed-count">-${removed}</span>`
        : "No differences";

    output.innerHTML = renderDiff(currentDiff, accepted);
    mergeSection.style.display = currentDiff.some(d => d.type !== "unchanged") ? "block" : "none";
    updateMerge();
    bindDiffClicks();
  }

  function updateMerge() {
    mergeOutput.value = buildMergeResult(currentDiff, accepted);
  }

  function bindDiffClicks() {
    output.querySelectorAll("[data-idx]").forEach(el => {
      el.addEventListener("click", () => {
        const idx = parseInt(el.dataset.idx);
        if (accepted.has(idx)) accepted.delete(idx);
        else accepted.add(idx);
        output.innerHTML = renderDiff(currentDiff, accepted);
        bindDiffClicks();
        updateMerge();
      });
    });
  }

  container.querySelector("#compare-diff").addEventListener("click", compare);

  container.querySelector("#diff-swap").addEventListener("click", () => {
    const tmp = leftInput.value;
    leftInput.value = rightInput.value;
    rightInput.value = tmp;
  });

  container.querySelector("#diff-clear").addEventListener("click", () => {
    leftInput.value = "";
    rightInput.value = "";
    output.innerHTML = "";
    stats.innerHTML = "";
    mergeSection.style.display = "none";
    currentDiff = [];
    accepted = new Set();
  });

  container.querySelector("#accept-all").addEventListener("click", () => {
    for (let i = 0; i < currentDiff.length; i++) {
      if (currentDiff[i].type === "added") accepted.add(i);
    }
    output.innerHTML = renderDiff(currentDiff, accepted);
    bindDiffClicks();
    updateMerge();
  });

  container.querySelector("#reject-all").addEventListener("click", () => {
    accepted = new Set();
    output.innerHTML = renderDiff(currentDiff, accepted);
    bindDiffClicks();
    updateMerge();
  });

  container.querySelector("#copy-merge").addEventListener("click", () => {
    navigator.clipboard.writeText(mergeOutput.value).catch(() => {});
  });

  container.querySelector("#download-merge").addEventListener("click", () => {
    const blob = new Blob([mergeOutput.value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "merged.txt";
    a.click();
    URL.revokeObjectURL(url);
  });
}
