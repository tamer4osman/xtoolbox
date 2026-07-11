import { showToast } from "../../components/toast.js";
import { copyToClipboard } from "../../utils/clipboard.js";

export function formatXml(xml, indent = 2) {
  const parsed = new DOMParser().parseFromString(xml, "text/xml");
  const errorNode = parsed.querySelector("parsererror");
  if (errorNode) {
    throw new Error("Invalid XML: " + errorNode.textContent);
  }

  const serializer = new XMLSerializer();
  let formatted = serializer.serializeToString(parsed);

  // Remove existing whitespace
  formatted = formatted.replace(/>\s*</g, "><");

  // Add newlines and indentation
  let output = "";
  let currentIndent = 0;
  const lines = formatted.replace(/>\s*</g, ">\n<").split("\n");

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Check for closing tag
    if (line.startsWith("</")) {
      currentIndent = Math.max(0, currentIndent - indent);
    }

    output += " ".repeat(currentIndent) + line + "\n";

    // Skip comments and CDATA sections entirely - they don't affect indentation
    if (line.startsWith("<!--") || line.startsWith("<![CDATA[")) {
      continue;
    }

    // Check for opening tag (not self-closing, not closing, not processing instruction)
    if (line.startsWith("<") && !line.startsWith("</") && !line.startsWith("<?")) {
      // Skip self-closing tags (end with /> or match self-closing pattern)
      if (line.endsWith("/>") || /<[^/][^>]*\/>/.test(line)) {
        continue;
      }
      // Check if it's a complete tag with content (opening + text + closing on same line)
      const match = line.match(/^<[^>]+>[^<]*<\/[^>]+>$/);
      if (!match) {
        currentIndent += indent;
      }
    }
  }

  return output.trim();
}

export function validateXml(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const errorNode = doc.querySelector("parsererror");

  if (errorNode) {
    const errorText = errorNode.textContent;
    const lineNumber = errorNode.lineNumber;
    const columnNumber = errorNode.columnNumber;
    const lineMatch = errorText.match(/line (\d+)/i);
    const colMatch = errorText.match(/column (\d+)/i);
    const line = Number.isInteger(lineNumber)
      ? lineNumber
      : lineMatch
        ? parseInt(lineMatch[1], 10)
        : undefined;
    const column = Number.isInteger(columnNumber)
      ? columnNumber
      : colMatch
        ? parseInt(colMatch[1], 10)
        : undefined;

    return {
      valid: false,
      error: errorText,
      line: line ?? null,
      column: column ?? null
    };
  }

  return { valid: true, error: null };
}

export function highlightXml(xml) {
  const fragment = document.createDocumentFragment();
  const regex =
    /(<\?[\s\S]*?\?>)|(<!--[\s\S]*?-->)|(<\/?[\w:-]+\/?)|(".*?")|([\w:-]+)(=)|(>)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(xml)) !== null) {
    if (match.index > lastIndex) {
      fragment.appendChild(document.createTextNode(xml.slice(lastIndex, match.index)));
    }

    const [, decl, comment, tag, str, attr, eq] = match;

    if (decl || comment) {
      const span = document.createElement("span");
      span.style.color = "#7f848e";
      span.textContent = decl || comment;
      fragment.appendChild(span);
    } else if (tag) {
      const span = document.createElement("span");
      span.style.color = "#e06c75";
      span.textContent = tag;
      fragment.appendChild(span);
    } else if (str) {
      const span = document.createElement("span");
      span.style.color = "#98c379";
      span.textContent = str;
      fragment.appendChild(span);
    } else if (attr && eq) {
      const span = document.createElement("span");
      span.style.color = "#d19a66";
      span.textContent = attr;
      fragment.appendChild(span);
      fragment.appendChild(document.createTextNode(eq));
    } else {
      fragment.appendChild(document.createTextNode(match[0]));
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < xml.length) {
    fragment.appendChild(document.createTextNode(xml.slice(lastIndex)));
  }

  return fragment;
}

