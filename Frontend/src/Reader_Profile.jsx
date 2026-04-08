import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, imgUrl } from './api';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .gl-input:focus{border-color:#B8860B!important;outline:none;box-shadow:0 0 0 3px rgba(184,134,11,.1)!important}
  .save-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(180,120,30,.35)!important}
  .stat-card:hover{transform:translateY(-3px)}
  .rating-row:hover{background:#FDF6E8!important}
`;
const FF  = { fontFamily:"'Lato',sans-serif" };
const SER = { fontFamily:"'Cinzel',serif" };
const INP = { width:'100%', padding:'11px 15px', background:'#FBF6ED', border:'1.5px solid #E0CFA8', borderRadius:10, fontSize:14, color:'#2A1F0E', outline:'none', transition:'all 0.2s', boxSizing:'border-box', ...FF };
const LBL = { display:'block', marginBottom:5, fontSize:11, letterSpacing:'1.5px', textTransform:'uppercase', color:'#B8860B', fontFamily:"'Cinzel',serif", fontWeight:700 };

const Stars = ({ n }) => (
  <span style={{ fontSize:13 }}>
    {[1,2,3,4,5].map(i => <span key={i} style={{ color: i<=n ? '#B8860B' : '#D8C898' }}>★</span>)}
  </span>
);

export default function Reader_Profile() {
  const rid = localStorage.getItem('readerid') || localStorage.getItem('userid');
  const [profile,  setProfile]  = useState(null);
  const [stats,    setStats]    = useState({});
  const [ratings,  setRatings]  = useState([]);
  const [editing,  setEditing]  = useState(false);
  const [form,     setForm]     = useState({});
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState('');
  const [loading,  setLoading]  = useState(true);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2600); };
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    Promise.all([
      api.readerGetProfile(rid),
      api.readerGetMyRatings(),
    ]).then(([prof, rats]) => {
      setProfile(prof.reader);
      setStats(prof.stats || {});
      setRatings(rats || []);
      setForm({ name: prof.reader.name||'', city: prof.reader.city||'', phone: prof.reader.phone||'', address: prof.reader.address||'' });
    }).catch(() => showToast('Could not load profile.'))
      .finally(() => setLoading(false));
  }, [rid]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.readerUpdateProfile(form);
      setProfile(res.reader);
      setForm({ name: res.reader.name||'', city: res.reader.city||'', phone: res.reader.phone||'', address: res.reader.address||'' });
      setEditing(false);
      localStorage.setItem('uname', res.reader.name || '');
      showToast('Profile updated!');
    } catch { showToast('Failed to save.'); }
    setSaving(false);
  };

  if (loading) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{GL}</style>
      <div style={{ width:44, height:44, border:'3px solid #F0E6D0', borderTopColor:'#B8860B', borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FDF8F0,#F5ECE0)', padding:'48px 24px 80px' }}>
      <style>{GL}</style>
      {toast && <div style={{ position:'fixed', top:24, right:24, background:'#2A1F0E', color:'#F5E8C8', padding:'12px 22px', borderRadius:12, fontSize:13, ...FF, zIndex:999, animation:'fadeUp 0.3s ease' }}>{toast}</div>}

      <div style={{ maxWidth:860, margin:'0 auto' }}>
        <div style={{ marginBottom:32, animation:'fadeUp 0.5s ease both' }}>
          <div style={{ fontSize:12, letterSpacing:'2px', fontFamily:"'Cinzel',serif", color:'#B8860B', textTransform:'uppercase', marginBottom:8, fontWeight:600 }}>My Account</div>
          <h1 style={{ fontSize:36, fontWeight:900, fontFamily:"'Playfair Display',serif", color:'#2A1F0E', margin:0 }}>Reader Profile</h1>
        </div>

        {/* Avatar + stats */}
        <div style={{ display:'flex', gap:18, flexWrap:'wrap', marginBottom:24, animation:'fadeUp 0.5s 0.05s ease both' }}>
          <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:18, padding:26, display:'flex', flexDirection:'column', alignItems:'center', gap:12, minWidth:150 }}>
            <div style={{ width:72, height:72, background:'linear-gradient(135deg,#2C5F7A,#1A3D50)', borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, color:'white', fontWeight:700, ...SER }}>
              {(profile?.name||'R')[0].toUpperCase()}
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:14, fontWeight:700, color:'#2A1F0E', ...FF }}>{profile?.name}</div>
              <div style={{ fontSize:12, color:'#1A1208', fontFamily:"'Cinzel',serif", letterSpacing:'1.5px', textTransform:'uppercase', marginTop:3, fontWeight:600 }}>Reader</div>
            </div>
          </div>
          {[
            { label:'Books Rated',    value: stats.totalRatings   || 0, color:'#B8860B' },
            { label:'Avg Rating Given', value: stats.avgGiven || '—',  color:'#2C5F7A' },
            { label:'Bookmarks',      value: stats.totalBookmarks || 0, color:'#3D6B30' },
          ].map((s,i) => (
            <div key={i} className="stat-card" style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:`1.5px solid ${s.color}22`, borderRadius:16, padding:'20px 26px', flex:1, minWidth:130, transition:'all 0.2s', boxShadow:'0 4px 16px rgba(80,50,15,.06)' }}>
              <div style={{ fontSize:30, fontWeight:900, color:s.color, ...FF, marginBottom:4 }}>{s.value}</div>
              <div style={{ fontSize:13, color:'#2A1F0E', fontFamily:"'Lato',sans-serif", fontWeight:600, letterSpacing:'0.3px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:24 }}>
          {[
            { to:'/reader_bookmarks',      label:'My Bookmarks' },
            { to:'/reader_reading_history',label:'Reading History' },
            { to:'/reader_recommendations',label:'Recommended' },
          ].map(l => (
            <Link key={l.to} to={l.to}
              style={{ padding:'8px 18px', background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:10, fontSize:13, ...SER, letterSpacing:'1px', color:'#2A1F0E', textDecoration:'none', transition:'all 0.2s' }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Profile info card */}
        <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:18, padding:28, boxShadow:'0 6px 24px rgba(80,50,15,.08)', marginBottom:24, animation:'fadeUp 0.5s 0.1s ease both' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
            <span style={{ fontSize:22, fontWeight:800, fontFamily:"'Playfair Display',serif", color:'#1A1208' }}>Profile Information</span>
            {!editing && (
              <button onClick={() => setEditing(true)}
                style={{ padding:'7px 18px', background:'linear-gradient(135deg,#C89030,#A06820)', border:'none', borderRadius:9, color:'white', ...SER, fontSize:12, letterSpacing:'1px', cursor:'pointer' }}>
                Edit
              </button>
            )}
          </div>
          {editing ? (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div><label style={LBL}>Full Name</label><input className="gl-input" style={INP} value={form.name} onChange={set('name')} /></div>
                <div><label style={LBL}>City</label><input className="gl-input" style={INP} value={form.city} onChange={set('city')} /></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:22 }}>
                <div><label style={LBL}>Phone</label><input className="gl-input" style={INP} value={form.phone} onChange={set('phone')} /></div>
                <div><label style={LBL}>Address</label><input className="gl-input" style={INP} value={form.address} onChange={set('address')} /></div>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button className="save-btn" onClick={handleSave} disabled={saving}
                  style={{ padding:'11px 24px', background: saving?'#C0A060':'linear-gradient(135deg,#C89030,#A06820)', border:'none', borderRadius:10, color:'white', ...SER, fontSize:13, letterSpacing:'1px', cursor: saving?'not-allowed':'pointer', transition:'all 0.25s' }}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button onClick={() => setEditing(false)}
                  style={{ padding:'11px 18px', background:'transparent', border:'1.5px solid #E0CFA8', borderRadius:10, color:'#2A1F0E', ...SER, fontSize:12, cursor:'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
              {[
                { label:'Email',   value: profile?.email },
                { label:'Phone',   value: profile?.phone },
                { label:'City',    value: profile?.city },
                { label:'Address', value: profile?.address },
                { label:'Member since', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year:'numeric', month:'long' }) : '—' },
              ].map((f,i) => (
                <div key={i}>
                  <div style={{ display:'block', marginBottom:5, fontSize:11, letterSpacing:'1.5px', textTransform:'uppercase', color:'#B8860B', fontFamily:"'Cinzel',serif", fontWeight:700 }}>{f.label}</div>
                  <div style={{ fontSize:14, color:'#2A1F0E', ...FF }}>{f.value || '—'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Ratings */}
        {ratings.length > 0 && (
          <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:18, overflow:'hidden', animation:'fadeUp 0.5s 0.15s ease both' }}>
            <div style={{ padding:'16px 22px 12px', borderBottom:'1px solid #F0E6D0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:22, fontWeight:800, fontFamily:"'Playfair Display',serif", color:'#1A1208' }}>My Ratings</span>
              <span style={{ fontSize:12, ...FF, color:'#3D2B0E' }}>{ratings.length} book{ratings.length!==1?'s':''} rated</span>
            </div>
            {ratings.slice(0,6).map((r,i) => (
              <div key={r._id} className="rating-row" style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 22px', borderBottom:'1px solid #F0E6D0', transition:'0.15s' }}>
                {r.cover_img
                  ? <img src={imgUrl(r.cover_img)} style={{ width:32, height:44, objectFit:'cover', borderRadius:5, flexShrink:0 }} alt="" />
                  : <div style={{ width:32, height:44, background:'#F0E6D0', borderRadius:5, flexShrink:0 }} />
                }
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#2A1F0E', ...FF, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.book_name}</div>
                  <div style={{ fontSize:13, color:'#3D2B0E', ...FF }}>{r.genre}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2, flexShrink:0 }}>
                  <Stars n={r.rating} />
                  <span style={{ fontSize:13, color:'#3D2B0E', ...FF }}>{new Date(r.rating_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {ratings.length > 6 && (
              <div style={{ padding:'12px 22px', textAlign:'center' }}>
                <Link to="/reader_reading_history" style={{ fontSize:12, color:'#B8860B', ...FF, textDecoration:'none' }}>View all {ratings.length} ratings →</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
