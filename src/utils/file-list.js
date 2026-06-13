import { formatFileSize } from './file.js';

export function createFileList(files) {
  return files.map((f, i) => `
    <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);margin-bottom:var(--space-2);">
      <span style="font-weight:600;color:var(--color-text-muted);">${i + 1}.</span>
      <span style="flex:1;font-size:var(--text-sm);">${f.name}</span>
      <span style="font-size:var(--text-xs);color:var(--color-text-muted);">${formatFileSize(f.size)}</span>
    </div>
  `).join('');
}
