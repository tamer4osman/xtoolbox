export const toolConfig = {
  id: 'coin-flip',
  name: 'Coin Flip',
  category: 'fun',
  description: 'Flip a coin. Heads or tails?',
  icon: '🪙',
  accept: null,
  maxSizeMB: null,
  keywords: ['coin flip', 'heads tails', 'random coin'],
  steps: ['Click to flip', 'See result']
};

export function render(container) {
  container.innerHTML = `
    <div class="coin-container">
      <div id="coin" class="coin">?</div>
      <button id="flip-btn" class="btn btn-primary btn-lg">Flip Coin</button>
      <div id="result" class="result"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .coin-container { text-align: center; padding: var(--space-8); }
    .coin { 
      font-size: 100px;
      width: 150px;
      height: 150px; 
      border-radius: 50%;
      background: linear-gradient(135deg, #ffd700, #ffaa00);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--space-6);
      cursor: pointer;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      user-select: none;
    }
    .coin.flipping { animation: flip 1s ease-out; }
    @keyframes flip {
      0% { transform: rotateY(0); }
      100% { transform: rotateY(1800deg); }
    }
    .result { font-size: var(--text-2xl); font-weight: bold; margin-top: var(--space-4); min-height: 40px; }
    .btn-lg { font-size: var(--text-xl); padding: var(--space-4) var(--space-8); }
  `;
  container.appendChild(style);

  const coin = container.querySelector('#coin');
  const flipBtn = container.querySelector('#flip-btn');
  const result = container.querySelector('#result');

  function flip() {
    coin.classList.add('flipping');
    const isHeads = Math.random() > 0.5;
    
    setTimeout(() => {
      coin.classList.remove('flipping');
      result.textContent = isHeads ? 'Heads! 🪙' : 'Tails! 🪙';
    }, 1000);
  }

  flipBtn.addEventListener('click', flip);
  coin.addEventListener('click', flip);
}
