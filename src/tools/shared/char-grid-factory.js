import { CHAR_GRID_CSS } from "./char-grid-css.js";

export function createCharGrid(options = {}) {
  const {
    containerClass = "char-grid-container",
    searchPlaceholder = "Search...",
    detailSection = false,
    detailTitle = "Character Details",
    onSelect = null,
    onCopy = null
  } = options;

  return function render(container, data, renderItem) {
    container.innerHTML = `
      <div class="${containerClass}">
        <div class="char-grid-search">
          <input type="text" id="search-input" placeholder="${searchPlaceholder}">
          ${
            options.categorySelect
              ? `
            <select id="category-select">
              <option value="">All Categories</option>
              ${options.categories.map(c => `<option value="${c.value}">${c.label}</option>`).join("")}
            </select>
          `
              : ""
          }
        </div>
        <div id="results" class="char-grid-results"></div>
        ${detailSection ? `<div id="details" class="char-grid-details hidden"></div>` : ""}
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      ${CHAR_GRID_CSS}
      ${options.extraCss || ""}
    `;
    container.appendChild(style);

    const searchInput = container.querySelector("#search-input");
    const results = container.querySelector("#results");
    const categorySelect = container.querySelector("#category-select");
    const details = container.querySelector("#details");

    function renderResults(items) {
      results.innerHTML = items.map((item, i) => renderItem(item, i)).join("");

      results.querySelectorAll(".char-grid-item").forEach(el => {
        el.addEventListener("click", () => {
          results.querySelectorAll(".char-grid-item").forEach(x => x.classList.remove("selected"));
          el.classList.add("selected");
          const idx = parseInt(el.dataset.index);
          const item = items[idx];

          if (detailSection && details) {
            showDetails(item, idx);
          }
          if (onSelect) onSelect(item, idx);
        });
      });
    }

    function showDetails(item, idx) {
      details.innerHTML = options.renderDetail ? options.renderDetail(item, idx) : "";
      details.classList.remove("hidden");

      const copyBtn = details.querySelector(".copy-btn");
      if (copyBtn && onCopy) {
        copyBtn.addEventListener("click", () => {
          onCopy(item, copyBtn);
        });
      }
    }

    function filter() {
      const query = searchInput.value.toLowerCase();
      const category = categorySelect?.value || "";

      let filtered = data;
      if (query || category) {
        filtered = data.filter(item => {
          const matchesQuery = !query || options.filterItem(item, query);
          const matchesCategory = !category || item.category === category;
          return matchesQuery && matchesCategory;
        });
      }
      renderResults(filtered);
      if (details) details.classList.add("hidden");
    }

    if (searchInput) searchInput.addEventListener("input", filter);
    if (categorySelect) categorySelect.addEventListener("change", filter);

    renderResults(data);

    return { searchInput, results, details, filter, renderResults };
  };
}
