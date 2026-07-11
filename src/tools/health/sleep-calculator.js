export const toolConfig = {
  id: "sleep-calculator",
  name: "Sleep Calculator",
  category: "health",
  description: "Find the best times to wake up based on sleep cycles.",
  icon: "😴",
  status: "done"
};

export function render(container) {
  container.innerHTML = `
    <div class="sleep-container">
      <div class="sleep-form">
        <div class="form-group">
          <label>Wake Up Time</label>
          <div class="time-input">
            <input type="number" id="wake-hour" value="7" min="0" max="23" />
            <span>:</span>
            <input type="number" id="wake-min" value="0" min="0" max="59" />
          </div>
        </div>
        <button id="bedtime-btn" class="calc-button">Calculate Bedtime</button>
        <div class="divider">or</div>
        <div class="form-group">
          <label>Bedtime</label>
          <div class="time-input">
            <input type="number" id="bed-hour" value="23" min="0" max="23" />
            <span>:</span>
            <input type="number" id="bed-min" value="0" min="0" max="59" />
          </div>
        </div>
        <button id="wake-btn" class="calc-button secondary">Calculate Wake Time</button>
      </div>
      <div id="bedtime-result" class="result hidden">
        <div class="sleep-card">
          <div class="sleep-title">Sleep Now</div>
          <div class="sleep-times" id="bedtime-slots"></div>
        </div>
      </div>
      <div id="wake-result" class="result hidden">
        <div class="sleep-card">
          <div class="sleep-title">Wake Up At</div>
          <div class="sleep-times" id="wake-slots"></div>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .sleep-container { max-width: 500px; margin: 0 auto; }
    .sleep-container h2 { text-align: center; margin-bottom: var(--space-6); }
    .sleep-form { background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-xl); margin-bottom: var(--space-6); }
    .form-group { margin-bottom: var(--space-4); text-align: left; }
    .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; }
    .time-input { display: flex; align-items: center; gap: var(--space-2); }
    .time-input input { width: 70px; padding: var(--space-3); text-align: center; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-xl); }
    .time-input span { font-size: var(--text-xl); font-weight: 600; }
    .calc-button { width: 100%; padding: var(--space-3); border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; background: var(--color-primary); color: white; }
    .calc-button.secondary { background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text); }
    .divider { text-align: center; color: var(--color-text-muted); font-size: var(--text-sm); margin: var(--space-4) 0; }
    .sleep-card { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-6); }
    .sleep-title { text-align: center; font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: var(--space-4); }
    .sleep-times { display: flex; flex-direction: column; gap: var(--space-3); }
    .time-slot { display: flex; justify-content: space-between; padding: var(--space-3); border-radius: var(--radius-lg); }
    .time-slot.optimal { background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; }
    .time-slot.good { background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; }
    .time-slot { background: var(--color-bg); }
    .slot-time { font-size: var(--text-lg); font-weight: 600; }
    .slot-cycles { font-size: var(--text-sm); color: var(--color-text-secondary); }
    .hidden { display: none; }
  `;
  container.appendChild(style);

  function formatTime(h, m) {
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
  }

  container.querySelector("#bedtime-btn").addEventListener("click", () => {
    const hour = parseInt(container.querySelector("#wake-hour").value) || 7;
    const min = parseInt(container.querySelector("#wake-min").value) || 0;

    const slots = container.querySelector("#bedtime-slots");
    slots.innerHTML = "";

    const cycles = [6, 5, 4, 3];
    cycles.forEach(cycle => {
      const sleepMinutes = cycle * 90 + 15;
      const bedDate = new Date();
      bedDate.setHours(hour, min, 0);
      bedDate.setMinutes(bedDate.getMinutes() - sleepMinutes);

      const h = bedDate.getHours();
      const m = bedDate.getMinutes();
      const cls = cycle >= 5 ? "optimal" : cycle >= 4 ? "good" : "";

      slots.innerHTML += `
        <div class="time-slot ${cls}">
          <span class="slot-time">${formatTime(h, m)}</span>
          <span class="slot-cycles">${cycle} cycles (${sleepMinutes} min)</span>
        </div>
      `;
    });

    container.querySelector("#bedtime-result").classList.remove("hidden");
    container.querySelector("#wake-result").classList.add("hidden");
  });

  container.querySelector("#wake-btn").addEventListener("click", () => {
    const hour = parseInt(container.querySelector("#bed-hour").value) || 23;
    const min = parseInt(container.querySelector("#bed-min").value) || 0;

    const slots = container.querySelector("#wake-slots");
    slots.innerHTML = "";

    const cycles = [6, 5, 4, 3];
    cycles.forEach(cycle => {
      const sleepMinutes = cycle * 90 + 15;
      const wakeDate = new Date();
      wakeDate.setHours(hour, min, 0);
      wakeDate.setMinutes(wakeDate.getMinutes() + sleepMinutes);

      const h = wakeDate.getHours();
      const m = wakeDate.getMinutes();
      const cls = cycle >= 5 ? "optimal" : cycle >= 4 ? "good" : "";

      slots.innerHTML += `
        <div class="time-slot ${cls}">
          <span class="slot-time">${formatTime(h, m)}</span>
          <span class="slot-cycles">${cycle} cycles (${sleepMinutes} min)</span>
        </div>
      `;
    });

    container.querySelector("#wake-result").classList.remove("hidden");
    container.querySelector("#bedtime-result").classList.add("hidden");
  });
}
