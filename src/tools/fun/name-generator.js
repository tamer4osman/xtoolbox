import { copyToClipboard } from "../../utils/clipboard.js";

export const NAME_DATA = {
  english: {
    male: [
      "James",
      "William",
      "Oliver",
      "Henry",
      "Thomas",
      "Daniel",
      "Matthew",
      "Jack",
      "Ryan",
      "Ethan",
      "Nathan",
      "Jacob",
      "Michael",
      "Alexander",
      "Benjamin",
      "Samuel",
      "David",
      "Joseph",
      "Charlie",
      "George",
      "Leo",
      "Oscar"
    ],
    female: [
      "Emma",
      "Olivia",
      "Sophia",
      "Isabella",
      "Charlotte",
      "Amelia",
      "Mia",
      "Harper",
      "Evelyn",
      "Abigail",
      "Emily",
      "Elizabeth",
      "Grace",
      "Chloe",
      "Victoria",
      "Hannah",
      "Zoe",
      "Lily",
      "Ella",
      "Ava",
      "Ruby",
      "Freya"
    ],
    surnames: [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Miller",
      "Davis",
      "Wilson",
      "Anderson",
      "Taylor",
      "Moore",
      "Martin",
      "Walker",
      "Hall",
      "Young",
      "King",
      "Wright",
      "Scott",
      "Green",
      "Baker",
      "Adams",
      "Nelson",
      "Hill",
      "Campbell"
    ]
  },
  spanish: {
    male: [
      "Alejandro",
      "Mateo",
      "Santiago",
      "Sebastián",
      "Diego",
      "Nicolás",
      "Miguel",
      "Javier",
      "Carlos",
      "Andrés",
      "Pablo",
      "Fernando",
      "Rafael",
      "Adrián",
      "Hugo",
      "Álvaro",
      "Mario",
      "Sergio",
      "Iker",
      "Rubén",
      "Bruno",
      "Gonzalo"
    ],
    female: [
      "María",
      "Lucía",
      "Sofía",
      "Valentina",
      "Carmen",
      "Camila",
      "Valeria",
      "Daniela",
      "Marta",
      "Paula",
      "Elena",
      "Sara",
      "Julia",
      "Alba",
      "Carla",
      "Nora",
      "Irene",
      "Andrea",
      "Laura",
      "Noa",
      "Vega",
      "Jimena"
    ],
    surnames: [
      "García",
      "Rodríguez",
      "Martínez",
      "López",
      "González",
      "Pérez",
      "Sánchez",
      "Ramírez",
      "Torres",
      "Flores",
      "Rivera",
      "Gómez",
      "Díaz",
      "Cruz",
      "Morales",
      "Reyes",
      "Gutiérrez",
      "Ortiz",
      "Ruiz",
      "Hernández",
      "Jiménez",
      "Álvarez",
      "Romero",
      "Alonso"
    ]
  },
  french: {
    male: [
      "Louis",
      "Gabriel",
      "Raphaël",
      "Arthur",
      "Jules",
      "Hugo",
      "Léo",
      "Adam",
      "Lucas",
      "Théo",
      "Tom",
      "Mathis",
      "Enzo",
      "Maxime",
      "Antoine",
      "Julien",
      "Clément",
      "Rémi",
      "Bastien",
      "Florian",
      "Damien",
      "Vincent"
    ],
    female: [
      "Jade",
      "Louise",
      "Alice",
      "Chloé",
      "Lina",
      "Léa",
      "Rose",
      "Anna",
      "Manon",
      "Inès",
      "Juliette",
      "Camille",
      "Zoé",
      "Eva",
      "Nina",
      "Margaux",
      "Céline",
      "Élise",
      "Maëlys",
      "Anaïs",
      "Clarisse",
      "Delphine"
    ],
    surnames: [
      "Martin",
      "Bernard",
      "Dubois",
      "Robert",
      "Richard",
      "Petit",
      "Durand",
      "Leroy",
      "Moreau",
      "Simon",
      "Laurent",
      "Lefebvre",
      "Michel",
      "Bertrand",
      "Roux",
      "Fournier",
      "Morel",
      "Girard",
      "Mercier",
      "Dupont",
      "Blanc",
      "Garnier",
      "Chevalier",
      "Faure"
    ]
  },
  german: {
    male: [
      "Lukas",
      "Leon",
      "Finn",
      "Jonas",
      "Paul",
      "Felix",
      "Luca",
      "Erik",
      "Max",
      "Julian",
      "Emil",
      "David",
      "Anton",
      "Jakob",
      "Moritz",
      "Niklas",
      "Tim",
      "Fabian",
      "Simon",
      "Tobias",
      "Matthias",
      "Stefan"
    ],
    female: [
      "Emma",
      "Hannah",
      "Sofia",
      "Mia",
      "Lina",
      "Ella",
      "Klara",
      "Lea",
      "Lena",
      "Marie",
      "Johanna",
      "Amelie",
      "Nele",
      "Frieda",
      "Ida",
      "Maja",
      "Alina",
      "Laura",
      "Greta",
      "Ronja",
      "Melina",
      "Franziska"
    ],
    surnames: [
      "Müller",
      "Schmidt",
      "Schneider",
      "Fischer",
      "Weber",
      "Meyer",
      "Wagner",
      "Becker",
      "Schulz",
      "Hoffmann",
      "Koch",
      "Bauer",
      "Richter",
      "Klein",
      "Wolf",
      "Schröder",
      "Neumann",
      "Braun",
      "Krüger",
      "Zimmermann",
      "Schmitt",
      "Hartmann",
      "Lange",
      "Werner"
    ]
  },
  italian: {
    male: [
      "Leonardo",
      "Francesco",
      "Alessandro",
      "Lorenzo",
      "Mattia",
      "Andrea",
      "Gabriele",
      "Riccardo",
      "Tommaso",
      "Edoardo",
      "Giuseppe",
      "Antonio",
      "Giovanni",
      "Marco",
      "Luca",
      "Davide",
      "Federico",
      "Simone",
      "Filippo",
      "Samuele",
      "Pietro",
      "Christian"
    ],
    female: [
      "Giulia",
      "Sofia",
      "Aurora",
      "Alice",
      "Ginevra",
      "Francesca",
      "Chiara",
      "Martina",
      "Valentina",
      "Elisa",
      "Alessia",
      "Giorgia",
      "Federica",
      "Beatrice",
      "Camilla",
      "Alessandra",
      "Silvia",
      "Serena",
      "Ilaria",
      "Noemi",
      "Gaia",
      "Rebecca"
    ],
    surnames: [
      "Rossi",
      "Russo",
      "Ferrari",
      "Esposito",
      "Bianchi",
      "Romano",
      "Colombo",
      "Ricci",
      "Marino",
      "Greco",
      "Bruno",
      "Gallo",
      "Conti",
      "De Luca",
      "Costa",
      "Giordano",
      "Mancini",
      "Rizzo",
      "Lombardi",
      "Moretti",
      "Barbieri",
      "Fontana",
      "Santoro",
      "Mariani"
    ]
  },
  japanese: {
    male: [
      "Haruto",
      "Yuto",
      "Sota",
      "Ren",
      "Yuki",
      "Hayato",
      "Riku",
      "Kaito",
      "Sora",
      "Hiroto",
      "Takumi",
      "Daiki",
      "Kenji",
      "Taro",
      "Hiroshi",
      "Akira",
      "Takeshi",
      "Shota",
      "Kenta",
      "Naoki",
      "Yuji",
      "Masaru"
    ],
    female: [
      "Sakura",
      "Hina",
      "Yuna",
      "Mei",
      "Yui",
      "Hana",
      "Mio",
      "Saki",
      "Nanami",
      "Ayane",
      "Misaki",
      "Riko",
      "Emi",
      "Yumi",
      "Keiko",
      "Akari",
      "Himari",
      "Momo",
      "Rina",
      "Asuka",
      "Chiyo",
      "Natsuki"
    ],
    surnames: [
      "Sato",
      "Suzuki",
      "Takahashi",
      "Tanaka",
      "Watanabe",
      "Ito",
      "Yamamoto",
      "Nakamura",
      "Kobayashi",
      "Kato",
      "Yoshida",
      "Yamada",
      "Sasaki",
      "Yamaguchi",
      "Matsumoto",
      "Inoue",
      "Kimura",
      "Hayashi",
      "Shimizu",
      "Okada",
      "Fujita",
      "Moriyama",
      "Ishikawa",
      "Nakagawa"
    ]
  },
  chinese: {
    male: [
      "Wei",
      "Jun",
      "Hao",
      "Lei",
      "Ming",
      "Yang",
      "Feng",
      "Kai",
      "Bo",
      "Chen",
      "Zhen",
      "Peng",
      "Qiang",
      "Tao",
      "Xu",
      "Jian",
      "Liang",
      "Zhong",
      "Guang",
      "Hong",
      "Sheng",
      "Yong"
    ],
    female: [
      "Mei",
      "Ling",
      "Xia",
      "Yun",
      "Fang",
      "Jing",
      "Lan",
      "Hua",
      "Xue",
      "Ying",
      "Yan",
      "Qiu",
      "Ping",
      "Rui",
      "Ting",
      "Jia",
      "Xin",
      "Yue",
      "Lin",
      "Shan",
      "Qing",
      "Zhi Lan"
    ],
    surnames: [
      "Wang",
      "Li",
      "Zhang",
      "Liu",
      "Chen",
      "Yang",
      "Huang",
      "Zhao",
      "Wu",
      "Zhou",
      "Xu",
      "Sun",
      "Ma",
      "Zhu",
      "Hu",
      "Guo",
      "He",
      "Lin",
      "Luo",
      "Zheng",
      "Liang",
      "Xie",
      "Song",
      "Han"
    ]
  },
  indian: {
    male: [
      "Aarav",
      "Vivaan",
      "Aditya",
      "Vihaan",
      "Arjun",
      "Reyansh",
      "Krishna",
      "Ishaan",
      "Shaurya",
      "Atharv",
      "Advik",
      "Kabir",
      "Aryan",
      "Dhruv",
      "Rohan",
      "Kartik",
      "Dev",
      "Ansh",
      "Rudra",
      "Yash",
      "Nikhil",
      "Varun"
    ],
    female: [
      "Saanvi",
      "Aadhya",
      "Aanya",
      "Diya",
      "Aarohi",
      "Anika",
      "Myra",
      "Ira",
      "Pari",
      "Anaya",
      "Navya",
      "Kiara",
      "Riya",
      "Priya",
      "Meera",
      "Tara",
      "Nisha",
      "Kavya",
      "Ishita",
      "Sana",
      "Aditi",
      "Nandini"
    ],
    surnames: [
      "Sharma",
      "Patel",
      "Singh",
      "Kumar",
      "Gupta",
      "Reddy",
      "Rao",
      "Mehta",
      "Kapoor",
      "Joshi",
      "Shah",
      "Verma",
      "Mishra",
      "Iyer",
      "Nair",
      "Das",
      "Bose",
      "Chopra",
      "Malhotra",
      "Desai",
      "Menon",
      "Bhatt",
      "Chauhan",
      "Pandey"
    ]
  },
  arabic: {
    male: [
      "Muhammad",
      "Ahmed",
      "Ali",
      "Omar",
      "Yusuf",
      "Khalid",
      "Ibrahim",
      "Hassan",
      "Hamza",
      "Tariq",
      "Karim",
      "Samir",
      "Faris",
      "Zaid",
      "Bilal",
      "Imran",
      "Malik",
      "Nabil",
      "Rayan",
      "Idris",
      "Sami",
      "Anwar"
    ],
    female: [
      "Fatima",
      "Aisha",
      "Layla",
      "Maryam",
      "Noor",
      "Zahra",
      "Amira",
      "Salma",
      "Yasmin",
      "Rania",
      "Hana",
      "Zainab",
      "Dalia",
      "Nadia",
      "Lina",
      "Amina",
      "Sumaya",
      "Farah",
      "Jamila",
      "Safia",
      "Inaya",
      "Kalila"
    ],
    surnames: [
      "Khan",
      "Hassan",
      "Ahmed",
      "Rahman",
      "Hussein",
      "Mohammed",
      "Saleh",
      "Farouk",
      "Aziz",
      "Hamid",
      "Khalil",
      "Mansour",
      "Nasser",
      "Said",
      "Sultan",
      "Darwish",
      "Habib",
      "Kamal",
      "Sabri",
      "Qureshi",
      "Abbasi",
      "Hashimi",
      "Amari",
      "Najjar"
    ]
  },
  nordic: {
    male: [
      "Lars",
      "Erik",
      "Magnus",
      "Olav",
      "Bjorn",
      "Anders",
      "Henrik",
      "Karl",
      "Nils",
      "Johan",
      "Sven",
      "Gustav",
      "Torsten",
      "Ragnar",
      "Leif",
      "Axel",
      "Emil",
      "Oskar",
      "Vidar",
      "Halvor",
      "Kjell",
      "Roald"
    ],
    female: [
      "Astrid",
      "Ingrid",
      "Freja",
      "Saga",
      "Sigrid",
      "Liv",
      "Solveig",
      "Runa",
      "Elin",
      "Maja",
      "Linnea",
      "Elsa",
      "Karin",
      "Kristin",
      "Hilde",
      "Tuva",
      "Selma",
      "Thea",
      "Siri",
      "Randi",
      "Vilma",
      "Svea"
    ],
    surnames: [
      "Hansen",
      "Johansen",
      "Olsen",
      "Larsen",
      "Andersen",
      "Pedersen",
      "Nilsen",
      "Kristiansen",
      "Jensen",
      "Karlsen",
      "Johnsen",
      "Pettersen",
      "Eriksen",
      "Berg",
      "Haugen",
      "Hagen",
      "Andreassen",
      "Jacobsen",
      "Dahl",
      "Halvorsen",
      "Henriksen",
      "Lund",
      "Sørensen",
      "Aas"
    ]
  },
  fantasy: {
    male: [
      "Aldric",
      "Theron",
      "Kaelen",
      "Draven",
      "Corvin",
      "Orin",
      "Balthus",
      "Rowan",
      "Cassian",
      "Evander",
      "Lucian",
      "Merrick",
      "Sylvan",
      "Thaddeus",
      "Ulric",
      "Varian",
      "Alaric",
      "Dorian",
      "Fenris",
      "Gideon",
      "Osric",
      "Perrin"
    ],
    female: [
      "Elowen",
      "Seraphina",
      "Lyra",
      "Isolde",
      "Ravenna",
      "Celestine",
      "Morgana",
      "Aurelia",
      "Thalia",
      "Ophelia",
      "Rosalind",
      "Elara",
      "Vivienne",
      "Maribel",
      "Kestra",
      "Sylvara",
      "Lirael",
      "Faelan",
      "Briony",
      "Cressida",
      "Maeve",
      "Sabine"
    ],
    surnames: [
      "Stormwind",
      "Ravencrest",
      "Ironvale",
      "Duskbloom",
      "Thornheart",
      "Winterbourne",
      "Ashgrove",
      "Silvermoor",
      "Nightshade",
      "Brightwater",
      "Frostbane",
      "Hollowbrook",
      "Moonwhisper",
      "Grimward",
      "Starfell",
      "Blackbriar",
      "Goldleaf",
      "Shadowmere",
      "Stonebrook",
      "Mistvale",
      "Emberly",
      "Wyndham",
      "Firelight",
      "Cloudmere"
    ]
  },
  scifi: {
    male: [
      "Kael",
      "Orion",
      "Zephyr",
      "Dax",
      "Rylan",
      "Jaxon",
      "Kyros",
      "Axton",
      "Zorin",
      "Talon",
      "Kiro",
      "Caspian",
      "Jericho",
      "Onyx",
      "Quill",
      "Tek",
      "Vance",
      "Xander",
      "Zenith",
      "Corvid",
      "Drax",
      "Solon"
    ],
    female: [
      "Nova",
      "Andromeda",
      "Luna",
      "Vega",
      "Celeste",
      "Astra",
      "Nebula",
      "Lyric",
      "Juno",
      "Calypso",
      "Electra",
      "Halo",
      "Kepler",
      "Prism",
      "Sirius",
      "Vela",
      "Io",
      "Titania",
      "Cosma",
      "Umbriel",
      "Solaria",
      "Astrea"
    ],
    surnames: [
      "Starkiller",
      "Voidwalker",
      "Starweaver",
      "Quantum",
      "Hyperion",
      "Astroforge",
      "Lunaris",
      "Photon",
      "Graviton",
      "Pulsar",
      "Singularity",
      "Warpfield",
      "Ionblade",
      "Cryostar",
      "Zenithar",
      "Orbitus",
      "Stellaris",
      "Chronos",
      "Novastorm",
      "Aetherion",
      "Helix",
      "Vectoris",
      "Cygnus",
      "Parallax"
    ]
  }
};

