import { copyToClipboard } from "../../utils/clipboard.js";
import { showToast } from "../../components/toast.js";
import { escapeHtml } from "../../utils/escape-html.js";

export const toolConfig = {
  id: "citation-generator",
  name: "Citation Generator",
  category: "text",
  description: "Generate formatted citations in APA, MLA, and Chicago styles.",
  icon: "📚",
  accept: null,
  maxSizeMB: null,
  keywords: [
    "citation generator",
    "apa citation",
    "mla citation",
    "chicago citation",
    "bibliography"
  ],
  steps: ["Enter source details", "Choose citation style", "Copy formatted citation"],
  faqs: [
    {
      question: "What citation styles are supported?",
      answer: "APA 7th Edition, MLA 9th Edition, and Chicago 17th Edition (Notes-Bibliography)."
    },
    {
      question: "What source types are supported?",
      answer: "Book, Journal Article, Website, and Newspaper Article."
    }
  ]
};

function formatAPA(data) {
  const { author, year, title, journal, volume, issue, pages, publisher, url, doi, sourceType } =
    data;
  const a = author.trim();
  const y = year.trim();
  const t = title.trim();

  if (sourceType === "book") {
    return `${a} (${y}). _${t}_. ${publisher.trim()}.`;
  }
  if (sourceType === "website") {
    const retrieved = url ? ` Retrieved from ${url.trim()}` : "";
    return `${a} (${y}). ${t}.${retrieved}`;
  }
  if (sourceType === "newspaper") {
    return `${a} (${y}). ${t}. _${journal.trim()}_${pages ? ", " + pages.trim() : ""}.`;
  }
  let ref = `${a} (${y}). ${t}. _${journal.trim()}_`;
  if (volume) ref += `, _${volume.trim()}_`;
  if (issue) ref += `(${issue.trim()})`;
  if (pages) ref += `, ${pages.trim()}`;
  ref += ".";
  if (doi) ref += ` https://doi.org/${doi.trim()}`;
  return ref;
}

function formatMLA(data) {
  const { author, year, title, journal, volume, issue, pages, publisher, url, sourceType } = data;
  const a = author.trim().replace(/\.$/, "");
  const t = title.trim();
  const y = year.trim();

  if (sourceType === "book") {
    return `${a}. _${t}_. ${publisher.trim()}, ${y}.`;
  }
  if (sourceType === "website") {
    return `${a}. "${t}." _${y ? y + ", " : ""}_ ${url ? url.trim() + "." : ""}`.trim();
  }
  if (sourceType === "newspaper") {
    return `${a}. "${t}." _${journal.trim()}_${pages ? ", " + pages.trim() : ""}, ${y}.`;
  }
  let ref = `${a}. "${t}." _${journal.trim()}_`;
  if (volume) ref += `, vol. ${volume.trim()}`;
  if (issue) ref += `, no. ${issue.trim()}`;
  ref += `, ${y}`;
  if (pages) ref += `, pp. ${pages.trim()}`;
  ref += ".";
  return ref;
}

function formatChicago(data) {
  const { author, year, title, journal, volume, issue, pages, publisher, url, sourceType } = data;
  const a = author.trim();
  const t = title.trim();
  const y = year.trim();

  if (sourceType === "book") {
    return `${a}. _${t}_. ${publisher.trim()}, ${y}.`;
  }
  if (sourceType === "website") {
    return `${a}. "${t}." Accessed ${y}. ${url ? url.trim() + "." : ""}`.trim();
  }
  if (sourceType === "newspaper") {
    return `${a}. "${t}." _${journal.trim()}_ (${y}): ${pages ? pages.trim() : ""}.`;
  }
  let ref = `${a}. "${t}." _${journal.trim()}_`;
  if (volume) ref += ` ${volume.trim()}`;
  if (issue) ref += `, no. ${issue.trim()}`;
  ref += ` (${y})`;
  if (pages) ref += `: ${pages.trim()}`;
  ref += ".";
  return ref;
}

const FORMATTERS = { apa: formatAPA, mla: formatMLA, chicago: formatChicago };

