import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";

export const toolConfig = {
  id: "graphql-schema-explorer",
  name: "GraphQL Schema Explorer",
  category: "dev",
  description: "Browse GraphQL SDL schemas as collapsible type trees.",
  icon: "🔬",
  accept: ".graphql,.gql,.txt",
  maxSizeMB: 5,
  keywords: ["graphql", "schema", "explore", "types", "sdl", "api"],
  steps: [
    "Upload or paste a GraphQL SDL schema",
    "Browse types, queries, mutations",
    "View field details and relationships",
  ],
  faqs: [
    {
      question: "What is SDL?",
      answer: "Schema Definition Language is the standard way to define GraphQL schemas.",
    },
    {
      question: "Does it validate schemas?",
      answer: "No, it parses and displays SDL for browsing only.",
    },
  ],
};

export function parseSDL(sdl) {
  const types = [];
  const lines = sdl.split("\n");
  let currentType = null;
  let braceDepth = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const typeMatch = trimmed.match(/^(type|interface|enum|input|union)\s+(\w+)/);
    if (typeMatch && braceDepth === 0) {
      currentType = { kind: typeMatch[1], name: typeMatch[2], fields: [] };
      if (trimmed.includes("{")) braceDepth = 1;
      continue;
    }

    if (braceDepth > 0 && currentType) {
      if (trimmed === "}") {
        types.push(currentType);
        currentType = null;
        braceDepth = 0;
        continue;
      }
      const fieldMatch = trimmed.match(/^(\w+)(?:\([^)]*\))?\s*:\s*(.+)/);
      if (fieldMatch) {
        const args = [];
        const argsMatch = trimmed.match(/\(([^)]+)\)/);
        if (argsMatch) {
          argsMatch[1].split(",").forEach((a) => {
            const [n, t] = a.split(":").map((s) => s.trim());
            if (n && t) args.push({ name: n, type: t });
          });
        }
        const fieldType = fieldMatch[2].replace(/[!,]/g, "").trim();
        currentType.fields.push({
          name: fieldMatch[1],
          type: fieldType,
          args,
          deprecated: trimmed.includes("@deprecated"),
        });
      }
    }

    const queryMatch = trimmed.match(/^(type\s+Query|type\s+Mutation|type\s+Subscription)/);
    if (queryMatch && trimmed.includes("{")) braceDepth = 1;
  }

  if (currentType) types.push(currentType);
  return types;
}

export function buildTypeMap(types) {
  const map = {};
  for (const t of types) map[t.name] = t;
  return map;
}

export function getTypeKind(typeStr) {
  if (typeStr.endsWith("!")) return "required";
  if (typeStr.startsWith("[")) return "list";
  return "nullable";
}

export function render(container) {
  let types = [];

  const upload = createFileUpload({
    accept: ".graphql,.gql,.txt",
    multiple: false,
    maxSizeMB: 5,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      try {
        const sdl = await files[0].text();
        types = parseSDL(sdl);
        renderTree();
        showToast({ message: `Parsed ${types.length} types.`, type: "success" });
      } catch {
        showToast({ message: "Failed to parse schema.", type: "error" });
      }
    },
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" style="display:block;">
        <div class="form-group">
          <label for="sdl-input">Or paste GraphQL SDL</label>
          <textarea id="sdl-input" class="text-input" rows="12" placeholder="type Query {&#10;  users: [User]&#10;  user(id: ID!): User&#10;}&#10;&#10;type User {&#10;  id: ID!&#10;  name: String!&#10;  email: String&#10;}"></textarea>
        </div>
        <button class="btn btn-primary" id="parse-paste-btn">Parse SDL</button>
      </div>
      <div id="tree-area" style="display:none;"></div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const sdlInput = container.querySelector("#sdl-input");
  const parsePasteBtn = container.querySelector("#parse-paste-btn");
  const treeArea = container.querySelector("#tree-area");

  parsePasteBtn.addEventListener("click", () => {
    try {
      types = parseSDL(sdlInput.value);
      renderTree();
      showToast({ message: `Parsed ${types.length} types.`, type: "success" });
    } catch {
      showToast({ message: "Failed to parse SDL.", type: "error" });
    }
  });

  function renderTree() {
    const typeMap = buildTypeMap(types);
    const queryType = typeMap["Query"];
    const mutationType = typeMap["Mutation"];
    const subscriptionType = typeMap["Subscription"];
    const otherTypes = types.filter((t) => !["Query", "Mutation", "Subscription"].includes(t.name));

    function renderTypeCard(type) {
      const fieldsHtml = type.fields
        .map((f) => {
          const typeBadge = f.deprecated
            ? '<span style="color:var(--color-error);font-size:var(--text-xs);margin-left:4px;">DEPRECATED</span>'
            : "";
          const argsHtml =
            f.args.length > 0
              ? `<div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:2px;">Args: ${f.args.map((a) => `${a.name}: ${a.type}`).join(", ")}</div>`
              : "";
          const isRef = typeMap[f.type.replace(/[[\]!]/g, "")];
          const typeLink = isRef
            ? `<span style="color:var(--color-primary);cursor:pointer;" class="type-link" data-type="${f.type.replace(/[[\]!]/g, "")}">${f.type}</span>`
            : `<code>${f.type}</code>`;
          return `
          <div style="padding:var(--space-2);border-left:2px solid var(--color-border);margin-bottom:var(--space-1);">
            <span style="font-weight:600;">${f.name}</span>: ${typeLink}${typeBadge}
            ${argsHtml}
          </div>
        `;
        })
        .join("");

      return `
        <details open style="margin-bottom:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;">
          <summary style="font-weight:700;padding:var(--space-3);background:var(--color-bg-secondary);cursor:pointer;display:flex;align-items:center;gap:var(--space-2);">
            <span style="font-size:var(--text-xs);color:var(--color-text-muted);text-transform:uppercase;">${type.kind}</span>
            <span>${type.name}</span>
            <span style="margin-left:auto;font-size:var(--text-sm);color:var(--color-text-muted);">${type.fields.length} fields</span>
          </summary>
          <div style="padding:var(--space-3);">${fieldsHtml || '<div style="color:var(--color-text-muted);">No fields</div>'}</div>
        </details>
      `;
    }

    treeArea.innerHTML = `
      <div style="margin-bottom:var(--space-4);">
        <h2 style="font-size:var(--text-xl);font-weight:700;">GraphQL Schema</h2>
        <div style="font-size:var(--text-sm);color:var(--color-text-muted);">${types.length} types | ${types.reduce((s, t) => s + t.fields.length, 0)} fields</div>
      </div>
      ${queryType ? renderTypeCard(queryType) : ""}
      ${mutationType ? renderTypeCard(mutationType) : ""}
      ${subscriptionType ? renderTypeCard(subscriptionType) : ""}
      ${
        otherTypes.length > 0
          ? `
        <h3 style="font-weight:600;margin:var(--space-4) 0 var(--space-2);">Other Types</h3>
        ${otherTypes.map((t) => renderTypeCard(t)).join("")}
      `
          : ""
      }
    `;
    treeArea.style.display = "block";
  }
}

export function destroy() {}
