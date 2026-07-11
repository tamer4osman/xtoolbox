const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen"
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const SCALES = ["", "thousand", "million", "billion", "trillion", "quadrillion"];

function convertHundreds(n) {
  const parts = [];
  if (n >= 100) {
    parts.push(ONES[Math.floor(n / 100)] + " hundred");
    n %= 100;
  }
  if (n >= 20) {
    const t = Math.floor(n / 10);
    parts.push(TENS[t]);
    n %= 10;
  }
  if (n > 0) {
    parts.push(ONES[n]);
  }
  return parts.join(" ");
}

export function numberToWords(num) {
  if (typeof num !== "number" || isNaN(num)) return "";
  if (num === 0) return "zero";

  let str = "";
  let prefix = "";
  let decimal = "";

  if (num < 0) {
    prefix = "negative ";
    num = Math.abs(num);
  }

  const decPart = Math.round((num % 1) * 100);
  if (decPart > 0) {
    decimal =
      " point " +
      (decPart < 10
        ? "zero " + ONES[decPart]
        : ONES[Math.floor(decPart / 10)] + " " + ONES[decPart % 10]);
  }
  num = Math.floor(num);
  if (num === 0 && decPart > 0) return "zero" + decimal;

  let scaleIdx = 0;
  while (num > 0) {
    const chunk = num % 1000;
    if (chunk > 0) {
      const chunkWords = convertHundreds(chunk);
      str = chunkWords + (SCALES[scaleIdx] ? " " + SCALES[scaleIdx] : "") + (str ? " " + str : "");
    }
    num = Math.floor(num / 1000);
    scaleIdx++;
  }

  return prefix + str + decimal;
}

export const toolConfig = {
  id: "number-to-words",
  name: "Number to Words",
  category: "text",
  description: "Convert numerals to written English words.",
  icon: "🔢",
  accept: null,
  maxSizeMB: null,
  keywords: [
    "number to words",
    "numbers to text",
    "spell number",
    "english words",
    "numeral converter"
  ],
  steps: [
    "Enter a number in the input field",
    "See the English word representation instantly",
    "Copy the result with one click"
  ],
  faqs: [
    {
      question: "What is the maximum number supported?",
      answer: "Up to quadrillions (15+ digits)."
    },
    { question: "Does it support decimals?", answer: "Yes, it converts up to two decimal places." },
    {
      question: "Does it handle negative numbers?",
      answer: 'Yes, negative numbers are prefixed with "negative".'
    }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div class="form-group">
        <label>Enter Number</label>
        <input type="text" id="n2w-input" class="text-input" placeholder="e.g. 1234" value="1234" inputmode="numeric">
      </div>
      <button class="btn btn-primary btn-lg" id="n2w-convert" style="width:100%;margin-bottom:var(--space-4);">Convert to Words</button>
      <div style="border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);min-height:60px;">
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);text-transform:uppercase;margin-bottom:var(--space-1);">Result</div>
        <div id="n2w-result" style="font-size:var(--text-lg);font-weight:600;word-break:break-word;">one thousand two hundred thirty four</div>
      </div>
      <button class="btn btn-secondary" id="n2w-copy" style="margin-top:var(--space-2);">Copy to Clipboard</button>
    </div>
  `;

  const input = container.querySelector("#n2w-input");
  const result = container.querySelector("#n2w-result");
  const convertBtn = container.querySelector("#n2w-convert");
  const copyBtn = container.querySelector("#n2w-copy");

  function convert() {
    const val = input.value.replace(/,/g, "");
    const num = parseFloat(val);
    if (isNaN(num) || val === "") {
      result.textContent = "Please enter a valid number.";
      return;
    }
    result.textContent = numberToWords(num);
  }

  convertBtn.addEventListener("click", convert);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") convert();
  });

  copyBtn.addEventListener("click", () => {
    const text = result.textContent;
    if (!text || text === "Please enter a valid number.") return;
    navigator.clipboard.writeText(text).catch(() => {});
  });

  convert();
}

export function destroy() {}
