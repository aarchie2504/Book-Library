import { useState, useEffect, useCallback } from 'react';
import { api } from './api';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .gl-input:focus{border-color:#B8860B!important;outline:none;box-shadow:0 0 0 3px rgba(184,134,11,.1)!important}
  .trow:hover{background:#FDF6E8!important}
  .btn-sm:hover{opacity:0.85;transform:translateY(-1px)}
`;
const ff = { fontFamily:"'Lato',sans-serif" };
const serif = { fontFamily:"'Cinzel',serif" };

export default function Admin_Manage_Writers() {
  const [writers, setWriters] = useState([]);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const [pages, setPages]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2600); };

  const load = useCallback((p = 1, q = search) => {
    setLoading(true);
    const params = `?page=${p}&limit=10${q ? `&search=${encodeURIComponent(q)}` : ''}`;
    api.adminGetWriters(params)
      .then(d => { setWriters(d.writers||[]); setTotal(d.total||0); setPages(d.pages||1); setPage(p); })
      .catch(() => showToast('Failed to load writers.'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { load(1, ''); }, []);

  const handleSearch = (e) => { e.preventDefault(); load(1, search); };

  const handleBlock = async (id, isBlocked) => {
    await api.adminBlockUser(id);
    showToast(isBlocked ? 'Writer unblocked.' : 'Writer blocked.');
    load(page);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete writer "${name}"? All their books will remain but be unlinked.`)) return;
    await api.adminDeleteUser(id);
    showToast('Writer deleted.');
    load(page);
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FDF8F0,#F5ECE0)', padding:'48px 24px 80px' }}>
      <style>{GL}</style>

      {toast && (
        <div style={{ position:'fixed', top:24, right:24, background:'#2A1F0E', color:'#F5E8C8', padding:'12px 22px', borderRadius:12, fontSize:13, ...ff, zIndex:999 }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:12, letterSpacing:'2px', fontFamily:"'Cinzel',serif", color:'#B8860B', textTransform:'uppercase', marginBottom:8, fontWeight:600 }}>Admin Panel</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <h1 style={{ fontSize:32, fontWeight:900, fontFamily:"'Playfair Display',serif", color:'#2A1F0E', margin:0 }}>Manage Writers</h1>
            <div style={{ background:'#FDF6E8', border:'1px solid #E2D5BA', borderRadius:10, padding:'8px 18px', fontSize:13, ...ff, color:'#2A1F0E' }}>
              Total: <strong style={{ color:'#2A1F0E' }}>{total}</strong> writers
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} style={{ display:'flex', gap:10, marginBottom:24 }}>
          <input
            className="gl-input"
            style={{ flex:1, padding:'11px 16px', background:'#FBF6ED', border:'1.5px solid #E0CFA8', borderRadius:10, ...ff, fontSize:14, color:'#2A1F0E', transition:'all 0.2s' }}
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" style={{ padding:'11px 24px', background:'linear-gradient(135deg,#C89030,#A06820)', border:'none', borderRadius:10, color:'white', ...serif, fontSize:13, letterSpacing:'1.2px', cursor:'pointer' }}>
            Search
          </button>
        </form>

        <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:16, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1.5px solid #E2D5BA', background:'rgba(240,230,208,0.4)' }}>
                {['#','Name','Email','City','Bio','Books','Status','Actions'].map((h,i) => (
                  <th key={i} style={{ padding:'13px 16px', textAlign:'left', fontSize:13, ...serif, letterSpacing:'1.5px', textTransform:'uppercase', color:'#1A1208' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding:40, textAlign:'center' }}>
                  <div style={{ width:32,height:32, border:'2.5px solid #F0E6D0', borderTopColor:'#B8860B', borderRadius:'50%', animation:'spin 0.9s linear infinite', margin:'0 auto' }} />
                </td></tr>
              ) : writers.length === 0 ? (
                <tr><td colSpan={8} style={{ padding:32, textAlign:'center', ...ff, color:'#3D2B0E', fontSize:14 }}>No writers found.</td></tr>
              ) : writers.map((w, i) => (
                <tr key={w._id} className="trow" style={{ borderBottom:'1px solid #F0E6D0', transition:'0.15s', opacity: w.isBlocked ? 0.65 : 1 }}>
                  <td style={{ padding:'12px 16px', fontSize:12, color:'#3D2B0E', ...ff }}>{(page-1)*10+i+1}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                      <div style={{ width:32,height:32, background:'linear-gradient(135deg,#2C5F7A,#1A3D50)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:12, ...serif, flexShrink:0 }}>
                        {(w.name||'?')[0].toUpperCase()}
                      </div>
                      <span style={{ fontSize:13, fontWeight:600, color:'#2A1F0E', ...ff }}>{w.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px', fontSize:13, color:'#2A1F0E', ...ff }}>{w.email}</td>
                  <td style={{ padding:'12px 16px', fontSize:12, color:'#2A1F0E', ...ff }}>{w.city||'—'}</td>
                  <td style={{ padding:'12px 16px', fontSize:12, color:'#2A1F0E', ...ff, maxWidth:160 }}>
                    <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{w.bio||'—'}</div>
                  </td>
                  <td style={{ padding:'12px 16px', fontSize:13, color:'#2A1F0E', ...ff, textAlign:'center' }}>{w.bookCount||0}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ fontSize:13, padding:'3px 10px', borderRadius:20, ...serif,
                      ...(w.isBlocked ? { background:'#FCEBEB', color:'#A32D2D', border:'1px solid #F09595' } : { background:'#EAF3DE', color:'#3B6D11', border:'1px solid #97C459' })
                    }}>
                      {w.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn-sm" onClick={() => handleBlock(w._id, w.isBlocked)}
                        style={{ padding:'5px 12px', border:'none', borderRadius:7, fontSize:13, cursor:'pointer', transition:'all 0.15s', ...serif,
                          background: w.isBlocked ? '#EAF3DE' : '#FCEBEB',
                          color: w.isBlocked ? '#3B6D11' : '#A32D2D',
                        }}>
                        {w.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                      <button className="btn-sm" onClick={() => handleDelete(w._id, w.name)}
                        style={{ padding:'5px 12px', border:'none', borderRadius:7, fontSize:13, background:'#F7C1C1', color:'#791F1F', cursor:'pointer', transition:'all 0.15s', ...serif }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:24 }}>
            {Array.from({ length: pages }, (_, i) => i+1).map(p => (
              <button key={p} onClick={() => load(p)}
                style={{ width:36,height:36, borderRadius:8, border:'1.5px solid', cursor:'pointer', transition:'all 0.15s', ...serif, fontSize:12,
                  borderColor: p===page ? '#B8860B' : '#E0CFA8',
                  background:  p===page ? 'linear-gradient(135deg,#C89030,#A06820)' : 'transparent',
                  color:       p===page ? 'white' : '#7A6040',
                }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
