export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <div class="tool-icon">📅</div>
        <h1>Public Holiday Calendar</h1>
        <p class="tool-description">View public holidays for any country and year.</p>
      </div>
      <div class="tool-content">
        <div class="search-box">
          <select id="country-select" class="tool-select">
            <option value="">Select Country</option>
          </select>
          <input type="number" id="year-input" class="tool-input year-input" value="2026" min="1900" max="2100" />
          <button id="search-btn" class="tool-button primary">Get Holidays</button>
        </div>
        <div id="loading" class="loading hidden">Loading...</div>
        <div id="result" class="result hidden">
          <h3 id="result-title"></h3>
          <div id="holidays-list" class="holidays-list"></div>
        </div>
        <div id="error" class="error hidden"></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .tool-container { max-width: 600px; margin: 0 auto; }
    .tool-header { text-align: center; margin-bottom: var(--space-8); }
    .search-box { display: flex; gap: var(--space-3); margin-bottom: var(--space-6); flex-wrap: wrap; }
    .tool-select, .year-input { padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: white; }
    .year-input { width: 100px; }
    .tool-button.primary { padding: var(--space-3) var(--space-6); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .loading, .error { text-align: center; padding: var(--space-8); color: var(--color-text-secondary); }
    .error { color: var(--color-error); }
    .result { animation: fadeIn 0.3s; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    #result-title { margin-bottom: var(--space-4); }
    .holiday-item { display: flex; justify-content: space-between; align-items: center; padding: var(--space-3) var(--space-4); background: var(--color-surface); border-radius: var(--radius-md); margin-bottom: var(--space-2); }
    .holiday-date { font-weight: 600; color: var(--color-primary); }
    .holiday-name { flex: 1; margin-left: var(--space-3); }
    .holiday-type { font-size: var(--text-sm); color: var(--color-text-muted); }
    .hidden { display: none !important; }
  `;
  container.appendChild(style);

  const searchBtn = container.querySelector('#search-btn');
  const countrySelect = container.querySelector('#country-select');
  const yearInput = container.querySelector('#year-input');
  const loading = container.querySelector('#loading');
  const result = container.querySelector('#result');
  const error = container.querySelector('#error');

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'IN', name: 'India' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' }
  ];

  countries.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.code;
    opt.textContent = c.name;
    countrySelect.appendChild(opt);
  });

  async function getHolidays(countryCode, year) {
    const res = await fetch('https://date.nager.at/api/v3/PublicHolidays/' + year + '/' + countryCode);
    if (!res.ok) throw new Error('Failed to fetch holidays');
    return res.json();
  }

  searchBtn.addEventListener('click', async () => {
    const country = countrySelect.value;
    const year = yearInput.value;
    
    if (!country) { alert('Select a country'); return; }

    loading.classList.remove('hidden');
    result.classList.add('hidden');
    error.classList.add('hidden');

    try {
      const holidays = await getHolidays(country, year);
      const countryName = countries.find(c => c.code === country)?.name || country;
      
      document.getElementById('result-title').textContent = 'Holidays in ' + countryName + ' ' + year;
      
      const list = document.getElementById('holidays-list');
      list.innerHTML = holidays.map(h => `
        <div class="holiday-item">
          <span class="holiday-date">${h.date}</span>
          <span class="holiday-name">${h.localName}</span>
          <span class="holiday-type">${h.counties ? h.counties.join(', ') : h.type}</span>
        </div>
      `).join('');

      result.classList.remove('hidden');
    } catch (err) {
      error.textContent = 'Could not load holidays. Try another country.';
      error.classList.remove('hidden');
    } finally {
      loading.classList.add('hidden');
    }
  });

  }
