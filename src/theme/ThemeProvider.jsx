// New file: ThemeProvider that reads/writes theme preference (supports chrome.storage when available, falls back to localStorage)
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext();
const THEME_KEY = 'themePreference'; // values: 'dark' | 'light' | 'system'

function readStoredTheme() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      // will be read asynchronously in effect; return undefined for initial render
      return undefined;
    }
    return localStorage.getItem(THEME_KEY) || 'system';
  } catch (e) {
    return 'system';
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => readStoredTheme());

  const applyTheme = useCallback((t) => {
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = t === 'dark' || (t === 'system' && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  // Load stored value from chrome.storage.sync when available
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get([THEME_KEY], (items) => {
        const t = items[THEME_KEY] || 'system';
        setThemeState(t);
        applyTheme(t);
      });
    } else {
      // already initialized from localStorage in readStoredTheme
      applyTheme(theme || 'system');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch for OS theme changes when in 'system' mode
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') applyTheme('system');
    };
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, [theme, applyTheme]);

  const setTheme = (t) => {
    setThemeState(t);
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        const obj = {};
        obj[THEME_KEY] = t;
        chrome.storage.sync.set(obj);
      } else {
        localStorage.setItem(THEME_KEY, t);
      }
    } catch (e) {
      // ignore
    }
    applyTheme(t);
  };

  const resolved = (function () {
    if (theme === 'system') {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    }
    return theme || 'light';
  })();

  return (
    <ThemeContext.Provider value={{ theme: theme || 'system', setTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

