import { $ } from '../utils/dom.js';

export function renderNotFound() {
  const main = $('#main-content');
  main.innerHTML = `
    <div class="container">
      <div class="error-page">
        <h1>404 — Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="#/" class="btn btn-primary">Go to Homepage</a>
      </div>
    </div>
  `;
}
