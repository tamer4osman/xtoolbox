export function octalToChmod(octal) {
  if (typeof octal !== "string") return null;
  const trimmed = octal.trim();
  if (!/^[0-7]{3,4}$/.test(trimmed)) return null;
  const padded = trimmed.length === 3 ? "0" + trimmed : trimmed;
  const digit = i => parseInt(padded[i], 10);
  return {
    special: { setuid: !!(digit(0) & 4), setgid: !!(digit(0) & 2), sticky: !!(digit(0) & 1) },
    owner: { r: !!(digit(1) & 4), w: !!(digit(1) & 2), x: !!(digit(1) & 1) },
    group: { r: !!(digit(2) & 4), w: !!(digit(2) & 2), x: !!(digit(2) & 1) },
    other: { r: !!(digit(3) & 4), w: !!(digit(3) & 2), x: !!(digit(3) & 1) }
  };
}

export function chmodToOctal(perms) {
  if (!perms) return null;
  const sp = perms.special || {};
  const o = perms.owner || {};
  const g = perms.group || {};
  const ot = perms.other || {};
  const triad = t => (t.r ? 4 : 0) + (t.w ? 2 : 0) + (t.x ? 1 : 0);
  const specDigit = (sp.setuid ? 4 : 0) + (sp.setgid ? 2 : 0) + (sp.sticky ? 1 : 0);
  const main = `${triad(o)}${triad(g)}${triad(ot)}`;
  return specDigit === 0 ? main : `${specDigit}${main}`;
}

export function chmodToSymbolic(perms) {
  if (!perms) return null;
  const sp = perms.special || {};
  const o = perms.owner || {};
  const g = perms.group || {};
  const ot = perms.other || {};
  const slot = (x, special, lo, hi) => (special ? (x ? lo : hi) : x ? "x" : "-");
  return (
    "-" +
    (o.r ? "r" : "-") +
    (o.w ? "w" : "-") +
    slot(o.x, sp.setuid, "s", "S") +
    (g.r ? "r" : "-") +
    (g.w ? "w" : "-") +
    slot(g.x, sp.setgid, "s", "S") +
    (ot.r ? "r" : "-") +
    (ot.w ? "w" : "-") +
    slot(ot.x, sp.sticky, "t", "T")
  );
}

export function symbolicToChmod(symbolic) {
  if (typeof symbolic !== "string") return null;
  let s = symbolic.trim();
  if (s.length === 10) s = s.slice(1);
  if (s.length !== 9) return null;
  if (!/^[-rwxsStT]{9}$/.test(s)) return null;
  const ux = s[2],
    gx = s[5],
    ox = s[8];
  return {
    owner: { r: s[0] === "r", w: s[1] === "w", x: ux === "x" || ux === "s" },
    group: { r: s[3] === "r", w: s[4] === "w", x: gx === "x" || gx === "s" },
    other: { r: s[6] === "r", w: s[7] === "w", x: ox === "x" || ox === "t" },
    special: {
      setuid: ux === "s" || ux === "S",
      setgid: gx === "s" || gx === "S",
      sticky: ox === "t" || ox === "T"
    }
  };
}

function emptyPerms() {
  return {
    owner: { r: false, w: false, x: false },
    group: { r: false, w: false, x: false },
    other: { r: false, w: false, x: false },
    special: { setuid: false, setgid: false, sticky: false }
  };
}

export const toolConfig = {
  id: "chmod-calculator",
  name: "Chmod Calculator",
  category: "dev",
  description:
    "Convert Unix file permissions between octal, symbolic, and visual checkbox form. Supports setuid, setgid, and sticky bits.",
  icon: "🔑",
  accept: null,
  maxSizeMB: null,
  keywords: [
    "chmod",
    "permissions",
    "unix",
    "linux",
    "octal",
    "symbolic",
    "setuid",
    "setgid",
    "sticky",
    "file permissions"
  ],
  steps: [
    "Toggle checkboxes for owner, group, and other permissions",
    "Or type an octal value (e.g. 755) to set permissions",
    "Copy the chmod command to use in your terminal"
  ],
  faqs: [
    {
      question: "What does 755 mean?",
      answer:
        "Owner can read, write, execute (7 = 4+2+1). Group and others can read and execute (5 = 4+1). Common for executable files and directories."
    },
    {
      question: "What is setuid / setgid / sticky?",
      answer:
        "setuid (4xxx) runs an executable as its owner. setgid (2xxx) runs as the group. Sticky (1xxx) restricts deletion in shared directories like /tmp."
    },
    {
      question: "What is the difference between 644 and 755?",
      answer:
        "644 (-rw-r--r--) is typical for regular files. 755 (-rwxr-xr-x) adds execute permission, needed for scripts and directories."
    }
  ]
};

