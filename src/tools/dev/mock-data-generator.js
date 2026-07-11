export const toolConfig = {
  id: "mock-data-generator",
  name: "Mock Data Generator",
  category: "dev",
  description:
    "Generate realistic fake data (names, emails, addresses) in JSON, CSV, SQL, and TypeScript formats.",
  icon: "🎲",
  keywords: ["mock", "data", "fake", "generator", "test", "faker"],
  accept: "",
  maxSizeMB: 0
};

let state = {
  count: 10,
  format: "json",
  includeFields: {
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    address: true,
    city: true,
    country: true,
    company: true,
    jobTitle: false,
    creditCard: false,
    username: false,
    password: false
  }
};

const dataFields = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
  { key: "company", label: "Company" },
  { key: "jobTitle", label: "Job Title" },
  { key: "creditCard", label: "Credit Card" },
  { key: "username", label: "Username" },
  { key: "password", label: "Password" }
];

const mockData = {
  firstNames: [
    "James",
    "Mary",
    "John",
    "Patricia",
    "Robert",
    "Jennifer",
    "Michael",
    "Linda",
    "William",
    "Elizabeth",
    "David",
    "Barbara",
    "Richard",
    "Susan",
    "Joseph",
    "Jessica",
    "Thomas",
    "Sarah",
    "Charles",
    "Karen"
  ],
  lastNames: [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin"
  ],
  domains: ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "example.com"],
  streets: [
    "Main St",
    "Oak Ave",
    "Maple Dr",
    "Cedar Ln",
    "Pine St",
    "Elm St",
    "Washington Blvd",
    "Lake View",
    "Park Ave",
    "Center St"
  ],
  cities: [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
    "Dallas",
    "San Jose"
  ],
  countries: [
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "France",
    "Australia",
    "Japan",
    "Brazil",
    "India",
    "Mexico"
  ],
  companies: [
    "Acme Corp",
    "GlobalTech",
    "Innovate LLC",
    "TechVision",
    "DataSync",
    "CloudNine",
    "ByteWorks",
    "CodeMasters",
    "DigitalEdge",
    "InfoTech"
  ],
  jobTitles: [
    "Software Engineer",
    "Product Manager",
    "Designer",
    "Data Analyst",
    "Marketing Manager",
    "Sales Representative",
    "Project Manager",
    "Developer",
    "Consultant",
    "Director"
  ],
  TLDs: ["com", "net", "org", "io", "co"]
};

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <h1>${toolConfig.name}</h1>
        <p>${toolConfig.description}</p>
      </div>

      <div class="controls-section">
        <div class="control-row">
          <label>Number of Records</label>
          <input type="range" id="recordCount" min="1" max="100" value="10">
          <span id="recordCountVal">10</span>
        </div>
        <div class="control-row">
          <label>Output Format</label>
          <select id="outputFormat">
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="sql">SQL</option>
            <option value="ts">TypeScript</option>
          </select>
        </div>
      </div>

      <div class="fields-section">
        <h3>Include Fields</h3>
        <div class="fields-grid" id="fieldsGrid">
          ${dataFields
            .map(
              f => `
            <label class="field-checkbox">
              <input type="checkbox" data-field="${f.key}" ${state.includeFields[f.key] ? "checked" : ""}>
              <span>${f.label}</span>
            </label>
          `
            )
            .join("")}
        </div>
      </div>

      <div class="action-buttons">
        <button class="btn-primary" id="generateBtn">Generate Mock Data</button>
      </div>

      <div class="output-section">
        <h3>Generated Data</h3>
        <div class="code-output">
          <pre id="dataOutput"><code>Click "Generate Mock Data" to create fake data.</code></pre>
        </div>
        <div class="action-buttons">
          <button class="btn-secondary" id="copyBtn">Copy to Clipboard</button>
          <button class="btn-secondary" id="downloadBtn" disabled>Download File</button>
        </div>
      </div>
    </div>
  `;

  bindEvents(container);
}

function bindEvents(container) {
  const recordCount = container.querySelector("#recordCount");
  const outputFormat = container.querySelector("#outputFormat");
  const generateBtn = container.querySelector("#generateBtn");
  const copyBtn = container.querySelector("#copyBtn");
  const downloadBtn = container.querySelector("#downloadBtn");
  const fieldsGrid = container.querySelector("#fieldsGrid");

  recordCount.addEventListener("input", e => {
    state.count = parseInt(e.target.value);
    container.querySelector("#recordCountVal").textContent = state.count;
  });

  outputFormat.addEventListener("change", e => {
    state.format = e.target.value;
  });

  fieldsGrid.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener("change", e => {
      state.includeFields[e.target.dataset.field] = e.target.checked;
    });
  });

  generateBtn.addEventListener("click", () => generateData(container));
  copyBtn.addEventListener("click", () => copyData(container));
  downloadBtn.addEventListener("click", () => downloadData(container));
}

function generateData(container) {
  const activeFields = dataFields.filter(f => state.includeFields[f.key]);
  if (activeFields.length === 0) {
    container.querySelector("#dataOutput code").textContent = "Please select at least one field.";
    return;
  }

  const records = [];
  for (let i = 0; i < state.count; i++) {
    const record = {};
    activeFields.forEach(f => {
      record[f.key] = generateField(f.key);
    });
    records.push(record);
  }

  const output = formatOutput(records, activeFields);
  container.querySelector("#dataOutput code").textContent = output;
  container.querySelector("#downloadBtn").disabled = false;
}

function generateField(key) {
  switch (key) {
    case "firstName":
      return random(mockData.firstNames);
    case "lastName":
      return random(mockData.lastNames);
    case "email":
      return `${random(mockData.firstNames).toLowerCase()}.${random(mockData.lastNames).toLowerCase()}${randomInt(1, 99)}@${random(mockData.domains)}`;
    case "phone":
      return `(${randomInt(200, 999)}) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
    case "address":
      return `${randomInt(1, 9999)} ${random(mockData.streets)}`;
    case "city":
      return random(mockData.cities);
    case "country":
      return random(mockData.countries);
    case "company":
      return random(mockData.companies);
    case "jobTitle":
      return random(mockData.jobTitles);
    case "creditCard":
      return `**** **** **** ${randomInt(1000, 9999)}`;
    case "username":
      return `${random(mockData.firstNames).toLowerCase()}${randomInt(1, 99)}`;
    case "password":
      return `Pass${randomInt(1000, 9999)}!`;
    default:
      return "";
  }
}

