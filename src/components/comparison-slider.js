/**
 * Create a before/after image comparison slider
 */
export function createComparisonSlider({ beforeSrc, afterSrc, beforeLabel = 'Original', afterLabel = 'Result' }) {
  const container = document.createElement('div');
  container.className = 'comparison-slider';
  container.innerHTML = `
    <div class="comparison-container">
      <div class="comparison-before">
        <img src="${beforeSrc}" alt="${beforeLabel}">
        <span class="comparison-label comparison-label-before">${beforeLabel}</span>
      </div>
      <div class="comparison-after">
        <img src="${afterSrc}" alt="${afterLabel}">
        <span class="comparison-label comparison-label-after">${afterLabel}</span>
      </div>
      <div class="comparison-handle">
        <div class="comparison-handle-line"></div>
        <div class="comparison-handle-circle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 4l-6 8 6 8"/>
            <path d="M16 4l6 8-6 8"/>
          </svg>
        </div>
      </div>
    </div>
  `;

  const afterDiv = container.querySelector('.comparison-after');
  const handle = container.querySelector('.comparison-handle');
  let isDragging = false;

  function updatePosition(x) {
    const rect = container.getBoundingClientRect();
    let percent = ((x - rect.left) / rect.width) * 100;
    percent = Math.max(0, Math.min(100, percent));
    afterDiv.style.clipPath = `inset(0 0 0 ${percent}%)`;
    handle.style.left = `${percent}%`;
  }

  handle.addEventListener('mousedown', (e) => { isDragging = true; e.preventDefault(); });
  document.addEventListener('mousemove', (e) => { if (isDragging) updatePosition(e.clientX); });
  document.addEventListener('mouseup', () => { isDragging = false; });

  handle.addEventListener('touchstart', (e) => { isDragging = true; e.preventDefault(); });
  document.addEventListener('touchmove', (e) => { if (isDragging) updatePosition(e.touches[0].clientX); });
  document.addEventListener('touchend', () => { isDragging = false; });

  container.addEventListener('click', (e) => {
    if (e.target.closest('.comparison-handle')) return;
    updatePosition(e.clientX);
  });

  requestAnimationFrame(() => {
    updatePosition(container.getBoundingClientRect().left + container.getBoundingClientRect().width / 2);
  });

  return container;
}
