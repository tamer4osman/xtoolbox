export const toolConfig = {
  id: 'crypto-prices',
  name: 'Crypto Prices',
  category: 'finance',
  description: 'Live cryptocurrency prices from CoinGecko.',
  icon: '₿',
  steps: ['View prices']
};

export function render(container) {
  container.innerHTML = `
    <div class="crypto-container">
      <div class="crypto-search">
        <input type="text" id="crypto-search" placeholder="Search coins...">
      </div>
      <div class="crypto-list" id="crypto-list">
        <p class="crypto-loading">Loading prices...</p>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .crypto-container { max-width: 500px; margin: 0 auto; }
    .crypto-search input { width: 100%; padding: var(--space-3); border: 1px solid #ddd; border-radius: var(--radius-md); margin-bottom: var(--space-3); }
    .crypto-list { max-height: 400px; overflow-y: auto; }
    .crypto-item { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3); border-bottom: 1px solid #eee; }
    .crypto-item:last-child { border-bottom: none; }
    .crypto-rank { font-size: var(--text-sm); color: var(--color-text-secondary); width: 30px; }
    .crypto-icon { width: 32px; height: 32px; border-radius: 50%; }
    .crypto-name { flex: 1; }
    .crypto-name .symbol { font-weight: bold; }
    .crypto-name .full { font-size: var(--text-sm); color: var(--color-text-secondary); }
    .crypto-price { text-align: right; }
    .crypto-price .usd { font-weight: bold; }
    .crypto-price .change { font-size: var(--text-sm); }
    .change.pos { color: #2e7d32; }
    .change.neg { color: #d32f2f; }
    .crypto-loading { text-align: center; color: var(--color-text-secondary); padding: var(--space-4); }
  `;
  container.appendChild(style);

  let coins = [];
  const ids = 'bitcoin,ethereum,tether,binancecoin,solana,ripple,cardano,dogecoin,polkadot,chainlink,litecoin,avalanche-2,polygon,uniswap,cosmos,stellar';

  fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=15&page=1&sparkline=false`)
    .then(r => r.json())
    .then(data => {
      coins = data;
      renderCoins(coins);
    })
    .catch(() => {
      container.querySelector('.crypto-list').innerHTML = '<p class="crypto-loading">Failed to load prices</p>';
    });

  function renderCoins(list) {
    container.querySelector('.crypto-list').innerHTML = list.map(c => `
      <div class="crypto-item">
        <span class="crypto-rank">#${c.market_cap_rank}</span>
        <img class="crypto-icon" src="${c.image}" alt="${c.symbol}">
        <div class="crypto-name">
          <div class="symbol">${c.symbol.toUpperCase()}</div>
          <div class="full">${c.name}</div>
        </div>
        <div class="crypto-price">
          <div class="usd">$${c.current_price.toLocaleString()}</div>
          <div class="change ${c.price_change_percentage_24h >= 0 ? 'pos' : 'neg'}">
            ${c.price_change_percentage_24h >= 0 ? '↑' : '↓'} ${Math.abs(c.price_change_percentage_24h || 0).toFixed(2)}%
          </div>
        </div>
      </div>
    `).join('');
  }

  container.querySelector('#crypto-search').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = coins.filter(c => 
      c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
    );
    renderCoins(filtered);
  });

  return container;
}
