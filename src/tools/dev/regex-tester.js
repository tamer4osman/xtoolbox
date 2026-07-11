import { escapeHtml } from "../../utils/escape-html.js";

export const toolConfig = {
  id: "regex-tester",
  name: "Regex Tester & Visualizer",
  category: "dev",
  description:
    "Test regular expressions with live matching, capture groups, visual railroad diagram, and plain English explanation.",
  icon: "🔍",
  keywords: ["regex", "regular expression", "pattern", "match", "railroad", "diagram", "debugger"],
  accept: "",
  maxSizeMB: 0,
  status: "done"
};

const PRESETS = [
  { name: "Email (simple)", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" },
  { name: "URL", pattern: "https?://[^\\s/$.?#].[^\\s]*" },
  { name: "IPv4 Address", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b" },
  { name: "Phone (US)", pattern: "\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}" },
  { name: "Date (YYYY-MM-DD)", pattern: "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])" },
  { name: "Hex Color", pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b" },
  { name: "HTML Tag", pattern: "<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>(.*?)</\\1>" },
  { name: "Word Boundary", pattern: "\\b\\w+\\b" },
  { name: "Whitespace", pattern: "\\s+" },
  { name: "Digits Only", pattern: "^\\d+$" },
  {
    name: "Password (strong)",
    pattern: "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}"
  },
  { name: "IPv6 Address", pattern: "([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}" }
];
export function tokenizeRegex(pattern) {
  const tokens = [];
  let i = 0;
  while (i < pattern.length) {
    const ch = pattern[i];
    if (ch === "\\") {
      const next = pattern[i + 1] || "";
      const cls = /[dDwWsSbB]/.test(next);
      tokens.push({ type: cls ? "class" : "escape", value: "\\" + next });
      i += 2;
    } else if (ch === "[") {
      let j = i + 1;
      if (j < pattern.length && pattern[j] === "^") j++;
      if (j < pattern.length && pattern[j] === "]") j++;
      while (j < pattern.length && pattern[j] !== "]") {
        if (pattern[j] === "\\") j++;
        j++;
      }
      tokens.push({ type: "class", value: pattern.slice(i, j + 1) });
      i = j + 1;
    } else if (ch === "(") {
      let groupType = "group";
      let value = "(";
      if (pattern[i + 1] === "?") {
        if (pattern[i + 2] === ":") {
          groupType = "noncapture";
          value = "(?:";
          i += 3;
        } else if (pattern[i + 2] === "=") {
          groupType = "lookahead";
          value = "(?=";
          i += 3;
        } else if (pattern[i + 2] === "!") {
          groupType = "neglookahead";
          value = "(?!";
          i += 3;
        } else if (pattern[i + 2] === "<" && pattern[i + 3] === "=") {
          groupType = "lookbehind";
          value = "(?<=";
          i += 4;
        } else if (pattern[i + 2] === "<" && pattern[i + 3] === "!") {
          groupType = "neglookbehind";
          value = "(?<!";
          i += 4;
        } else {
          i += 2;
        }
      } else {
        i++;
      }
      tokens.push({ type: "group-start", groupType, value });
    } else if (ch === ")") {
      tokens.push({ type: "group-end", value: ")" });
      i++;
    } else if (ch === "|") {
      tokens.push({ type: "alternation", value: "|" });
      i++;
    } else if (ch === "^" || ch === "$") {
      tokens.push({ type: "anchor", value: ch });
      i++;
    } else if (ch === "*" || ch === "+" || ch === "?") {
      let value = ch;
      if (pattern[i + 1] === "?") {
        value += "?";
        i++;
      }
      tokens.push({ type: "quantifier", value });
      i++;
    } else if (ch === "{") {
      let j = i + 1;
      while (j < pattern.length && pattern[j] !== "}") j++;
      const quant = pattern.slice(i, j + 1);
      let value = quant;
      if (pattern[j + 1] === "?") {
        value += "?";
        j++;
      }
      tokens.push({ type: "quantifier", value });
      i = j + 1;
    } else if (ch === ".") {
      tokens.push({ type: "class", value: "." });
      i++;
    } else {
      tokens.push({ type: "literal", value: ch });
      i++;
    }
  }
  return tokens;
}
export function explainRegex(pattern) {
  const tokens = tokenizeRegex(pattern);
  const parts = [];
  let groupNum = 0;
  for (const tok of tokens) {
    switch (tok.type) {
      case "literal":
        parts.push('"' + tok.value + '"');
        break;
      case "class":
        if (tok.value === ".") parts.push("any character");
        else if (tok.value === "\\d") parts.push("a digit");
        else if (tok.value === "\\D") parts.push("a non-digit");
        else if (tok.value === "\\w") parts.push("a word character");
        else if (tok.value === "\\W") parts.push("a non-word character");
        else if (tok.value === "\\s") parts.push("whitespace");
        else if (tok.value === "\\S") parts.push("non-whitespace");
        else if (tok.value === "\\b") parts.push("a word boundary");
        else if (tok.value === "\\B") parts.push("a non-word boundary");
        else if (tok.value.startsWith("[")) parts.push("one of " + tok.value);
        else parts.push(tok.value);
        break;
      case "escape":
        if (tok.value === "\\b") parts.push("a word boundary");
        else if (tok.value === "\\B") parts.push("a non-word boundary");
        else if (tok.value === "\\n") parts.push("a newline");
        else if (tok.value === "\\t") parts.push("a tab");
        else parts.push('the character "' + tok.value.slice(1) + '"');
        break;
      case "anchor":
        parts.push(tok.value === "^" ? "the start of the string" : "the end of the string");
        break;
      case "group-start":
        if (tok.groupType === "noncapture") parts.push("a non-capturing group");
        else if (tok.groupType === "lookahead") parts.push("a lookahead for");
        else if (tok.groupType === "neglookahead") parts.push("a negative lookahead for");
        else if (tok.groupType === "lookbehind") parts.push("a lookbehind for");
        else if (tok.groupType === "neglookbehind") parts.push("a negative lookbehind for");
        else {
          groupNum++;
          parts.push("capturing group #" + groupNum);
        }
        break;
      case "group-end":
        break;
      case "alternation":
        parts.push("or");
        break;
      case "quantifier": {
        const q = tok.value;
        if (q === "*") parts.push("zero or more times");
        else if (q === "+") parts.push("one or more times");
        else if (q === "?") parts.push("optionally");
        else if (q === "*?") parts.push("zero or more times (lazy)");
        else if (q === "+?") parts.push("one or more times (lazy)");
        else if (q === "??") parts.push("optionally (lazy)");
        else {
          const m = q.match(/\{(\d+)(?:,(\d*))?\}/);
          if (m) {
            const min = m[1];
            const max = m[2];
            if (max === undefined) parts.push("exactly " + min + " times");
            else if (max === "") parts.push(min + " or more times");
            else parts.push("between " + min + " and " + max + " times");
          }
        }
        break;
      }
    }
  }
  if (parts.length === 0) return "Empty pattern";
  let result = "Match " + parts.join(" ");
  result = result.charAt(0).toUpperCase() + result.slice(1);
  return result;
}


export function highlightMatches(text, regex) {
  if (!regex || !text) return escapeHtml(text);
  const escaped = [];
  let lastIndex = 0;
  regex.lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      escaped.push(escapeHtml(text.slice(lastIndex, match.index)));
    }
    const colors = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff", "#fed7aa"];
    const color = colors[escaped.length % colors.length];
    escaped.push(
      '<mark style="background:' +
        color +
        ';padding:1px 2px;border-radius:2px;border:1px solid rgba(0,0,0,0.1)">' +
        escapeHtml(match[0]) +
        "</mark>"
    );
    lastIndex = regex.lastIndex;
    if (match[0].length === 0) regex.lastIndex++;
  }
  if (lastIndex < text.length) {
    escaped.push(escapeHtml(text.slice(lastIndex)));
  }
  return escaped.join("");
}

export function getGroupMatches(text, regex) {
  if (!regex || !text) return [];
  regex.lastIndex = 0;
  const results = [];
  let match;
  let idx = 0;
  while ((match = regex.exec(text)) !== null) {
    const groups = [];
    for (let g = 1; g < match.length; g++) {
      groups.push({ group: g, value: match[g] !== undefined ? match[g] : "(undefined)" });
    }
    results.push({ index: idx++, full: match[0], groups, position: match.index });
    if (match[0].length === 0) regex.lastIndex++;
  }
  return results;
}
function buildRailroadSVG(tokens) {
  const NODE_W = 40,
    NODE_H = 28,
    H_GAP = 12,
    V_GAP = 24;
  const TEXT_MAX = 60;

  function measureText(text) {
    return Math.min(text.length * 7 + 12, TEXT_MAX);
  }

  function renderNode(label, color) {
    const w = Math.max(measureText(label), NODE_W);
    return { w, h: NODE_H, label, color, kind: "node" };
  }

  function layoutTokens(tokens) {
    const items = [];
    let i = 0;
    while (i < tokens.length) {
      const tok = tokens[i];
      if (tok.type === "group-start") {
        const inner = [];
        let depth = 1;
        i++;
        while (i < tokens.length && depth > 0) {
          if (tokens[i].type === "group-start") depth++;
          if (tokens[i].type === "group-end") depth--;
          if (depth > 0) inner.push(tokens[i]);
          i++;
        }
        const groupLabel =
          tok.groupType === "noncapture"
            ? "?:"
            : tok.groupType === "lookahead"
              ? "?="
              : tok.groupType === "neglookahead"
                ? "?!"
                : tok.groupType === "lookbehind"
                  ? "?<="
                  : tok.groupType === "neglookbehind"
                    ? "?<!"
                    : "";
        items.push({ kind: "group", label: groupLabel, children: inner, color: "#6366f1" });
      } else if (tok.type === "alternation") {
        const branches = [];
        let current = [];
        i++;
        let depth = 0;
        while (i < tokens.length) {
          if (tokens[i].type === "group-start") depth++;
          if (tokens[i].type === "group-end") depth--;
          if (tokens[i].type === "alternation" && depth === 0) {
            branches.push(current);
            current = [];
            i++;
            continue;
          }
          if (depth < 0) break;
          current.push(tokens[i]);
          i++;
        }
        branches.push(current);
        items.push({ kind: "branch", branches });
      } else if (tok.type === "anchor") {
        items.push({
          kind: "anchor",
          label: tok.value === "^" ? "start" : "end",
          color: "#f59e0b"
        });
        i++;
      } else if (tok.type === "quantifier") {
        items.push({ kind: "quant", label: tok.value, color: "#8b5cf6" });
        i++;
      } else if (tok.type === "class") {
        const label = tok.value.length > 8 ? tok.value.slice(0, 7) + "..." : tok.value;
        items.push(renderNode(label, "#10b981"));
        i++;
      } else if (tok.type === "escape") {
        const label = tok.value.length > 8 ? tok.value.slice(0, 7) + "..." : tok.value;
        items.push(renderNode(label, "#f97316"));
        i++;
      } else {
        const label = tok.value.length > 8 ? tok.value.slice(0, 7) + "..." : tok.value;
        items.push(renderNode(label, "#3b82f6"));
        i++;
      }
    }
    return items;
  }

  function measureItems(items) {
    let totalW = 0;
    for (const item of items) {
      if (item.kind === "branch") {
        let maxBranchW = 0;
        for (const branch of item.branches) {
          const bw = measureItems(branch);
          if (bw > maxBranchW) maxBranchW = bw;
        }
        totalW += maxBranchW + H_GAP * 2;
      } else if (item.kind === "group") {
        const innerW = measureItems(item.children);
        totalW += innerW + 20;
      } else {
        totalW += (item.w || NODE_W) + H_GAP;
      }
    }
    return totalW;
  }

  function renderItems(items, svg, x, y) {
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      if (item.kind === "node") {
        const w = item.w || NODE_W;
        svg +=
          '<rect x="' +
          x +
          '" y="' +
          (y - NODE_H / 2) +
          '" width="' +
          w +
          '" height="' +
          NODE_H +
          '" rx="6" fill="white" stroke="' +
          item.color +
          '" stroke-width="2"/>';
        svg +=
          '<text x="' +
          (x + w / 2) +
          '" y="' +
          (y + 4) +
          '" text-anchor="middle" font-size="11">' +
          item.label +
          "</text>";
        x += w + H_GAP;
      } else if (item.kind === "anchor") {
        const w = 36;
        svg +=
          '<rect x="' +
          x +
          '" y="' +
          (y - NODE_H / 2) +
          '" width="' +
          w +
          '" height="' +
          NODE_H +
          '" rx="4" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>';
        svg +=
          '<text x="' +
          (x + w / 2) +
          '" y="' +
          (y + 4) +
          '" text-anchor="middle" font-size="10">' +
          item.label +
          "</text>";
        x += w + H_GAP;
      } else if (item.kind === "quant") {
        const w = Math.max(measureText(item.label), 32);
        svg +=
          '<rect x="' +
          x +
          '" y="' +
          (y - NODE_H / 2) +
          '" width="' +
          w +
          '" height="' +
          NODE_H +
          '" rx="10" fill="#ede9fe" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="4,2"/>';
        svg +=
          '<text x="' +
          (x + w / 2) +
          '" y="' +
          (y + 4) +
          '" text-anchor="middle" font-size="10">' +
          item.label +
          "</text>";
        x += w + H_GAP;
      } else if (item.kind === "group") {
        const innerW = measureItems(item.children);
        const boxW = innerW + 20;
        svg +=
          '<rect x="' +
          x +
          '" y="' +
          (y - NODE_H / 2 - 6) +
          '" width="' +
          boxW +
          '" height="' +
          (NODE_H + 12) +
          '" rx="6" fill="none" stroke="' +
          item.color +
          '" stroke-width="1.5" stroke-dasharray="5,3"/>';
        if (item.label) {
          svg +=
            '<text x="' +
            (x + 8) +
            '" y="' +
            (y - NODE_H / 2 - 10) +
            '" font-size="9" fill="#6366f1">' +
            item.label +
            "</text>";
        }
        svg = renderItems(item.children, svg, x + 10, y);
        x += boxW + H_GAP;
      } else if (item.kind === "branch") {
        const branchCount = item.branches.length;
        const branchSpacing = NODE_H + V_GAP;
        const totalH = (branchCount - 1) * branchSpacing;
        let maxBranchW = 0;
        for (const branch of item.branches) {
          const bw = measureItems(branch);
          if (bw > maxBranchW) maxBranchW = bw;
        }
        const splitX = x;
        const splitY = y;
        svg += '<circle cx="' + splitX + '" cy="' + splitY + '" r="4" fill="#ef4444"/>';
        for (let b = 0; b < branchCount; b++) {
          const branch = item.branches[b];
          const branchY = splitY - totalH / 2 + b * branchSpacing;
          svg +=
            '<line x1="' +
            splitX +
            '" y1="' +
            splitY +
            '" x2="' +
            (splitX + H_GAP) +
            '" y2="' +
            branchY +
            '" stroke="#9ca3af" stroke-width="1.5"/>';
          if (branch.length > 0) {
            svg = renderItems(branch, svg, splitX + H_GAP, branchY);
          }
          const branchEndX = splitX + H_GAP + measureItems(item.branches[b]);
          svg +=
            '<line x1="' +
            branchEndX +
            '" y1="' +
            branchY +
            '" x2="' +
            (splitX + maxBranchW + H_GAP * 2) +
            '" y2="' +
            splitY +
            '" stroke="#9ca3af" stroke-width="1.5"/>';
        }
        x += maxBranchW + H_GAP * 3;
      }
      if (idx < items.length - 1 && item.kind !== "branch") {
        svg +=
          '<line x1="' +
          (x - H_GAP) +
          '" y1="' +
          y +
          '" x2="' +
          x +
          '" y2="' +
          y +
          '" stroke="#9ca3af" stroke-width="2"/>';
      }
    }
    return svg;
  }

  const items = layoutTokens(tokens);
  if (items.length === 0) return "";

  const contentW = measureItems(items);
  const totalW = contentW + 30;
  const totalH = NODE_H + V_GAP * 2 + 40;

  let svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="' +
    totalW +
    '" height="' +
    totalH +
    '" viewBox="0 0 ' +
    totalW +
    " " +
    totalH +
    '">';
  svg += "<style>text{font:11px monospace;fill:#1f2937}</style>";

  const y = totalH / 2;
  let x = 10;
  svg +=
    '<line x1="0" y1="' + y + '" x2="' + x + '" y2="' + y + '" stroke="#9ca3af" stroke-width="2"/>';
  svg = renderItems(items, svg, x, y);
  const endX = x + contentW;
  svg +=
    '<line x1="' +
    endX +
    '" y1="' +
    y +
    '" x2="' +
    (endX + 10) +
    '" y2="' +
    y +
    '" stroke="#9ca3af" stroke-width="2"/>';
  svg += '<circle cx="' + (endX + 10) + '" cy="' + y + '" r="4" fill="#9ca3af"/>';
  svg += "</svg>";
  return svg;
}
export function render(container) {
  container.innerHTML = `
    <div class="rt-container">
      <div class="rt-header">
        <h2>Regex Tester & Visualizer</h2>
        <div class="rt-presets">
          <label class="rt-label">Presets:</label>
          <select id="presetSelect" class="rt-select">
            <option value="">Custom...</option>
          </select>
        </div>
      </div>
      <div class="rt-input-group">
        <div class="rt-pattern-row">
          <span class="rt-slash">/</span>
          <input type="text" id="pattern" class="rt-pattern" placeholder="Regular expression" value="\\b\\w+\\b">
          <span class="rt-slash">/</span>
          <input type="text" id="flags" class="rt-flags" value="gim" placeholder="flags">
        </div>
        <textarea id="testInput" class="rt-textarea" placeholder="Test string...">The quick brown fox jumps over the lazy dog</textarea>
      </div>
      <div class="rt-explanation" id="explanation"></div>
      <div class="rt-tabs">
        <button class="rt-tab active" data-tab="diagram">Railroad Diagram</button>
        <button class="rt-tab" data-tab="matches">Matches</button>
        <button class="rt-tab" data-tab="groups">Groups</button>
      </div>
      <div class="rt-tab-content" id="tabContent"></div>
      <div class="rt-highlighted" id="highlighted"></div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .rt-container { max-width: 900px; margin: 0 auto; }
    .rt-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
    .rt-header h2 { margin: 0; }
    .rt-presets { display: flex; align-items: center; gap: 8px; }
    .rt-label { font-size: 13px; font-weight: 600; color: #888; }
    .rt-select { padding: 6px 10px; border: 1px solid var(--color-border, #ccc); border-radius: 6px; font-size: 13px; background: var(--color-surface, #fff); color: var(--color-text, #333); }
    .rt-input-group { margin-bottom: 16px; }
    .rt-pattern-row { display: flex; align-items: center; gap: 4px; margin-bottom: 12px; }
    .rt-slash { font-size: 20px; font-family: monospace; color: #888; user-select: none; }
    .rt-pattern { flex: 1; padding: 10px 12px; border: 1px solid var(--color-border, #ccc); border-radius: 8px; font-family: monospace; font-size: 16px; background: var(--color-surface, #fff); color: var(--color-text, #333); }
    .rt-flags { width: 60px; padding: 10px 8px; border: 1px solid var(--color-border, #ccc); border-radius: 8px; font-family: monospace; font-size: 16px; text-align: center; background: var(--color-surface, #fff); color: var(--color-text, #333); }
    .rt-textarea { width: 100%; height: 100px; padding: 12px; border: 1px solid var(--color-border, #ccc); border-radius: 8px; background: var(--color-surface, #fff); color: var(--color-text, #333); font-family: monospace; resize: vertical; box-sizing: border-box; }
    .rt-explanation { padding: 10px 14px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; font-size: 13px; color: #0369a1; margin-bottom: 16px; line-height: 1.5; }
    .rt-explanation:empty { display: none; }
    .rt-tabs { display: flex; gap: 4px; margin-bottom: 12px; border-bottom: 2px solid var(--color-border, #e5e7eb); padding-bottom: 0; }
    .rt-tab { padding: 8px 16px; border: none; background: none; cursor: pointer; font-size: 13px; font-weight: 500; color: #888; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.15s; }
    .rt-tab:hover { color: var(--color-text, #333); }
    .rt-tab.active { color: #3b82f6; border-bottom-color: #3b82f6; }
    .rt-tab-content { min-height: 60px; overflow-x: auto; padding: 12px; background: var(--color-surface, #f9fafb); border: 1px solid var(--color-border, #e5e7eb); border-radius: 8px; margin-bottom: 12px; }
    .rt-tab-content:empty { display: none; }
    .rt-tab-content svg { display: block; }
    .rt-highlighted { padding: 12px; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e5e7eb); border-radius: 8px; font-family: monospace; font-size: 14px; line-height: 1.8; white-space: pre-wrap; word-break: break-all; }
    .rt-highlighted:empty { display: none; }
    .rt-match-count { font-weight: 600; margin-bottom: 8px; font-size: 13px; }
    .rt-match-item { padding: 6px 10px; border-bottom: 1px solid var(--color-border, #e5e7eb); font-family: monospace; font-size: 12px; display: flex; gap: 12px; }
    .rt-match-item:last-child { border: none; }
    .rt-match-idx { color: #888; min-width: 24px; }
    .rt-match-val { color: #3b82f6; font-weight: 500; }
    .rt-match-pos { color: #888; margin-left: auto; }
    .rt-group-table { width: 100%; border-collapse: collapse; font-size: 12px; font-family: monospace; }
    .rt-group-table th { text-align: left; padding: 6px 10px; border-bottom: 2px solid var(--color-border, #e5e7eb); font-weight: 600; color: #888; }
    .rt-group-table td { padding: 6px 10px; border-bottom: 1px solid var(--color-border, #e5e7eb); }
    .rt-group-table tr:last-child td { border: none; }
    .rt-no-data { color: #888; font-size: 13px; font-style: italic; }
  `;
  container.appendChild(style);

  const patternEl = container.querySelector("#pattern");
  const flagsEl = container.querySelector("#flags");
  const textEl = container.querySelector("#testInput");
  const presetEl = container.querySelector("#presetSelect");
  const explanationEl = container.querySelector("#explanation");
  const tabContent = container.querySelector("#tabContent");
  const highlightedEl = container.querySelector("#highlighted");
  const tabs = container.querySelectorAll(".rt-tab");

  let activeTab = "diagram";

  PRESETS.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.pattern;
    opt.textContent = p.name;
    presetEl.appendChild(opt);
  });

  presetEl.addEventListener("change", () => {
    if (presetEl.value) {
      patternEl.value = presetEl.value;
      run();
    }
  });

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeTab = tab.dataset.tab;
      run();
    });
  });

  function run() {
    const pattern = patternEl.value;
    const flags = flagsEl.value;
    const text = textEl.value;

    explanationEl.textContent = pattern ? explainRegex(pattern) : "";

    let regex = null;
    try {
      regex = new RegExp(pattern, flags);
    } catch (e) {
      tabContent.innerHTML =
        '<span style="color:#ef4444;font-size:13px">Invalid regex: ' +
        escapeHtml(e.message) +
        "</span>";
      highlightedEl.innerHTML = escapeHtml(text);
      return;
    }

    highlightedEl.innerHTML = highlightMatches(text, regex);

    if (activeTab === "diagram") {
      try {
        const tokens = tokenizeRegex(pattern);
        tabContent.innerHTML =
          buildRailroadSVG(tokens) || '<span class="rt-no-data">Empty pattern</span>';
      } catch {
        tabContent.innerHTML =
          '<span style="color:#ef4444;font-size:13px">Cannot render diagram</span>';
      }
    } else if (activeTab === "matches") {
      const matches = [];
      regex.lastIndex = 0;
      let m;
      while ((m = regex.exec(text)) !== null) {
        matches.push({ value: m[0], position: m.index });
        if (m[0].length === 0) regex.lastIndex++;
      }
      if (matches.length === 0) {
        tabContent.innerHTML = '<span class="rt-no-data">No matches found</span>';
      } else {
        let html =
          '<div class="rt-match-count">' +
          matches.length +
          " match" +
          (matches.length !== 1 ? "es" : "") +
          "</div>";
        matches.forEach((m, i) => {
          html +=
            '<div class="rt-match-item"><span class="rt-match-idx">#' +
            (i + 1) +
            '</span><span class="rt-match-val">' +
            escapeHtml(m.value) +
            '</span><span class="rt-match-pos">pos ' +
            m.position +
            "</span></div>";
        });
        tabContent.innerHTML = html;
      }
    } else if (activeTab === "groups") {
      const groupMatches = getGroupMatches(text, regex);
      if (groupMatches.length === 0) {
        tabContent.innerHTML = '<span class="rt-no-data">No matches found</span>';
      } else {
        const maxGroups = Math.max(...groupMatches.map(m => m.groups.length));
        if (maxGroups === 0) {
          tabContent.innerHTML =
            '<span class="rt-no-data">No capturing groups in this pattern</span>';
        } else {
          let html = '<table class="rt-group-table"><thead><tr><th>Match</th>';
          for (let g = 1; g <= maxGroups; g++) {
            html += "<th>Group " + g + "</th>";
          }
          html += "</tr></thead><tbody>";
          groupMatches.forEach((m, i) => {
            html += "<tr><td>#" + (i + 1) + ' "' + escapeHtml(m.full) + '"</td>';
            for (let g = 0; g < maxGroups; g++) {
              const val = m.groups[g] ? m.groups[g].value : "";
              html +=
                "<td>" +
                (val !== "" ? '"' + escapeHtml(val) + '"' : '<span style="color:#ccc">-</span>') +
                "</td>";
            }
            html += "</tr>";
          });
          html += "</tbody></table>";
          tabContent.innerHTML = html;
        }
      }
    }
  }

  patternEl.addEventListener("input", run);
  flagsEl.addEventListener("input", run);
  textEl.addEventListener("input", run);
  run();
}
