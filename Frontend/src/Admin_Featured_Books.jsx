import { useState, useEffect } from 'react';
import { api, imgUrl } from './api';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .gl-input:focus{border-color:#B8860B!important;outline:none;box-shadow:0 0 0 3px rgba(184,134,11,.1)!important}
  .trow:hover{background:#FDF6E8!important}
  .btn-feat:hover{transform:translateY(-1px);opacity:0.85}
`;
const ff = { fontFamily:"'Lato',sans-serif" };
const serif = { fontFamily:"'Cinzel',serif" };

function BookTable({ books, onToggle, isFeatured }) {
  return (
    <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:16, overflow:'hidden' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ borderBottom:'1.5px solid #E2D5BA', background:'rgba(240,230,208,0.4)' }}>
            {['Cover','Title','Genre','Added By','Action'].map((h,i) => (
              <th key={i} style={{ padding:'12px 16px', textAlign:'left', fontSize:13, ...serif, letterSpacing:'1.5px', textTransform:'uppercase', color:'#1A1208' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {books.map(b => (
            <tr key={b._id} className="trow" style={{ borderBottom:'1px solid #F0E6D0', transition:'0.15s' }}>
              <td style={{ padding:'10px 16px', width:52 }}>
                {(b.cover_img || b.coverImage)
                  ? <img src={imgUrl(b.cover_img || b.coverImage)} style={{ width:36, height:48, objectFit:'cover', borderRadius:5 }} alt="" />
                  : <div style={{ width:36, height:48, background:'#F0E6D0', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C0A870" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                    </div>
                }
              </td>
              <td style={{ padding:'10px 16px', fontSize:13, fontWeight:600, color:'#2A1F0E', ...ff, maxWidth:260 }}>
                <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.book_name || b.title}</div>
              </td>
              <td style={{ padding:'10px 16px', fontSize:12, color:'#2A1F0E', ...ff }}>{b.cat_id || b.genre || '—'}</td>
              <td style={{ padding:'10px 16px', fontSize:12, color:'#2A1F0E', ...ff }}>{b.addedBy?.name || '—'}</td>
              <td style={{ padding:'10px 16px' }}>
                <button className="btn-feat" onClick={() => onToggle(b._id || b.book_id, b.featured)}
                  style={{ padding:'6px 16px', border:'none', borderRadius:8, fontSize:13, ...serif, cursor:'pointer', transition:'all 0.15s',
                    background: isFeatured ? '#FCEBEB' : 'linear-gradient(135deg,#C89030,#A06820)',
                    color:      isFeatured ? '#A32D2D' : 'white',
                  }}>
                  {isFeatured ? 'Unfeature' : 'Feature'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Admin_Featured_Books() {
  const [books, setBooks]     = useState([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2600); };

  const load = () => {
    setLoading(true);
    api.getAllBooks()
      .then(d => setBooks(Array.isArray(d) ? d : []))
      .catch(() => showToast('Failed to load books.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (bid, isFeatured) => {
    await api.adminToggleFeatured(bid);
    showToast(isFeatured ? 'Book unfeatured.' : 'Book marked as featured!');
    load();
  };

  const filtered = books.filter(b =>
    !search.trim() || (b.book_name || b.title || '').toLowerCase().includes(search.toLowerCase())
  );
  const featured = filtered.filter(b => b.featured);
  const rest     = filtered.filter(b => !b.featured);

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FDF8F0,#F5ECE0)', padding:'48px 24px 80px' }}>
      <style>{GL}</style>

      {toast && (
        <div style={{ position:'fixed', top:24, right:24, background:'#2A1F0E', color:'#F5E8C8', padding:'12px 22px', borderRadius:12, fontSize:13, ...ff, zIndex:999, animation:'fadeUp 0.3s ease' }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:12, letterSpacing:'2px', fontFamily:"'Cinzel',serif", color:'#B8860B', textTransform:'uppercase', marginBottom:8, fontWeight:600 }}>Admin Panel</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <h1 style={{ fontSize:32, fontWeight:900, fontFamily:"'Playfair Display',serif", color:'#2A1F0E', margin:0 }}>Featured Books</h1>
              <p style={{ margin:'6px 0 0', fontSize:13, ...ff, color:'#2A1F0E' }}>Featured books appear at the top of the reader browse page.</p>
            </div>
            <div style={{ background:'linear-gradient(135deg,#C89030,#A06820)', borderRadius:10, padding:'8px 18px', fontSize:13, ...ff, color:'white' }}>
              {featured.length} featured
            </div>
          </div>
        </div>

        <div style={{ position:'relative', marginBottom:28 }}>
          <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#7A5A2A' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
          <input className="gl-input"
            style={{ width:'100%', padding:'11px 16px 11px 42px', background:'#FBF6ED', border:'1.5px solid #E0CFA8', borderRadius:10, ...ff, fontSize:14, color:'#2A1F0E', transition:'all 0.2s', boxSizing:'border-box' }}
            placeholder="Filter books by title…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
            <div style={{ width:36,height:36, border:'3px solid #F0E6D0', borderTopColor:'#B8860B', borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <div style={{ marginBottom:32 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#B8860B"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                  <span style={{ fontSize:22, fontWeight:800, fontFamily:"'Playfair Display',serif", color:'#1A1208' }}>Currently Featured</span>
                </div>
                <BookTable books={featured} onToggle={handleToggle} isFeatured />
              </div>
            )}
            <div>
              <div style={{ marginBottom:14 }}>
                <span style={{ fontSize:22, fontWeight:800, fontFamily:"'Playfair Display',serif", color:'#1A1208' }}>All Books</span>
              </div>
              {rest.length === 0
                ? <p style={{ ...ff, color:'#3D2B0E', fontSize:14 }}>No other books.</p>
                : <BookTable books={rest} onToggle={handleToggle} isFeatured={false} />
              }
            </div>
          </>
        )}
      </div>
    </div>
  );
}
