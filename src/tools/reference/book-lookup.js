import { wireLookupSearch, escapeHtml } from '../shared/lookup.js';

export const toolConfig = {
  id: 'book-lookup',
  name: 'Book Info Lookup',
  category: 'reference',
  description: 'Search for book information by ISBN, title, or author.',
  icon: '📚',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <div class="tool-icon">📚</div>
        <h1>Book Info Lookup</h1>
        <p class="tool-description">Search for book information by ISBN, title, or author.</p>
      </div>
      <div class="tool-content">
        <div class="search-box">
          <select id="search-type" class="tool-select">
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="isbn">ISBN</option>
          </select>
          <input type="text" id="query-input" class="tool-input" placeholder="Search for books..." />
          <button id="search-btn" class="tool-button primary">Search</button>
        </div>
        <div id="loading" class="loading hidden">Searching...</div>
        <div id="result" class="result hidden">
          <div id="books-grid" class="books-grid"></div>
        </div>
        <div id="error" class="error hidden"></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .tool-container { max-width: 800px; margin: 0 auto; }
    .tool-header { text-align: center; margin-bottom: var(--space-8); }
    .search-box { display: flex; gap: var(--space-3); margin-bottom: var(--space-6); }
    .tool-select { padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: white; }
    .tool-input { flex: 1; padding: var(--space-3) var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
    .tool-input:focus { border-color: var(--color-primary); outline: none; }
    .tool-button.primary { padding: var(--space-3) var(--space-6); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .loading, .error { text-align: center; padding: var(--space-8); color: var(--color-text-secondary); }
    .error { color: var(--color-error); }
    .result { animation: fadeIn 0.3s; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .books-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: var(--space-4); }
    .book-card { background: var(--color-surface); border-radius: var(--radius-lg); overflow: hidden; }
    .book-cover { width: 100%; height: 200px; object-fit: cover; background: var(--color-border); }
    .book-info { padding: var(--space-4); }
    .book-title { font-weight: 600; margin-bottom: var(--space-2); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .book-author { color: var(--color-text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-2); }
    .book-year { color: var(--color-text-muted); font-size: var(--text-sm); }
    .hidden { display: none !important; }
  `;
  container.appendChild(style);

  async function searchBooks(query, type) {
    if (type === 'isbn') {
      const res = await fetch('https://openlibrary.org/isbn/' + query + '.json');
      const data = await res.json();
      return [{ key: data.key, title: 'ISBN: ' + query, author_name: [data.authors?.[0]?.name || 'Unknown'] }];
    }
    const res = await fetch('https://openlibrary.org/search.json?' + type + '=' + encodeURIComponent(query) + '&limit=10');
    const data = await res.json();
    return data.docs || [];
  }

  wireLookupSearch({
    container,
    searchButtonId: 'search-btn',
    inputSelector: 'input',
    errorMessage: 'No books found. Try a different search.',
    validate: (vals) => !vals['query-input']?.trim() ? 'Enter a search term' : null,
    onSearch: async (vals) => {
      const query = vals['query-input'].trim();
      const type = container.querySelector('#search-type').value;
      const books = await searchBooks(query, type);
      if (books.length === 0) throw new Error('No books found');
      const grid = container.querySelector('#books-grid');
      grid.innerHTML = books.map(book => `
        <div class="book-card">
          <img class="book-cover" src="https://covers.openlibrary.org/b/id/${escapeHtml(book.cover_i || '')}-M.jpg" onerror="this.style.display='none'" alt="" />
          <div class="book-info">
            <div class="book-title">${escapeHtml(book.title || 'Unknown')}</div>
            <div class="book-author">${escapeHtml(book.author_name?.join(', ') || 'Unknown Author')}</div>
            <div class="book-year">${escapeHtml(book.first_publish_year || '')}</div>
          </div>
        </div>
      `).join('');
    }
  });
}
