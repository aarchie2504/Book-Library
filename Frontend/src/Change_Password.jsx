import { Alert, FieldError } from './ToastProvider.jsx';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRole } from './api';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .gl-input:focus{border-color:#B8860B!important;outline:none;box-shadow:0 0 0 3px rgba(184,134,11,.1)!important}
  .save-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(180,120,30,.35)!important}
  .eye-btn:hover{opacity:0.7}
  .otp-box:focus{border-color:#B8860B!important;outline:none;box-shadow:0 0 0 3px rgba(184,134,11,.15)!important;background:#FFFBF0!important}
`;
const FF  = { fontFamily:"'Lato',sans-serif" };
const SER = { fontFamily:"'Cinzel',serif" };
const INP = { width:'100%', padding:'11px 46px 11px 15px', background:'#FBF6ED', border:'1.5px solid #E0CFA8', borderRadius:10, fontSize:14, color:'#2A1F0E', outline:'none', transition:'all 0.2s', boxSizing:'border-box', ...FF };
const LBL = { display:'block', marginBottom:5, fontSize:11, letterSpacing:'1.5px', textTransform:'uppercase', color:'#B8860B', fontFamily:"'Cinzel',serif", fontWeight:700 };

// ── Password field with show/hide toggle ──────────────────────────────────────
function PwdField({ label, value, onChange, show, onToggle, error }) {
  return (
    <div style={{ marginBottom:18 }}>
      <label style={LBL}>{label}</label>
      <div style={{ position:'relative' }}>
        <input className="gl-input" type={show ? 'text' : 'password'} style={INP} value={value} onChange={onChange} />
        <button type="button" className="eye-btn" onClick={onToggle}
          style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#7A5A2A', transition:'opacity 0.15s' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            {show
              ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
              : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
            }
          </svg>
        </button>
      </div>
      {error && <FieldError message={error} />}
    </div>
  );
}

// ── 6-digit OTP input ─────────────────────────────────────────────────────────
function OtpInput({ value, onChange }) {
  const refs = Array.from({ length: 6 }, () => useRef(null));

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const arr = value.split('');
      arr[i] = '';
      onChange(arr.join('').replace(/ /g, ''));
      if (i > 0) refs[i - 1].current?.focus();
      return;
    }
    if (e.key === 'ArrowLeft' && i > 0)  { refs[i - 1].current?.focus(); return; }
    if (e.key === 'ArrowRight' && i < 5) { refs[i + 1].current?.focus(); return; }
  };

  const handleChange = (i, e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) return;
    if (raw.length > 1) {
      const pasted = raw.slice(0, 6);
      onChange(pasted);
      refs[Math.min(pasted.length, 5)].current?.focus();
      return;
    }
    const arr = (value.padEnd(6, ' ')).split('');
    arr[i] = raw[0];
    onChange(arr.join('').replace(/ /g, ''));
    if (i < 5) refs[i + 1].current?.focus();
  };

  const handlePaste = e => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    refs[Math.min(pasted.length, 5)].current?.focus();
  };

  const digits = value.split('');

  return (
    <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i} ref={refs[i]}
          className="otp-box"
          type="text" inputMode="numeric" maxLength={6}
          value={digits[i] || ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          style={{
            width:44, height:52, textAlign:'center', fontSize:20, fontWeight:700,
            background:'#FBF6ED', border:`2px solid ${digits[i] ? '#B8860B' : '#E0CFA8'}`,
            borderRadius:12, color:'#2A1F0E', outline:'none', transition:'all 0.15s',
            fontFamily:"'Cinzel',serif", caretColor:'#B8860B',
          }}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Change_Password() {
  const navigate  = useNavigate();
  const role      = getRole();
  const backPath  = role === 'admin' ? '/admin_dashboard' : role === 'writer' ? '/writer_profile' : '/reader_profile';
  const BASE      = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  // step: 'verify' (send OTP) → 'otp' (enter OTP) → 'change' (new password form)
  const [step,    setStep]    = useState('verify');
  const [otp,     setOtp]     = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [form,    setForm]    = useState({ current: '', newPwd: '', confirm: '' });
  const [show,    setShow]    = useState({ current: false, newPwd: false, confirm: false });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const toggle = k => () => setShow(s => ({ ...s, [k]: !s[k] }));
  const set    = k => e  => setForm(f => ({ ...f, [k]: e.target.value }));

  const startCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  // Step 1: Send OTP to user's email
  const handleSendOtp = async () => {
    setLoading(true); setErrors({});
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE}/api/auth/send-change-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMaskedEmail(data.maskedEmail || '');
        setStep('otp');
        startCooldown();
      } else {
        setErrors({ otp: data.message || 'Failed to send OTP. Please try again.' });
      }
    } catch { setErrors({ otp: 'Server error. Please try again.' }); }
    setLoading(false);
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true); setErrors({}); setOtp('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE}/api/auth/send-change-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) startCooldown();
      else setErrors({ otp: 'Could not resend OTP. Please try again.' });
    } catch { setErrors({ otp: 'Server error. Please try again.' }); }
    setLoading(false);
  };

  // Step 2: Verify OTP → move to password form
  const handleVerifyOtp = () => {
    if (otp.length < 6) { setErrors({ otp: 'Please enter the complete 6-digit OTP.' }); return; }
    setErrors({});
    setStep('change');
  };

  // Step 3: Submit new password
  const validate = () => {
    const x = {};
    if (!form.current.trim()) x.current = 'Current password is required.';
    if (!form.newPwd.trim())  x.newPwd  = 'New password is required.';
    else if (form.newPwd.length < 6) x.newPwd = 'Must be at least 6 characters.';
    if (!form.confirm.trim()) x.confirm = 'Please confirm your new password.';
    else if (form.newPwd !== form.confirm) x.confirm = 'Passwords do not match.';
    return x;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const x = validate(); setErrors(x);
    if (Object.keys(x).length) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE}/api/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.newPwd, otp }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.message?.toLowerCase().includes('otp')) {
          setErrors({ otp: data.message });
          setStep('otp'); // go back to OTP step
        } else {
          setErrors({ current: data.message || 'Current password is incorrect.' });
        }
      } else {
        setSuccess(true);
        setForm({ current: '', newPwd: '', confirm: '' });
        setTimeout(() => navigate(backPath), 2000);
      }
    } catch { setErrors({ current: 'Server error. Please try again.' }); }
    setSaving(false);
  };

  const [saving, setSaving] = useState(false);

  const strength = pwd => {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length >= 6)  s++;
    if (pwd.length >= 10) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };
  const s = strength(form.newPwd);
  const strengthLabel = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'][s] || '';
  const strengthColor = ['','#E24B4A','#EF9F27','#EF9F27','#639922','#3B6D11'][s] || '#E0CFA8';

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FDF8F0,#F5ECE0)', padding:'48px 24px 80px' }}>
      <style>{GL}</style>
      <div style={{ maxWidth:520, margin:'0 auto' }}>

        <button onClick={() => navigate(backPath)}
          style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'#B8860B', ...SER, fontSize:13, letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:28 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/></svg>
          Back
        </button>

        <div style={{ marginBottom:28, animation:'fadeUp 0.5s ease both' }}>
          <div style={{ fontSize:12, letterSpacing:'2px', fontFamily:"'Cinzel',serif", color:'#B8860B', textTransform:'uppercase', marginBottom:8, fontWeight:600 }}>Account Settings</div>
          <h1 style={{ fontSize:32, fontWeight:900, fontFamily:"'Playfair Display',serif", color:'#2A1F0E', margin:0 }}>Change Password</h1>
        </div>

        {success ? (
          <div style={{ background:'linear-gradient(135deg,#F0FAE8,#E6F5D9)', border:'1.5px solid #8DC55A', borderRadius:18, padding:'36px 32px', textAlign:'center', animation:'fadeUp 0.4s cubic-bezier(0.34,1.4,0.64,1) both', boxShadow:'0 6px 24px rgba(60,120,20,.12)' }}>
            <div style={{ width:64, height:64, background:'linear-gradient(135deg,#C8EAAA,#A0D870)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', boxShadow:'0 4px 16px rgba(60,160,20,.25)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#235A08" strokeWidth="2.2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div style={{ fontSize:20, fontWeight:700, fontFamily:"'Playfair Display',serif", color:'#235A08', marginBottom:8 }}>Password changed!</div>
            <p style={{ fontSize:13, fontFamily:"'Lato',sans-serif", color:'#3B7A10' }}>Redirecting you back…</p>
          </div>

        ) : step === 'verify' ? (
          /* ── Step 1: Verify Identity via OTP ── */
          <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:18, padding:32, boxShadow:'0 6px 24px rgba(80,50,15,.08)', animation:'fadeUp 0.5s 0.05s ease both' }}>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ width:56, height:56, background:'linear-gradient(145deg,#F5E8C8,#E8D0A0)', border:'1.5px solid #D4B870', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'0 4px 16px rgba(180,130,50,.18)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="1.6">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <div style={{ fontSize:16, fontWeight:700, fontFamily:"'Playfair Display',serif", color:'#2A1F0E', marginBottom:8 }}>Verify Your Identity</div>
              <p style={{ fontSize:13, ...FF, color:'#5A4832', lineHeight:1.6 }}>
                To keep your account secure, we'll send a 6-digit OTP to your registered email address before allowing you to change your password.
              </p>
            </div>
            {errors.otp && <Alert type="error" message={errors.otp} onClose={() => setErrors(e => ({...e, otp:""}))} />}
            <button onClick={handleSendOtp} disabled={loading} className="save-btn"
              style={{ width:'100%', padding:'13px', background: loading ? '#C0A060' : 'linear-gradient(135deg,#C89030,#A06820)', border:'none', borderRadius:12, color:'white', ...SER, fontSize:13, letterSpacing:'1.2px', cursor: loading ? 'not-allowed' : 'pointer', transition:'all 0.25s', boxShadow:'0 4px 16px rgba(180,120,30,.25)' }}>
              {loading ? 'Sending OTP…' : 'Send OTP to My Email'}
            </button>
          </div>

        ) : step === 'otp' ? (
          /* ── Step 2: Enter OTP ── */
          <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:18, padding:32, boxShadow:'0 6px 24px rgba(80,50,15,.08)', animation:'fadeUp 0.5s ease both' }}>
            <Alert type="info" message={<>OTP sent to <strong>{maskedEmail}</strong>. Check your inbox.</>} />

            <label style={{ ...LBL, textAlign:'center', display:'block', marginBottom:14 }}>Enter 6-Digit OTP</label>
            <OtpInput value={otp} onChange={setOtp} />

            {errors.otp && <Alert type="error" message={errors.otp} onClose={() => setErrors(e => ({...e, otp:""}))} />}

            <div style={{ textAlign:'center', marginTop:12, marginBottom:22 }}>
              {resendCooldown > 0 ? (
                <span style={{ fontSize:12, ...FF, color:'#7A5A2A' }}>Resend OTP in {resendCooldown}s</span>
              ) : (
                <button type="button" onClick={handleResend} disabled={loading}
                  style={{ background:'none', border:'none', ...SER, fontSize:12, color:'#B8860B', cursor:'pointer', letterSpacing:'0.5px', textDecoration:'underline' }}>
                  Resend OTP
                </button>
              )}
            </div>

            <button onClick={handleVerifyOtp} disabled={otp.length < 6} className="save-btn"
              style={{ width:'100%', padding:'13px', background: otp.length < 6 ? '#C0A060' : 'linear-gradient(135deg,#C89030,#A06820)', border:'none', borderRadius:12, color:'white', ...SER, fontSize:13, letterSpacing:'1.2px', cursor: otp.length < 6 ? 'not-allowed' : 'pointer', transition:'all 0.25s', boxShadow:'0 4px 16px rgba(180,120,30,.25)', marginBottom:10 }}>
              Verify OTP
            </button>
            <button onClick={() => { setStep('verify'); setOtp(''); setErrors({}); }}
              style={{ width:'100%', padding:'10px', background:'transparent', border:'none', ...SER, fontSize:13, color:'#3D2B0E', cursor:'pointer', letterSpacing:'1px' }}>
              ← Back
            </button>
          </div>

        ) : (
          /* ── Step 3: New Password Form ── */
          <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:18, padding:32, boxShadow:'0 6px 24px rgba(80,50,15,.08)', animation:'fadeUp 0.5s ease both' }}>
            {/* OTP verified badge */}
            <Alert type="success" message="Identity verified — set your new password below." />

            <form onSubmit={handleSubmit}>
              <PwdField label="Current password" value={form.current} onChange={set('current')} show={show.current} onToggle={toggle('current')} error={errors.current} />
              <div style={{ height:1, background:'linear-gradient(to right,transparent,#E0CFA8,transparent)', margin:'4px 0 18px' }} />
              <PwdField label="New password" value={form.newPwd} onChange={set('newPwd')} show={show.newPwd} onToggle={toggle('newPwd')} error={errors.newPwd} />

              {/* Strength meter */}
              {form.newPwd && (
                <div style={{ marginTop:-10, marginBottom:18 }}>
                  <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ flex:1, height:4, borderRadius:2, background: i<=s ? strengthColor : '#E0CFA8', transition:'background 0.3s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize:13, ...FF, color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}

              <PwdField label="Confirm new password" value={form.confirm} onChange={set('confirm')} show={show.confirm} onToggle={toggle('confirm')} error={errors.confirm} />

              <div style={{ marginTop:8, background:'rgba(240,230,208,0.4)', borderRadius:10, padding:'12px 14px', marginBottom:22 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#2A1F0E', ...FF, marginBottom:4 }}>Tips for a strong password</div>
                {['At least 6 characters', 'Mix of uppercase and lowercase letters', 'Include numbers and symbols'].map((t,i) => (
                  <div key={i} style={{ fontSize:13, ...FF, color:'#2A1F0E', display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {t}
                  </div>
                ))}
              </div>

              <button type="submit" className="save-btn" disabled={saving}
                style={{ width:'100%', padding:'13px', background: saving ? '#C0A060' : 'linear-gradient(135deg,#C89030,#A06820)', border:'none', borderRadius:12, color:'white', ...SER, fontSize:13, letterSpacing:'1.2px', cursor: saving ? 'not-allowed' : 'pointer', transition:'all 0.25s', boxShadow:'0 4px 16px rgba(180,120,30,.25)' }}>
                {saving ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
