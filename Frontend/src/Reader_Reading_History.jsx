import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, imgUrl } from './api';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .hist-row:hover{background:#FDF6E8!important}
  .borrow-row:hover{background:#F0F7FF!important}
  .tab-btn:hover{opacity:0.85}
`;
const FF  = { fontFamily:"'Lato',sans-serif" };
const SER = { fontFamily:"'Cinzel',serif" };

const Stars = ({ n }) => (
  <div style={{ display:'flex', gap:2 }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i<=n?'#B8860B':'none'} stroke={i<=n?'#B8860B':'#C0A870'} strokeWidth="1.5">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
      </svg>
    ))}
  </div>
);

const StatusBadge = ({ status }) => {
  const colors = {
    borrowed: { bg:'#EFF6FF', color:'#1D4ED8', border:'#BFDBFE' },
    returned: { bg:'#F0FDF4', color:'#15803D', border:'#BBF7D0' },
    overdue:  { bg:'#FFF7ED', color:'#C2410C', border:'#FED7AA' },
  };
  const c = colors[status] || colors.borrowed;
  return (
    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, letterSpacing:'0.5px',
      background:c.bg, color:c.color, border:`1px solid ${c.border}`, ...SER }}>
      {status?.toUpperCase()}
    </span>
  );
};

export default function Reader_Reading_History() {
  const [tab,      setTab]      = useState('ratings');
  const [ratings,  setRatings]  = useState([]);
  const [borrows,  setBorrows]  = useState([]);
  const [recent,   setRecent]   = useState([]);
  const [filter,   setFilter]   = useState('all');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.readerGetMyRatings().catch(() => []),
      api.getMyBorrows().catch(() => []),
      api.readerGetRecent().catch(() => []),
    ]).then(([r, b, rv]) => {
      setRatings(Array.isArray(r) ? r : []);
      setBorrows(Array.isArray(b) ? (b.borrows || b) : []);
      setRecent(Array.isArray(rv) ? rv : []);
    }).finally(() => setLoading(false));
  }, []);

  // ── Filtered ratings ──
  const filteredRatings = ratings.filter(r => {
    if (filter === '5')       return r.rating === 5;
    if (filter === '4')       return r.rating === 4;
    if (filter === 'low')     return r.rating <= 3;
    if (filter === 'reviewed') return !!r.review;
    return true;
  });

  // ── Filtered borrows ──
  const filteredBorrows = borrows.filter(b => {
    if (filter === 'borrowed') return b.status === 'borrowed';
    if (filter === 'returned') return b.status === 'returned';
    if (filter === 'overdue')  return b.status === 'overdue';
    return true;
  });

  const avg = ratings.length
    ? (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1)
    : '—';

  const TabBtn = ({ id, label, count }) => (
    <button className="tab-btn" onClick={() => { setTab(id); setFilter('all'); }}
      style={{ padding:'10px 22px', borderRadius:10, border:'none', cursor:'pointer', transition:'all 0.15s',
        ...SER, fontSize:11, letterSpacing:'1.5px', textTransform:'uppercase',
        background: tab===id ? 'linear-gradient(135deg,#C89030,#A06820)' : 'rgba(0,0,0,0.04)',
        color:      tab===id ? 'white' : '#7A6040',
        fontWeight: tab===id ? 700 : 400,
      }}>
      {label} {count !== undefined && <span style={{ opacity:0.75, marginLeft:4 }}>({count})</span>}
    </button>
  );

  const FilterBtn = ({ key2, label }) => (
    <button onClick={() => setFilter(key2)}
      style={{ padding:'6px 14px', borderRadius:20, border:'1.5px solid', cursor:'pointer', transition:'all 0.15s',
        ...SER, fontSize:11, letterSpacing:'1px',
        borderColor: filter===key2 ? '#B8860B' : '#E0CFA8',
        background:  filter===key2 ? 'linear-gradient(135deg,#C89030,#A06820)' : 'transparent',
        color:       filter===key2 ? 'white' : '#7A6040',
      }}>
      {label}
    </button>
  );

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FDF8F0,#F5ECE0)', padding:'48px 24px 80px' }}>
      <style>{GL}</style>

      <div style={{ maxWidth:960, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom:28, animation:'fadeUp 0.5s ease both' }}>
          <div style={{ fontSize:11, letterSpacing:'2px', ...SER, color:'#B8860B', textTransform:'uppercase', marginBottom:8 }}>My Library</div>
          <h1 style={{ fontSize:34, fontWeight:900, fontFamily:"'Playfair Display',serif", color:'#2A1F0E', margin:'0 0 20px' }}>Reading History</h1>

          {/* Stats */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:24 }}>
            {[
              { val: ratings.length,  label:'Books Rated',    color:'#B8860B' },
              { val: avg,             label:'Avg Rating',     color:'#2C5F7A' },
              { val: borrows.length,  label:'Books Borrowed', color:'#2D6A30' },
              { val: recent.length,   label:'Recently Viewed',color:'#8B4A7E' },
            ].map((s,i) => (
              <div key={i} style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:10, padding:'10px 18px', textAlign:'center', minWidth:100 }}>
                <div style={{ fontSize:22, fontWeight:700, color:s.color, ...FF }}>{s.val}</div>
                <div style={{ fontSize:10, letterSpacing:'1.5px', textTransform:'uppercase', color:'#B8860B', ...SER }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <TabBtn id="ratings"  label="Ratings & Reviews" count={ratings.length} />
            <TabBtn id="borrows"  label="Borrow History"    count={borrows.length} />
            <TabBtn id="recent"   label="Recently Viewed"   count={recent.length} />
          </div>
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
            <div style={{ width:36, height:36, border:'2.5px solid #F0E6D0', borderTopColor:'#B8860B', borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
          </div>
        ) : (
          <>
            {/* ── RATINGS TAB ── */}
            {tab === 'ratings' && (
              <>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
                  {[['all','All'],['5','5 Stars'],['4','4 Stars'],['low','1–3 Stars'],['reviewed','With Review']].map(([k,l]) => (
                    <FilterBtn key2={k} label={l} key={k} />
                  ))}
                </div>
                {filteredRatings.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'60px 20px' }}>
                    <p style={{ ...FF, color:'#3D2B0E', fontSize:15 }}>{ratings.length===0 ? "You haven't rated any books yet." : "No books match this filter."}</p>
                    {ratings.length===0 && <Link to="/reader_view_all_books" style={{ display:'inline-block', marginTop:16, padding:'10px 22px', background:'linear-gradient(135deg,#C89030,#A06820)', borderRadius:10, color:'white', ...SER, fontSize:13, letterSpacing:'1px', textDecoration:'none' }}>Browse Books</Link>}
                  </div>
                ) : (
                  <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:18, overflow:'hidden', animation:'fadeUp 0.4s ease both' }}>
                    {filteredRatings.map((r, i) => (
                      <div key={r._id} className="hist-row" style={{ display:'flex', gap:14, padding:'14px 20px', borderBottom: i < filteredRatings.length-1 ? '1px solid #F0E6D0':'none', transition:'0.15s' }}>
                        {r.cover_img
                          ? <img src={imgUrl(r.cover_img)} style={{ width:36, height:50, objectFit:'cover', borderRadius:6, flexShrink:0 }} alt="" />
                          : <div style={{ width:36, height:50, background:'#F0E6D0', borderRadius:6, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>📚</div>
                        }
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:14, fontWeight:600, color:'#2A1F0E', ...FF, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:4 }}>{r.book_name}</div>
                          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: r.review ? 5 : 0 }}>
                            <Stars n={r.rating} />
                            <span style={{ fontSize:12, color:'#7A6040', ...FF }}>{new Date(r.rating_date).toLocaleDateString()}</span>
                            {r.genre && <span style={{ fontSize:11, color:'#B8860B', ...SER, letterSpacing:'0.5px' }}>{r.genre}</span>}
                          </div>
                          {r.review && <div style={{ fontSize:12, color:'#5A4832', ...FF, fontStyle:'italic', lineHeight:1.5 }}>"{r.review}"</div>}
                        </div>
                        <Link to={`/reader_view_book_detail/${r.book_id}`}
                          style={{ display:'flex', alignItems:'center', padding:'6px 12px', background:'#FDF6E8', border:'1px solid #E0CFA8', borderRadius:8, fontSize:11, ...SER, letterSpacing:'1px', color:'#2A1F0E', textDecoration:'none', flexShrink:0, alignSelf:'center' }}>
                          Update
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── BORROWS TAB ── */}
            {tab === 'borrows' && (
              <>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
                  {[['all','All'],['borrowed','Active'],['returned','Returned'],['overdue','Overdue']].map(([k,l]) => (
                    <FilterBtn key2={k} label={l} key={k} />
                  ))}
                </div>
                {filteredBorrows.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'60px 20px' }}>
                    <p style={{ ...FF, color:'#3D2B0E', fontSize:15 }}>{borrows.length===0 ? "You haven't borrowed any books yet." : "No records match this filter."}</p>
                    {borrows.length===0 && <Link to="/reader_view_all_books" style={{ display:'inline-block', marginTop:16, padding:'10px 22px', background:'linear-gradient(135deg,#C89030,#A06820)', borderRadius:10, color:'white', ...SER, fontSize:13, letterSpacing:'1px', textDecoration:'none' }}>Browse Books</Link>}
                  </div>
                ) : (
                  <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:18, overflow:'hidden', animation:'fadeUp 0.4s ease both' }}>
                    {filteredBorrows.map((b, i) => {
                      const book = b.book || {};
                      const due  = b.dueDate ? new Date(b.dueDate) : null;
                      const isOverdue = b.status === 'overdue';
                      return (
                        <div key={b._id} className="borrow-row" style={{ display:'flex', gap:14, padding:'14px 20px', borderBottom: i < filteredBorrows.length-1 ? '1px solid #F0E6D0':'none', transition:'0.15s' }}>
                          <div style={{ width:36, height:50, background: isOverdue ? '#FFF7ED':'#EFF6FF', borderRadius:6, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                            {isOverdue ? '⚠️' : '📖'}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:14, fontWeight:600, color:'#2A1F0E', ...FF, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:4 }}>
                              {book.title || '—'}
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                              <StatusBadge status={b.status} />
                              <span style={{ fontSize:12, color:'#7A6040', ...FF }}>
                                Borrowed: {new Date(b.borrowedAt).toLocaleDateString()}
                              </span>
                              {due && (
                                <span style={{ fontSize:12, color: isOverdue?'#C2410C':'#7A6040', fontWeight: isOverdue?700:400, ...FF }}>
                                  Due: {due.toLocaleDateString()}
                                </span>
                              )}
                              {b.returnedAt && (
                                <span style={{ fontSize:12, color:'#15803D', ...FF }}>
                                  Returned: {new Date(b.returnedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <Link to={`/reader_view_book_detail/${book._id}`}
                            style={{ display:'flex', alignItems:'center', padding:'6px 12px', background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:8, fontSize:11, ...SER, letterSpacing:'1px', color:'#1D4ED8', textDecoration:'none', flexShrink:0, alignSelf:'center' }}>
                            View
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* ── RECENTLY VIEWED TAB ── */}
            {tab === 'recent' && (
              <>
                {recent.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'60px 20px' }}>
                    <p style={{ ...FF, color:'#3D2B0E', fontSize:15 }}>No recently viewed books yet.</p>
                    <Link to="/reader_view_all_books" style={{ display:'inline-block', marginTop:16, padding:'10px 22px', background:'linear-gradient(135deg,#C89030,#A06820)', borderRadius:10, color:'white', ...SER, fontSize:13, letterSpacing:'1px', textDecoration:'none' }}>Browse Books</Link>
                  </div>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:16, animation:'fadeUp 0.4s ease both' }}>
                    {recent.map((b, i) => (
                      <Link key={b._id || i} to={`/reader_view_book_detail/${b.book_id || b._id}`} style={{ textDecoration:'none', display:'block', background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:14, overflow:'hidden', transition:'all 0.25s', boxShadow:'0 2px 10px rgba(100,70,30,0.07)' }}>
                        {b.cover_img
                          ? <img src={imgUrl(b.cover_img)} style={{ width:'100%', height:130, objectFit:'cover' }} alt="" />
                          : <div style={{ width:'100%', height:130, background:'linear-gradient(135deg,#E8D5B0,#D4B870)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36 }}>📚</div>
                        }
                        <div style={{ padding:'10px 12px' }}>
                          <div style={{ fontSize:13, fontWeight:600, color:'#2A1F0E', ...FF, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.book_name}</div>
                          {b.genre && <div style={{ fontSize:11, color:'#B8860B', ...SER, letterSpacing:'0.5px', marginTop:3 }}>{b.genre}</div>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
