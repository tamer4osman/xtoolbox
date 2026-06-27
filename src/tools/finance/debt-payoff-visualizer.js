import { downloadBlob } from '../../utils/file.js';

function simulatePayoff(debts, extraPayment, strategy) {
  const accounts = debts.map(d => ({
    name: d.name,
    balance: d.balance,
    apr: d.apr,
    minPayment: d.minPayment,
    monthlyRate: d.apr / 100 / 12
  }));

  const months = [];
  let totalInterest = 0;
  let month = 0;
  const maxMonths = 600;

  while (accounts.some(a => a.balance > 0) && month < maxMonths) {
    month++;
    let monthInterest = 0;
    let availableExtra = extraPayment;

    accounts.forEach(a => {
      if (a.balance <= 0) return;
      const interest = a.balance * a.monthlyRate;
      monthInterest += interest;
      a.balance += interest;
      const payment = Math.min(a.balance, a.minPayment);
      a.balance -= payment;
    });

    totalInterest += monthInterest;

    const targets = accounts
      .filter(a => a.balance > 0)
      .sort((a, b) => strategy === 'avalanche'
        ? b.apr - a.apr
        : a.balance - b.balance);

    for (const target of targets) {
      if (availableExtra <= 0) break;
      const payment = Math.min(availableExtra, target.balance);
      target.balance -= payment;
      availableExtra -= payment;
    }

    const freedPayments = [];
    accounts.forEach(a => {
      if (a.balance <= 0 && a.minPayment > 0) {
        freedPayments.push(a.minPayment);
        a.minPayment = 0;
      }
    });

    if (freedPayments.length > 0) {
      const extraFreed = freedPayments.reduce((s, p) => s + p, 0);
      accounts.forEach(a => {
        if (a.balance > 0) {
          const additionalPayment = Math.min(extraFreed, a.balance);
          a.balance -= additionalPayment;
        }
      });
    }

    const snapshot = accounts.map(a => ({
      name: a.name,
      remaining: Math.max(0, a.balance)
    }));

    months.push({
      month,
      balances: snapshot,
      totalInterest
    });
  }

  return { months, totalInterest, totalMonths: month };
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatCurrencyExact(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function createDebtRow(index, data) {
  return `
    <div class="debt-row" data-index="${index}">
      <div class="debt-field">
        <label for="debt-name-${index}">Name</label>
        <input type="text" id="debt-name-${index}" class="debt-name" value="${data?.name || `Debt ${index + 1}`}" placeholder="e.g. Credit Card">
      </div>
      <div class="debt-field">
        <label for="debt-balance-${index}">Balance ($)</label>
        <input type="number" id="debt-balance-${index}" class="debt-balance" value="${data?.balance || ''}" min="0" step="0.01" placeholder="5000">
      </div>
      <div class="debt-field">
        <label for="debt-apr-${index}">APR (%)</label>
        <input type="number" id="debt-apr-${index}" class="debt-apr" value="${data?.apr || ''}" min="0" max="100" step="0.01" placeholder="18.99">
      </div>
      <div class="debt-field">
        <label for="debt-min-${index}">Min Payment ($)</label>
        <input type="number" id="debt-min-${index}" class="debt-min" value="${data?.minPayment || ''}" min="0" step="0.01" placeholder="100">
      </div>
      <button type="button" class="btn-remove-debt" data-index="${index}" aria-label="Remove debt">×</button>
    </div>
  `;
}

function collectDebts(container) {
  const rows = container.querySelectorAll('.debt-row');
  const debts = [];
  rows.forEach(row => {
    const name = row.querySelector('.debt-name')?.value.trim() || 'Debt';
    const balance = parseFloat(row.querySelector('.debt-balance')?.value) || 0;
    const apr = parseFloat(row.querySelector('.debt-apr')?.value) || 0;
    const minPayment = parseFloat(row.querySelector('.debt-min')?.value) || 0;
    if (balance > 0 && minPayment > 0) {
      debts.push({ name, balance, apr, minPayment });
    }
  });
  return debts;
}

export const toolConfig = {
  id: 'debt-payoff-visualizer',
  name: 'Debt Payoff Visualizer',
  category: 'finance',
  description: 'Visualize debt payoff strategies (snowball vs avalanche) with timeline and interest charts.',
  icon: '📉',
  keywords: ['debt', 'payoff', 'snowball', 'avalanche', 'finance', 'interest'],
  accept: '',
  maxSizeMB: 10
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <h1>${toolConfig.name}</h1>
      <p class="tool-description">Compare debt payoff strategies — see which method gets you debt-free faster and saves the most interest.</p>

      <div class="debt-input-section">
        <div class="debt-header-row">
          <h2>Your Debts</h2>
          <button type="button" id="add-debt-btn" class="btn-primary">+ Add Debt</button>
        </div>
        <div id="debt-list"></div>
        <div class="extra-payment-row">
          <label for="extra-payment">Extra Monthly Payment ($)</label>
          <input type="number" id="extra-payment" min="0" step="1" value="200" placeholder="200">
        </div>
        <button type="button" id="calculate-btn" class="btn-primary btn-large">Compare Strategies</button>
      </div>

      <div id="results" class="results-section" style="display:none">
        <div class="strategy-cards" id="strategy-cards"></div>
        <div class="chart-container" id="chart-container"></div>
        <div class="payoff-schedule" id="payoff-schedule"></div>
        <button type="button" id="export-csv-btn" class="btn-secondary">Export CSV</button>
      </div>
    </div>
  `;

  const debtList = container.querySelector('#debt-list');
  const addBtn = container.querySelector('#add-debt-btn');
  const calcBtn = container.querySelector('#calculate-btn');
  const resultsDiv = container.querySelector('#results');
  const strategyCards = container.querySelector('#strategy-cards');
  const chartContainer = container.querySelector('#chart-container');
  const payoffSchedule = container.querySelector('#payoff-schedule');
  const exportBtn = container.querySelector('#export-csv-btn');

  let debtCount = 0;
  let lastResults = null;

  function addDebt(data) {
    debtCount++;
    debtList.insertAdjacentHTML('beforeend', createDebtRow(debtCount, data));
  }

  addDebt({ name: 'Credit Card', balance: 5000, apr: 18.99, minPayment: 100 });
  addDebt({ name: 'Car Loan', balance: 8000, apr: 5.5, minPayment: 200 });
  addDebt({ name: 'Student Loan', balance: 12000, apr: 4.5, minPayment: 150 });

  addBtn.addEventListener('click', () => addDebt());

  debtList.addEventListener('click', e => {
    const btn = e.target.closest('.btn-remove-debt');
    if (btn) {
      const row = btn.closest('.debt-row');
      if (debtList.querySelectorAll('.debt-row').length > 1) {
        row.remove();
      }
    }
  });

  calcBtn.addEventListener('click', () => {
    const debts = collectDebts(debtList);
    if (debts.length === 0) {
      resultsDiv.style.display = 'none';
      return;
    }

    const extra = parseFloat(container.querySelector('#extra-payment').value) || 0;

    const snowball = simulatePayoff(debts, extra, 'snowball');
    const avalanche = simulatePayoff(debts, extra, 'avalanche');
    const baseline = simulatePayoff(debts, 0, 'snowball');

    lastResults = { snowball, avalanche, baseline, debts };

    strategyCards.innerHTML = `
      <div class="strategy-card">
        <h3>Snowball</h3>
        <p class="strategy-desc">Pay smallest balance first</p>
        <div class="stat"><span class="stat-label">Debt-Free In</span><span class="stat-value">${snowball.totalMonths} months</span></div>
        <div class="stat"><span class="stat-label">Total Interest</span><span class="stat-value">${formatCurrencyExact(snowball.totalInterest)}</span></div>
        <div class="stat"><span class="stat-label">Interest Saved vs Minimums</span><span class="stat-value">${formatCurrencyExact(baseline.totalInterest - snowball.totalInterest)}</span></div>
      </div>
      <div class="strategy-card">
        <h3>Avalanche</h3>
        <p class="strategy-desc">Pay highest interest first</p>
        <div class="stat"><span class="stat-label">Debt-Free In</span><span class="stat-value">${avalanche.totalMonths} months</span></div>
        <div class="stat"><span class="stat-label">Total Interest</span><span class="stat-value">${formatCurrencyExact(avalanche.totalInterest)}</span></div>
        <div class="stat"><span class="stat-label">Interest Saved vs Minimums</span><span class="stat-value">${formatCurrencyExact(baseline.totalInterest - avalanche.totalInterest)}</span></div>
      </div>
    `;

    const maxMonth = Math.max(snowball.totalMonths, avalanche.totalMonths);
    const debtNames = debts.map(d => d.name);
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    let svg = `<svg viewBox="0 0 800 400" class="payoff-chart" role="img" aria-label="Debt payoff timeline chart">`;
    svg += `<text x="400" y="25" text-anchor="middle" class="chart-title">Balance Over Time</text>`;

    const padL = 60, padR = 20, padT = 40, padB = 60;
    const w = 800 - padL - padR;
    const h = 400 - padT - padB;

    const maxBalance = Math.max(...debts.map(d => d.balance));

    svg += `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + h}" stroke="#374151" stroke-width="1"/>`;
    svg += `<line x1="${padL}" y1="${padT + h}" x2="${padL + w}" y2="${padT + h}" stroke="#374151" stroke-width="1"/>`;

    for (let i = 0; i <= 4; i++) {
      const y = padT + (h * i / 4);
      const val = maxBalance * (1 - i / 4);
      svg += `<text x="${padL - 5}" y="${y + 4}" text-anchor="end" class="chart-label">${formatCurrency(val)}</text>`;
      svg += `<line x1="${padL}" y1="${y}" x2="${padL + w}" y2="${y}" stroke="#374151" stroke-width="0.5" stroke-dasharray="4"/>`;
    }

    const step = Math.max(1, Math.floor(maxMonth / 6));
    for (let m = 0; m <= maxMonth; m += step) {
      const x = padL + (m / maxMonth) * w;
      svg += `<text x="${x}" y="${padT + h + 20}" text-anchor="middle" class="chart-label">${m}mo</text>`;
      svg += `<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT + h}" stroke="#374151" stroke-width="0.5" stroke-dasharray="4"/>`;
    }

    debtNames.forEach((name, di) => {
      let pathD = '';
      snowball.months.forEach((m, mi) => {
        const bal = m.balances[di]?.remaining || 0;
        const x = padL + (m.month / maxMonth) * w;
        const y = padT + h - (bal / maxBalance) * h;
        pathD += (mi === 0 ? 'M' : 'L') + `${x},${y}`;
      });
      svg += `<path d="${pathD}" fill="none" stroke="${colors[di % colors.length]}" stroke-width="2"/>`;
      const lastBal = snowball.months[snowball.months.length - 1]?.balances[di]?.remaining || 0;
      if (lastBal > 0) {
        const lastM = snowball.months.length;
        const x = padL + (lastM / maxMonth) * w;
        const y = padT + h - (lastBal / maxBalance) * h;
        svg += `<text x="${x + 5}" y="${y - 5}" class="chart-legend" fill="${colors[di % colors.length]}">${name}</text>`;
      }
    });

    svg += `</svg>`;

    chartContainer.innerHTML = `
      <h3>Payoff Timeline (Snowball)</h3>
      ${svg}
      <div class="chart-legend-list">
        ${debtNames.map((name, i) => `<span class="legend-item"><span class="legend-dot" style="background:${colors[i % colors.length]}"></span>${name}</span>`).join('')}
      </div>
    `;

    let scheduleHTML = '<h3>Month-by-Month Comparison</h3>';
    scheduleHTML += '<div class="schedule-table-wrapper"><table class="schedule-table"><thead><tr><th>Month</th>';
    debtNames.forEach(name => { scheduleHTML += `<th>${name} (Snow)</th><th>${name} (Avl)</th>`; });
    scheduleHTML += '<th>Total Interest (Snow)</th><th>Total Interest (Avl)</th></tr></thead><tbody>';

    const maxRows = Math.min(Math.max(snowball.totalMonths, avalanche.totalMonths), 120);
    const displayMonths = [snowball, avalanche].reduce((acc) => {
      for (let i = 0; i < maxRows; i++) {
        if (!acc.includes(i + 1)) acc.push(i + 1);
      }
      return acc;
    }, []).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b).slice(0, 60);

    displayMonths.forEach(monthNum => {
      const sMonth = snowball.months[monthNum - 1];
      const aMonth = avalanche.months[monthNum - 1];
      if (!sMonth && !aMonth) return;

      scheduleHTML += `<tr><td>${monthNum}</td>`;
      debtNames.forEach((_, i) => {
        const sBal = sMonth ? sMonth.balances[i]?.remaining : 0;
        const aBal = aMonth ? aMonth.balances[i]?.remaining : 0;
        scheduleHTML += `<td>${formatCurrency(sBal)}</td>`;
        scheduleHTML += `<td>${formatCurrency(aBal)}</td>`;
      });
      scheduleHTML += `<td>${formatCurrencyExact(sMonth?.totalInterest || 0)}</td>`;
      scheduleHTML += `<td>${formatCurrencyExact(aMonth?.totalInterest || 0)}</td>`;
      scheduleHTML += '</tr>';
    });

    scheduleHTML += '</tbody></table></div>';
    payoffSchedule.innerHTML = scheduleHTML;

    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  exportBtn.addEventListener('click', () => {
    if (!lastResults) return;
    const { snowball, avalanche, debts } = lastResults;
    const debtNames = debts.map(d => d.name);

    let csv = 'Month,';
    debtNames.forEach(name => { csv += `${name} (Snowball),${name} (Avalanche),`; });
    csv += 'Interest (Snowball),Interest (Avalanche)\n';

    const maxMonth = Math.max(snowball.totalMonths, avalanche.totalMonths);
    for (let m = 1; m <= maxMonth; m++) {
      const s = snowball.months[m - 1];
      const a = avalanche.months[m - 1];
      csv += `${m},`;
      debtNames.forEach((_, i) => {
        csv += `${s ? s.balances[i]?.remaining.toFixed(2) : 0},${a ? a.balances[i]?.remaining.toFixed(2) : 0},`;
      });
      csv += `${s ? s.totalInterest.toFixed(2) : 0},${a ? a.totalInterest.toFixed(2) : 0}\n`;
    }

    downloadBlob(new Blob([csv], { type: 'text/csv' }), 'debt-payoff-schedule.csv');
  });
}
