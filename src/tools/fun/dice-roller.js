export const toolConfig = {
  id: "dice-roller",
  name: "Dice Roller",
  category: "fun",
  description: "Roll dice. Choose 1-6 dice with random results.",
  icon: "🎲",
  accept: null,
  maxSizeMB: null,
  keywords: ["dice roller", "roll dice", "random dice"],
  steps: ["Choose number of dice", "Roll"]
};

export function render(container) {
  container.innerHTML = `
    <div class="dice-container">
      <div class="dice-controls">
        <label>Dice: <input type="number" id="dice-count" value="2" min="1" max="6"></label>
        <button id="roll-btn" class="btn btn-primary">Roll</button>
      </div>
      <div id="dice-results" class="dice-results"></div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .dice-container { text-align: center; padding: var(--space-8); }
    .dice-controls { margin-bottom: var(--space-6); }
    .dice-controls input { width: 60px; padding: var(--space-2); margin: 0 var(--space-3); }
    .dice-results { display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap; }
    .die { 
      width: 80px; height: 80px; background: white; border-radius: var(--radius-lg);
      display: flex; align-items: center; justify-content: center;
      font-size: 2.5em; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
    .die.rolling { animation: roll 0.5s ease-out; }
    @keyframes roll { 
      0% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(720deg) scale(1.2); }
      100% { transform: rotate(1080deg) scale(1); }
    }
  `;
  container.appendChild(style);

  const diceInput = container.querySelector("#dice-count");
  const rollBtn = container.querySelector("#roll-btn");
  const results = container.querySelector("#dice-results");

  function roll() {
    const inputVal = parseInt(diceInput.value) || 2;
    const count = Math.min(6, Math.max(1, inputVal));
    diceInput.value = count;

    results.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const die = document.createElement("div");
      die.className = "die";
      die.textContent = Math.ceil(Math.random() * 6);
      die.classList.add("rolling");
      results.appendChild(die);
    }
  }

  rollBtn.addEventListener("click", roll);
  roll();
}
