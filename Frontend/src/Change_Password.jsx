import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRole } from './api';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .gl-input:focus{border-color:#B8860B!important;outline:none;box-shadow:0 0 0 3px rgba(184,134,11,.1)!important}
  .save-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(180,120,30,.35)!important}
  .eye-btn:hover{opacity:0.7}
`;
const FF  = { fontFamily:"'Lato',sans-serif" };
const SER = { fontFamily:"'Cinzel',serif" };
const INP = { width:'100%', padding:'11px 46px 11px 15px', background:'#FBF6ED', border:'1.5px solid #E0CFA8', borderRadius:10, fontSize:14, color:'#2A1F0E', outline:'none', transition:'all 0.2s', boxSizing:'border-box', ...FF };
const LBL = { display:'block', marginBottom:5, fontSize:11, letterSpacing:'1.5px', textTransform:'uppercase', color:'#B8860B', fontFamily:"'Cinzel',serif", fontWeight:700 };

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
      {error && <span style={{ fontSize:12, color:'#A32D2D', marginTop:4, display:'block', ...FF }}>{error}</span>}
    </div>
  );
}

export default function Change_Password() {
  const navigate  = useNavigate();
  const role      = getRole();
  const backPath  = role === 'admin' ? '/admin_dashboard' : role === 'writer' ? '/writer_profile' : '/reader_profile';

  const [form,    setForm]    = useState({ current: '', newPwd: '', confirm: '' });
  const [show,    setShow]    = useState({ current: false, newPwd: false, confirm: false });
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);

  const toggle = k => () => setShow(s => ({ ...s, [k]: !s[k] }));
  const set    = k => e  => setForm(f => ({ ...f, [k]: e.target.value }));

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
      const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.newPwd }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrors({ current: data.message || 'Current password is incorrect.' });
      } else {
        setSuccess(true);
        setForm({ current: '', newPwd: '', confirm: '' });
        setTimeout(() => navigate(backPath), 2000);
      }
    } catch { setErrors({ current: 'Server error. Please try again.' }); }
    setSaving(false);
  };

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
          <div style={{ background:'#EAF3DE', border:'1px solid #97C459', borderRadius:16, padding:'28px 32px', textAlign:'center', animation:'fadeUp 0.4s ease both' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="1.5" style={{ marginBottom:14 }}>
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <div style={{ fontSize:18, fontWeight:700, fontFamily:"'Playfair Display',serif", color:'#27500A', marginBottom:6 }}>Password changed!</div>
            <p style={{ fontSize:13, ...FF, color:'#3B6D11' }}>Redirecting you back…</p>
          </div>
        ) : (
          <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:18, padding:32, boxShadow:'0 6px 24px rgba(80,50,15,.08)', animation:'fadeUp 0.5s 0.05s ease both' }}>
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