function formatOutput(records, fields) {
  const activeFields = fields.map(f => f.key);

  switch (state.format) {
    case "json":
      return JSON.stringify(records, null, 2);

    case "csv":
      const headers = activeFields.join(",");
      const rows = records.map(r => activeFields.map(k => `"${r[k]}"`).join(","));
      return [headers, ...rows].join("\n");

    case "sql":
      const table = "mock_data";
      const cols = activeFields.join(", ");
      const values = records
        .map(r => {
          const vals = activeFields
            .map(k => {
              const v = r[k];
              return typeof v === "string" ? `'${v.replace(/'/g, "''")}` : v;
            })
            .join(", ");
          return `(${vals})`;
        })
        .join(",\n  ");
      return `INSERT INTO ${table} (${cols}) VALUES\n  ${values};`;

    case "ts":
      const typeName = "MockData";
      const props = activeFields.map(k => `  ${k}: string;`).join("\n");
      const data = records
        .map(r => {
          const obj = activeFields.map(k => `    ${k}: '${r[k].replace(/'/g, "\\'")}'`).join(",\n");
          return `  {\n${obj}\n  }`;
        })
        .join(",\n");
      return `interface ${typeName} {\n${props}\n}\n\nexport const mockData: ${typeName}[] = [\n${data}\n];`;

    default:
      return JSON.stringify(records, null, 2);
  }
}

function copyData(container) {
  const data = container.querySelector("#dataOutput code").textContent;
  navigator.clipboard.writeText(data);
  const btn = container.querySelector("#copyBtn");
  btn.textContent = "Copied!";
  setTimeout(() => (btn.textContent = "Copy to Clipboard"), 2000);
}

function downloadData(container) {
  const data = container.querySelector("#dataOutput code").textContent;
  const ext = { json: "json", csv: "csv", sql: "sql", ts: "ts" }[state.format];
  const blob = new Blob([data], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mock-data.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
