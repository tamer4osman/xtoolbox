import { showToast } from "../../components/toast.js";
import { copyToClipboard } from "../../utils/clipboard.js";

const COMMIT_TYPES = {
  feat: { label: "✨ Features", order: 1 },
  fix: { label: "🐛 Bug Fixes", order: 2 },
  docs: { label: "📚 Documentation", order: 3 },
  style: { label: "💄 Styles", order: 4 },
  refactor: { label: "♻️ Refactoring", order: 5 },
  perf: { label: "⚡ Performance", order: 6 },
  test: { label: "✅ Tests", order: 7 },
  build: { label: "📦 Build", order: 8 },
  ci: { label: "🔧 CI", order: 9 },
  chore: { label: "🔨 Chores", order: 10 },
  revert: { label: "⏪ Reverts", order: 11 }
};

const CHANGELOG_CSS = `
  .changelog-container { max-width: 1000px; margin: 0 auto; }
  .log-textarea, .output-textarea { width: 100%; height: 250px; padding: var(--space-4); border: 2px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-surface); font-family: 'Fira Code', monospace; font-size: var(--text-sm); resize: vertical; }
  .log-textarea:focus { outline: none; border-color: var(--color-primary); }
  .output-textarea { background: var(--color-bg); cursor: default; }
  .file-input { display: block; padding: var(--space-3); border: 2px dashed var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface); cursor: pointer; }
  .file-input:hover { border-color: var(--color-primary); }
  .options-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4); }
  .text-input, .select-input { width: 100%; padding: var(--space-3); border: 2px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface); font-size: var(--text-sm); }
  .text-input:focus, .select-input:focus { outline: none; border-color: var(--color-primary); }
  .checkbox-row { display: flex; gap: var(--space-6); margin-bottom: var(--space-4); }
  .checkbox-label { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; }
  .checkbox-label input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--color-primary); }
  .action-buttons { display: flex; gap: var(--space-3); margin: var(--space-6) 0; flex-wrap: wrap; }
  .action-buttons .btn { flex: 1; min-width: 140px; }
  .stats { padding: var(--space-4); margin-bottom: var(--space-4); background: var(--color-surface); border-radius: var(--radius-lg); display: none; }
  .stats.visible { display: block; }
  .stat-item { display: inline-block; padding: var(--space-2) var(--space-3); margin: var(--space-1); background: var(--color-primary-light); color: var(--color-primary); border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: 500; }
`;

const CHANGELOG_HTML = `
  <div class="changelog-container">
    <div class="form-group">
      <label for="git-log-input">Git Log Input</label>
      <textarea id="git-log-input" class="log-textarea" placeholder="Paste your git log here...&#10;&#10;Example:&#10;abc1234 feat(auth): add login&#10;def5678 fix(api): handle null response&#10;ghi9012 docs: update README"></textarea>
    </div>
    <div class="form-group">
      <label for="file-upload">Or upload a .txt/.log file:</label>
      <input type="file" id="file-upload" accept=".txt,.log" class="file-input">
    </div>
    <div class="options-row">
      <div class="form-group">
        <label for="changelog-title">Title</label>
        <input type="text" id="changelog-title" value="Changelog" class="text-input">
      </div>
      <div class="form-group">
        <label for="output-format">Output Format</label>
        <select id="output-format" class="select-input">
          <option value="markdown">Markdown</option>
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
        </select>
      </div>
    </div>
    <div class="checkbox-row">
      <label class="checkbox-label"><input type="checkbox" id="include-hash" checked> Include Commit Hash</label>
      <label class="checkbox-label"><input type="checkbox" id="include-scope" checked> Include Scope</label>
    </div>
    <div class="action-buttons">
      <button id="generate-btn" class="btn btn-primary">Generate Changelog</button>
      <button id="copy-btn" class="btn btn-secondary" disabled>Copy to Clipboard</button>
      <button id="download-btn" class="btn btn-secondary" disabled>Download</button>
      <button id="clear-btn" class="btn btn-ghost">Clear</button>
    </div>
    <div class="stats" id="stats"></div>
    <div class="form-group">
      <label for="output">Output</label>
      <textarea id="output" class="output-textarea" readonly placeholder="Generated changelog will appear here..."></textarea>
    </div>
  </div>
`;

export function parseConventionalCommits(text) {
  const lines = text.split("\n").filter(line => line.trim());
  const commits = [];

  const commitRegex = /^([a-f0-9]{7,40})\s+(?:(\w+)(?:\(([^)]+)\))?\s*:\s*(.+))$/i;
  const shortRegex = /^(\w+)(?:\(([^)]+)\))?\s*:\s*(.+)$/i;

  for (const line of lines) {
    let match = commitRegex.exec(line);
    if (match) {
      const [, hash, type, scope, message] = match;
      commits.push({
        hash: hash.substring(0, 7),
        type: type.toLowerCase(),
        scope: scope || null,
        message: message.trim()
      });
      continue;
    }

    match = shortRegex.exec(line);
    if (match) {
      const [, type, scope, message] = match;
      if (COMMIT_TYPES[type.toLowerCase()]) {
        commits.push({
          hash: null,
          type: type.toLowerCase(),
          scope: scope || null,
          message: message.trim()
        });
      }
    }
  }

  return commits;
}

export function groupCommitsByType(commits) {
  const groups = {};

  for (const commit of commits) {
    if (!groups[commit.type]) {
      groups[commit.type] = [];
    }
    groups[commit.type].push(commit);
  }

  return groups;
}

