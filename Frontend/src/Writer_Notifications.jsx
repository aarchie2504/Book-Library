import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .notif-row:hover{background:#FDF6E8!important}
`;
const FF  = { fontFamily:"'Lato',sans-serif" };
const SER = { fontFamily:"'Cinzel',serif" };

const Stars = ({ n }) => (
  <div style={{ display:'flex', gap:2 }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i<=n?'#B8860B':'none'} stroke={i<=n?'#B8860B':'#C0A870'} strokeWidth="1.5">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
      </svg>
    ))}
  </div>
);

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  if (diff < 604800)return `${Math.floor(diff/86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function Writer_Notifications() {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');  // all | with-review | high | low

  useEffect(() => {
    api.writerGetNotifications()
      .then(d => setNotifs(d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = notifs.filter(n => {
    if (filter === 'with-review') return !!n.review;
    if (filter === 'high')        return n.rating >= 4;
    if (filter === 'low')         return n.rating <= 2;
    return true;
  });

  const filterBtn = (key, label) => (
    <button onClick={() => setFilter(key)}
      style={{ padding:'7px 16px', borderRadius:20, border:'1.5px solid', cursor:'pointer', transition:'all 0.15s', ...SER, fontSize:12, letterSpacing:'1px', textTransform:'uppercase',
        borderColor: filter===key ? '#B8860B' : '#E0CFA8',
        background:  filter===key ? 'linear-gradient(135deg,#C89030,#A06820)' : 'transparent',
        color:       filter===key ? 'white' : '#7A6040',
      }}>
      {label}
    </button>
  );

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FDF8F0,#F5ECE0)', padding:'48px 24px 80px' }}>
      <style>{GL}</style>

      <div style={{ maxWidth:860, margin:'0 auto' }}>
        <div style={{ marginBottom:28, animation:'fadeUp 0.5s ease both' }}>
          <div style={{ fontSize:12, letterSpacing:'2px', fontFamily:"'Cinzel',serif", color:'#B8860B', textTransform:'uppercase', marginBottom:8, fontWeight:600 }}>Writer Panel</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <h1 style={{ fontSize:34, fontWeight:900, fontFamily:"'Playfair Display',serif", color:'#2A1F0E', margin:0 }}>Notifications</h1>
            <div style={{ background:'#FDF6E8', border:'1px solid #E2D5BA', borderRadius:10, padding:'8px 18px', fontSize:13, ...FF, color:'#2A1F0E' }}>
              {notifs.length} recent activit{notifs.length!==1?'ies':'y'}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:22 }}>
          {filterBtn('all',         'All')}
          {filterBtn('with-review', 'With review')}
          {filterBtn('high',        '4-5 stars')}
          {filterBtn('low',         '1-2 stars')}
        </div>

        {/* Notifications list */}
        <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:18, overflow:'hidden', animation:'fadeUp 0.5s 0.05s ease both' }}>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
              <div style={{ width:32, height:32, border:'2.5px solid #F0E6D0', borderTopColor:'#B8860B', borderRadius:'50%', animation:'spin 0.9s linear infinite' }}/>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#C0A870" strokeWidth="1" style={{ marginBottom:14 }}>
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              <p style={{ ...FF, color:'#3D2B0E', fontSize:14 }}>{filter==='all' ? 'No notifications yet.' : 'No items match this filter.'}</p>
            </div>
          ) : filtered.map((n, i) => (
            <div key={n._id} className="notif-row" style={{ display:'flex', gap:14, padding:'16px 20px', borderBottom:'1px solid #F0E6D0', transition:'0.15s', animation:`fadeUp 0.3s ${i*0.03}s ease both` }}>
              {/* Icon */}
              <div style={{ width:40, height:40, background:'linear-gradient(135deg,#F5E8C8,#EDD098)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#B8860B" stroke="none"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
              </div>

              {/* Content */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, color:'#2A1F0E', ...FF, marginBottom:3 }}>
                  <strong>{n.reader_name}</strong> rated <strong>"{n.book_name}"</strong>
                </div>
                {n.review && (
                  <div style={{ fontSize:13, color:'#2A1F0E', ...FF, lineHeight:1.5, fontStyle:'italic', marginBottom:4 }}>
                    "{n.review}"
                  </div>
                )}
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <Stars n={n.rating} />
                  <span style={{ fontSize:13, color:'#3D2B0E', ...FF }}>{timeAgo(n.date)}</span>
                </div>
              </div>

              {/* Link to reviews page */}
              <Link to={`/writer_book_reviews/${n.book_id}`}
                style={{ display:'flex', alignItems:'center', padding:'6px 14px', background:'#FDF6E8', border:'1px solid #E0CFA8', borderRadius:8, fontSize:12, ...SER, letterSpacing:'1px', color:'#2A1F0E', textDecoration:'none', flexShrink:0, alignSelf:'center' }}>
                View
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
