import { useState, useEffect, createContext, useContext, useCallback } from 'react';

// ── Toast Context ─────────────────────────────────────────────────────────────
const ToastCtx = createContext(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

const ICONS = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
};

const COLORS = {
  success: { bg: '#EAF3DE', border: '#97C459', color: '#27500A', icon: '#3B6D11' },
  error:   { bg: '#FCEBEB', border: '#F09595', color: '#501313', icon: '#A32D2D' },
  info:    { bg: '#E6F1FB', border: '#85B7EB', color: '#042C53', icon: '#185FA5' },
  warning: { bg: '#FAEEDA', border: '#FAC775', color: '#412402', icon: '#854F0B' },
};

const GL = `
  @keyframes toastIn{from{opacity:0;transform:translateX(120%)}to{opacity:1;transform:translateX(0)}}
  @keyframes toastOut{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(120%)}}
  .toast-item{animation:toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both}
  .toast-item.leaving{animation:toastOut 0.25s ease both}
`;

function ToastItem({ toast, onRemove }) {
  const c = COLORS[toast.type] || COLORS.info;
  return (
    <div className={`toast-item${toast.leaving ? ' leaving' : ''}`} style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 12, padding: '12px 16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      maxWidth: 340, minWidth: 260,
      fontFamily: "'Lato', sans-serif",
    }}>
      <span style={{ color: c.icon, flexShrink: 0, marginTop: 1 }}>{ICONS[toast.type]}</span>
      <span style={{ flex: 1, fontSize: 13, color: c.color, lineHeight: 1.5 }}>{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: c.icon, opacity: 0.6, padding: '0 2px', flexShrink: 0, lineHeight: 1,
      }}>×</button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(t => t.map(x => x.id === id ? { ...x, leaving: true } : x));
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 280);
  }, []);

  const show = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type, leaving: false }]);
    if (duration > 0) setTimeout(() => remove(id), duration);
    return id;
  }, [remove]);

  const toast = {
    success: (msg, dur) => show(msg, 'success', dur),
    error:   (msg, dur) => show(msg, 'error',   dur),
    info:    (msg, dur) => show(msg, 'info',     dur),
    warning: (msg, dur) => show(msg, 'warning',  dur),
  };

  return (
    <ToastCtx.Provider value={toast}>
      <style>{GL}</style>
      {children}
      {/* Toast container — fixed top-right */}
      <div style={{
        position: 'fixed', top: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 10,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
