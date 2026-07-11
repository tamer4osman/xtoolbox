const fs = require("fs");

const raw = fs.readFileSync("./tools.json", "utf8");
const json = JSON.parse(raw);

console.log("Current tools count:", json.length);

// Add coin-flip
json.push({
  id: "coin-flip",
  name: "Coin Flip",
  category: "fun",
  description: "Flip a coin. Heads or tails?",
  icon: "🪙",
  href: "/tools/coin-flip",
  keywords: ["coin flip", "heads tails", "random coin"],
  accept: null,
  maxSizeMB: null,
  status: "done"
});

// Add dice-roller
json.push({
  id: "dice-roller",
  name: "Dice Roller",
  category: "fun",
  description: "Roll dice. Choose 1-6 dice with random results.",
  icon: "🎲",
  href: "/tools/dice-roller",
  keywords: ["dice roller", "roll dice", "random dice"],
  accept: null,
  maxSizeMB: null,
  status: "done"
});

// Add random-picker
json.push({
  id: "random-picker",
  name: "Random Picker",
  category: "fun",
  description: "Pick random names from a list. Great for giveaways.",
  icon: "🎯",
  href: "/tools/random-picker",
  keywords: ["random picker", "random selector", "name picker", "raffle"],
  accept: null,
  maxSizeMB: null,
  status: "done"
});

fs.writeFileSync("./tools.json", JSON.stringify(json, null, 2));
console.log("New tools count:", json.length);
console.log("Done!");
