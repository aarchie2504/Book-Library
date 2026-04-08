import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, imgUrl } from './api';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .stat-card:hover{transform:translateY(-3px);box-shadow:0 16px 48px rgba(80,50,15,.14)!important}
  .row-hover:hover{background:#FDF6E8!important}
`;

const FF  = { fontFamily:"'Lato',sans-serif" };
const SER = { fontFamily:"'Cinzel',serif" };

const StatCard = ({ label, value, color, icon, delay, iconBg }) => (
  <div className="stat-card" style={{
    background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)',
    border:`1.5px solid ${color}33`, borderRadius:16, padding:'28px 24px',
    boxShadow:'0 6px 24px rgba(80,50,15,.09)', transition:'all 0.22s',
    animation:`fadeUp 0.6s ${delay}s ease both`, flex:1, minWidth:160,
  }}>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
      <div style={{ width:48, height:48, background:`${color}15`, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', border:`1.5px solid ${color}30` }}>
        {icon}
      </div>
    </div>
    <div style={{ fontSize:32, fontWeight:900, color:'#2A1F0E', ...FF, marginBottom:4 }}>{value}</div>
    <div style={{ fontSize:12, color:'#3D2B0E', ...SER, letterSpacing:'1.5px', textTransform:'uppercase' }}>{label}</div>
  </div>
);

const BookRow = ({ book, i }) => (
  <div className="row-hover" style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', borderRadius:8, transition:'0.15s' }}>
    <span style={{ width:22, height:22, background:'#F0E6D0', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#B8860B', ...SER, flexShrink:0 }}>{i+1}</span>
    {book.cover_img
      ? <img src={imgUrl(book.cover_img)} style={{ width:32, height:44, objectFit:'cover', borderRadius:4, flexShrink:0 }} alt="" />
      : <div style={{ width:32, height:44, background:'#F0E6D0', borderRadius:4, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C0A870" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
        </div>
    }
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontSize:13, fontWeight:600, color:'#2A1F0E', ...FF, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{book.book_name}</div>
      <div style={{ fontSize:13, color:'#3D2B0E', ...FF }}>Added by {book.addedBy}</div>
    </div>
    <div style={{ fontSize:13, color:'#B8A080', ...FF, flexShrink:0 }}>{book.createdAt ? new Date(book.createdAt).toLocaleDateString() : ''}</div>
  </div>
);

const UserRow = ({ user }) => (
  <div className="row-hover" style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', borderRadius:8, transition:'0.15s' }}>
    <div style={{ width:34, height:34, background:'linear-gradient(135deg,#C89030,#A06820)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:13, ...SER, flexShrink:0 }}>
      {(user.name || '?')[0].toUpperCase()}
    </div>
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontSize:13, fontWeight:600, color:'#2A1F0E', ...FF }}>{user.name}</div>
      <div style={{ fontSize:13, color:'#3D2B0E', ...FF, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.email}</div>
    </div>
    <div style={{ fontSize:13, color:'#B8A080', ...FF, flexShrink:0 }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}</div>
  </div>
);

export default function Admin_Dashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminDashboard()
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{GL}</style>
      <div style={{ width:44, height:44, border:'3px solid #F0E6D0', borderTopColor:'#B8860B', borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
    </div>
  );

  if (!data) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{GL}</style>
      <p style={{ ...FF, color:'#3D2B0E', fontSize:16 }}>Could not load dashboard. Make sure the backend admin routes are registered.</p>
    </div>
  );

  const { stats = {}, recentBooks = [], recentReaders = [], recentWriters = [], topRated = [] } = data || {};

  const statCards = [
    { label:'Total Books',   value:stats.totalBooks   ?? 0, color:'#B8860B', delay:0,    icon:
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5z" fill="#B8860B" fillOpacity="0.18"/>
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="#B8860B" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="#B8860B" strokeWidth="1.8"/>
        <line x1="9" y1="7" x2="15" y2="7" stroke="#B8860B" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.6"/>
        <line x1="9" y1="11" x2="13" y2="11" stroke="#B8860B" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.6"/>
      </svg> },
    { label:'Writers',       value:stats.totalWriters ?? 0, color:'#2C5F7A', delay:0.05, icon:
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M14 3l7 7-10 10H4v-7z" fill="#2C5F7A" fillOpacity="0.18"/>
        <path d="M14 3l7 7-10 10H4v-7z" stroke="#2C5F7A" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M12 5l7 7" stroke="#2C5F7A" strokeWidth="1.4" strokeOpacity="0.6"/>
        <path d="M3 21h18" stroke="#2C5F7A" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.5"/>
      </svg> },
    { label:'Readers',       value:stats.totalReaders ?? 0, color:'#3D6B30', delay:0.1,  icon:
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" fill="#3D6B30" fillOpacity="0.2" stroke="#3D6B30" strokeWidth="1.8"/>
        <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" fill="#3D6B30" fillOpacity="0.12" stroke="#3D6B30" strokeWidth="1.8" strokeLinecap="round"/>
      </svg> },
    { label:'Total Ratings', value:stats.totalRatings ?? 0, color:'#9B4A8C', delay:0.15, icon:
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#9B4A8C" fillOpacity="0.2" stroke="#9B4A8C" strokeWidth="1.8" strokeLinejoin="round"/>
        <polygon points="12,5 14.2,9.5 19,10.27 15.5,13.64 16.4,18.42 12,16.17 7.6,18.42 8.5,13.64 5,10.27 9.8,9.5" fill="#9B4A8C" fillOpacity="0.35"/>
      </svg> },
    { label:'Avg Rating',    value:stats.avgRating    ?? '—', color:'#C05C1A', delay:0.2,  icon:
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <polyline points="2,12 6,12 9,3 15,21 18,12 22,12" fill="none" stroke="#C05C1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="2" y="10" width="20" height="4" rx="2" fill="#C05C1A" fillOpacity="0.1"/>
      </svg> },
  ];

  const Panel = ({ title, linkTo, linkLabel, children }) => (
    <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:16, overflow:'hidden', animation:'fadeUp 0.6s 0.1s ease both' }}>
      <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid #F0E6D0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:22, fontWeight:800, fontFamily:"'Playfair Display',serif", color:'#1A1208' }}>{title}</span>
        {linkTo && <Link to={linkTo} style={{ fontSize:13, color:'#B8860B', ...FF, textDecoration:'none' }}>{linkLabel} →</Link>}
      </div>
      <div style={{ padding:'8px 4px' }}>{children}</div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FDF8F0,#F5ECE0)', padding:'48px 24px 80px' }}>
      <style>{GL}</style>

      {/* Header */}
      <div style={{ maxWidth:1200, margin:'0 auto 40px', animation:'fadeUp 0.5s ease both' }}>
        <div style={{ fontSize:12, letterSpacing:'2px', fontFamily:"'Cinzel',serif", color:'#B8860B', textTransform:'uppercase', marginBottom:8, fontWeight:600 }}>Admin Panel</div>
        <h1 style={{ fontSize:'clamp(26px,3vw,40px)', fontWeight:900, fontFamily:"'Playfair Display',serif", color:'#2A1F0E', margin:0 }}>Dashboard</h1>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto' }}>

        {/* Stat Cards */}
        <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:36 }}>
          {statCards.map((s,i) => <StatCard key={i} {...s} />)}
        </div>

        {/* Row 1 */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:24 }}>
          <Panel title="Recent Books" linkTo="/admin_view_books" linkLabel="View all">
            {(recentBooks||[]).map((b,i) => <BookRow key={b._id||i} book={b} i={i} />)}
            {!recentBooks?.length && <p style={{ padding:'16px 20px', ...FF, color:'#3D2B0E', fontSize:13 }}>No books yet.</p>}
          </Panel>
          <Panel title="Recent Readers" linkTo="/admin_manage_readers" linkLabel="View all">
            {(recentReaders||[]).map((u,i) => <UserRow key={u._id||i} user={u} />)}
            {!recentReaders?.length && <p style={{ padding:'16px 20px', ...FF, color:'#3D2B0E', fontSize:13 }}>No readers yet.</p>}
          </Panel>
        </div>

        {/* Row 2 */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
          <Panel title="Top Rated Books">
            {(topRated||[]).map((b,i) => (
              <div key={i} className="row-hover" style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', borderRadius:8, transition:'0.15s' }}>
                <span style={{ width:22, height:22, background:'#F0E6D0', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#B8860B', ...SER, flexShrink:0 }}>{i+1}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#2A1F0E', ...FF, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{b.book_name}</div>
                  <div style={{ fontSize:13, color:'#3D2B0E', ...FF }}>{b.count} rating{b.count !== 1 ? 's' : ''}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#B8860B" stroke="none"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                  <span style={{ fontSize:13, fontWeight:700, color:'#B8860B', ...FF }}>{b.avgRating?.toFixed(1)}</span>
                </div>
              </div>
            ))}
            {!topRated?.length && <p style={{ padding:'16px 20px', ...FF, color:'#3D2B0E', fontSize:13 }}>No ratings yet.</p>}
          </Panel>
          <Panel title="Recent Writers" linkTo="/admin_manage_writers" linkLabel="View all">
            {(recentWriters||[]).map((u,i) => <UserRow key={u._id||i} user={u} />)}
            {!recentWriters?.length && <p style={{ padding:'16px 20px', ...FF, color:'#3D2B0E', fontSize:13 }}>No writers yet.</p>}
          </Panel>
        </div>

      </div>
    </div>
  );
}
