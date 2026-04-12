import { useState, useEffect, createContext, useContext, useCallback } from 'react';

// ── Toast Context ─────────────────────────────────────────────────────────────
const ToastCtx = createContext(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

// ── Inline Alert Component (exported for use in forms) ────────────────────────
export function Alert({ type = 'error', message, onClose, style = {} }) {
  if (!message) return null;

  const cfg = {
    success: {
      bg: 'linear-gradient(135deg,#F0FAE8,#E6F5D9)',
      border: '#8DC55A',
      color: '#235A08',
      iconBg: '#C8EAAA',
      iconColor: '#2E7A0E',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      label: 'Success',
    },
    error: {
      bg: 'linear-gradient(135deg,#FEF2F2,#FDE8E8)',
      border: '#F08080',
      color: '#7F1D1D',
      iconBg: '#FECACA',
      iconColor: '#B91C1C',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ),
      label: 'Error',
    },
    warning: {
      bg: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
      border: '#F5C842',
      color: '#5C3A00',
      iconBg: '#FDE68A',
      iconColor: '#B45309',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      label: 'Warning',
    },
    info: {
      bg: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)',
      border: '#6BA3E0',
      color: '#1E3A5F',
      iconBg: '#BFDBFE',
      iconColor: '#1D4ED8',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      ),
      label: 'Info',
    },
  };

  const c = cfg[type] || cfg.error;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      background: c.bg, border: `1.5px solid ${c.border}`,
      borderRadius: 12, padding: '13px 16px',
      fontFamily: "'Lato', sans-serif",
      boxShadow: `0 2px 12px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.6)`,
      marginBottom: 16, position: 'relative',
      animation: 'alertSlideIn 0.25s cubic-bezier(0.34,1.4,0.64,1) both',
      ...style,
    }}>
      <style>{`@keyframes alertSlideIn{from{opacity:0;transform:translateY(-8px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
      <span style={{
        width: 26, height: 26, borderRadius: 8, background: c.iconBg,
        color: c.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 1,
      }}>
        {c.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: c.iconColor, marginBottom: 2, fontFamily: "'Cinzel', serif" }}>
          {c.label}
        </div>
        <div style={{ fontSize: 13, color: c.color, lineHeight: 1.55 }}>{message}</div>
      </div>
      {onClose && (
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: c.iconColor, opacity: 0.5, padding: 2, flexShrink: 0,
          fontSize: 18, lineHeight: 1, transition: 'opacity 0.15s',
        }}
          onMouseOver={e => e.currentTarget.style.opacity = '1'}
          onMouseOut={e => e.currentTarget.style.opacity = '0.5'}
        >×</button>
      )}
    </div>
  );
}

// ── Field-level error label ────────────────────────────────────────────────────
export function FieldError({ message }) {
  if (!message) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      <span style={{ display: 'block', fontSize: 12, color: '#B91C1C', fontFamily: "'Lato', sans-serif", fontStyle: 'italic' }}>
        {message}
      </span>
    </div>
  );
}

// ── Toast notification item ───────────────────────────────────────────────────
const TOAST_CFG = {
  success: {
    bg: 'linear-gradient(135deg,#1A3A0A,#2D5A12)',
    border: 'rgba(141,197,90,0.4)',
    color: '#E8F8D8',
    accentBg: 'rgba(141,197,90,0.25)',
    accentColor: '#A8DF6A',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    label: 'Success',
    progressColor: '#8DC55A',
  },
  error: {
    bg: 'linear-gradient(135deg,#3A0A0A,#5A1212)',
    border: 'rgba(240,128,128,0.4)',
    color: '#FEE2E2',
    accentBg: 'rgba(240,128,128,0.25)',
    accentColor: '#F87171',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
    label: 'Error',
    progressColor: '#F87171',
  },
  warning: {
    bg: 'linear-gradient(135deg,#3A2800,#5A3E00)',
    border: 'rgba(245,200,66,0.4)',
    color: '#FEF3C7',
    accentBg: 'rgba(245,200,66,0.2)',
    accentColor: '#FCD34D',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    label: 'Warning',
    progressColor: '#FCD34D',
  },
  info: {
    bg: 'linear-gradient(135deg,#0A1E3A,#122D5A)',
    border: 'rgba(107,163,224,0.4)',
    color: '#DBEAFE',
    accentBg: 'rgba(107,163,224,0.2)',
    accentColor: '#93C5FD',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
    label: 'Info',
    progressColor: '#60A5FA',
  },
};

const ANIM = `
  @keyframes toastSlideIn {
    from { opacity:0; transform:translateX(110%) scale(0.92); }
    to   { opacity:1; transform:translateX(0)   scale(1); }
  }
  @keyframes toastSlideOut {
    from { opacity:1; transform:translateX(0)   scale(1);    max-height:120px; margin-bottom:10px; }
    to   { opacity:0; transform:translateX(110%) scale(0.92); max-height:0;     margin-bottom:0; }
  }
  @keyframes toastProgress {
    from { width: 100%; }
    to   { width: 0%; }
  }
  @keyframes alertSlideIn{from{opacity:0;transform:translateY(-8px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
`;

function ToastItem({ toast, onRemove, duration }) {
  const c = TOAST_CFG[toast.type] || TOAST_CFG.info;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', overflow: 'hidden',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 14, padding: '14px 16px 18px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
        maxWidth: 360, minWidth: 280,
        fontFamily: "'Lato', sans-serif",
        animation: toast.leaving
          ? 'toastSlideOut 0.3s cubic-bezier(0.36,0,0.66,-.56) both'
          : 'toastSlideIn 0.4s cubic-bezier(0.34,1.4,0.64,1) both',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
        {/* Icon badge */}
        <span style={{
          width: 30, height: 30, borderRadius: 9, background: c.accentBg,
          color: c.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, border: `1px solid ${c.border}`,
        }}>
          {c.icon}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: c.accentColor, marginBottom: 3, fontFamily: "'Cinzel', serif" }}>
            {c.label}
          </div>
          <div style={{ fontSize: 13, color: c.color, lineHeight: 1.55 }}>
            {toast.message}
          </div>
        </div>

        <button onClick={() => onRemove(toast.id)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: c.color, opacity: 0.4, padding: '0 2px', flexShrink: 0,
          fontSize: 18, lineHeight: 1, transition: 'opacity 0.15s', marginTop: -2,
        }}
          onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={e => e.currentTarget.style.opacity = '0.4'}
        >×</button>
      </div>

      {/* Progress bar */}
      {duration > 0 && !hovered && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
          background: 'rgba(255,255,255,0.1)', borderRadius: '0 0 14px 14px',
        }}>
          <div style={{
            height: '100%', background: c.progressColor, borderRadius: '0 0 14px 14px',
            animation: `toastProgress ${duration}ms linear both`,
            opacity: 0.8,
          }} />
        </div>
      )}
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(t => t.map(x => x.id === id ? { ...x, leaving: true } : x));
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 320);
  }, []);

  const show = useCallback((message, type = 'info', duration = 4000) => {
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
      <style>{ANIM}</style>
      {children}

      {/* Toast container — fixed bottom-right */}
      <div style={{
        position: 'fixed', bottom: 28, right: 24, zIndex: 99999,
        display: 'flex', flexDirection: 'column-reverse', gap: 10,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={t} onRemove={remove} duration={4000} />
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ── Confirm Dialog Context ────────────────────────────────────────────────────
const ConfirmCtx = createContext(null);

export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error('useConfirm must be used inside ToastProvider');
  return ctx;
}

const CONFIRM_ANIM = `
  @keyframes confirmBgIn  { from{opacity:0}                              to{opacity:1} }
  @keyframes confirmBoxIn { from{opacity:0;transform:scale(0.88) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes confirmBgOut  { from{opacity:1}                              to{opacity:0} }
  @keyframes confirmBoxOut { from{opacity:1;transform:scale(1) translateY(0)} to{opacity:0;transform:scale(0.92) translateY(8px)} }
`;

const CONFIRM_ICONS = {
  danger: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  warning: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  question: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
};

const CONFIRM_THEMES = {
  danger: {
    iconBg: 'linear-gradient(135deg,#FEE2E2,#FECACA)',
    iconColor: '#B91C1C',
    iconBorder: '#FCA5A5',
    confirmBg: 'linear-gradient(135deg,#DC2626,#B91C1C)',
    confirmHover: '#991B1B',
    confirmText: 'white',
  },
  warning: {
    iconBg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)',
    iconColor: '#B45309',
    iconBorder: '#FCD34D',
    confirmBg: 'linear-gradient(135deg,#F59E0B,#D97706)',
    confirmHover: '#B45309',
    confirmText: 'white',
  },
  question: {
    iconBg: 'linear-gradient(135deg,#DBEAFE,#BFDBFE)',
    iconColor: '#1D4ED8',
    iconBorder: '#93C5FD',
    confirmBg: 'linear-gradient(135deg,#C89030,#A06820)',
    confirmHover: '#8A5A10',
    confirmText: 'white',
  },
};

function ConfirmModal({ options, onConfirm, onCancel, leaving }) {
  const {
    title = 'Are you sure?',
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
  } = options;
  const theme = CONFIRM_THEMES[variant] || CONFIRM_THEMES.danger;

  return (
    <>
      <style>{CONFIRM_ANIM}</style>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0, zIndex: 99990,
          background: 'rgba(15,10,5,0.55)',
          backdropFilter: 'blur(4px)',
          animation: leaving ? 'confirmBgOut 0.2s ease both' : 'confirmBgIn 0.2s ease both',
        }}
      />
      {/* Dialog box */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 99991,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, pointerEvents: 'none',
      }}>
        <div style={{
          background: 'linear-gradient(160deg,#FFFEF8,#FBF4E4)',
          border: '1px solid #E2D5BA',
          borderRadius: 20,
          padding: '32px 32px 28px',
          maxWidth: 400, width: '100%',
          boxShadow: '0 24px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.1)',
          pointerEvents: 'all',
          animation: leaving ? 'confirmBoxOut 0.2s ease both' : 'confirmBoxIn 0.3s cubic-bezier(0.34,1.4,0.64,1) both',
          fontFamily: "'Lato', sans-serif",
        }}>
          {/* Icon */}
          <div style={{
            width: 56, height: 56,
            background: theme.iconBg,
            border: `1.5px solid ${theme.iconBorder}`,
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: theme.iconColor,
            margin: '0 auto 20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}>
            {CONFIRM_ICONS[variant] || CONFIRM_ICONS.danger}
          </div>

          {/* Text */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              fontSize: 18, fontWeight: 700,
              fontFamily: "'Playfair Display', serif",
              color: '#1A1208', marginBottom: 8,
            }}>
              {title}
            </div>
            {message && (
              <p style={{ fontSize: 13, color: '#5A4832', lineHeight: 1.6, margin: 0 }}>
                {message}
              </p>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'linear-gradient(to right,transparent,#E0CFA8,transparent)', marginBottom: 20 }} />

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1, padding: '11px', border: '1.5px solid #D4C090',
                borderRadius: 10, background: 'transparent',
                fontFamily: "'Cinzel', serif", fontSize: 12,
                letterSpacing: '1px', color: '#5A4832',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#F5ECD8'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              style={{
                flex: 1, padding: '11px', border: 'none',
                borderRadius: 10, background: theme.confirmBg,
                fontFamily: "'Cinzel', serif", fontSize: 12,
                letterSpacing: '1px', color: theme.confirmText,
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
              }}
              onMouseOver={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Combined Provider that wraps ToastProvider with ConfirmProvider ────────────
export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);   // { options, resolve }
  const [leaving, setLeaving] = useState(false);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setLeaving(false);
      setDialog({ options: typeof options === 'string' ? { message: options } : options, resolve });
    });
  }, []);

  const close = useCallback((result) => {
    setLeaving(true);
    setTimeout(() => {
      setDialog(null);
      setLeaving(false);
      dialog?.resolve(result);
    }, 200);
  }, [dialog]);

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {dialog && (
        <ConfirmModal
          options={dialog.options}
          leaving={leaving}
          onConfirm={() => close(true)}
          onCancel={() => close(false)}
        />
      )}
    </ConfirmCtx.Provider>
  );
}
