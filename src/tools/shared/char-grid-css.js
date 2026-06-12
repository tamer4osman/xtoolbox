export const CHAR_GRID_CSS = `
  .char-grid-container { max-width: 700px; margin: 0 auto; }
  .char-grid-search { display: flex; gap: var(--space-3); margin-bottom: var(--space-3); }
  .char-grid-search input {
    width: 100%; flex: 1; padding: var(--space-3);
    border: 1px solid var(--color-border); border-radius: var(--radius-md);
  }
  .char-grid-results {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(55px, 1fr));
    gap: var(--space-2); max-height: 400px; overflow-y: auto;
    padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-lg);
  }
  .char-grid-item {
    aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
    font-size: 1.6em; cursor: pointer; border-radius: var(--radius-md);
    transition: background 0.2s, transform 0.1s;
  }
  .char-grid-item:hover {
    background: var(--color-primary); color: white; transform: scale(1.2);
  }
  .hidden { display: none !important; }
`;
