import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api, imgUrl } from './api';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .gl-input:focus{border-color:#B8860B!important;outline:none;box-shadow:0 0 0 3px rgba(184,134,11,.1)!important}
  .res-row:hover{background:#FDF6E8!important}
`;
const ff = { fontFamily:"'Lato',sans-serif" };
const serif = { fontFamily:"'Cinzel',serif" };

const Section = ({ title, children, count }) => count === 0 ? null : (
  <div style={{ marginBottom:28, animation:'fadeUp 0.4s ease both' }}>
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
      <span style={{ fontSize:22, fontWeight:800, fontFamily:"'Playfair Display',serif", color:'#1A1208' }}>{title}</span>
      <span style={{ background:'#F0E6D0', color:'#3D2B0E', borderRadius:20, fontSize:13, padding:'2px 9px', ...serif }}>{count}</span>
    </div>
    <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:14, overflow:'hidden' }}>
      {children}
    </div>
  </div>
);

export default function Admin_Site_Search() {
  const [q, setQ]             = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  const search = async (val) => {
    if (!val.trim()) { setResults(null); return; }
    setLoading(true);
    const data = await api.adminSearch(val).catch(() => null);
    setResults(data);
    setLoading(false);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQ(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(val), 380);
  };

  const total = results ? (results.books?.length||0) + (results.writers?.length||0) + (results.readers?.length||0) : 0;

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FDF8F0,#F5ECE0)', padding:'48px 24px 80px' }}>
      <style>{GL}</style>

      <div style={{ maxWidth:800, margin:'0 auto' }}>
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:12, letterSpacing:'2px', fontFamily:"'Cinzel',serif", color:'#B8860B', textTransform:'uppercase', marginBottom:8, fontWeight:600 }}>Admin Panel</div>
          <h1 style={{ fontSize:32, fontWeight:900, fontFamily:"'Playfair Display',serif", color:'#2A1F0E', margin:0 }}>Site-Wide Search</h1>
          <p style={{ marginTop:8, fontSize:14, ...ff, color:'#2A1F0E' }}>Search across books, writers, and readers simultaneously.</p>
        </div>

        {/* Search input */}
        <div style={{ position:'relative', marginBottom:32 }}>
          <div style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'#7A5A2A' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
          <input
            className="gl-input"
            autoFocus
            style={{ width:'100%', padding:'15px 16px 15px 46px', background:'#FBF6ED', border:'1.5px solid #E0CFA8', borderRadius:12, ...ff, fontSize:15, color:'#2A1F0E', transition:'all 0.2s', boxSizing:'border-box' }}
            placeholder="Search books, writers, readers…"
            value={q}
            onChange={handleChange}
          />
          {loading && (
            <div style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', width:18, height:18, border:'2px solid #F0E6D0', borderTopColor:'#B8860B', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
          )}
        </div>

        {/* Results */}
        {results && total === 0 && !loading && (
          <div style={{ textAlign:'center', padding:'40px 0', ...ff, color:'#3D2B0E', fontSize:15 }}>
            No results found for "{q}"
          </div>
        )}

        {results && (
          <>
            <Section title="Books" count={results.books?.length||0}>
              {results.books?.map(b => (
                <Link key={b._id} to={`/admin_view_bookwise_rating/${b._id}`}
                  style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', borderBottom:'1px solid #F0E6D0', textDecoration:'none', transition:'0.15s' }}
                  className="res-row">
                  {b.cover_img
                    ? <img src={imgUrl(b.cover_img)} style={{ width:32,height:44, objectFit:'cover', borderRadius:4, flexShrink:0 }} alt="" />
                    : <div style={{ width:32,height:44, background:'#F0E6D0', borderRadius:4, flexShrink:0 }} />
                  }
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:'#2A1F0E', ...ff }}>{b.book_name}</div>
                    <div style={{ fontSize:12, color:'#3D2B0E', ...ff }}>{b.genre}</div>
                  </div>
                </Link>
              ))}
            </Section>

            <Section title="Writers" count={results.writers?.length||0}>
              {results.writers?.map(w => (
                <Link key={w._id} to={`/admin_view_writerwise_books_report/${w._id}`}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:'1px solid #F0E6D0', textDecoration:'none', transition:'0.15s' }}
                  className="res-row">
                  <div style={{ width:34,height:34, background:'linear-gradient(135deg,#2C5F7A,#1A3D50)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:13, ...serif, flexShrink:0 }}>
                    {(w.name||'?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:'#2A1F0E', ...ff }}>{w.name}</div>
                    <div style={{ fontSize:12, color:'#3D2B0E', ...ff }}>{w.email}</div>
                  </div>
                </Link>
              ))}
            </Section>

            <Section title="Readers" count={results.readers?.length||0}>
              {results.readers?.map(r => (
                <Link key={r._id} to={`/admin_view_readerwise_rating_report/${r._id}`}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:'1px solid #F0E6D0', textDecoration:'none', transition:'0.15s' }}
                  className="res-row">
                  <div style={{ width:34,height:34, background:'linear-gradient(135deg,#C89030,#A06820)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:13, ...serif, flexShrink:0 }}>
                    {(r.name||'?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:'#2A1F0E', ...ff }}>{r.name}</div>
                    <div style={{ fontSize:12, color:'#3D2B0E', ...ff }}>{r.email}</div>
                  </div>
                </Link>
              ))}
            </Section>
          </>
        )}

        {!results && !loading && (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C0A870" strokeWidth="1" style={{ marginBottom:16 }}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <p style={{ ...ff, color:'#3D2B0E', fontSize:15 }}>Type to search across the entire library</p>
          </div>
        )}
      </div>
    </div>
  );
}
