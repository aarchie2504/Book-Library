import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, imgUrl } from './api';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes bar{from{width:0}to{width:var(--w)}}
  .book-row:hover{background:#FDF6E8!important}
`;
const FF  = { fontFamily:"'Lato',sans-serif" };
const SER = { fontFamily:"'Cinzel',serif" };

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Stars = ({ n }) => (
  <div style={{ display:'flex', gap:2 }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i<=n?'#B8860B':'none'} stroke={i<=n?'#B8860B':'#C0A870'} strokeWidth="1.5">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
      </svg>
    ))}
  </div>
);

export default function Writer_Analytics() {
  const wid = localStorage.getItem('writerid') || localStorage.getItem('userid');
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.writerGetAnalytics(wid)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [wid]);

  if (loading) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{GL}</style>
      <div style={{ width:44, height:44, border:'3px solid #F0E6D0', borderTopColor:'#B8860B', borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
    </div>
  );

  const { bookStats = [], trend = [], totals = {} } = data || {};
  const maxRatings = Math.max(...bookStats.map(b => b.ratingCount), 1);
  const maxTrend   = Math.max(...trend.map(t => t.count), 1);

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FDF8F0,#F5ECE0)', padding:'48px 24px 80px' }}>
      <style>{GL}</style>

      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom:32, animation:'fadeUp 0.5s ease both' }}>
          <div style={{ fontSize:12, letterSpacing:'2px', fontFamily:"'Cinzel',serif", color:'#B8860B', textTransform:'uppercase', marginBottom:8, fontWeight:600 }}>Writer Panel</div>
          <h1 style={{ fontSize:36, fontWeight:900, fontFamily:"'Playfair Display',serif", color:'#2A1F0E', margin:0 }}>Analytics</h1>
        </div>

        {/* Summary cards */}
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:28 }}>
          {[
            { label:'Total Books',   value: totals.totalBooks   || 0, color:'#B8860B' },
            { label:'Total Ratings', value: totals.totalRatings || 0, color:'#2C5F7A' },
            { label:'Avg Rating',    value: totals.avgRating    || '0.0', color:'#3D6B30' },
          ].map((s,i) => (
            <div key={i} style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:`1.5px solid ${s.color}22`, borderRadius:16, padding:'22px 28px', flex:1, minWidth:140, boxShadow:'0 4px 16px rgba(80,50,15,.07)', animation:`fadeUp 0.5s ${i*0.06}s ease both` }}>
              <div style={{ fontSize:34, fontWeight:900, color:s.color, ...FF, marginBottom:4 }}>{s.value}</div>
              <div style={{ fontSize:13, color:'#2A1F0E', fontFamily:"'Lato',sans-serif", fontWeight:600, letterSpacing:'0.3px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:24, marginBottom:24 }}>

          {/* Per-book ratings bar chart */}
          <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:18, padding:26, animation:'fadeUp 0.5s 0.1s ease both' }}>
            <div style={{ fontSize:22, fontWeight:800, fontFamily:"'Playfair Display',serif", color:'#1A1208', marginBottom:10 }}>Ratings per book</div>
            {bookStats.length === 0
              ? <p style={{ ...FF, color:'#3D2B0E', fontSize:13 }}>No books yet.</p>
              : bookStats.map((b, i) => (
                <div key={b.book_id} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:'#2A1F0E', ...FF, maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.book_name}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Stars n={Math.round(parseFloat(b.avgRating))} />
                      <span style={{ fontSize:12, color:'#2A1F0E', ...FF }}>{b.ratingCount} rating{b.ratingCount!==1?'s':''}</span>
                    </div>
                  </div>
                  <div style={{ height:8, background:'#F0E6D0', borderRadius:6, overflow:'hidden' }}>
                    <div style={{
                      height:'100%', borderRadius:6,
                      background:'linear-gradient(90deg,#C89030,#A06820)',
                      width:`${(b.ratingCount / maxRatings) * 100}%`,
                      transition:'width 1s ease',
                    }}/>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Monthly trend */}
          <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:18, padding:26, animation:'fadeUp 0.5s 0.15s ease both' }}>
            <div style={{ fontSize:22, fontWeight:800, fontFamily:"'Playfair Display',serif", color:'#1A1208', marginBottom:10 }}>Ratings trend (6 months)</div>
            {trend.length === 0
              ? <p style={{ ...FF, color:'#3D2B0E', fontSize:13 }}>No ratings in the last 6 months.</p>
              : (
                <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:120, paddingBottom:28, position:'relative' }}>
                  {trend.map((t, i) => {
                    const h = Math.max(8, (t.count / maxTrend) * 100);
                    return (
                      <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                        <span style={{ fontSize:13, color:'#B8860B', ...FF, fontWeight:600 }}>{t.count}</span>
                        <div style={{ width:'100%', height:h, background:'linear-gradient(180deg,#C89030,#A06820)', borderRadius:'4px 4px 0 0', transition:'height 0.8s ease' }}/>
                        <span style={{ fontSize:13, color:'#3D2B0E', ...FF, position:'absolute', bottom:0 }}>{MONTHS[(t._id.month-1)]}</span>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>
        </div>

        {/* Book details table */}
        <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:18, overflow:'hidden', animation:'fadeUp 0.5s 0.2s ease both' }}>
          <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #F0E6D0' }}>
            <span style={{ fontSize:22, fontWeight:800, fontFamily:"'Playfair Display',serif", color:'#1A1208' }}>All books performance</span>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'rgba(240,230,208,0.4)', borderBottom:'1.5px solid #E2D5BA' }}>
                {['Cover','Title','Genre','Avg Rating','Ratings','Added On','Reviews'].map((h,i) => (
                  <th key={i} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, ...SER, letterSpacing:'1.5px', textTransform:'uppercase', color:'#3D2B0E' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookStats.length === 0 ? (
                <tr><td colSpan={7} style={{ padding:32, textAlign:'center', ...FF, color:'#3D2B0E', fontSize:14 }}>No books uploaded yet.</td></tr>
              ) : bookStats.map(b => (
                <tr key={b.book_id} className="book-row" style={{ borderBottom:'1px solid #F0E6D0', transition:'0.15s' }}>
                  <td style={{ padding:'10px 16px' }}>
                    {b.cover_img
                      ? <img src={imgUrl(b.cover_img)} style={{ width:32, height:44, objectFit:'cover', borderRadius:5 }} alt="" />
                      : <div style={{ width:32, height:44, background:'#F0E6D0', borderRadius:5 }}/>
                    }
                  </td>
                  <td style={{ padding:'10px 16px', fontSize:13, fontWeight:600, color:'#2A1F0E', ...FF, maxWidth:180 }}>
                    <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.book_name}</div>
                  </td>
                  <td style={{ padding:'10px 16px', fontSize:12, color:'#2A1F0E', ...FF }}>{b.genre || '—'}</td>
                  <td style={{ padding:'10px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <Stars n={Math.round(parseFloat(b.avgRating))} />
                      <span style={{ fontSize:12, fontWeight:600, color:'#B8860B', ...FF }}>{b.avgRating}</span>
                    </div>
                  </td>
                  <td style={{ padding:'10px 16px', fontSize:13, color:'#2A1F0E', ...FF, textAlign:'center' }}>{b.ratingCount}</td>
                  <td style={{ padding:'10px 16px', fontSize:12, color:'#2A1F0E', ...FF }}>
                    {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding:'10px 16px' }}>
                    <Link to={`/writer_book_reviews/${b.book_id}`}
                      style={{ padding:'5px 12px', background:'#FDF6E8', border:'1px solid #E0CFA8', borderRadius:7, fontSize:13, ...SER, color:'#2A1F0E', textDecoration:'none' }}>
                      Reviews
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