export const toolConfig = {
  id: "xml-formatter",
  name: "XML Formatter & Validator",
  category: "text",
  description: "Format, validate, and highlight XML markup without server transmissions.",
  icon: "📝",
  accept: ".xml",
  maxSizeMB: 5,
  keywords: [
    "xml",
    "formatter",
    "validator",
    "beautifier",
    "pretty print",
    "xml validator",
    "xml formatter"
  ],
  steps: [
    "Paste or upload XML content",
    'Click "Format" to pretty-print',
    "View validation results and syntax highlighting",
    "Copy or download formatted XML"
  ],
  faqs: [
    {
      question: "What does XML formatting do?",
      answer:
        "XML formatting (pretty-printing) adds proper indentation and line breaks to make XML documents human-readable while preserving structure."
    },
    {
      question: "How does validation work?",
      answer:
        "The tool uses the browser's built-in DOMParser to check if the XML is well-formed. It reports line numbers for any parsing errors."
    },
    {
      question: "Is my XML data sent to a server?",
      answer:
        "No, all processing happens locally in your browser. Your XML data never leaves your device."
    }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div class="form-group">
        <label for="xf-input">XML Input</label>
        <textarea id="xf-input" class="text-input" rows="12" placeholder="Paste your XML here..." style="font-family:monospace;font-size:var(--text-sm);"></textarea>
      </div>
      
      <div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-3);">
        <button class="btn btn-primary" id="xf-format">Format</button>
        <button class="btn btn-secondary" id="xf-validate">Validate Only</button>
        <button class="btn btn-secondary" id="xf-minify">Minify</button>
        <button class="btn btn-secondary" id="xf-clear">Clear</button>
      </div>
      
      <div id="xf-status" style="display:none;padding:var(--space-3);border-radius:var(--radius-md);margin-bottom:var(--space-3);font-size:var(--text-sm);"></div>
      
      <div class="form-group">
        <label for="xf-output">Formatted Output</label>
        <div style="position:relative;">
          <pre id="xf-output" style="background:var(--color-code-bg, #1e1e2e);color:#cdd6f4;padding:var(--space-3);border-radius:var(--radius-md);overflow-x:auto;font-size:var(--text-sm);line-height:1.6;white-space:pre-wrap;word-break:break-all;min-height:120px;font-family:monospace;max-height:400px;overflow-y:auto;"></pre>
          <div style="position:absolute;top:var(--space-2);right:var(--space-2);display:flex;gap:var(--space-2);">
            <button class="btn btn-sm btn-secondary" id="xf-copy">Copy</button>
            <button class="btn btn-sm btn-secondary" id="xf-download">Download</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const input = container.querySelector("#xf-input");
  const output = container.querySelector("#xf-output");
  const status = container.querySelector("#xf-status");
  const formatBtn = container.querySelector("#xf-format");
  const validateBtn = container.querySelector("#xf-validate");
  const minifyBtn = container.querySelector("#xf-minify");
  const clearBtn = container.querySelector("#xf-clear");
  const copyBtn = container.querySelector("#xf-copy");
  const downloadBtn = container.querySelector("#xf-download");

  let currentXml = "";
  let currentFileName = "formatted.xml";

  function showStatus(message, type) {
    status.style.display = "block";
    status.textContent = message;
    status.style.background =
      type === "error"
        ? "var(--color-error-bg, #fef2f2)"
        : type === "success"
          ? "var(--color-success-bg, #f0fdf4)"
          : "var(--color-info-bg, #f0f9ff)";
    status.style.color =
      type === "error"
        ? "var(--color-error, #dc2626)"
        : type === "success"
          ? "var(--color-success, #16a34a)"
          : "var(--color-info, #2563eb)";
    status.style.border = `1px solid ${
      type === "error"
        ? "var(--color-error-border, #fecaca)"
        : type === "success"
          ? "var(--color-success-border, #bbf7d0)"
          : "var(--color-info-border, #bfdbfe)"
    }`;
  }

  function format() {
    const xml = input.value.trim();
    if (!xml) {
      showStatus("Please enter XML content", "error");
      return;
    }

    try {
      const formatted = formatXml(xml);
      currentXml = formatted;
      output.textContent = "";
      output.appendChild(highlightXml(formatted));
      showStatus("XML formatted successfully", "success");
    } catch (e) {
      showStatus(e.message, "error");
      output.textContent = "";
    }
  }

  function validate() {
    const xml = input.value.trim();
    if (!xml) {
      showStatus("Please enter XML content", "error");
      return;
    }

    const result = validateXml(xml);
    if (result.valid) {
      showStatus("XML is valid (well-formed)", "success");
    } else {
      let errorMsg = "Invalid XML: " + result.error;
      if (result.line || result.column) {
        errorMsg += " (";
        if (result.line) errorMsg += `line ${result.line}`;
        if (result.line && result.column) errorMsg += ", ";
        if (result.column) errorMsg += `column ${result.column}`;
        errorMsg += ")";
      }
      showStatus(errorMsg, "error");
    }
  }

  function minify() {
    const xml = input.value.trim();
    if (!xml) {
      showStatus("Please enter XML content", "error");
      return;
    }

    try {
      // Validate first
      const result = validateXml(xml);
      if (!result.valid) {
        showStatus("Cannot minify invalid XML", "error");
        return;
      }

      // Collapse whitespace between adjacent tags only (preserve text/CDATA content)
      // Match whitespace between tags that is NOT adjacent to text content
      const minified = xml
        .replace(/>\s+(?=<)/g, ">")
        .replace(/(?<=>)\s+</g, "<")
        .trim();
      currentXml = minified;
      output.textContent = minified;
      showStatus("XML minified", "success");
    } catch (e) {
      showStatus("Error minifying XML", "error");
    }
  }

  formatBtn.addEventListener("click", format);
  validateBtn.addEventListener("click", validate);
  minifyBtn.addEventListener("click", minify);

  clearBtn.addEventListener("click", () => {
    input.value = "";
    output.textContent = "";
    status.style.display = "none";
    currentXml = "";
  });

  copyBtn.addEventListener("click", async () => {
    const text = currentXml || output.textContent;
    if (!text) {
      showStatus("Nothing to copy", "error");
      return;
    }
    const success = await copyToClipboard(text);
    if (success) {
      showToast({ message: "XML copied to clipboard", type: "success" });
    } else {
      showToast({ message: "Failed to copy", type: "error" });
    }
  });

  downloadBtn.addEventListener("click", () => {
    const text = currentXml || output.textContent;
    if (!text) {
      showStatus("Nothing to download", "error");
      return;
    }
    const blob = new Blob([text], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast({ message: "XML file downloaded", type: "success" });
  });

  // Handle file upload
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".xml";
  fileInput.style.display = "none";
  fileInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    currentFileName = file.name;
    const reader = new FileReader();
    reader.onload = event => {
      input.value = event.target.result;
      format();
    };
    reader.readAsText(file);
  });

  // Add file upload button to the UI
  const uploadBtn = document.createElement("button");
  uploadBtn.className = "btn btn-secondary";
  uploadBtn.textContent = "Upload XML File";
  uploadBtn.addEventListener("click", () => fileInput.click());
  container
    .querySelector(".tool-layout")
    .insertBefore(uploadBtn, container.querySelector(".form-group"));
}

export function destroy() {}
