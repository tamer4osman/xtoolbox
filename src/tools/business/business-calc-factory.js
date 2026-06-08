const CALC_STYLES = `
  .biz-container { max-width: 400px; margin: 0 auto; text-align: center; }
  .biz-container h2 { margin-bottom: var(--space-4); }
  .biz-container input { width: 100%; padding: var(--space-3); margin-bottom: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-lg); text-align: center; }
  .biz-result { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); }
  .biz-result div { margin-bottom: var(--space-2); }
  .biz-result strong { color: var(--color-primary); font-size: var(--text-xl); }
`;

export function initBusinessCalc(container, { title, inputs, resultHTML, calc }) {
  container.innerHTML = `
    <div class="biz-container">
      <h2>${title}</h2>
      ${inputs.map(i => `<input type="number" id="${i.id}" placeholder="${i.placeholder}" value="${i.value}">`).join('')}
      <div class="biz-result">${resultHTML}</div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = CALC_STYLES;
  container.appendChild(style);

  function update() {
    const get = (id) => parseFloat(container.querySelector(`#${id}`).value) || 0;
    calc({ get, el: (id) => container.querySelector(`#${id}`) });
  }

  container.querySelectorAll('input').forEach(i => i.addEventListener('input', update));
  update();
}
