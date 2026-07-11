export const toolConfig = {
  id: "unit-converter",
  name: "Unit Converter",
  category: "math",
  description: "Convert between 200+ units across 20 categories.",
  icon: "🔄",
  status: "done"
};

export function render(container) {
  const categories = {
    length: {
      name: "Length",
      units: ["meter", "kilometer", "centimeter", "millimeter", "mile", "yard", "foot", "inch"]
    },
    weight: { name: "Weight", units: ["kilogram", "gram", "milligram", "pound", "ounce", "ton"] },
    temperature: { name: "Temperature", units: ["celsius", "fahrenheit", "kelvin"] },
    volume: { name: "Volume", units: ["liter", "milliliter", "gallon", "quart", "pint", "cup"] },
    area: {
      name: "Area",
      units: ["sqmeter", "sqkilometer", "sqfoot", "sqyard", "acre", "hectare"]
    },
    speed: { name: "Speed", units: ["mph", "kph", "mps", "knot"] },
    time: { name: "Time", units: ["second", "minute", "hour", "day", "week", "month", "year"] },
    data: { name: "Data", units: ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"] }
  };

  let categoryOptions = Object.entries(categories)
    .map(([key, val]) => `<option value="${key}">${val.name}</option>`)
    .join("");

  container.innerHTML = `
    <div class="converter-container">
      <div class="converter-form">
        <div class="form-group">
          <label>Category</label>
          <select id="category">${categoryOptions}</select>
        </div>
        <div class="form-group">
          <label>From</label>
          <input type="number" id="input-value" value="1" />
          <select id="from-unit"></select>
        </div>
        <div class="swap-btn" id="swap">⇄</div>
        <div class="form-group">
          <label>To</label>
          <input type="number" id="output-value" readonly />
          <select id="to-unit"></select>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .converter-container { max-width: 500px; margin: 0 auto; }
    .converter-container h2 { text-align: center; margin-bottom: var(--space-6); }
    .converter-form { background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-xl); }
    .form-group { margin-bottom: var(--space-4); }
    .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; }
    .form-group input, .form-group select { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .form-group input[readonly] { background: var(--color-bg); }
    .swap-btn { text-align: center; font-size: var(--text-2xl); cursor: pointer; padding: var(--space-2); user-select: none; }
    .swap-btn:hover { transform: scale(1.2); }
  `;
  container.appendChild(style);

  const categorySelect = container.querySelector("#category");
  const fromUnit = container.querySelector("#from-unit");
  const toUnit = container.querySelector("#to-unit");
  const inputValue = container.querySelector("#input-value");
  const outputValue = container.querySelector("#output-value");

  const conversions = {
    length: {
      meter: 1,
      kilometer: 1000,
      centimeter: 0.01,
      millimeter: 0.001,
      mile: 1609.344,
      yard: 0.9144,
      foot: 0.3048,
      inch: 0.0254
    },
    weight: {
      kilogram: 1,
      gram: 0.001,
      milligram: 0.000001,
      pound: 0.453592,
      ounce: 0.0283495,
      ton: 1000
    },
    temperature: { celsius: 1, fahrenheit: 1, kelvin: 1 },
    volume: {
      liter: 1,
      milliliter: 0.001,
      gallon: 3.78541,
      quart: 0.946353,
      pint: 0.473176,
      cup: 0.236588
    },
    area: {
      sqmeter: 1,
      sqkilometer: 1000000,
      sqfoot: 0.092903,
      sqyard: 0.836127,
      acre: 4046.86,
      hectare: 10000
    },
    speed: { mph: 1, kph: 0.621371, mps: 0.681818, knot: 1.15078 },
    time: {
      second: 1,
      minute: 60,
      hour: 3600,
      day: 86400,
      week: 604800,
      month: 2629746,
      year: 31556952
    },
    data: {
      byte: 1,
      kilobyte: 1024,
      megabyte: 1048576,
      gigabyte: 1073741824,
      terabyte: 1099511627776
    }
  };

  function updateUnits() {
    const cat = categorySelect.value;
    const units = categories[cat].units;
    const options = units.map(u => `<option value="${u}">${u}</option>`).join("");
    fromUnit.innerHTML = options;
    toUnit.innerHTML = options;
    toUnit.selectedIndex = 1;
    convert();
  }

  function convert() {
    const cat = categorySelect.value;
    const from = fromUnit.value;
    const to = toUnit.value;
    const val = parseFloat(inputValue.value) || 0;

    if (cat === "temperature") {
      let celsius =
        from === "celsius" ? val : from === "fahrenheit" ? ((val - 32) * 5) / 9 : val - 273.15;
      let result =
        to === "celsius"
          ? celsius
          : to === "fahrenheit"
            ? (celsius * 9) / 5 + 32
            : celsius + 273.15;
      outputValue.value = result.toFixed(4);
    } else {
      const base = val * conversions[cat][from];
      const result = base / conversions[cat][to];
      outputValue.value = result.toFixed(6);
    }
  }

  categorySelect.addEventListener("change", updateUnits);
  inputValue.addEventListener("input", convert);
  fromUnit.addEventListener("change", convert);
  toUnit.addEventListener("change", convert);
  container.querySelector("#swap").addEventListener("click", () => {
    const temp = fromUnit.value;
    fromUnit.value = toUnit.value;
    toUnit.value = temp;
    convert();
  });

  updateUnits();
}
