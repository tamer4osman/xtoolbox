import { createHealthCalculator } from "./health-calculator.js";

export const toolConfig = {
  id: "macros-calculator",
  name: "Macros Calculator",
  category: "health",
  description: "Calculate daily macronutrient requirements.",
  icon: "🥗",
  status: "done"
};

const GOAL_OPTIONS = [
  { value: "lose", label: "Lose Weight", selected: true },
  { value: "maintain", label: "Maintain" },
  { value: "gain", label: "Gain Muscle" }
];

const PREFERENCE_OPTIONS = [
  { value: "balanced", label: "Balanced (30P/40C/30F)", selected: true },
  { value: "lowcarb", label: "Low Carb (40P/20C/40F)" },
  { value: "highcarb", label: "High Carb (20P/50C/30F)" },
  { value: "highprotein", label: "High Protein (40P/30C/30F)" }
];

const RESULT_CSS = `
  .macros-display { display: flex; justify-content: center; gap: var(--space-4); margin-bottom: var(--space-6); }
  .macro-circle { width: 120px; height: 120px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: white; }
  .macro-circle.protein { background: linear-gradient(135deg, #ef4444, #dc2626); }
  .macro-circle.carbs { background: linear-gradient(135deg, #f59e0b, #d97706); }
  .macro-circle.fat { background: linear-gradient(135deg, #10b981, #059669); }
  .macro-value { font-size: var(--text-xl); font-weight: 700; }
  .macro-label { font-size: var(--text-xs); opacity: 0.9; }
  .macro-pct { font-size: var(--text-xs); opacity: 0.8; }
  .macros-info { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-lg); }
  .macros-info h3 { font-size: var(--text-sm); margin-bottom: var(--space-3); }
  .tip-item { display: flex; justify-content: space-between; padding: var(--space-2) 0; font-size: var(--text-sm); color: var(--color-text-secondary); border-bottom: 1px solid var(--color-border); }
  .tip-item:last-child { border: none; }
`;

export function getRatios(pref) {
  switch (pref) {
    case "lowcarb":
      return [40, 20, 40];
    case "highcarb":
      return [20, 50, 30];
    case "highprotein":
      return [40, 30, 30];
    default:
      return [30, 40, 30];
  }
}

export function adjustForGoal(ratios, goal) {
  const adjusted = [...ratios];
  if (goal === "lose") {
    adjusted[0] += 10;
    adjusted[2] -= 10;
  } else if (goal === "gain") {
    adjusted[0] += 5;
    adjusted[1] += 10;
    adjusted[2] -= 15;
  }
  return adjusted;
}

export function render(container) {
  createHealthCalculator({
    container,
    containerClass: "macros-container",
    calcButtonLabel: "Calculate Macros",
    extraCSS: RESULT_CSS,
    fields: [
      { id: "calories", label: "Daily Calories", value: 2000, min: 500, max: 10000 },
      { id: "goal", type: "select", label: "Goal", options: GOAL_OPTIONS },
      { id: "preference", type: "select", label: "Preference", options: PREFERENCE_OPTIONS }
    ],
    onCalculate: (container, resultEl) => {
      const calories = parseInt(container.querySelector("#calories").value) || 2000;
      const goal = container.querySelector("#goal").value;
      const pref = container.querySelector("#preference").value;

      const ratios = getRatios(pref);
      const adjusted = adjustForGoal(ratios, goal);

      const protein = Math.round((calories * adjusted[0]) / 100 / 4);
      const carbs = Math.round((calories * adjusted[1]) / 100 / 4);
      const fat = Math.round((calories * adjusted[2]) / 100 / 9);

      resultEl.innerHTML = `
        <div class="macros-display">
          <div class="macro-circle protein">
            <div class="macro-value">${protein}g</div>
            <div class="macro-label">Protein</div>
            <div class="macro-pct">${adjusted[0]}%</div>
          </div>
          <div class="macro-circle carbs">
            <div class="macro-value">${carbs}g</div>
            <div class="macro-label">Carbs</div>
            <div class="macro-pct">${adjusted[1]}%</div>
          </div>
          <div class="macro-circle fat">
            <div class="macro-value">${fat}g</div>
            <div class="macro-label">Fat</div>
            <div class="macro-pct">${adjusted[2]}%</div>
          </div>
        </div>
        <div class="macros-info">
          <h3>💡 Tips</h3>
          <div class="tip-item">
            <span>🥩 Protein</span>
            <span>4 calories/gram</span>
          </div>
          <div class="tip-item">
            <span>🍞 Carbs</span>
            <span>4 calories/gram</span>
          </div>
          <div class="tip-item">
            <span>🥑 Fat</span>
            <span>9 calories/gram</span>
          </div>
        </div>
      `;
    }
  });
}
