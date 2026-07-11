const ROMAN_MAP = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"]
];

const ROMAN_PATTERN = /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

export function toRoman(num) {
  if (!Number.isInteger(num) || num < 1 || num > 3999) return null;
  let result = "";
  let n = num;
  for (const [val, sym] of ROMAN_MAP) {
    while (n >= val) {
      result += sym;
      n -= val;
    }
  }
  return result;
}

export function fromRoman(str) {
  if (!str || typeof str !== "string") return null;
  const s = str.trim().toUpperCase();
  if (!ROMAN_PATTERN.test(s)) return null;
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = map[s[i]];
    const next = map[s[i + 1]];
    if (next && cur < next) {
      total += next - cur;
      i++;
    } else total += cur;
  }
  return total;
}

export const toolConfig = {
  id: "roman-numerals",
  name: "Roman Numeral Converter",
  category: "text",
  description: "Convert between Roman numerals and Arabic numbers. Supports 1–3999 (I–MMMCMXCIX).",
  icon: "Ⅿ",
  accept: null,
  maxSizeMB: null,
  keywords: [
    "roman numerals",
    "roman numeral converter",
    "arabic to roman",
    "roman to number",
    "numeral conversion"
  ],
  steps: [
    "Enter a number (1–3999) to convert to Roman",
    "Or enter a Roman numeral to convert to a number",
    "See the result immediately"
  ],
  faqs: [
    {
      question: "What range is supported?",
      answer:
        "1 to 3999 (I to MMMCMXCIX). Larger numbers require special notation not supported here."
    },
    {
      question: "Is the input validated?",
      answer: "Yes. Invalid Roman numerals or out-of-range numbers show an error message."
    }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:var(--space-4);align-items:center;">
        <div class="form-group" style="margin-bottom:0;">
          <label>Number</label>
          <input type="number" id="rn-number" class="text-input" placeholder="2024" value="2024" min="1" max="3999">
        </div>
        <div style="text-align:center;">
          <button class="btn btn-primary" id="rn-to-roman" title="→ Roman">→</button>
          <div style="margin:var(--space-2) 0;font-size:var(--text-sm);color:var(--color-text-muted);">or</div>
          <button class="btn btn-primary" id="rn-to-number" title="→ Number">←</button>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label>Roman Numeral</label>
          <input type="text" id="rn-roman" class="text-input" placeholder="MMXXIV" value="MMXXIV" style="font-family:serif;text-transform:uppercase;">
        </div>
      </div>

      <div id="rn-result" style="margin-top:var(--space-4);background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-4);text-align:center;">
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.5px;">Result</div>
        <div id="rn-output" style="font-size:var(--text-3xl);font-weight:700;margin-top:var(--space-2);font-family:serif;">MMXXIV</div>
        <div id="rn-sub" style="font-size:var(--text-sm);color:var(--color-text-muted);margin-top:var(--space-1);">= 2024</div>
      </div>
    </div>
  `;

  const numberInput = container.querySelector("#rn-number");
  const romanInput = container.querySelector("#rn-roman");
  const output = container.querySelector("#rn-output");
  const sub = container.querySelector("#rn-sub");
  const toRomanBtn = container.querySelector("#rn-to-roman");
  const toNumberBtn = container.querySelector("#rn-to-number");

  function showNumberToRoman() {
    const val = parseInt(numberInput.value);
    const roman = toRoman(val);
    if (roman === null) {
      output.textContent = "Invalid";
      sub.textContent = "Enter a number between 1 and 3999";
      return;
    }
    output.textContent = roman;
    sub.textContent = `= ${val}`;
  }

  function showRomanToNumber() {
    const val = fromRoman(romanInput.value);
    if (val === null) {
      output.textContent = "Invalid";
      sub.textContent = "Enter a valid Roman numeral (I–MMMCMXCIX)";
      return;
    }
    output.textContent = val;
    sub.textContent = `= ${romanInput.value.trim().toUpperCase()}`;
  }

  toRomanBtn.addEventListener("click", showNumberToRoman);
  toNumberBtn.addEventListener("click", showRomanToNumber);
  numberInput.addEventListener("keydown", e => {
    if (e.key === "Enter") showNumberToRoman();
  });
  romanInput.addEventListener("keydown", e => {
    if (e.key === "Enter") showRomanToNumber();
  });

  showNumberToRoman();
}

export function destroy() {}
