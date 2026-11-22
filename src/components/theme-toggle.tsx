'use client';

import { useEffect } from 'react';

const storageKey = 'gearharbor-theme';

export function ThemeSync() {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      let saved: string | null = null;
      try { saved = localStorage.getItem(storageKey); } catch { /* Storage may be disabled. */ }
      document.documentElement.dataset.theme = saved === 'light' || saved === 'dark' ? saved : media.matches ? 'dark' : 'light';
    };
    const onStorage = (event: StorageEvent) => { if (event.key === storageKey || event.key === null) sync(); };
    sync();
    media.addEventListener('change', sync);
    window.addEventListener('storage', onStorage);
    return () => {
      media.removeEventListener('change', sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  return null;
}

export function ThemeToggle() {
  function toggleTheme() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(storageKey, next); } catch { /* Keep the toggle usable without storage. */ }
  }
  return <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Toggle light and dark theme" title="Toggle light and dark theme">
    <svg className="theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20.8 13a9 9 0 0 1-9.8-9.8A9 9 0 1 0 20.8 13Z"/></svg>
    <svg className="theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>
    <span className="theme-moon">Dark</span><span className="theme-sun">Light</span>
  </button>;
}
