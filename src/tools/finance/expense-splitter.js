export const toolConfig = {
  id: "expense-splitter",
  name: "Expense Splitter",
  category: "finance",
  description: "Split bills and expenses fairly among groups of people.",
  icon: "💸",
  accept: null,
  maxSizeMB: null,
  keywords: ["expense", "split", "bill", "group", "share", "debt"],
  steps: [
    "Add people to your group",
    "Add expenses with who paid and who shares",
    "View balances and settle-up instructions"
  ],
  faqs: [
    {
      question: "How are debts calculated?",
      answer:
        "Each person's balance is calculated by subtracting their share of expenses from what they paid. Positive balance means they are owed money; negative means they owe."
    },
    {
      question: "How does settle-up work?",
      answer:
        "The tool uses a greedy algorithm to minimize the number of transactions needed. For example, if Alice owes Bob $10 and Bob owes Charlie $10, the tool simplifies this to Alice pays Charlie $10 directly."
    },
    {
      question: "Is my data saved?",
      answer:
        "All data is stored in your browser's localStorage. Nothing is sent to any server. Clear your browser data to erase everything."
    }
  ]
};

export function calculateBalances(people, expenses) {
  const balances = {};
  people.forEach(p => {
    balances[p.id] = 0;
  });
  for (const exp of expenses) {
    const share = exp.amount / exp.splitAmong.length;
    balances[exp.paidBy] = (balances[exp.paidBy] || 0) + exp.amount;
    for (const personId of exp.splitAmong) {
      balances[personId] = (balances[personId] || 0) - share;
    }
  }
  return balances;
}

export function simplifyDebts(balances) {
  const creditors = [];
  const debtors = [];
  for (const [id, amount] of Object.entries(balances)) {
    if (amount > 0.01) creditors.push({ id, amount });
    else if (amount < -0.01) debtors.push({ id, amount: -amount });
  }
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let ci = 0;
  let di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const amount = Math.min(creditors[ci].amount, debtors[di].amount);
    transactions.push({ from: debtors[di].id, to: creditors[ci].id, amount });
    creditors[ci].amount -= amount;
    debtors[di].amount -= amount;
    if (creditors[ci].amount < 0.01) ci++;
    if (debtors[di].amount < 0.01) di++;
  }
  return transactions;
}

