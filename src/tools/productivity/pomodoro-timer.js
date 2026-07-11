const STORAGE_KEY = "xtoolbox-pomodoro";
const MODES = {
  pomodoro: { label: "Pomodoro", color: "var(--color-error)" },
  shortBreak: { label: "Short Break", color: "var(--color-success)" },
  longBreak: { label: "Long Break", color: "var(--color-info)" }
};

function loadSettings() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

function getDefaultSettings() {
  return {
    durations: { pomodoro: 25, shortBreak: 5, longBreak: 15 },
    autoStartBreaks: true,
    sound: true,
    notifications: true,
    sessionsBeforeLong: 4,
    completedToday: 0,
    lastDate: null
  };
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function playTone(freq, duration) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

function notify(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "🍅" });
  }
}

function formatMMSS(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export const toolConfig = {
  id: "pomodoro-timer",
  name: "Pomodoro Timer",
  category: "productivity",
  description:
    "Focus timer using the Pomodoro Technique — 25 min work, 5 min break, repeat. Tracks sessions and saves settings.",
  icon: "🍅",
  accept: null,
  maxSizeMB: null,
  keywords: ["pomodoro", "focus", "timer", "productivity", "work", "break", "study"],
  steps: [
    "Pick a mode (Pomodoro, Short Break, or Long Break)",
    "Click Start to begin",
    "Take a break when the timer rings",
    "After 4 pomodoros, take a long break"
  ],
  faqs: [
    {
      question: "What is the Pomodoro Technique?",
      answer:
        "A time management method: work for 25 minutes, take a 5-minute break, repeat. After 4 sessions, take a 15-30 minute long break."
    },
    {
      question: "Does it save my progress?",
      answer: "Yes! Your completed sessions and settings are saved in your browser."
    },
    {
      question: "Can I customize the durations?",
      answer: "Yes! Open Settings to change work, short break, and long break durations."
    }
  ]
};

export function render(container) {
  const saved = loadSettings();
  const settings = saved || getDefaultSettings();
  if (settings.lastDate !== getToday()) {
    settings.completedToday = 0;
    settings.lastDate = getToday();
  }

  let currentMode = "pomodoro";
  let running = false;
  let remaining = settings.durations.pomodoro * 60;
  let totalSeconds = remaining;
  let intervalId = null;
  let sessionCount = 0;
  let lastTick = null;

  container.innerHTML = `
    <div class="tool-layout" style="max-width:400px;margin:0 auto;text-align:center;">
      <div id="pt-modes" style="display:flex;gap:var(--space-2);justify-content:center;margin-bottom:var(--space-6);">
        <button class="btn btn-primary btn-sm" data-mode="pomodoro">Pomodoro</button>
        <button class="btn btn-secondary btn-sm" data-mode="shortBreak">Short Break</button>
        <button class="btn btn-secondary btn-sm" data-mode="longBreak">Long Break</button>
      </div>

      <div style="position:relative;width:220px;height:220px;margin:0 auto var(--space-6);">
        <svg width="220" height="220" viewBox="0 0 220 220" id="pt-ring">
          <circle cx="110" cy="110" r="100" fill="none" stroke="var(--color-border)" stroke-width="8"/>
          <circle cx="110" cy="110" r="100" fill="none" stroke="var(--color-error)" stroke-width="8"
            stroke-dasharray="628.32" stroke-dashoffset="0" stroke-linecap="round"
            id="pt-progress" transform="rotate(-90 110 110)"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div id="pt-time" style="font-size:3rem;font-weight:700;font-family:monospace;letter-spacing:2px;">${formatMMSS(remaining)}</div>
          <div id="pt-label" style="font-size:var(--text-sm);color:var(--color-text-secondary);">Work Session</div>
        </div>
      </div>

      <div style="display:flex;gap:var(--space-2);justify-content:center;margin-bottom:var(--space-4);">
        <button class="btn btn-primary btn-lg" id="pt-start" style="min-width:120px;">Start</button>
        <button class="btn btn-secondary btn-lg" id="pt-reset" style="min-width:80px;">Reset</button>
      </div>

      <div style="display:flex;gap:var(--space-1);justify-content:center;margin-bottom:var(--space-2);" id="pt-dots"></div>
      <div style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-6);">
        Today: <span id="pt-today">${settings.completedToday}</span> completed
      </div>

      <div style="border-top:1px solid var(--color-border);padding-top:var(--space-4);">
        <button class="btn btn-ghost btn-sm" id="pt-settings-toggle" style="margin-bottom:var(--space-3);">⚙ Settings</button>
        <div id="pt-settings" style="display:none;text-align:left;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);margin-bottom:var(--space-3);">
            <label style="font-size:var(--text-sm);">
              Pomodoro (min)
              <input type="number" id="pt-dur-pomodoro" min="1" max="120" value="${settings.durations.pomodoro}" class="input" style="width:100%;margin-top:var(--space-1);">
            </label>
            <label style="font-size:var(--text-sm);">
              Short Break (min)
              <input type="number" id="pt-dur-short" min="1" max="60" value="${settings.durations.shortBreak}" class="input" style="width:100%;margin-top:var(--space-1);">
            </label>
            <label style="font-size:var(--text-sm);">
              Long Break (min)
              <input type="number" id="pt-dur-long" min="1" max="60" value="${settings.durations.longBreak}" class="input" style="width:100%;margin-top:var(--space-1);">
            </label>
            <label style="font-size:var(--text-sm);">
              Sessions before long
              <input type="number" id="pt-sessions" min="2" max="10" value="${settings.sessionsBeforeLong}" class="input" style="width:100%;margin-top:var(--space-1);">
            </label>
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--space-2);">
            <label style="font-size:var(--text-sm);display:flex;align-items:center;gap:var(--space-2);cursor:pointer;">
              <input type="checkbox" id="pt-auto-break" ${settings.autoStartBreaks ? "checked" : ""}> Auto-start breaks
            </label>
            <label style="font-size:var(--text-sm);display:flex;align-items:center;gap:var(--space-2);cursor:pointer;">
              <input type="checkbox" id="pt-sound" ${settings.sound ? "checked" : ""}> Play sound
            </label>
            <label style="font-size:var(--text-sm);display:flex;align-items:center;gap:var(--space-2);cursor:pointer;">
              <input type="checkbox" id="pt-notif" ${settings.notifications ? "checked" : ""}> Browser notifications
            </label>
          </div>
        </div>
      </div>
    </div>
  `;

  const timeEl = container.querySelector("#pt-time");
  const labelEl = container.querySelector("#pt-label");
  const progressEl = container.querySelector("#pt-progress");
  const startBtn = container.querySelector("#pt-start");
  const resetBtn = container.querySelector("#pt-reset");
  const todayEl = container.querySelector("#pt-today");
  const dotsEl = container.querySelector("#pt-dots");
  const modeBtns = container.querySelectorAll("[data-mode]");
  const settingsToggle = container.querySelector("#pt-settings-toggle");
  const settingsPanel = container.querySelector("#pt-settings");
  const durPomodoro = container.querySelector("#pt-dur-pomodoro");
  const durShort = container.querySelector("#pt-dur-short");
  const durLong = container.querySelector("#pt-dur-long");
  const sessionsInput = container.querySelector("#pt-sessions");
  const autoBreakCheck = container.querySelector("#pt-auto-break");
  const soundCheck = container.querySelector("#pt-sound");
  const notifCheck = container.querySelector("#pt-notif");

  const CIRCUMFERENCE = 2 * Math.PI * 100;

  function updateDots() {
    dotsEl.innerHTML = "";
    for (let i = 0; i < settings.sessionsBeforeLong; i++) {
      const dot = document.createElement("span");
      dot.style.cssText = `width:10px;height:10px;border-radius:50%;display:inline-block;${i < sessionCount ? "background:var(--color-error);" : "background:var(--color-border);"}`;
      dotsEl.appendChild(dot);
    }
  }

  function updateProgress() {
    const pct = totalSeconds > 0 ? remaining / totalSeconds : 0;
    progressEl.setAttribute("stroke-dashoffset", String(CIRCUMFERENCE * (1 - pct)));
  }

  function updateDisplay() {
    timeEl.textContent = formatMMSS(remaining);
    updateProgress();
  }

  function applyMode(mode) {
    currentMode = mode;
    totalSeconds = settings.durations[mode] * 60;
    remaining = totalSeconds;
    running = false;
    clearInterval(intervalId);
    intervalId = null;
    lastTick = null;
    startBtn.textContent = "Start";

    const labels = { pomodoro: "Work Session", shortBreak: "Short Break", longBreak: "Long Break" };
    labelEl.textContent = labels[mode];

    const colors = {
      pomodoro: "var(--color-error)",
      shortBreak: "var(--color-success)",
      longBreak: "var(--color-info)"
    };
    progressEl.setAttribute("stroke", colors[mode]);

    modeBtns.forEach(b => {
      b.className = b.dataset.mode === mode ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm";
    });

    updateDisplay();
  }

  function tick() {
    const now = Date.now();
    if (lastTick) {
      const elapsed = Math.floor((now - lastTick) / 1000);
      if (elapsed >= 1) {
        remaining = Math.max(0, remaining - elapsed);
        lastTick = now;
        updateDisplay();
      }
    } else {
      lastTick = now;
    }

    if (remaining <= 0) {
      clearInterval(intervalId);
      intervalId = null;
      running = false;
      startBtn.textContent = "Start";
      onTimerComplete();
    }
  }

  function onTimerComplete() {
    if (settings.sound) {
      playTone(880, 0.15);
      setTimeout(() => playTone(1100, 0.15), 200);
      setTimeout(() => playTone(880, 0.3), 400);
    }

    if (currentMode === "pomodoro") {
      sessionCount++;
      settings.completedToday++;
      settings.lastDate = getToday();
      saveSettings(settings);
      todayEl.textContent = settings.completedToday;
      updateDots();
      notify("Pomodoro complete!", "Time for a break.");

      if (sessionCount >= settings.sessionsBeforeLong) {
        sessionCount = 0;
        if (settings.autoStartBreaks) applyMode("longBreak");
        else applyMode("longBreak");
      } else {
        if (settings.autoStartBreaks) applyMode("shortBreak");
        else applyMode("shortBreak");
      }
    } else {
      notify("Break over!", "Time to focus.");
      applyMode("pomodoro");
    }
  }

  function startTimer() {
    if (running) {
      running = false;
      clearInterval(intervalId);
      intervalId = null;
      lastTick = null;
      startBtn.textContent = "Resume";
    } else {
      running = true;
      lastTick = Date.now();
      intervalId = setInterval(tick, 250);
      startBtn.textContent = "Pause";
    }
  }

  function resetTimer() {
    running = false;
    clearInterval(intervalId);
    intervalId = null;
    lastTick = null;
    remaining = settings.durations[currentMode] * 60;
    totalSeconds = remaining;
    startBtn.textContent = "Start";
    updateDisplay();
  }

  function applySettings() {
    settings.durations.pomodoro = Math.max(1, Math.min(120, parseInt(durPomodoro.value) || 25));
    settings.durations.shortBreak = Math.max(1, Math.min(60, parseInt(durShort.value) || 5));
    settings.durations.longBreak = Math.max(1, Math.min(60, parseInt(durLong.value) || 15));
    settings.sessionsBeforeLong = Math.max(2, Math.min(10, parseInt(sessionsInput.value) || 4));
    settings.autoStartBreaks = autoBreakCheck.checked;
    settings.sound = soundCheck.checked;
    settings.notifications = notifCheck.checked;

    durPomodoro.value = settings.durations.pomodoro;
    durShort.value = settings.durations.shortBreak;
    durLong.value = settings.durations.longBreak;
    sessionsInput.value = settings.sessionsBeforeLong;

    saveSettings(settings);
    updateDots();

    if (!running) {
      totalSeconds = settings.durations[currentMode] * 60;
      remaining = totalSeconds;
      updateDisplay();
    }
  }

  modeBtns.forEach(b =>
    b.addEventListener("click", () => {
      if (running) {
        clearInterval(intervalId);
        running = false;
      }
      applyMode(b.dataset.mode);
    })
  );

  startBtn.addEventListener("click", startTimer);
  resetBtn.addEventListener("click", resetTimer);

  settingsToggle.addEventListener("click", () => {
    const visible = settingsPanel.style.display !== "none";
    settingsPanel.style.display = visible ? "none" : "block";
    settingsToggle.textContent = visible ? "⚙ Settings" : "✕ Close Settings";
  });

  [durPomodoro, durShort, durLong, sessionsInput].forEach(el =>
    el.addEventListener("change", applySettings)
  );
  [autoBreakCheck, soundCheck, notifCheck].forEach(el =>
    el.addEventListener("change", applySettings)
  );

  if (settings.notifications && "Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }

  updateDots();
  applyMode("pomodoro");
}
