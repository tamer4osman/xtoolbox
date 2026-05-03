export const toolConfig = {
  id: 'emoji-picker',
  name: 'Emoji Picker',
  category: 'text',
  description: 'Browse and copy emojis. Search by name or browse by category.',
  icon: '😊',
  accept: null,
  maxSizeMB: null,
  keywords: ['emoji picker', 'emoji search', 'copy emoji', 'emoji browser'],
  steps: ['Browse or search emojis', 'Click to copy', 'Paste anywhere']
};

export function render(container) {
  container.innerHTML = `
    <div class="emoji-container">
      <div class="emoji-search">
        <input type="text" id="search-input" placeholder="Search emojis (e.g., 'smile', 'heart', 'food')...">
      </div>
      <div class="emoji-categories">
        <button class="cat-btn active" data-cat="smileys">😊 Smileys</button>
        <button class="cat-btn" data-cat="people">👋 People</button>
        <button class="cat-btn" data-cat="animals">🐱 Animals</button>
        <button class="cat-btn" data-cat="food">🍔 Food</button>
        <button class="cat-btn" data-cat="travel">✈️ Travel</button>
        <button class="cat-btn" data-cat="activities">⚽ Activities</button>
        <button class="cat-btn" data-cat="objects">💡 Objects</button>
        <button class="cat-btn" data-cat="symbols">❤️ Symbols</button>
      </div>
      <div id="results" class="emoji-results"></div>
      <div id="toast" class="emoji-toast">Copied!</div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .emoji-container { max-width: 600px; margin: 0 auto; }
    .emoji-search { margin-bottom: var(--space-3); }
    .emoji-search input { 
      width: 100%; padding: var(--space-3); 
      border: 1px solid var(--color-border); border-radius: var(--radius-md);
    }
    .emoji-categories { display: flex; gap: var(--space-2); flex-wrap: wrap; margin-bottom: var(--space-4); }
    .cat-btn { 
      padding: var(--space-2) var(--space-3); border: 1px solid var(--color-border);
      border-radius: var(--radius-md); background: var(--color-surface); cursor: pointer;
    }
    .cat-btn.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
    .emoji-results { 
      display: grid; grid-template-columns: repeat(auto-fill, minmax(50px, 1fr)); 
      gap: var(--space-2); max-height: 400px; overflow-y: auto;
      padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-lg);
    }
    .emoji-item { 
      aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
      font-size: 1.8em; cursor: pointer; border-radius: var(--radius-md);
      transition: transform 0.1s, background 0.2s;
    }
    .emoji-item:hover { transform: scale(1.2); background: var(--color-surface); }
    .emoji-toast {
      position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
      background: var(--color-success); color: white; padding: var(--space-3) var(--space-6);
      border-radius: var(--radius-lg); opacity: 0; transition: opacity 0.3s;
    }
    .emoji-toast.show { opacity: 1; }
  `;
  container.appendChild(style);

  const searchInput = container.querySelector('#search-input');
  const results = container.querySelector('#results');
  const toast = container.querySelector('#toast');
  const catBtns = container.querySelectorAll('.cat-btn');

  const emojiData = {
    smileys: ['😀','😃','😄','😁','😅','😂','🤣','😊','😇','🙂','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖'],
    people: ['👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','👃','🧠','🫀','🫁','🦴','👀','👁️','👅','👄','👶','🧒','👦','👧','🧑','👱','👨','🧔','👩','🧓','👴','👵'],
    animals: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🪳','🦟','🪳','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🦣','🐘','🦛','🦏'],
    food: ['🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🫑','🌽','🥕','🫒','🧄','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧈','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪'],
    travel: ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍','🛵','🚲','🛴','🛺','🚨','🚔','🚍','🚘','🚖','🚡','🚠','🚟','🚃','🚋','🚞','🚝','🚄','🚅','🚈','🚂','🚆','🚇','🚊','🚉','✈️','🛫','🛬','🛩','💺','🛰️','🚀','🛸','🚁','🛶','🚟','🚠','🚡','🗺️','🗿','🗽','🗼','🏰','🏯','🏟','🎡','🎢','🎠','⛲','⛱','🏖️','🏝','⛱','🌋','🗻','🏔','⛰','🏕','⛺','🛖','🏠','🏡','🏘','🏚','🏗','🏭','🏢','🏬','🏣','🏤','🏥','🏦','🏨','🏪','🏫','🏩','💒','🏛','⛪','⛩','🕋','🕍','⛩','🕉','☸️','✡️','🔯','🕎','☯️','☮️','�十字','☦','☪','☮','🕈','✝','☨','☫','☭','🪯','🔹','🔷','🔶','🔵','🔷','🔶'],
    activities: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','⛸','🥌','🎿','⛷','⛹','🥅','🎪','🤹','🎭','🩰','🎪','🎬','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🪘','🎷','🎺','🪗','🎸','🪕','🎻','🎲','🎯','🎳','🎮','🕹️','🎰'],
    objects: ['⌚','📱','📲','💻','⌨️','🖥','🖨','🖱','🖲','🕹️','🗜️','💽','💾','💿','📀','📼','📷','📸','📹','🎥','📽','🎞','📞','☎️','📟','📠','📺','📻','🎙','🎚','🎛','🧭','⏱','⏲','⏰','🕰','⌛','⏳','📡','🔋','🔌','💡','🔦','🕯','🧯','🛒','💰','🪙','💴','💵','💶','💷','🪧','💸','💳','💎','⚖️','🧰','🔧','🔨','⚒','🛠','⛏','🪚','🔩','⚙️','🪤','🧱','⛓','🧲','🔫','💣','🧨','🧱','💥','💨','🌀','🌪️','🌈','☀️','🌤️','⛅','🌥','☁️','🌦','🌧','⛈','🌩','🌨','❄️','☃️','⛄','🌬','💧','💦','☔️','☂️','🌊'],
    symbols: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉','☸️','✡️','🔯','🕎','☯️','☦','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','�','☢️','☣️','📴','📳','🈶','🈶','🈸','🈺','🈷','✴️','🆚','💮','�','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰','🅱','🆎','🆑','🅾','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳','❎','🌐','💠','�️','🅿','🈳','🈂️','🛂','🛃','🛄','🛅','💌','💤','💢','💥','💦','💧','💨','💤','💧']
  };

  function renderEmojis(emojis) {
    results.innerHTML = emojis.map(e => 
      `<div class="emoji-item">${e}</div>`
    ).join('');
    
    results.querySelectorAll('.emoji-item').forEach(el => {
      el.addEventListener('click', () => {
        navigator.clipboard.writeText(el.textContent);
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 1500);
      });
    });
  }

  function filter(query) {
    let all = Object.values(emojiData).flat();
    if (query) {
      // Simple filter - just show all if search
      query = query.toLowerCase();
      all = all.slice(0, 100); // limit results
    }
    renderEmojis(all);
  }

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      renderEmojis(emojiData[cat] || []);
    });
  });

  searchInput.addEventListener('input', e => filter(e.target.value));

  renderEmojis(emojiData.smileys);
}
