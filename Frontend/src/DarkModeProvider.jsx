import { createContext, useContext, useEffect, useState } from 'react';

const DarkCtx = createContext(null);
export const useDark = () => useContext(DarkCtx);

export function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', String(dark));
    const root = document.documentElement;
    if (dark) {
      root.setAttribute('data-theme', 'dark');
      root.style.setProperty('--page-bg', 'linear-gradient(160deg,#1A1410,#201810)');
      root.style.setProperty('--card-bg', 'linear-gradient(160deg,#221C14,#1E180E)');
      root.style.setProperty('--card-border', '#3A2E1E');
      root.style.setProperty('--text-primary', '#F5E8C8');
      root.style.setProperty('--text-secondary', '#C0A870');
      root.style.setProperty('--input-bg', '#1E180E');
      root.style.setProperty('--input-border', '#3A2E1E');
    } else {
      root.removeAttribute('data-theme');
      root.style.removeProperty('--page-bg');
      root.style.removeProperty('--card-bg');
      root.style.removeProperty('--card-border');
      root.style.removeProperty('--text-primary');
      root.style.removeProperty('--text-secondary');
      root.style.removeProperty('--input-bg');
      root.style.removeProperty('--input-border');
    }
  }, [dark]);

  return (
    <DarkCtx.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </DarkCtx.Provider>
  );
}

// ── Standalone toggle button — drop into Navbar ───────────────────────────────
export function DarkModeToggle() {
  const { dark, toggle } = useDark();
  return (
    <button onClick={toggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: 36, height: 36,
        background: dark ? 'rgba(255,232,180,0.12)' : 'rgba(0,0,0,0.06)',
        border: dark ? '1px solid rgba(255,232,180,0.2)' : '1px solid #E0CFA8',
        borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
      }}>
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5E8C8" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7A6040" strokeWidth="1.8" strokeLinecap="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      )}
    </button>
  );
}
