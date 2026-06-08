export const QR_STYLES = `
  .tool-container { max-width: 600px; margin: 0 auto; }
  .tool-header { text-align: center; margin-bottom: var(--space-8); }
  .tool-icon { font-size: 4rem; margin-bottom: var(--space-4); }
  .tool-description { color: var(--color-text-secondary); max-width: 400px; margin: var(--space-2) auto 0; }
  .tool-content { display: flex; flex-direction: column; gap: var(--space-6); }
  .input-section { display: flex; flex-direction: column; gap: var(--space-2); }
  .input-section label { font-weight: 500; color: var(--color-text); }
  .tool-input, .tool-select, .tool-textarea {
    padding: var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .tool-input:focus, .tool-select:focus, .tool-textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }
  .tool-textarea { min-height: 80px; resize: vertical; }
  .checkbox-label { display: flex; align-items: center; gap: var(--space-2); font-weight: normal; cursor: pointer; }
  .options-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); }
  .option-group { display: flex; flex-direction: column; gap: var(--space-2); }
  .option-group label { font-size: var(--text-sm); color: var(--color-text-secondary); font-weight: 500; }
  .tool-color { width: 100%; height: 40px; padding: 2px; cursor: pointer; }
  .tool-button {
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: var(--text-base);
    transition: all 0.2s;
    cursor: pointer;
  }
  .tool-button.primary { background: var(--color-primary); color: white; }
  .tool-button.primary:hover { background: var(--color-primary-hover); }
  .tool-button.secondary { background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text); }
  .tool-button.secondary:hover { background: var(--color-border); }
  .result-section { text-align: center; padding: var(--space-8) 0; }
  .result-section.hidden { display: none; }
  .preview-container { background: white; padding: var(--space-6); border-radius: var(--radius-lg); display: inline-block; box-shadow: var(--shadow-md); }
  #qr-canvas { max-width: 100%; height: auto; }
  .result-info { margin: var(--space-4) 0; color: var(--color-text-secondary); font-size: var(--text-sm); }
  .result-actions { display: flex; gap: var(--space-3); justify-content: center; flex-wrap: wrap; }
  @media (max-width: 480px) {
    .options-grid { grid-template-columns: 1fr; }
    .result-actions { flex-direction: column; }
    .tool-button { width: 100%; }
  }
`;
