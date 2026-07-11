import { createBasicTool } from "../shared/basic-tool-factory.js";
import { escapeHtml } from "../../utils/escape-html.js";

const { toolConfig, render } = createBasicTool({
  toolConfig: {
    id: "jwt-decoder",
    name: "JWT Decoder",
    category: "encoding",
    description: "Decode and inspect JWT tokens.",
    icon: "🎫",
    accept: null,
    maxSizeMB: null,
    keywords: ["jwt decoder", "jwt parse", "json web token", "jwt viewer"],
    steps: ["Paste JWT", "See decoded payload"]
  },
  inputHTML: `<textarea id="jwt-input" placeholder="Paste JWT token here..."></textarea>`,
  outputHTML: `<div id="jwt-output" class="jwt-output"></div>`,
  extraCSS: `
    .tool-container textarea { margin-bottom: var(--space-4); font-size: 13px; }
    .jwt-section { margin-bottom: var(--space-4); }
    .jwt-section h3 { font-size: var(--text-sm); color: var(--color-muted); margin-bottom: var(--space-2); }
    .jwt-section pre { background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-md); overflow: auto; font-size: 13px; }
    .jwt-err { color: var(--color-error); }
  `,
  init(container) {
    const input = container.querySelector("#jwt-input");
    const output = container.querySelector("#jwt-output");

    function decodeJWT(jwt) {
      const parts = jwt.trim().split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format. Expected 3 parts separated by dots.");
      }

      const decode = str => {
        try {
          return JSON.stringify(
            JSON.parse(atob(str.replace(/-/g, "+").replace(/_/g, "/"))),
            null,
            2
          );
        } catch (e) {
          return atob(str.replace(/-/g, "+").replace(/_/g, "/"));
        }
      };

      return {
        header: decode(parts[0]),
        payload: decode(parts[1]),
        signature: parts[2]
      };
    }

    function renderJWT() {
      const jwt = input.value.trim();
      if (!jwt) {
        output.innerHTML = "<p>Enter a JWT token to decode</p>";
        return;
      }

      try {
        const decoded = decodeJWT(jwt);
        output.innerHTML = `
          <div class="jwt-section">
            <h3>HEADER</h3>
            <pre>${decoded.header}</pre>
          </div>
          <div class="jwt-section">
            <h3>PAYLOAD</h3>
            <pre>${decoded.payload}</pre>
          </div>
          <div class="jwt-section">
            <h3>SIGNATURE</h3>
            <pre>${decoded.signature}</pre>
          </div>
        `;
      } catch (e) {
        output.innerHTML = `<p class="jwt-err">Error: ${escapeHtml(e.message)}</p>`;
      }
    }

    input.addEventListener("input", renderJWT);
    renderJWT();
  }
});

export { toolConfig, render };
