import { wireLookupSearch } from "./lookup.js";
import { LOOKUP_CSS } from "./lookup-css.js";

export function createLookupTool(config) {
  return {
    toolConfig: config.toolConfig,
    render(container) {
      container.innerHTML = `
        <div class="tool-container">
          <div class="tool-header">
            <div class="tool-icon">${config.toolConfig.icon}</div>
            <h1>${config.toolConfig.name}</h1>
            <p class="tool-description">${config.toolConfig.description}</p>
          </div>
          <div class="tool-content">
            ${config.contentHTML}
            <div id="loading" class="loading hidden">${config.loadingText || "Searching..."}</div>
            <div id="result" class="result hidden">${config.resultHTML || ""}</div>
            <div id="error" class="error hidden"></div>
          </div>
        </div>
      `;

      const style = document.createElement("style");
      style.textContent = LOOKUP_CSS + (config.extraCSS || "");
      container.appendChild(style);

      wireLookupSearch({
        container,
        searchButtonId: config.searchButtonId || "search-btn",
        inputSelector: config.inputSelector || "input",
        errorMessage: config.errorMessage || "Search failed. Please try again.",
        validate: config.validate,
        onSearch: config.onSearch
      });

      if (config.init) config.init(container);
    }
  };
}
