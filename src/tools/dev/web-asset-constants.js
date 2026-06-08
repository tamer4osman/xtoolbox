export const WAE_STYLES = `
  .wae-container { max-width: 900px; margin: 0 auto; }
  .wae-input-section textarea { width: 100%; height: 200px; padding: var(--space-3); border: 2px solid var(--color-border); border-radius: var(--radius-xl); font-family: monospace; font-size: var(--text-sm); resize: vertical; background: var(--color-surface); margin-bottom: var(--space-3); }
  .wae-input-section textarea:focus { outline: none; border-color: var(--color-primary); }
  .wae-actions { display: flex; gap: var(--space-3); }
  .wae-btn { padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); border: none; cursor: pointer; font-size: var(--text-sm); font-weight: 500; }
  .wae-btn-primary { background: var(--color-primary); color: #fff; }
  .wae-btn-primary:hover { background: var(--color-primary-hover); }
  .wae-btn-ghost { background: transparent; color: var(--color-text-secondary); }
  .wae-results { margin-top: var(--space-4); }
  .wae-stats { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-3); }
  .wae-stat { padding: var(--space-1) var(--space-3); background: var(--color-surface); border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: 500; }
  .wae-stat .num { color: var(--color-primary); font-weight: 700; }
  .wae-tabs { display: flex; gap: var(--space-2); margin-bottom: var(--space-3); border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-2); }
  .wae-tab { padding: var(--space-2) var(--space-3); border: none; background: none; cursor: pointer; font-size: var(--text-sm); border-radius: var(--radius-md) var(--radius-md) 0 0; }
  .wae-tab.active { background: var(--color-primary); color: #fff; }
  .wae-tab:hover:not(.active) { background: var(--color-surface); }
  .wae-list { display: flex; flex-direction: column; gap: var(--space-2); }
  .wae-item { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-3); }
  .wae-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2); }
  .wae-item-label { font-weight: 600; font-size: var(--text-sm); }
  .wae-item-actions { display: flex; gap: var(--space-2); }
  .wae-item-actions button { padding: 2px 8px; font-size: var(--text-xs); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg); cursor: pointer; }
  .wae-item-actions button:hover { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
  .wae-item pre { background: #1e1e2e; color: #cdd6f4; padding: var(--space-3); border-radius: var(--radius-md); font-family: monospace; font-size: var(--text-xs); overflow-x: auto; white-space: pre-wrap; word-break: break-all; max-height: 200px; overflow-y: auto; margin: 0; }
  .wae-item img { max-width: 100%; max-height: 150px; border-radius: var(--radius-md); border: 1px solid var(--color-border); }
  .wae-empty { text-align: center; padding: var(--space-6); color: var(--color-text-secondary); }
`;

export const WAE_DEMO = `<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
  </style>
</head>
<body>
  <div class="hero">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#fff"/></svg>
    <svg width="200" height="100"><rect x="10" y="10" width="80" height="80" fill="coral" rx="10"/></svg>
    <img src="https://via.placeholder.com/300x200" alt="placeholder">
    <img src="https://via.placeholder.com/150x150" alt="avatar">
  </div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script>
    console.log('Hello');
  </script>
</body>
</html>`;
