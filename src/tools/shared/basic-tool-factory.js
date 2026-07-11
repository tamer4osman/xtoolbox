import { BASIC_TOOL_CSS } from "./basic-tool-css.js";

export function createBasicTool(config) {
  return {
    toolConfig: config.toolConfig,
    render(container) {
      container.innerHTML = `
        <div class="tool-container">
          ${config.inputHTML || ""}
          <div class="tool-output">${config.outputHTML || ""}</div>
        </div>
      `;

      const style = document.createElement("style");
      style.textContent = BASIC_TOOL_CSS + (config.extraCSS || "");
      container.appendChild(style);

      if (config.init) config.init(container);
    }
  };
}