export function generateChangelog(commits, options = {}) {
  const { includeHash = true, includeScope = true, title = "Changelog" } = options;

  const grouped = groupCommitsByType(commits);
  const sortedTypes = Object.keys(grouped).sort((a, b) => {
    const orderA = COMMIT_TYPES[a]?.order || 99;
    const orderB = COMMIT_TYPES[b]?.order || 99;
    return orderA - orderB;
  });

  let markdown = `# ${title}\n\n`;

  for (const type of sortedTypes) {
    const typeInfo = COMMIT_TYPES[type];
    const typeCommits = grouped[type];
    const label = typeInfo?.label || type;

    markdown += `## ${label}\n\n`;

    for (const commit of typeCommits) {
      let entry = "- ";
      if (includeHash && commit.hash) {
        entry += `**${commit.hash}** `;
      }
      if (includeScope && commit.scope) {
        entry += `**${commit.scope}:** `;
      }
      entry += commit.message;
      markdown += `${entry}\n`;
    }

    markdown += "\n";
  }

  return markdown.trim();
}

export function exportToJson(commits) {
  return JSON.stringify(commits, null, 2);
}

export function exportToCsv(commits) {
  const headers = ["hash", "type", "scope", "message"];
  const rows = commits.map(c =>
    [c.hash || "", c.type, c.scope || "", `"${c.message.replace(/"/g, '""')}"`].join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export const toolConfig = {
  id: "git-changelog-generator",
  name: "Conventional Commit Changelog Generator",
  category: "text",
  description:
    "Parse conventional git logs and compile beautiful categorized Markdown release changelogs.",
  icon: "📜",
  accept: ".txt,.log",
  maxSizeMB: 5,
  keywords: ["git", "changelog", "commit", "release", "conventional", "markdown"],
  status: "done",
  steps: [
    "Paste your git log output (conventional commit format)",
    "Select output format (Markdown, JSON, or CSV)",
    'Click "Generate Changelog"',
    "Copy or download the formatted release notes"
  ],
  faqs: [
    {
      question: "What commit format does this tool support?",
      answer:
        "It supports Conventional Commits format: type(scope): message. Supported types include feat, fix, docs, style, refactor, perf, test, build, ci, chore, and revert."
    },
    {
      question: "Can I customize the changelog output?",
      answer:
        "Yes, you can toggle including commit hashes and scopes, change the title, and choose between Markdown, JSON, or CSV formats."
    }
  ]
};

export function render(container) {
  container.innerHTML = CHANGELOG_HTML;

  const style = document.createElement("style");
  style.textContent = CHANGELOG_CSS;
  container.appendChild(style);

  const q = id => container.querySelector(`#${id}`);
  const els = {
    gitLogInput: q("git-log-input"),
    fileUpload: q("file-upload"),
    titleInput: q("changelog-title"),
    formatSelect: q("output-format"),
    includeHash: q("include-hash"),
    includeScope: q("include-scope"),
    generateBtn: q("generate-btn"),
    copyBtn: q("copy-btn"),
    downloadBtn: q("download-btn"),
    clearBtn: q("clear-btn"),
    stats: q("stats"),
    output: q("output")
  };

  let currentCommits = [];

  els.fileUpload.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        els.gitLogInput.value = ev.target.result;
      };
      reader.readAsText(file);
    }
  });

  els.generateBtn.addEventListener("click", () => {
    const text = els.gitLogInput.value.trim();
    if (!text) {
      alert("Please paste a git log or upload a file first.");
      return;
    }

    currentCommits = parseConventionalCommits(text);
    if (currentCommits.length === 0) {
      alert("No conventional commits found. Please check the format.");
      return;
    }

    const grouped = groupCommitsByType(currentCommits);
    const typeCounts = Object.entries(grouped)
      .map(([type, commits]) => `<span class="stat-item">${type}: ${commits.length}</span>`)
      .join("");
    els.stats.innerHTML = `<strong>Found ${currentCommits.length} commits:</strong> ${typeCounts}`;
    els.stats.classList.add("visible");

    const format = els.formatSelect.value;
    let result;
    if (format === "json") {
      result = exportToJson(currentCommits);
    } else if (format === "csv") {
      result = exportToCsv(currentCommits);
    } else {
      result = generateChangelog(currentCommits, {
        includeHash: els.includeHash.checked,
        includeScope: els.includeScope.checked,
        title: els.titleInput.value || "Changelog"
      });
    }

    els.output.value = result;
    els.copyBtn.disabled = false;
    els.downloadBtn.disabled = false;
  });

  els.copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(els.output.value);
      els.copyBtn.textContent = "Copied!";
      setTimeout(() => {
        els.copyBtn.textContent = "Copy to Clipboard";
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  });

  els.downloadBtn.addEventListener("click", () => {
    const format = els.formatSelect.value;
    const ext = format === "json" ? "json" : format === "csv" ? "csv" : "md";
    const mime =
      format === "json" ? "application/json" : format === "csv" ? "text/csv" : "text/markdown";
    const blob = new Blob([els.output.value], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `changelog.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  });

  els.clearBtn.addEventListener("click", () => {
    els.gitLogInput.value = "";
    els.output.value = "";
    els.stats.innerHTML = "";
    els.stats.classList.remove("visible");
    els.copyBtn.disabled = true;
    els.downloadBtn.disabled = true;
    els.fileUpload.value = "";
    currentCommits = [];
  });
}

export function destroy() {
  // No cleanup needed
}
