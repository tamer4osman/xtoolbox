export const toolConfig = {
  id: "xml-json",
  name: "XML to JSON",
  category: "text",
  description: "Convert XML to JSON format.",
  icon: "📋",
  accept: ".xml,.json",
  maxSizeMB: 1,
  keywords: ["xml to json", "convert xml", "xml parser"],
  steps: ["Enter XML", "Get JSON"]
};

export function render(container) {
  container.innerHTML = `
    <div class="convert-container">
      <div class="convert-input">
        <h3>XML</h3>
        <textarea id="xml-input" placeholder="<root><name>John</name><age>30</age></root>"><root>
  <name>John</name>
  <age>30</age>
  <city>NYC</city>
</root></textarea>
      </div>
      <div class="convert-output">
        <h3>JSON</h3>
        <textarea id="json-output" readonly></textarea>
        <button id="copy-btn" class="btn btn-secondary">Copy</button>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .convert-container { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .convert-input textarea, .convert-output textarea { width: 100%; min-height: 250px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-family: monospace; font-size: 14px; }
    .convert-output textarea { background: var(--color-surface); }
    .convert-input h3, .convert-output h3 { margin-bottom: var(--space-2); font-size: var(--text-sm); color: var(--color-muted); }
    #copy-btn { margin-top: var(--space-2); }
  `;
  container.appendChild(style);

  const xmlInput = container.querySelector("#xml-input");
  const jsonOutput = container.querySelector("#json-output");
  const copyBtn = container.querySelector("#copy-btn");

  function parseXML(xml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");

    if (doc.querySelector("parsererror")) {
      throw new Error("Invalid XML");
    }

    function nodeToObj(node) {
      const obj = {};

      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.attributes?.length) {
          obj["@attributes"] = {};
          for (const attr of node.attributes) {
            obj["@attributes"][attr.name] = attr.value;
          }
        }

        for (const child of node.childNodes) {
          if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent?.trim();
            if (text) return text;
          }
          if (child.nodeType === Node.ELEMENT_NODE) {
            const childObj = nodeToObj(child);
            if (obj[child.tagName]) {
              if (!Array.isArray(obj[child.tagName])) {
                obj[child.tagName] = [obj[child.tagName]];
              }
              obj[child.tagName].push(childObj);
            } else {
              obj[child.tagName] = childObj;
            }
          }
        }
      }
      return Object.keys(obj).length ? obj : null;
    }

    const root = doc.documentElement;
    return { [root.tagName]: nodeToObj(root) };
  }

  function convert() {
    try {
      const obj = parseXML(xmlInput.value);
      jsonOutput.value = JSON.stringify(obj, null, 2);
    } catch (e) {
      jsonOutput.value = "Error: " + e.message;
    }
  }

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(jsonOutput.value);
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
  });

  xmlInput.addEventListener("input", convert);
  convert();
}
