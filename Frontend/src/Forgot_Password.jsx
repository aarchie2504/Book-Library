import { useState } from 'react';
import { Link } from 'react-router-dom';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .gl-input:focus{border-color:#B8860B!important;outline:none;box-shadow:0 0 0 3px rgba(184,134,11,.1)!important}
  .submit-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(180,120,30,.35)!important}
`;
const FF  = { fontFamily:"'Lato',sans-serif" };
const SER = { fontFamily:"'Cinzel',serif" };
const INP = { width:'100%', padding:'12px 15px', background:'#FBF6ED', border:'1.5px solid #E0CFA8', borderRadius:10, fontSize:14, color:'#2A1F0E', outline:'none', transition:'all 0.2s', boxSizing:'border-box', ...FF };

export default function Forgot_Password() {
  const [email,   setEmail]   = useState('');
  const [step,    setStep]    = useState('form'); // form | sent | reset
  const [code,    setCode]    = useState('');
  const [newPwd,  setNewPwd]  = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  // Step 1: Request reset (backend sends OTP or simulates it)
  const handleRequest = async e => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Invalid email address.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('sent');
      } else {
        setError(data.message || 'Could not send reset email. Check the address and try again.');
      }
    } catch { setError('Server error. Please try again.'); }
    setLoading(false);
  };

  // Step 2: Submit code + new password
  const handleReset = async e => {
    e.preventDefault();
    if (!code.trim())   { setError('Enter the code from your email.'); return; }
    if (newPwd.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (newPwd !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: newPwd }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Invalid or expired code. Request a new one.');
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
            <div style={{ textAlign:'center', padding:'12px 0' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="1.5" style={{ marginBottom:14 }}>
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <div style={{ fontSize:18, fontWeight:700, fontFamily:"'Playfair Display',serif", color:'#27500A', marginBottom:8 }}>Password reset!</div>
              <p style={{ fontSize:13, ...FF, color:'#5A7A50', marginBottom:20 }}>Your password has been updated. You can now log in with your new password.</p>
              <Link to="/login" style={{ display:'inline-block', padding:'11px 28px', background:'linear-gradient(135deg,#C89030,#A06820)', borderRadius:10, color:'white', ...SER, fontSize:13, letterSpacing:'1px', textDecoration:'none' }}>
                Go to Login
              </Link>
            </div>
          ) : step === 'form' ? (
            <>
              <p style={{ fontSize:13, ...FF, color:'#2A1F0E', marginBottom:22, lineHeight:1.6 }}>
                Enter your registered email address. We'll send you a code to reset your password.
              </p>
              {error && <div style={{ background:'#FCEBEB', border:'1px solid #F09595', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13, ...FF, color:'#A32D2D' }}>{error}</div>}
              <form onSubmit={handleRequest}>
                <div style={{ marginBottom:22 }}>
                  <label style={{ display:'block', marginBottom:6, fontSize:12, letterSpacing:'1.5px', textTransform:'uppercase', color:'#3D2B0E', ...SER }}>Email Address</label>
                  <input className="gl-input" type="email" style={INP} placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}
                  style={{ width:'100%', padding:'13px', background: loading ? '#C0A060' : 'linear-gradient(135deg,#C89030,#A06820)', border:'none', borderRadius:10, color:'white', ...SER, fontSize:13, letterSpacing:'1.2px', cursor: loading ? 'not-allowed' : 'pointer', transition:'all 0.25s', marginBottom:16 }}>
                  {loading ? 'Sending…' : 'Send Reset Code'}
                </button>
              </form>
              <div style={{ textAlign:'center', fontSize:12, ...FF, color:'#3D2B0E' }}>
                Remember your password? <Link to="/login" style={{ color:'#B8860B', textDecoration:'none', fontWeight:600 }}>Log in</Link>
              </div>
            </>
          ) : (
            <>
              <div style={{ background:'#EAF3DE', border:'1px solid #97C459', borderRadius:10, padding:'10px 14px', marginBottom:20, fontSize:13, ...FF, color:'#27500A' }}>
                A reset code was sent to <strong>{email}</strong>. Check your inbox.
              </div>
              {error && <div style={{ background:'#FCEBEB', border:'1px solid #F09595', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13, ...FF, color:'#A32D2D' }}>{error}</div>}
              <form onSubmit={handleReset}>
                <div style={{ marginBottom:16 }}>
                  <label style={{ display:'block', marginBottom:6, fontSize:12, letterSpacing:'1.5px', textTransform:'uppercase', color:'#3D2B0E', ...SER }}>Reset Code</label>
                  <input className="gl-input" style={INP} placeholder="Enter the code from your email" value={code} onChange={e => setCode(e.target.value)} />
                </div>
                <div style={{ marginBottom:16 }}>
                  <label style={{ display:'block', marginBottom:6, fontSize:12, letterSpacing:'1.5px', textTransform:'uppercase', color:'#3D2B0E', ...SER }}>New Password</label>
                  <input className="gl-input" type="password" style={INP} placeholder="Min 6 characters" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                </div>
                <div style={{ marginBottom:22 }}>
                  <label style={{ display:'block', marginBottom:6, fontSize:12, letterSpacing:'1.5px', textTransform:'uppercase', color:'#3D2B0E', ...SER }}>Confirm Password</label>
                  <input className="gl-input" type="password" style={INP} placeholder="Re-enter new password" value={confirm} onChange={e => setConfirm(e.target.value)} />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}
                  style={{ width:'100%', padding:'13px', background: loading ? '#C0A060' : 'linear-gradient(135deg,#C89030,#A06820)', border:'none', borderRadius:10, color:'white', ...SER, fontSize:13, letterSpacing:'1.2px', cursor: loading ? 'not-allowed' : 'pointer', transition:'all 0.25s', marginBottom:12 }}>
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
                <button type="button" onClick={() => setStep('form')}
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
