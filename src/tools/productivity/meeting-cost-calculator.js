import { showToast } from "../../components/toast.js";

export const toolConfig = {
  id: "meeting-cost-calculator",
  name: "Meeting Cost Calculator",
  category: "productivity",
  description: "Calculate real-time meeting cost based on participant salaries.",
  icon: "💰",
  accept: null,
  maxSizeMB: 0,
  keywords: ["meeting", "cost", "calculator", "salary", "time", "money"],
  steps: [
    "Add participants with salaries",
    "Start timer when meeting begins",
    "View running cost in real-time",
  ],
  faqs: [
    {
      question: "How is cost calculated?",
      answer:
        "Annual salary divided by working hours, multiplied by meeting duration and number of participants.",
    },
    {
      question: "Are benefits included?",
      answer:
        "No. For a more realistic cost, multiply the result by 1.3-1.5 to account for benefits and overhead.",
    },
  ],
};

export function calculateHourlyRate(annualSalary, hoursPerWeek = 40, weeksPerYear = 50) {
  return annualSalary / (hoursPerWeek * weeksPerYear);
}

export function calculateMeetingCost(hourlyRate, durationMinutes, participants) {
  return hourlyRate * (durationMinutes / 60) * participants;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function render(container) {
  let participants = [];
  let timerInterval = null;
  let elapsedSeconds = 0;
  let isRunning = false;

  destroyFn = () => {
    clearInterval(timerInterval);
  };

  container.innerHTML = `
    <div class="tool-layout">
      <div class="form-row" style="margin-bottom:var(--space-3);">
        <div class="form-group" style="flex:2;">
          <label for="name-input">Participant Name</label>
          <input type="text" id="name-input" class="text-input" placeholder="John">
        </div>
        <div class="form-group" style="flex:2;">
          <label for="salary-input">Annual Salary ($)</label>
          <input type="number" id="salary-input" class="text-input" placeholder="80000">
        </div>
        <div style="display:flex;align-items:flex-end;padding-bottom:var(--space-2);">
          <button class="btn btn-primary btn-sm" id="add-btn">Add</button>
        </div>
      </div>
      <div id="participants-list" style="margin-bottom:var(--space-3);"></div>
      <div class="form-row" style="margin-bottom:var(--space-3);">
        <button class="btn btn-primary btn-lg" id="start-btn" style="flex:1;">Start Meeting</button>
        <button class="btn btn-secondary btn-lg" id="reset-btn" style="flex:1;">Reset</button>
      </div>
      <div id="timer-display" style="text-align:center;padding:var(--space-4);background:var(--color-bg-secondary);border-radius:var(--radius-md);display:none;">
        <div id="timer-value" style="font-size:var(--text-3xl);font-weight:700;font-family:monospace;">00:00:00</div>
        <div id="cost-display" style="font-size:var(--text-xl);color:var(--color-primary);margin-top:var(--space-2);">$0.00</div>
        <div id="cost-details" style="font-size:var(--text-sm);color:var(--color-text-muted);margin-top:var(--space-1);"></div>
      </div>
    </div>
  `;

  const nameInput = container.querySelector("#name-input");
  const salaryInput = container.querySelector("#salary-input");
  const addBtn = container.querySelector("#add-btn");
  const participantsList = container.querySelector("#participants-list");
  const startBtn = container.querySelector("#start-btn");
  const resetBtn = container.querySelector("#reset-btn");
  const timerDisplay = container.querySelector("#timer-display");
  const timerValue = container.querySelector("#timer-value");
  const costDisplay = container.querySelector("#cost-display");
  const costDetails = container.querySelector("#cost-details");

  function renderParticipants() {
    participantsList.innerHTML = participants
      .map(
        (p, i) => `
      <div style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2);border:1px solid var(--color-border);border-radius:var(--radius-sm);margin-bottom:var(--space-1);">
        <span style="flex:1;font-weight:600;">${p.name}</span>
        <span style="color:var(--color-text-muted);">${formatCurrency(p.salary)}/yr</span>
        <button class="btn btn-secondary btn-sm remove-participant" data-index="${i}">Remove</button>
      </div>
    `,
      )
      .join("");

    participantsList.querySelectorAll(".remove-participant").forEach((btn) => {
      btn.addEventListener("click", () => {
        participants.splice(parseInt(btn.dataset.index), 1);
        renderParticipants();
      });
    });
  }

  function updateCost() {
    if (participants.length === 0) return;
    const totalHourly = participants.reduce((sum, p) => sum + calculateHourlyRate(p.salary), 0);
    const cost = totalHourly * (elapsedSeconds / 3600);
    timerValue.textContent = formatDuration(elapsedSeconds);
    costDisplay.textContent = formatCurrency(cost);
    costDetails.textContent = `${participants.length} participant${participants.length > 1 ? "s" : ""} | ${formatCurrency(totalHourly)}/hr combined`;
  }

  addBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const salary = parseFloat(salaryInput.value);
    if (!name || !salary || salary <= 0) {
      showToast({ message: "Enter valid name and salary.", type: "error" });
      return;
    }
    participants.push({ name, salary });
    nameInput.value = "";
    salaryInput.value = "";
    renderParticipants();
    showToast({ message: `${name} added.`, type: "success" });
  });

  startBtn.addEventListener("click", () => {
    if (participants.length === 0) {
      showToast({ message: "Add at least one participant.", type: "error" });
      return;
    }
    if (isRunning) {
      clearInterval(timerInterval);
      isRunning = false;
      startBtn.textContent = "Resume";
      startBtn.classList.remove("btn-danger");
      startBtn.classList.add("btn-primary");
    } else {
      isRunning = true;
      startBtn.textContent = "Pause";
      timerDisplay.style.display = "block";
      timerInterval = setInterval(() => {
        elapsedSeconds++;
        updateCost();
      }, 1000);
    }
  });

  resetBtn.addEventListener("click", () => {
    clearInterval(timerInterval);
    isRunning = false;
    elapsedSeconds = 0;
    timerValue.textContent = "00:00:00";
    costDisplay.textContent = "$0.00";
    costDetails.textContent = "";
    timerDisplay.style.display = "none";
    startBtn.textContent = "Start Meeting";
  });
}

let destroyFn = null;

export function destroy() {
  if (typeof destroyFn === "function") destroyFn();
}
