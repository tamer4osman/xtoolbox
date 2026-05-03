export const toolConfig = {
  id: 'random-picker',
  name: 'Random Picker',
  category: 'fun',
  description: 'Pick random names from a list. Great for giveaways.',
  icon: '🎯',
  accept: null,
  maxSizeMB: null,
  keywords: ['random picker', 'random selector', 'name picker', 'raffle'],
  steps: ['Enter names', 'Pick winner']
};

export function render(container) {
  container.innerHTML = `
    <div class="picker-container">
      <textarea id="names" placeholder="Enter names (one per line)">Alice
Bob
Charlie
Diana
Eve</textarea>
      <div class="picker-controls">
        <label>Pick <input type="number" id="count" value="1" min="1" max="10"> winner(s)</label>
        <button id="pick-btn" class="btn btn-primary">Pick Winner(s)</button>
      </div>
      <div id="results" class="picker-results"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .picker-container { max-width: 500px; margin: 0 auto; }
    textarea { width: 100%; min-height: 150px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .picker-controls { display: flex; gap: var(--space-4); align-items: center; margin: var(--space-4) 0; }
    .picker-controls input { width: 50px; }
    .picker-results { 
      background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-lg);
      text-align: center;
    }
    .winner { font-size: var(--text-2xl); font-weight: bold; color: var(--color-primary); }
  `;
  container.appendChild(style);

  const namesInput = container.querySelector('#names');
  const countInput = container.querySelector('#count');
  const pickBtn = container.querySelector('#pick-btn');
  const results = container.querySelector('#results');

  function pick() {
    const names = namesInput.value.split('\n').map(n => n.trim()).filter(n => n);
    
    if (names.length < 2) {
      results.innerHTML = '<p>Enter at least 2 names</p>';
      return;
    }
    
    const count = Math.min(names.length, Math.max(1, parseInt(countInput.value) || 1));
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    const winners = shuffled.slice(0, count);
    
    results.innerHTML = winners.map((w, i) => 
      `<div class="winner">${i + 1}. ${w} 🎉</div>`
    ).join('');
  }

  pickBtn.addEventListener('click', pick);
}
