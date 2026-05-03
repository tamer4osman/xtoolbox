export function render(container) {
  container.innerHTML = `
    <div class="calc-container">
      <div class="calc-form">
        <div class="form-group">
          <label>Birth Date</label>
          <input type="date" id="birth-date" />
        </div>
        <button id="calc-btn" class="calc-button">Calculate Age</button>
      </div>
      <div id="result" class="result hidden">
        <div class="age-display">
          <div class="age-years" id="years">0</div>
          <div class="age-label">years old</div>
        </div>
        <div class="age-details">
          <div class="detail-item">
            <div class="detail-value" id="months">0</div>
            <div class="detail-label">months</div>
          </div>
          <div class="detail-item">
            <div class="detail-value" id="days">0</div>
            <div class="detail-label">days</div>
          </div>
        </div>
        <div class="birthday-info" id="birthday-info"></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .calc-container { max-width: 400px; margin: 0 auto; }
    .calc-container h2 { text-align: center; margin-bottom: var(--space-6); }
    .calc-form { background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-xl); margin-bottom: var(--space-6); }
    .form-group { margin-bottom: var(--space-4); }
    .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; }
    .form-group input { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .calc-button { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .result { background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-xl); text-align: center; }
    .age-display { margin-bottom: var(--space-6); }
    .age-years { font-size: 4rem; font-weight: 700; line-height: 1; }
    .age-label { font-size: var(--text-lg); color: var(--color-text-secondary); }
    .age-details { display: flex; justify-content: center; gap: var(--space-8); margin-bottom: var(--space-4); }
    .detail-item { text-align: center; }
    .detail-value { font-size: var(--text-2xl); font-weight: 600; }
    .detail-label { font-size: var(--text-sm); color: var(--color-text-muted); }
    .birthday-info { background: var(--color-bg); padding: var(--space-3); border-radius: var(--radius-lg); font-size: var(--text-sm); }
    .hidden { display: none; }
  `;
  container.appendChild(style);

  const zodiac = [
    'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 
    'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn'
  ];
  const zodiacIcons = ['♑', '♒', '♓', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑'];

  container.querySelector('#calc-btn').addEventListener('click', () => {
    const birth = new Date(container.querySelector('#birth-date').value);
    const now = new Date();
    
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    
    if (days < 0) { months--; days += 30; }
    if (months < 0) { years--; months += 12; }
    
    const totalDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
    const nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday < now) nextBirthday.setFullYear(now.getFullYear() + 1);
    const daysToBirthday = Math.ceil((nextBirthday - now) / (1000 * 60 * 60 * 24));
    
    const birthMonth = birth.getMonth();
    const zodiacIdx = birthMonth + (birth.getDate() > 20 ? 1 : 0);
    
    container.querySelector('#years').textContent = years;
    container.querySelector('#months').textContent = months;
    container.querySelector('#days').textContent = days;
    container.querySelector('#birthday-info').textContent = 
      `Zodiac: ${zodiac[zodiacIdx]} ${zodiacIcons[zodiacIdx]} | Next birthday in ${daysToBirthday} days`;
    container.querySelector('#result').classList.remove('hidden');
  });

}
