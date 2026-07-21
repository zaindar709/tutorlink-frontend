import { useCallback, useEffect, useState } from 'react';
import type { ThemeMode } from '../types/parent.types';

const STORAGE_KEY = 'tl-parent-theme';

const getSystemTheme = (): 'light' | 'dark' =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const applyTheme = (mode: ThemeMode) => {
  const resolved = mode === 'system' ? getSystemTheme() : mode;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
};

export const initTheme = () => {
  const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? 'light';
  applyTheme(stored);
};

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? 'light';
  });

  const setTheme = useCallback((mode: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    setThemeState(mode);
    applyTheme(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    setTheme(resolved === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const resolvedTheme =
    theme === 'system' ? getSystemTheme() : theme;

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return { theme, setTheme, toggleTheme, resolvedTheme };
}