export function render(container) {
  container.innerHTML = `
    <div class="tool-container" style="max-width:700px;margin:0 auto;">
      <div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-4);flex-wrap:wrap;">
        <div style="flex:1;min-width:200px;">
          <label style="display:block;font-weight:600;margin-bottom:var(--space-1);font-size:var(--text-sm);">Source Type</label>
          <select id="cit-type" style="width:100%;padding:var(--space-2);border:1px solid var(--color-border);border-radius:var(--radius-md);">
            <option value="journal">Journal Article</option>
            <option value="book">Book</option>
            <option value="website">Website</option>
            <option value="newspaper">Newspaper Article</option>
          </select>
        </div>
        <div style="flex:1;min-width:200px;">
          <label style="display:block;font-weight:600;margin-bottom:var(--space-1);font-size:var(--text-sm);">Citation Style</label>
          <select id="cit-style" style="width:100%;padding:var(--space-2);border:1px solid var(--color-border);border-radius:var(--radius-md);">
            <option value="apa">APA 7th Edition</option>
            <option value="mla">MLA 9th Edition</option>
            <option value="chicago">Chicago 17th Edition</option>
          </select>
        </div>
      </div>

      <div id="cit-fields"></div>

      <div style="margin-top:var(--space-4);padding:var(--space-4);background:var(--color-surface);border-radius:var(--radius-md);border:1px solid var(--color-border);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
          <h3 style="font-size:var(--text-lg);font-weight:600;">Generated Citation</h3>
          <button class="btn btn-secondary" id="cit-copy">📋 Copy</button>
        </div>
        <div id="cit-output" style="font-family:serif;line-height:1.8;min-height:60px;"></div>
      </div>
    </div>
  `;

  const fieldsEl = container.querySelector("#cit-fields");
  const outputEl = container.querySelector("#cit-output");
  const typeEl = container.querySelector("#cit-type");
  const styleEl = container.querySelector("#cit-style");
  const copyBtn = container.querySelector("#cit-copy");

  const FIELDS = {
    journal: [
      { id: "author", label: "Author(s)", placeholder: "Last, First M.", required: true },
      { id: "title", label: "Article Title", placeholder: "Title of the article", required: true },
      { id: "journal", label: "Journal Name", placeholder: "Journal of Examples", required: true },
      { id: "year", label: "Year", placeholder: "2024", required: true },
      { id: "volume", label: "Volume", placeholder: "12" },
      { id: "issue", label: "Issue", placeholder: "3" },
      { id: "pages", label: "Pages", placeholder: "45-67" },
      { id: "doi", label: "DOI", placeholder: "10.1234/example" }
    ],
    book: [
      { id: "author", label: "Author(s)", placeholder: "Last, First M.", required: true },
      { id: "title", label: "Book Title", placeholder: "Title of the book", required: true },
      { id: "year", label: "Year", placeholder: "2024", required: true },
      { id: "publisher", label: "Publisher", placeholder: "Publisher name", required: true }
    ],
    website: [
      { id: "author", label: "Author / Organization", placeholder: "Author name or Organization" },
      { id: "title", label: "Page Title", placeholder: "Title of the page", required: true },
      {
        id: "year",
        label: "Publication / Access Date",
        placeholder: "2024 or Month Day, Year",
        required: true
      },
      { id: "url", label: "URL", placeholder: "https://..." }
    ],
    newspaper: [
      { id: "author", label: "Author(s)", placeholder: "Last, First M.", required: true },
      { id: "title", label: "Article Title", placeholder: "Title of the article", required: true },
      { id: "journal", label: "Newspaper Name", placeholder: "The Example Times", required: true },
      { id: "year", label: "Year", placeholder: "2024", required: true },
      { id: "pages", label: "Pages", placeholder: "A1, A4" }
    ]
  };

  function renderFields() {
    const type = typeEl.value;
    const fields = FIELDS[type];
    fieldsEl.innerHTML = fields
      .map(
        f => `
      <div style="margin-bottom:var(--space-3);">
        <label style="display:block;font-weight:600;margin-bottom:var(--space-1);font-size:var(--text-sm);">${f.label}${f.required ? " *" : ""}</label>
        <input type="text" id="cit-${f.id}" data-field="${f.id}" placeholder="${f.placeholder}" style="width:100%;padding:var(--space-2) var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:var(--text-sm);" />
      </div>
    `
      )
      .join("");

    fieldsEl.querySelectorAll("input").forEach(input => {
      input.addEventListener("input", generate);
    });
    generate();
  }

  function getData() {
    const data = { sourceType: typeEl.value };
    fieldsEl.querySelectorAll("input").forEach(input => {
      data[input.dataset.field] = input.value;
    });
    return data;
  }

  function generate() {
    const data = getData();
    const style = styleEl.value;
    const formatter = FORMATTERS[style];
    if (!formatter) return;

    const required = FIELDS[typeEl.value].filter(f => f.required);
    const missing = required.some(f => !data[f.id]?.trim());
    if (missing) {
      outputEl.innerHTML =
        '<span style="color:var(--color-text-muted);">Fill in required fields to generate citation...</span>';
      return;
    }
    const result = formatter(data);
    outputEl.innerHTML = `<span style="font-style:italic;">${escapeHtml(result)}</span>`;
    outputEl.dataset.text = result;
  }

  typeEl.addEventListener("change", renderFields);
  styleEl.addEventListener("change", generate);

  copyBtn.addEventListener("click", async () => {
    const text = outputEl.dataset.text;
    if (!text) return;
    await copyToClipboard(text);
    showToast({ message: "Citation copied!", type: "success" });
  });

  renderFields();
}