export function render(container) {
  const PRESETS = ["644", "755", "600", "700", "777", "444"];
  const ROLES = ["owner", "group", "other"];
  const BITS = ["r", "w", "x"];
  const ROLE_LABELS = { owner: "Owner", group: "Group", other: "Other" };
  const BIT_LABELS = { r: "Read", w: "Write", x: "Execute" };
  const listeners = [];

  container.innerHTML = `
    <div class="tool-layout">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-4);">
        <div class="form-group" style="margin-bottom:0;">
          <label for="cc-octal">Octal</label>
          <input type="text" id="cc-octal" class="text-input" maxlength="4" inputmode="numeric" placeholder="755" value="755" style="font-family:monospace;font-size:var(--text-lg);letter-spacing:0.1em;">
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label>Symbolic</label>
          <div id="cc-symbolic" style="font-family:monospace;font-size:var(--text-lg);letter-spacing:0.15em;padding:var(--space-3);background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);">-rwxr-xr-x</div>
        </div>
      </div>

      <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);margin-bottom:var(--space-4);">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="color:var(--color-text-muted);font-size:var(--text-sm);">
              <th style="text-align:left;padding:var(--space-2) var(--space-3);font-weight:500;"></th>
              ${BITS.map(b => `<th style="text-align:center;padding:var(--space-2) var(--space-3);font-weight:500;">${BIT_LABELS[b]}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${ROLES.map(
              role => `
              <tr>
                <td style="padding:var(--space-2) var(--space-3);font-weight:600;">${ROLE_LABELS[role]}</td>
                ${BITS.map(
                  bit => `
                  <td style="text-align:center;padding:var(--space-2) var(--space-3);">
                    <input type="checkbox" id="cc-${role}-${bit}" class="cc-bit" data-role="${role}" data-bit="${bit}" style="width:20px;height:20px;cursor:pointer;">
                  </td>
                `
                ).join("")}
              </tr>
            `
            ).join("")}
          </tbody>
        </table>
      </div>

      <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-3) var(--space-4);margin-bottom:var(--space-4);">
        <div style="display:flex;flex-wrap:wrap;gap:var(--space-4);align-items:center;">
          <span style="font-weight:600;color:var(--color-text-muted);font-size:var(--text-sm);">Special bits:</span>
          <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer;"><input type="checkbox" id="cc-setuid" class="cc-special" data-special="setuid" style="width:18px;height:18px;cursor:pointer;"> setuid</label>
          <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer;"><input type="checkbox" id="cc-setgid" class="cc-special" data-special="setgid" style="width:18px;height:18px;cursor:pointer;"> setgid</label>
          <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer;"><input type="checkbox" id="cc-sticky" class="cc-special" data-special="sticky" style="width:18px;height:18px;cursor:pointer;"> sticky</label>
        </div>
      </div>

      <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);margin-bottom:var(--space-4);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
          <span style="font-weight:600;color:var(--color-text-muted);font-size:var(--text-sm);">Command</span>
          <button class="btn btn-primary btn-sm" id="cc-copy" type="button">Copy</button>
        </div>
        <div id="cc-command" style="font-family:monospace;font-size:var(--text-base);background:#1e1e2e;color:#cdd6f4;padding:var(--space-3);border-radius:var(--radius-md);word-break:break-all;">chmod 755 myfile</div>
      </div>

      <div>
        <div style="font-weight:600;color:var(--color-text-muted);font-size:var(--text-sm);margin-bottom:var(--space-2);">Presets</div>
        <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);">
          ${PRESETS.map(p => `<button class="btn btn-sm cc-preset" data-octal="${p}" type="button" style="font-family:monospace;min-width:64px;">${p}</button>`).join("")}
        </div>
      </div>
    </div>
  `;

  const octalInput = container.querySelector("#cc-octal");
  const symbolicEl = container.querySelector("#cc-symbolic");
  const commandEl = container.querySelector("#cc-command");
  const copyBtn = container.querySelector("#cc-copy");
  const bitChecks = container.querySelectorAll(".cc-bit");
  const specialChecks = container.querySelectorAll(".cc-special");
  const presetBtns = container.querySelectorAll(".cc-preset");

  const state = { perms: octalToChmod("755"), lastValidOctal: "755", flashTimer: null };

  function renderAll() {
    const octal = chmodToOctal(state.perms);
    const symbolic = chmodToSymbolic(state.perms);
    if (document.activeElement !== octalInput) octalInput.value = octal;
    symbolicEl.textContent = symbolic;
    commandEl.textContent = `chmod ${octal} myfile`;
    bitChecks.forEach(cb => {
      const role = cb.dataset.role;
      const bit = cb.dataset.bit;
      cb.checked = !!state.perms[role][bit];
    });
    specialChecks.forEach(cb => {
      cb.checked = !!state.perms.special[cb.dataset.special];
    });
    state.lastValidOctal = octal;
  }

  function flashError() {
    octalInput.style.borderColor = "var(--color-danger, #EF4444)";
    if (state.flashTimer) clearTimeout(state.flashTimer);
    state.flashTimer = setTimeout(() => {
      octalInput.style.borderColor = "";
    }, 1500);
  }

  function commitOctal() {
    const raw = octalInput.value.trim();
    if (raw === "") {
      state.perms = emptyPerms();
      renderAll();
      return;
    }
    const parsed = octalToChmod(raw);
    if (!parsed) {
      flashError();
      octalInput.value = state.lastValidOctal;
      return;
    }
    state.perms = parsed;
    renderAll();
  }

  function onBitChange(cb) {
    const role = cb.dataset.role;
    const bit = cb.dataset.bit;
    state.perms[role][bit] = cb.checked;
    renderAll();
  }

  function onSpecialChange(cb) {
    state.perms.special[cb.dataset.special] = cb.checked;
    renderAll();
  }

  function onPresetClick(btn) {
    const parsed = octalToChmod(btn.dataset.octal);
    if (parsed) {
      state.perms = parsed;
      renderAll();
    }
  }

  function onOctalBlur() {
    commitOctal();
  }

  function onOctalKeydown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitOctal();
      octalInput.blur();
    }
  }

  function onCopyClick() {
    const text = commandEl.textContent;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          const original = copyBtn.textContent;
          copyBtn.textContent = "Copied!";
          setTimeout(() => {
            copyBtn.textContent = original;
          }, 1200);
        })
        .catch(() => {});
    }
  }

  bitChecks.forEach(cb => {
    const handler = () => onBitChange(cb);
    cb.addEventListener("change", handler);
    listeners.push({ el: cb, event: "change", handler });
  });

  specialChecks.forEach(cb => {
    const handler = () => onSpecialChange(cb);
    cb.addEventListener("change", handler);
    listeners.push({ el: cb, event: "change", handler });
  });

  presetBtns.forEach(btn => {
    const handler = () => onPresetClick(btn);
    btn.addEventListener("click", handler);
    listeners.push({ el: btn, event: "click", handler });
  });

  octalInput.addEventListener("blur", onOctalBlur);
  listeners.push({ el: octalInput, event: "blur", handler: onOctalBlur });

  octalInput.addEventListener("keydown", onOctalKeydown);
  listeners.push({ el: octalInput, event: "keydown", handler: onOctalKeydown });

  copyBtn.addEventListener("click", onCopyClick);
  listeners.push({ el: copyBtn, event: "click", handler: onCopyClick });

  renderAll();

  return () => {
    if (state.flashTimer) clearTimeout(state.flashTimer);
    listeners.forEach(({ el, event, handler }) => el.removeEventListener(event, handler));
    listeners.length = 0;
  };
}

export function destroy() {}
