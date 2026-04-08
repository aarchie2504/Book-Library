import { useState, useEffect } from 'react';
import { api } from './api';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .gl-input:focus{border-color:#B8860B!important;outline:none;box-shadow:0 0 0 3px rgba(184,134,11,.1)!important}
  .save-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(180,120,30,.35)!important}
  .stat-card:hover{transform:translateY(-3px);box-shadow:0 14px 40px rgba(80,50,15,.14)!important}
`;
const FF  = { fontFamily:"'Lato',sans-serif" };
const SER = { fontFamily:"'Cinzel',serif" };
const INP = { width:'100%', padding:'11px 15px', background:'#FBF6ED', border:'1.5px solid #E0CFA8', borderRadius:10, fontSize:14, color:'#2A1F0E', outline:'none', transition:'all 0.2s', boxSizing:'border-box', ...FF };
const LBL = { display:'block', marginBottom:5, fontSize:11, letterSpacing:'1.5px', textTransform:'uppercase', color:'#B8860B', fontFamily:"'Cinzel',serif", fontWeight:700 };

export default function Writer_Profile() {
  const wid = localStorage.getItem('writerid') || localStorage.getItem('userid');
  const [profile, setProfile] = useState(null);
  const [stats,   setStats]   = useState({});
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({});
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState('');
  const [loading, setLoading] = useState(true);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2600); };
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    api.writerGetProfile(wid)
      .then(d => {
        setProfile(d.writer);
        setStats(d.stats || {});
        setForm({ name: d.writer.name||'', bio: d.writer.bio||'', city: d.writer.city||'', phone: d.writer.phone||'', address: d.writer.address||'' });
      })
      .catch(() => showToast('Could not load profile.'))
      .finally(() => setLoading(false));
  }, [wid]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.writerUpdateProfile(form);
      setProfile(res.writer);
      setForm({ name: res.writer.name||'', bio: res.writer.bio||'', city: res.writer.city||'', phone: res.writer.phone||'', address: res.writer.address||'' });
      setEditing(false);
      showToast('Profile updated successfully!');
      // Update name in localStorage so navbar stays in sync
      localStorage.setItem('uname', res.writer.name || '');
    } catch { showToast('Failed to save. Try again.'); }
    setSaving(false);
  };

  if (loading) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{GL}</style>
      <div style={{ width:44, height:44, border:'3px solid #F0E6D0', borderTopColor:'#B8860B', borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
    </div>
  );

  const statCards = [
    { label:'Books Published', value: stats.totalBooks   || 0, color:'#B8860B' },
    { label:'Total Ratings',   value: stats.totalRatings || 0, color:'#2C5F7A' },
    { label:'Average Rating',  value: stats.avgRating    || '—', color:'#3D6B30' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FDF8F0,#F5ECE0)', padding:'48px 24px 80px' }}>
      <style>{GL}</style>
      {toast && (
        <div style={{ position:'fixed', top:24, right:24, background:'#2A1F0E', color:'#F5E8C8', padding:'12px 22px', borderRadius:12, fontSize:13, ...FF, zIndex:999, animation:'fadeUp 0.3s ease' }}>{toast}</div>
      )}

      <div style={{ maxWidth:800, margin:'0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom:32, animation:'fadeUp 0.5s ease both' }}>
          <div style={{ fontSize:12, letterSpacing:'2px', fontFamily:"'Cinzel',serif", color:'#B8860B', textTransform:'uppercase', marginBottom:8, fontWeight:600 }}>My Account</div>
          <h1 style={{ fontSize:36, fontWeight:900, fontFamily:"'Playfair Display',serif", color:'#2A1F0E', margin:0 }}>Writer Profile</h1>
        </div>

        {/* Avatar + stat cards */}
        <div style={{ display:'flex', gap:20, flexWrap:'wrap', marginBottom:28, animation:'fadeUp 0.5s 0.05s ease both' }}>
          {/* Avatar */}
          <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:18, padding:28, display:'flex', flexDirection:'column', alignItems:'center', gap:14, minWidth:160 }}>
            <div style={{ width:80, height:80, background:'linear-gradient(135deg,#C89030,#A06820)', borderRadius:24, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, color:'white', fontWeight:700, ...SER }}>
              {(profile?.name||'W')[0].toUpperCase()}
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:15, fontWeight:700, color:'#2A1F0E', ...FF }}>{profile?.name}</div>
              <div style={{ fontSize:12, color:'#1A1208', fontFamily:"'Cinzel',serif", letterSpacing:'1.5px', textTransform:'uppercase', marginTop:3, fontWeight:600 }}>Writer</div>
            </div>
          </div>

          {/* Stat cards */}
          {statCards.map((s,i) => (
            <div key={i} className="stat-card" style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:`1.5px solid ${s.color}22`, borderRadius:16, padding:'22px 26px', flex:1, minWidth:130, transition:'all 0.22s', boxShadow:'0 4px 16px rgba(80,50,15,.07)' }}>
              <div style={{ fontSize:30, fontWeight:900, color: s.color, ...FF, marginBottom:4 }}>{s.value}</div>
              <div style={{ fontSize:13, color:'#2A1F0E', fontFamily:"'Lato',sans-serif", fontWeight:600, letterSpacing:'0.3px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Profile card */}
        <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:18, padding:32, boxShadow:'0 6px 24px rgba(80,50,15,.08)', animation:'fadeUp 0.5s 0.1s ease both' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <span style={{ fontSize:22, fontWeight:800, fontFamily:"'Playfair Display',serif", color:'#1A1208' }}>Profile Information</span>
            {!editing && (
              <button onClick={() => setEditing(true)}
                style={{ padding:'8px 20px', background:'linear-gradient(135deg,#C89030,#A06820)', border:'none', borderRadius:9, color:'white', ...SER, fontSize:13, letterSpacing:'1px', cursor:'pointer' }}>
                Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18 }}>
                <div><label style={LBL}>Full Name</label><input className="gl-input" style={INP} value={form.name} onChange={set('name')} /></div>
                <div><label style={LBL}>City</label><input className="gl-input" style={INP} value={form.city} onChange={set('city')} /></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18 }}>
                <div><label style={LBL}>Phone</label><input className="gl-input" style={INP} value={form.phone} onChange={set('phone')} /></div>
                <div><label style={LBL}>Address</label><input className="gl-input" style={INP} value={form.address} onChange={set('address')} /></div>
              </div>
              <div style={{ marginBottom:22 }}>
                <label style={LBL}>Bio / About</label>
                <textarea className="gl-input" style={{ ...INP, minHeight:100, resize:'vertical', lineHeight:1.6 }} value={form.bio} onChange={set('bio')} placeholder="Tell readers about yourself…" />
              </div>
              <div style={{ display:'flex', gap:12 }}>
                <button className="save-btn" onClick={handleSave} disabled={saving}
                  style={{ padding:'12px 28px', background: saving ? '#C0A060' : 'linear-gradient(135deg,#C89030,#A06820)', border:'none', borderRadius:10, color:'white', ...SER, fontSize:13, letterSpacing:'1px', cursor: saving ? 'not-allowed' : 'pointer', transition:'all 0.25s' }}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button onClick={() => setEditing(false)}
                  style={{ padding:'12px 22px', background:'transparent', border:'1.5px solid #E0CFA8', borderRadius:10, color:'#2A1F0E', ...SER, fontSize:13, cursor:'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              {[
                { label:'Email',   value: profile?.email   },
                { label:'Phone',   value: profile?.phone   },
                { label:'City',    value: profile?.city    },
                { label:'Address', value: profile?.address },
                { label:'Member since', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year:'numeric', month:'long' }) : '—' },
              ].map((f,i) => (
                <div key={i}>
                  <div style={{ display:'block', marginBottom:5, fontSize:11, letterSpacing:'1.5px', textTransform:'uppercase', color:'#B8860B', fontFamily:"'Cinzel',serif", fontWeight:700 }}>{f.label}</div>
                  <div style={{ fontSize:14, color:'#2A1F0E', ...FF }}>{f.value || '—'}</div>
                </div>
              ))}
              {profile?.bio && (
                <div style={{ gridColumn:'1 / -1' }}>
                  <div style={{ display:'block', marginBottom:5, fontSize:11, letterSpacing:'1.5px', textTransform:'uppercase', color:'#B8860B', fontFamily:"'Cinzel',serif", fontWeight:700 }}>Bio</div>
                  <div style={{ fontSize:14, color:'#2A1F0E', ...FF, lineHeight:1.7 }}>{profile.bio}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