export const CULTURES = Object.keys(NAME_DATA);

export function pickRandom(list) {
  if (!Array.isArray(list) || list.length === 0) return null;
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return list[buf[0] % list.length];
}

export function generateNames({ culture = "english", gender = "any", count = 6 } = {}) {
  const set = NAME_DATA[culture];
  if (!set) return [];
  const pool =
    gender === "male" ? set.male : gender === "female" ? set.female : [...set.male, ...set.female];
  const total = Math.max(1, Math.min(20, count | 0));
  const names = new Set();
  let guard = total * 30;
  while (names.size < total && guard-- > 0) {
    const first = pickRandom(pool);
    const last = pickRandom(set.surnames);
    if (!first || !last) break;
    names.add(`${first} ${last}`);
  }
  return [...names];
}

export const toolConfig = {
  id: "name-generator",
  name: "Name Generator",
  category: "fun",
  description: "Generate random names by culture, gender, or style.",
  icon: "🎲",
  accept: null,
  maxSizeMB: null,
  keywords: ["name", "random", "generate", "baby", "character"],
  steps: ["Choose culture and gender", "Set how many names to generate", "Click a name to copy it"],
  faqs: [
    {
      question: "Where do the names come from?",
      answer:
        "Curated lists of real first names and surnames per culture, plus fantasy and sci-fi pools for fiction. Everything is stored locally in your browser."
    },
    {
      question: "Can I use these names commercially?",
      answer:
        "Yes. The generator only combines existing common words and names, so results are yours to use freely."
    }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <h1>🎲 ${toolConfig.name}</h1>
      <p>${toolConfig.description}</p>
      <div class="ng-controls">
        <label for="ng-culture">Culture</label>
        <select id="ng-culture"></select>
        <label for="ng-gender">Gender</label>
        <select id="ng-gender">
          <option value="any">Any</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <label for="ng-count">Count</label>
        <input type="number" id="ng-count" min="1" max="20" value="6">
        <button id="ng-generate" class="btn btn-primary">Generate</button>
        <button id="ng-copy-all" class="btn btn-secondary hidden">Copy All</button>
      </div>
      <div id="ng-results" class="ng-results" aria-live="polite"></div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .ng-controls { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center; margin: var(--space-4) 0; }
    .ng-controls label { font-weight: 600; font-size: var(--text-sm); }
    .ng-controls select, .ng-controls input { padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .ng-controls input { width: 70px; }
    .hidden { display: none; }
    .ng-results { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-4); min-height: 60px; }
    .ng-chip {
      background: var(--color-surface); border: 1px solid var(--color-border);
      border-radius: var(--radius-lg); padding: var(--space-2) var(--space-3);
      cursor: pointer; transition: border-color 0.15s ease;
      font-size: var(--text-base);
    }
    .ng-chip:hover { border-color: var(--color-primary); }
    .ng-empty { color: var(--color-text-muted, #888); }
  `;
  container.appendChild(style);

  const cultureSelect = container.querySelector("#ng-culture");
  const genderSelect = container.querySelector("#ng-gender");
  const countInput = container.querySelector("#ng-count");
  const generateBtn = container.querySelector("#ng-generate");
  const copyAllBtn = container.querySelector("#ng-copy-all");
  const results = container.querySelector("#ng-results");

  CULTURES.forEach(c => {
    const label = c.charAt(0).toUpperCase() + c.slice(1);
    cultureSelect.appendChild(new Option(label, c));
  });

  results.innerHTML = `<span class="ng-empty">Pick your options and hit Generate.</span>`;

  async function renderNames() {
    const count = Math.max(1, Math.min(20, parseInt(countInput.value, 10) || 6));
    countInput.value = String(count);
    try {
      const names = generateNames({
        culture: cultureSelect.value,
        gender: genderSelect.value,
        count
      });
      if (!names.length) {
        results.innerHTML = `<span class="ng-empty">Could not generate names — try again.</span>`;
        return;
      }
      copyAllBtn.classList.remove("hidden");
      results.innerHTML = names
        .map(
          n =>
            `<button type="button" class="ng-chip" data-name="${n}" title="Click to copy">${n}</button>`
        )
        .join("");
    } catch {
      results.innerHTML = `<span class="ng-empty">Something went wrong — please try again.</span>`;
    }
  }

  results.addEventListener("click", async e => {
    const chip = e.target.closest(".ng-chip");
    if (!chip) return;
    await copyToClipboard(chip.dataset.name);
    const original = chip.textContent;
    chip.textContent = "Copied!";
    setTimeout(() => {
      chip.textContent = original;
    }, 900);
  });

  copyAllBtn.addEventListener("click", async () => {
    const names = [...results.querySelectorAll(".ng-chip")].map(c => c.dataset.name);
    await copyToClipboard(names.join("\n"));
    const original = copyAllBtn.textContent;
    copyAllBtn.textContent = "Copied!";
    setTimeout(() => {
      copyAllBtn.textContent = original;
    }, 900);
  });

  generateBtn.addEventListener("click", renderNames);

  [cultureSelect, genderSelect].forEach(el => el.addEventListener("change", renderNames));
}
