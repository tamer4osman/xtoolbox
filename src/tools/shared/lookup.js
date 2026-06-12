import { escapeHtml } from '../../utils/dom.js';

export { escapeHtml };

export function wireLookupSearch({
  container,
  searchButtonId = 'search-btn',
  inputSelector = 'input',
  loadingId = 'loading',
  resultId = 'result',
  errorId = 'error',
  onSearch,
  validate,
  errorMessage = 'Search failed. Please try again.'
}) {
  const searchBtn = container.querySelector(`#${searchButtonId}`);
  const inputs = container.querySelectorAll(inputSelector);
  const loading = container.querySelector(`#${loadingId}`);
  const result = container.querySelector(`#${resultId}`);
  const error = container.querySelector(`#${errorId}`);

  function readInputs() {
    const values = {};
    inputs.forEach((input, i) => {
      values[input.id || `input${i}`] = input.value;
    });
    return values;
  }

  function showLoading() {
    if (result) result.classList.add('hidden');
    if (error) error.classList.add('hidden');
    if (loading) loading.classList.remove('hidden');
  }

  function showResult() {
    if (result) result.classList.remove('hidden');
    if (error) error.classList.add('hidden');
  }

  function showError(message) {
    if (error) {
      error.textContent = message;
      error.classList.remove('hidden');
    }
    if (result) result.classList.add('hidden');
  }

  function hideLoading() {
    if (loading) loading.classList.add('hidden');
  }

  async function runSearch() {
    const values = readInputs();

    if (validate) {
      const validationError = validate(values);
      if (validationError) {
        showError(validationError);
        return;
      }
    }

    showLoading();
    try {
      await onSearch(values);
      showResult();
    } catch (e) {
      console.error('Lookup error:', e);
      showError(errorMessage);
    } finally {
      hideLoading();
    }
  }

  if (searchBtn) searchBtn.addEventListener('click', runSearch);
  inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') runSearch();
    });
  });

  return { runSearch, readInputs, showResult, showError, showLoading, hideLoading };
}
