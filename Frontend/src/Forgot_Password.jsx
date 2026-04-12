import { Alert } from './ToastProvider.jsx';
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .gl-input:focus{border-color:#B8860B!important;outline:none;box-shadow:0 0 0 3px rgba(184,134,11,.1)!important}
  .submit-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(180,120,30,.35)!important}
  .otp-box:focus{border-color:#B8860B!important;outline:none;box-shadow:0 0 0 3px rgba(184,134,11,.15)!important;background:#FFFBF0!important}
`;
const FF  = { fontFamily:"'Lato',sans-serif" };
const SER = { fontFamily:"'Cinzel',serif" };
const INP = { width:'100%', padding:'12px 15px', background:'#FBF6ED', border:'1.5px solid #E0CFA8', borderRadius:10, fontSize:14, color:'#2A1F0E', outline:'none', transition:'all 0.2s', boxSizing:'border-box', ...FF };

// 6-digit OTP input component
function OtpInput({ value, onChange }) {
  const refs = Array.from({ length: 6 }, () => useRef(null));
  const digits = (value + '      ').slice(0, 6).split('');

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = digits.map((d, idx) => idx === i ? '' : d).join('').trimEnd();
      onChange(next);
      if (i > 0) refs[i - 1].current?.focus();
      return;
    }
    if (e.key === 'ArrowLeft' && i > 0) { refs[i - 1].current?.focus(); return; }
    if (e.key === 'ArrowRight' && i < 5) { refs[i + 1].current?.focus(); return; }
  };

  const handleChange = (i, e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) return;
    // Allow paste of full OTP
    if (raw.length > 1) {
      const pasted = raw.slice(0, 6);
      onChange(pasted);
      refs[Math.min(pasted.length, 5)].current?.focus();
      return;
    }
    const next = digits.map((d, idx) => idx === i ? raw[0] : d).join('').replace(/ /g, '').padEnd(0);
    const updated = digits.slice();
    updated[i] = raw[0];
    onChange(updated.join('').replace(/ /g, ''));
    if (i < 5) refs[i + 1].current?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    refs[Math.min(pasted.length, 5)].current?.focus();
  };

  const filledDigits = value.split('');

  return (
    <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:6 }}>
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={refs[i]}
          className="otp-box"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={filledDigits[i] || ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          style={{
            width: 46, height: 54, textAlign: 'center', fontSize: 22, fontWeight: 700,
            background: '#FBF6ED', border: `2px solid ${filledDigits[i] ? '#B8860B' : '#E0CFA8'}`,
            borderRadius: 12, color: '#2A1F0E', outline: 'none', transition: 'all 0.15s',
            fontFamily: "'Cinzel', serif", caretColor: '#B8860B',
          }}
        />
      ))}
    </div>
  );
}

export default function Forgot_Password() {
  const [email,   setEmail]   = useState('');
  const [step,    setStep]    = useState('form'); // form | sent | reset
  const [otp,     setOtp]     = useState('');
  const [newPwd,  setNewPwd]  = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  // Resend cooldown timer
  const startCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  // Step 1: Request reset
  const handleRequest = async e => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Invalid email address.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('sent');
        startCooldown();
      } else {
        setError(data.message || 'Could not send reset email. Check the address and try again.');
      }
    } catch { setError('Server error. Please try again.'); }
    setLoading(false);
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true); setError(''); setOtp('');
    try {
      const res = await fetch(`${BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) startCooldown();
      else setError('Could not resend OTP. Please try again.');
    } catch { setError('Server error. Please try again.'); }
    setLoading(false);
  };

  // Step 2: Verify OTP + set new password
  const handleReset = async e => {
    e.preventDefault();
    if (otp.length < 6)      { setError('Please enter the complete 6-digit OTP.'); return; }
    if (newPwd.length < 6)   { setError('New password must be at least 6 characters.'); return; }
    if (newPwd !== confirm)  { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp, newPassword: newPwd }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Invalid or expired OTP. Request a new one.');
      }
    } catch { setError('Server error. Please try again.'); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FDF8F0,#F5ECE0)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <style>{GL}</style>
      <div style={{ width:'100%', maxWidth:460 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32, animation:'fadeUp 0.5s ease both' }}>
          <div style={{ width:52, height:52, background:'linear-gradient(145deg,#F5E8C8,#E8D0A0)', border:'1.5px solid #D4B870', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', boxShadow:'0 4px 16px rgba(180,130,50,.18)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="1.6"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
          </div>
          <div style={{ fontSize:12, letterSpacing:'2px', fontFamily:"'Cinzel',serif", color:'#B8860B', textTransform:'uppercase', marginBottom:8, fontWeight:600 }}>Book Library</div>
          <h1 style={{ fontSize:26, fontWeight:900, fontFamily:"'Playfair Display',serif", color:'#2A1F0E', margin:0 }}>Reset Password</h1>
        </div>

        <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:18, padding:32, boxShadow:'0 6px 24px rgba(80,50,15,.08)', animation:'fadeUp 0.5s 0.05s ease both' }}>

          {success ? (
            <div style={{ textAlign:'center', padding:'16px 0' }}>
              <div style={{ width:72, height:72, background:'linear-gradient(135deg,#C8EAAA,#A0D870)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', boxShadow:'0 6px 20px rgba(60,160,20,.25)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#235A08" strokeWidth="2.2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div style={{ fontSize:20, fontWeight:700, fontFamily:"'Playfair Display',serif", color:'#235A08', marginBottom:10 }}>Password Reset!</div>
              <p style={{ fontSize:13, ...FF, color:'#3B7A10', marginBottom:24, lineHeight:1.6 }}>Your password has been updated successfully. You can now log in with your new password.</p>
              <Link to="/login" style={{ display:'inline-block', padding:'12px 32px', background:'linear-gradient(135deg,#C89030,#A06820)', borderRadius:10, color:'white', ...SER, fontSize:13, letterSpacing:'1px', textDecoration:'none', boxShadow:'0 4px 14px rgba(180,120,30,.3)' }}>
                Go to Login
              </Link>
            </div>

          ) : step === 'form' ? (
            <>
              <p style={{ fontSize:13, ...FF, color:'#2A1F0E', marginBottom:22, lineHeight:1.6 }}>
                Enter your registered email address. We'll send you a 6-digit OTP to reset your password.
              </p>
              {error && <Alert type="error" message={error} onClose={() => setError("")} />}
              <form onSubmit={handleRequest}>
                <div style={{ marginBottom:22 }}>
                  <label style={{ display:'block', marginBottom:6, fontSize:12, letterSpacing:'1.5px', textTransform:'uppercase', color:'#3D2B0E', ...SER }}>Email Address</label>
                  <input className="gl-input" type="email" style={INP} placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}
                  style={{ width:'100%', padding:'13px', background: loading ? '#C0A060' : 'linear-gradient(135deg,#C89030,#A06820)', border:'none', borderRadius:10, color:'white', ...SER, fontSize:13, letterSpacing:'1.2px', cursor: loading ? 'not-allowed' : 'pointer', transition:'all 0.25s', marginBottom:16 }}>
                  {loading ? 'Sending…' : 'Send OTP'}
                </button>
              </form>
              <div style={{ textAlign:'center', fontSize:12, ...FF, color:'#3D2B0E' }}>
                Remember your password? <Link to="/login" style={{ color:'#B8860B', textDecoration:'none', fontWeight:600 }}>Log in</Link>
              </div>
            </>

          ) : (
            <>
              {/* OTP Step */}
              <Alert type="info" message={<>A 6-digit OTP was sent to <strong>{email}</strong>. Check your inbox (and spam folder).</>} />
              {error && <Alert type="error" message={error} onClose={() => setError("")} />}

              <form onSubmit={handleReset}>
                {/* OTP Boxes */}
                <div style={{ marginBottom:20 }}>
                  <label style={{ display:'block', marginBottom:12, fontSize:12, letterSpacing:'1.5px', textTransform:'uppercase', color:'#3D2B0E', ...SER, textAlign:'center' }}>Enter OTP</label>
                  <OtpInput value={otp} onChange={setOtp} />
                  <div style={{ textAlign:'center', marginTop:10 }}>
                    {resendCooldown > 0 ? (
                      <span style={{ fontSize:12, ...FF, color:'#7A5A2A' }}>Resend OTP in {resendCooldown}s</span>
                    ) : (
                      <button type="button" onClick={handleResend} disabled={loading}
                        style={{ background:'none', border:'none', ...SER, fontSize:12, color:'#B8860B', cursor:'pointer', letterSpacing:'0.5px', textDecoration:'underline' }}>
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ height:1, background:'linear-gradient(to right,transparent,#E0CFA8,transparent)', margin:'4px 0 18px' }} />

                <div style={{ marginBottom:16 }}>
                  <label style={{ display:'block', marginBottom:6, fontSize:12, letterSpacing:'1.5px', textTransform:'uppercase', color:'#3D2B0E', ...SER }}>New Password</label>
                  <input className="gl-input" type="password" style={INP} placeholder="Min 6 characters" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                </div>
                <div style={{ marginBottom:22 }}>
                  <label style={{ display:'block', marginBottom:6, fontSize:12, letterSpacing:'1.5px', textTransform:'uppercase', color:'#3D2B0E', ...SER }}>Confirm Password</label>
                  <input className="gl-input" type="password" style={INP} placeholder="Re-enter new password" value={confirm} onChange={e => setConfirm(e.target.value)} />
                </div>

                <button type="submit" className="submit-btn" disabled={loading || otp.length < 6}
                  style={{ width:'100%', padding:'13px', background: (loading || otp.length < 6) ? '#C0A060' : 'linear-gradient(135deg,#C89030,#A06820)', border:'none', borderRadius:10, color:'white', ...SER, fontSize:13, letterSpacing:'1.2px', cursor: (loading || otp.length < 6) ? 'not-allowed' : 'pointer', transition:'all 0.25s', marginBottom:12 }}>
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
                <button type="button" onClick={() => { setStep('form'); setOtp(''); setError(''); }}
                  style={{ width:'100%', padding:'10px', background:'transparent', border:'none', ...SER, fontSize:13, color:'#3D2B0E', cursor:'pointer', letterSpacing:'1px' }}>
                  ← Back
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
