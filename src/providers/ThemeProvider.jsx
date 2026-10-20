import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export const THEME_STORAGE_KEY = 'edurock-theme';
const ThemeContext = createContext(null);

const systemTheme = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

function readPreference() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    /* storage blocked (private mode) */
  }
  return 'system';
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(readPreference);
  const [system, setSystem] = useState(systemTheme);
  const resolved = preference === 'system' ? system : preference;

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystem(media.matches ? 'dark' : 'light');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    // Briefly disable transitions so the whole UI swaps colours in one frame.
    root.classList.add('theme-switching');
    root.setAttribute('data-theme', resolved);
    root.style.colorScheme = resolved;
    const id = requestAnimationFrame(() => root.classList.remove('theme-switching'));
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      /* ignore */
    }
    return () => cancelAnimationFrame(id);
  }, [preference, resolved]);

  const value = useMemo(
    () => ({
      preference,
      resolved,
      setPreference,
      toggleTheme: () => setPreference(resolved === 'dark' ? 'light' : 'dark'),
    }),
    [preference, resolved],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
