export function render(container) {
  container.innerHTML = `
    <div class="picker-container">
      <h2>Random Picker</h2>
      <div class="picker-input">
        <label>Enter choices (one per line)</label>
        <textarea id="choices" placeholder="Option 1&#10;Option 2&#10;Option 3">Apple
Banana
Cherry
Date
Elderberry</textarea>
      </div>
      <div class="picker-options">
        <label>Number to pick: <input type="number" id="pick-count" value="1" min="1" max="10" /></label>
        <label><input type="checkbox" id="shuffle"> Shuffle order</label>
      </div>
      <button id="pick-btn" class="pick-btn">Pick Random</button>
      <div id="result" class="picker-result"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .picker-container { max-width: 500px; margin: 0 auto; }
    .picker-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .picker-input { margin-bottom: var(--space-4); }
    .picker-input label { display: block; font-weight: 500; margin-bottom: var(--space-2); }
    .picker-input textarea { width: 100%; height: 150px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-surface); resize: vertical; }
    .picker-options { display: flex; gap: var(--space-4); margin-bottom: var(--space-4); align-items: center; flex-wrap: wrap; }
    .picker-options label { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); }
    .picker-options input[type="number"] { width: 50px; padding: var(--space-1); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .pick-btn { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; margin-bottom: var(--space-4); }
    .picker-result { display: none; background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-xl); text-align: center; }
    .picker-result.show { display: block; }
    .winner { font-size: 2rem; font-weight: 700; color: var(--color-primary); animation: pop 0.3s ease; }
    @keyframes pop { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    .winner-list { display: flex; flex-wrap: wrap; gap: var(--space-2); justify-content: center; }
    .winner-item { padding: var(--space-2) var(--space-3); background: var(--color-bg); border-radius: var(--radius-md); }
  `;
  container.appendChild(style);

  container.querySelector('#pick-btn').addEventListener('click', () => {
    const choices = container.querySelector('#choices').value.split('\\n').filter(c => c.trim());
    if (choices.length === 0) return;
    
    const count = Math.min(parseInt(container.querySelector('#pick-count').value) || 1, choices.length);
    const shuffled = container.querySelector('#shuffle').checked ? 
      choices.sort(() => Math.random() - 0.5) : 
      [...choices].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, count);
    
    const result = container.querySelector('#result');
    if (count === 1) {
      result.innerHTML = '<div class="winner">' + picked[0] + '</div>';
    } else {
      result.innerHTML = '<div class="winner-list">' + picked.map(w => '<span class="winner-item">' + w + '</span>').join('') + '</div>';
    }
    result.classList.add('show');
  });

  return container;
}
