export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'theme';
const DEFAULT_THEME: Theme = 'dark';

const listeners = new Set<() => void>();

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : DEFAULT_THEME;
  } catch {
    // Storage can be blocked (private mode); the default is fine.
    return DEFAULT_THEME;
  }
}

let current: Theme = readStoredTheme();

function applyToDocument(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

// Called before the first render so the page never flashes the wrong theme.
export function initTheme() {
  applyToDocument(current);
}

export function getTheme(): Theme {
  return current;
}

export function setTheme(theme: Theme) {
  current = theme;
  applyToDocument(theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Not persisting is acceptable; the choice still holds for this visit.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeToTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
