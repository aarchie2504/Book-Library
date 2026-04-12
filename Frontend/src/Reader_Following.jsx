import { useState, useEffect } from 'react';
import { useToast } from './ToastProvider.jsx';
import { Link } from 'react-router-dom';
import { api } from './api';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .writer-card:hover{transform:translateY(-4px);box-shadow:0 16px 44px rgba(80,50,15,.14)!important}
  .unfollow-btn:hover{background:#FCEBEB!important;color:#A32D2D!important;border-color:#F09595!important}
`;
const FF  = { fontFamily:"'Lato',sans-serif" };
const SER = { fontFamily:"'Cinzel',serif" };

export default function Reader_Following() {
  const toast = useToast();
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.readerGetFollowing()
      .then(d => setWriters(d || []))
      .finally(() => setLoading(false));
  }, []);

  const handleUnfollow = async (wid, name) => {
    await api.readerToggleFollow(wid);
    setWriters(w => w.filter(x => String(x._id) !== String(wid)));
    toast.success(`Unfollowed ${name}.`);
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FDF8F0,#F5ECE0)', padding:'48px 24px 80px' }}>
      <style>{GL}</style>
      

      <div style={{ maxWidth:900, margin:'0 auto' }}>
        <div style={{ marginBottom:32, animation:'fadeUp 0.5s ease both' }}>
          <div style={{ fontSize:12, letterSpacing:'2px', fontFamily:"'Cinzel',serif", color:'#B8860B', textTransform:'uppercase', marginBottom:8, fontWeight:600 }}>My Library</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <h1 style={{ fontSize:34, fontWeight:900, fontFamily:"'Playfair Display',serif", color:'#2A1F0E', margin:0 }}>Following</h1>
            {writers.length > 0 && (
              <span style={{ fontSize:13, ...FF, color:'#2A1F0E' }}>
                Following <strong style={{ color:'#2A1F0E' }}>{writers.length}</strong> writer{writers.length!==1?'s':''}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:80 }}>
            <div style={{ width:40, height:40, border:'3px solid #F0E6D0', borderTopColor:'#B8860B', borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
          </div>
        ) : writers.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 20px', animation:'fadeUp 0.4s ease both' }}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#C0A870" strokeWidth="1" style={{ marginBottom:16 }}>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <div style={{ fontSize:22, fontWeight:700, fontFamily:"'Playfair Display',serif", color:'#4A3822', marginBottom:8 }}>Not following anyone yet</div>
            <p style={{ fontSize:14, ...FF, color:'#3D2B0E', marginBottom:24 }}>Follow writers to get notified when they publish new books.</p>
            <Link to="/reader_view_all_books" style={{ padding:'12px 26px', background:'linear-gradient(135deg,#C89030,#A06820)', borderRadius:10, color:'white', ...SER, fontSize:13, letterSpacing:'1px', textDecoration:'none' }}>Browse Books</Link>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20 }}>
            {writers.map((w, i) => (
              <div key={w._id} className="writer-card" style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:18, padding:24, boxShadow:'0 4px 18px rgba(80,50,15,.08)', transition:'all 0.3s', animation:`fadeUp 0.4s ${i*0.05}s ease both` }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                  <div style={{ width:52, height:52, background:'linear-gradient(135deg,#2C5F7A,#1A3D50)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:20, ...SER, flexShrink:0 }}>
                    {(w.name||'W')[0].toUpperCase()}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:'#2A1F0E', ...FF, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{w.name}</div>
                    <div style={{ fontSize:13, color:'#3D2B0E', ...FF, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{w.email}</div>
                  </div>
                </div>
                {w.bio && (
                  <p style={{ fontSize:12, color:'#5A4832', ...FF, lineHeight:1.6, marginBottom:14, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {w.bio}
                  </p>
                )}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                  <span style={{ fontSize:13, ...FF, color:'#2A1F0E' }}>
                    <strong style={{ color:'#2A1F0E' }}>{w.bookCount || 0}</strong> book{w.bookCount!==1?'s':''} published
                  </span>
                  {w.city && <span style={{ fontSize:13, color:'#3D2B0E', ...FF }}>{w.city}</span>}
                </div>
                <button className="unfollow-btn" onClick={() => handleUnfollow(w._id, w.name)}
                  style={{ width:'100%', padding:'8px', background:'transparent', border:'1.5px solid #E0CFA8', borderRadius:9, ...SER, fontSize:12, letterSpacing:'1px', color:'#2A1F0E', cursor:'pointer', transition:'all 0.15s' }}>
                  Unfollow
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
