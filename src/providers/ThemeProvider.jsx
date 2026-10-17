import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export const THEME_STORAGE_KEY = 'edurock-theme';

const ThemeContext = createContext(null);

export function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function readThemePreference() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    /* Storage can be blocked in private browsing. */
  }
  return 'system';
}

function applyResolvedTheme(theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(readThemePreference);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  const resolved = preference === 'system' ? systemTheme : preference;

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemTheme(media.matches ? 'dark' : 'light');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    applyResolvedTheme(resolved);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      /* Ignore storage failures and keep the in-memory choice. */
    }
  }, [preference, resolved]);

  const setPreference = (next) => {
    if (next === 'light' || next === 'dark' || next === 'system') {
      setPreferenceState(next);
    }
  };

  const toggleTheme = () => {
    setPreferenceState(resolved === 'dark' ? 'light' : 'dark');
  };

  const value = useMemo(
    () => ({ preference, resolved, setPreference, toggleTheme }),
    [preference, resolved]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