const STORAGE_KEY = "exs_v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { people: [], expenses: [] };
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function render(container) {
  const state = loadState();

  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <h1>${toolConfig.name}</h1>
        <p class="tool-description">${toolConfig.description}</p>
      </div>
      <div class="exs-privacy">🔒 All data is stored only on this device. Nothing is sent anywhere.</div>

      <div class="exs-section">
        <h2>People</h2>
        <div class="exs-add-person">
          <input type="text" id="exs-person-input" class="exs-input" placeholder="Add a person and press Enter">
        </div>
        <div id="exs-people" class="exs-people-row"></div>
      </div>

      <div class="exs-section">
        <h2>Add Expense</h2>
        <div class="exs-expense-form">
          <input type="text" id="exs-desc" class="exs-input" placeholder="Description">
          <input type="number" id="exs-amount" class="exs-input" placeholder="Amount" min="0" step="0.01">
          <select id="exs-paid-by" class="exs-select"><option value="">Paid by...</option></select>
          <div id="exs-split" class="exs-split-checks"></div>
          <button id="exs-add-expense" class="btn btn-primary">Add Expense</button>
        <div id="exs-error" class="exs-error" style="display:none"></div>
        </div>
      </div>

      <div class="exs-section">
        <h2>Expenses</h2>
        <div id="exs-expenses-list"></div>
      </div>

      <div class="exs-section">
        <h2>Balances</h2>
        <div id="exs-balances"></div>
      </div>

      <div class="exs-section">
        <h2>Settle Up</h2>
        <div id="exs-settle"></div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .exs-privacy {
      background: var(--color-surface);
      padding: var(--space-3);
      border-radius: var(--radius);
      font-size: var(--text-sm);
      margin-bottom: var(--space-4);
    }
    .exs-section { margin-bottom: var(--space-6); }
    .exs-section h2 {
      font-size: var(--text-lg);
      margin-bottom: var(--space-3);
    }
    .exs-input, .exs-select {
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: var(--text-base);
    }
    .exs-input { flex: 1; min-width: 0; }
    .exs-add-person { display: flex; gap: var(--space-2); margin-bottom: var(--space-3); }
    .exs-people-row { display: flex; gap: var(--space-2); flex-wrap: wrap; }
    .exs-person-chip {
      background: var(--color-surface);
      padding: var(--space-2) var(--space-3);
      border-radius: 99px;
      font-size: var(--text-sm);
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .exs-person-chip button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: var(--text-sm);
      color: var(--color-danger, #ef4444);
      padding: 0;
    }
    .exs-expense-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .exs-expense-form > :not(.exs-split-checks):not(.btn) {
      display: block;
      width: 100%;
    }
    .exs-split-checks {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      font-size: var(--text-sm);
    }
    .exs-split-checks label {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }
    .exs-expense-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-2) 0;
      border-bottom: 1px solid var(--color-border);
      font-size: var(--text-sm);
    }
    .exs-expense-row span { flex: 1; }
    .exs-expense-row .exs-expense-amount { width: 80px; text-align: right; }
    .exs-expense-row .exs-expense-payer { width: 100px; color: var(--color-text-secondary, #6b7280); }
    .exs-expense-row button {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-danger, #ef4444);
      font-size: var(--text-sm);
    }
    .exs-balance-row {
      display: flex;
      justify-content: space-between;
      padding: var(--space-2) 0;
      border-bottom: 1px solid var(--color-border);
      font-size: var(--text-sm);
    }
    .exs-balance-positive { color: #065f46; font-weight: 600; }
    .exs-balance-negative { color: #991b1b; font-weight: 600; }
    .exs-settle-row {
      padding: var(--space-3);
      background: var(--color-surface);
      border-radius: var(--radius);
      margin-bottom: var(--space-2);
      font-size: var(--text-sm);
    }
    .exs-empty {
      color: var(--color-text-secondary, #6b7280);
      font-size: var(--text-sm);
      font-style: italic;
    }
    .exs-error {
      background: #fee2e2;
      color: #991b1b;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-sm);
      font-size: var(--text-sm);
      margin-top: var(--space-2);
    }
    .exs-input-invalid {
      border-color: #ef4444 !important;
    }
  `;
  container.appendChild(style);

  const personInput = container.querySelector("#exs-person-input");
  const peopleDiv = container.querySelector("#exs-people");
  const paidBySelect = container.querySelector("#exs-paid-by");
  const splitDiv = container.querySelector("#exs-split");
  const expensesList = container.querySelector("#exs-expenses-list");
  const balancesDiv = container.querySelector("#exs-balances");
  const settleDiv = container.querySelector("#exs-settle");

  function renderPeople() {
    peopleDiv.innerHTML = state.people
      .map(
        p =>
          `<span class="exs-person-chip">${escapeHtml(p.name)} <button data-remove="${p.id}">&times;</button></span>`
      )
      .join("");
    peopleDiv.querySelectorAll("button[data-remove]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-remove");
        const hasExpenses = state.expenses.some(e => e.paidBy === id || e.splitAmong.includes(id));
        if (hasExpenses) {
          if (!confirm("This person has expenses. Remove them too?")) return;
          state.expenses = state.expenses.filter(
            e => e.paidBy !== id && !e.splitAmong.includes(id)
          );
        }
        state.people = state.people.filter(p => p.id !== id);
        saveState(state);
        renderAll();
      });
    });

    paidBySelect.innerHTML =
      '<option value="">Paid by...</option>' +
      state.people.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("");

    splitDiv.innerHTML = state.people
      .map(
        p =>
          `<label><input type="checkbox" class="exs-split-check" value="${p.id}" checked> ${escapeHtml(p.name)}</label>`
      )
      .join("");
  }

  function renderExpenses() {
    if (state.expenses.length === 0) {
      expensesList.innerHTML = '<p class="exs-empty">No expenses yet.</p>';
      return;
    }
    expensesList.innerHTML = state.expenses
      .map(exp => {
        const payer = state.people.find(p => p.id === exp.paidBy);
        return `<div class="exs-expense-row">
          <span>${escapeHtml(exp.description)}</span>
          <span class="exs-expense-amount">$${exp.amount.toFixed(2)}</span>
          <span class="exs-expense-payer">${payer ? escapeHtml(payer.name) : "?"}</span>
          <button data-remove-exp="${exp.id}">&times;</button>
        </div>`;
      })
      .join("");
    expensesList.querySelectorAll("button[data-remove-exp]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-remove-exp");
        state.expenses = state.expenses.filter(e => e.id !== id);
        saveState(state);
        renderAll();
      });
    });
  }

  function renderBalances() {
    if (state.people.length === 0) {
      balancesDiv.innerHTML = '<p class="exs-empty">Add people to see balances.</p>';
      return;
    }
    const balances = calculateBalances(state.people, state.expenses);
    const entries = state.people
      .map(p => ({ name: p.name, amount: balances[p.id] || 0 }))
      .filter(e => Math.abs(e.amount) > 0.01);
    if (entries.length === 0) {
      balancesDiv.innerHTML = '<p class="exs-empty">All settled up!</p>';
      return;
    }
    balancesDiv.innerHTML = entries
      .map(e => {
        const cls = e.amount > 0 ? "exs-balance-positive" : "exs-balance-negative";
        const label =
          e.amount > 0 ? `owed $${e.amount.toFixed(2)}` : `owes $${Math.abs(e.amount).toFixed(2)}`;
        return `<div class="exs-balance-row"><span>${escapeHtml(e.name)}</span><span class="${cls}">${label}</span></div>`;
      })
      .join("");
  }

  function renderSettle() {
    if (state.people.length === 0) {
      settleDiv.innerHTML = '<p class="exs-empty">Add people to see settle-up.</p>';
      return;
    }
    const balances = calculateBalances(state.people, state.expenses);
    const transactions = simplifyDebts(balances);
    if (transactions.length === 0) {
      settleDiv.innerHTML = '<p class="exs-empty">All settled up!</p>';
      return;
    }
    settleDiv.innerHTML = transactions
      .map(t => {
        const from = state.people.find(p => p.id === t.from);
        const to = state.people.find(p => p.id === t.to);
        return `<div class="exs-settle-row">${escapeHtml(from?.name || "?")} pays ${escapeHtml(to?.name || "?")} $${t.amount.toFixed(2)}</div>`;
      })
      .join("");
  }

  function renderAll() {
    renderPeople();
    renderExpenses();
    renderBalances();
    renderSettle();
  }

  personInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const name = personInput.value.trim();
      if (!name) return;
      state.people.push({ id: crypto.randomUUID(), name });
      personInput.value = "";
      saveState(state);
      renderAll();
    }
  });

  container.querySelector("#exs-add-expense").addEventListener("click", () => {
    const descEl = container.querySelector("#exs-desc");
    const amountEl = container.querySelector("#exs-amount");
    const errorEl = container.querySelector("#exs-error");
    const desc = descEl.value.trim();
    const amount = parseFloat(amountEl.value);
    const currentPaidBy = container.querySelector("#exs-paid-by").value;
    const splitAmong = Array.from(
      container.querySelectorAll(".exs-split-check:checked")
    ).map(cb => cb.value);

    descEl.classList.remove("exs-input-invalid");
    amountEl.classList.remove("exs-input-invalid");
    errorEl.style.display = "none";

    const errors = [];
    if (!desc) {
      errors.push("Description is required");
      descEl.classList.add("exs-input-invalid");
    }
    if (isNaN(amount) || amount <= 0) {
      errors.push("Amount must be greater than 0");
      amountEl.classList.add("exs-input-invalid");
    }
    if (!currentPaidBy) {
      errors.push("Select who paid");
    }
    if (splitAmong.length === 0) {
      errors.push("Select at least one person to split with");
    }

    if (errors.length > 0) {
      errorEl.textContent = errors.join(". ");
      errorEl.style.display = "";
      return;
    }

    if (!splitAmong.includes(currentPaidBy)) {
      splitAmong.push(currentPaidBy);
    }

    state.expenses.push({
      id: crypto.randomUUID(),
      description: desc,
      amount,
      paidBy: currentPaidBy,
      splitAmong
    });

    descEl.value = "";
    amountEl.value = "";
    errorEl.style.display = "none";
    saveState(state);
    renderAll();
  });

  renderAll();
}
