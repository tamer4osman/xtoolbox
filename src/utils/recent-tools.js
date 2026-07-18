const STORAGE_KEY = "xtoolbox-recent-tools";
const MAX_RECENT = 8;

export function getRecentTools() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentTool(toolId) {
  const recent = getRecentTools().filter(id => id !== toolId);
  recent.unshift(toolId);
  if (recent.length > MAX_RECENT) recent.length = MAX_RECENT;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
  } catch {
    // localStorage full or blocked — silently ignore
  }
}

export function clearRecentTools() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
