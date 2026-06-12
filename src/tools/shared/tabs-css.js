export const TABS_CSS = `
  .tabs { display: flex; border-bottom: 1px solid var(--color-border); margin-bottom: var(--space-6); }
  .tab { flex: 1; padding: var(--space-3); background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-weight: 500; color: var(--color-text-secondary); }
  .tab.active { color: var(--color-primary); border-color: var(--color-primary); }
  .tab-panel { display: none; flex-direction: column; gap: var(--space-4); }
  .tab-panel.active { display: flex; }
  .input-section { display: flex; flex-direction: column; gap: var(--space-2); }
  .input-section label { font-weight: 500; }
  .upload-zone { border: 2px dashed var(--color-border); border-radius: var(--radius-lg); padding: var(--space-8); text-align: center; cursor: pointer; transition: all 0.2s; }
  .upload-zone:hover { border-color: var(--color-primary); background: var(--color-primary-light); }
  .tool-input { padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-base); }
  .tool-input:focus { outline: none; border-color: var(--color-primary); }
  .tool-button { padding: var(--space-3) var(--space-6); border-radius: var(--radius-md); font-weight: 600; cursor: pointer; }
  .tool-button.primary { background: var(--color-primary); color: white; border: none; }
  .tool-button.primary:hover { background: var(--color-primary-hover); }
  .result-section { margin-top: var(--space-4); text-align: center; padding: var(--space-4); border-radius: var(--radius-md); }
  .result-section.hidden { display: none; }
`;
