import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from './api';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .review-card:hover{box-shadow:0 8px 32px rgba(80,50,15,.12)!important}
`;
const FF  = { fontFamily:"'Lato',sans-serif" };
const SER = { fontFamily:"'Cinzel',serif" };

const Stars = ({ n }) => (
  <div style={{ display:'flex', gap:2 }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i<=n?'#B8860B':'none'} stroke={i<=n?'#B8860B':'#C0A870'} strokeWidth="1.5">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
      </svg>
    ))}
  </div>
);

export default function Writer_Book_Reviews() {
  const { bid }   = useParams();
  const navigate  = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [bookName, setBookName] = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      api.writerGetReviews(bid),
      api.getSingleBook(bid),
    ]).then(([revs, book]) => {
      setReviews(revs || []);
      setBookName(book?.book_name || book?.title || 'Book');
    }).finally(() => setLoading(false));
  }, [bid]);

  const avg = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  const dist = [5,4,3,2,1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length,
    pct: reviews.length ? Math.round((reviews.filter(r => r.rating === s).length / reviews.length) * 100) : 0,
  }));

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FDF8F0,#F5ECE0)', padding:'48px 24px 80px' }}>
      <style>{GL}</style>
      <div style={{ maxWidth:860, margin:'0 auto' }}>

        <button onClick={() => navigate(-1)}
          style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'#B8860B', ...SER, fontSize:13, letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:28 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/></svg>
          Back
        </button>

        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:12, letterSpacing:'2px', fontFamily:"'Cinzel',serif", color:'#B8860B', textTransform:'uppercase', marginBottom:8, fontWeight:600 }}>Book Reviews</div>
          <h1 style={{ fontSize:30, fontWeight:900, fontFamily:"'Playfair Display',serif", color:'#2A1F0E', margin:'0 0 8px' }}>{bookName}</h1>
          <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
            <span style={{ fontSize:13, ...FF, color:'#2A1F0E' }}>{reviews.length} review{reviews.length!==1?'s':''}</span>
            <span style={{ fontSize:13, ...FF, color:'#2A1F0E' }}>Average: <strong style={{ color:'#B8860B' }}>{avg}</strong> / 5</span>
          </div>
        </div>

        {/* Rating distribution */}
        {reviews.length > 0 && (
          <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:16, padding:22, marginBottom:24, animation:'fadeUp 0.4s ease both' }}>
            <div style={{ fontSize:22, fontWeight:800, fontFamily:"'Playfair Display',serif", color:'#1A1208', marginBottom:10 }}>Rating distribution</div>
            {dist.map(d => (
              <div key={d.star} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                <div style={{ display:'flex', gap:2, flexShrink:0 }}>
                  {[...Array(d.star)].map((_,i) => <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="#B8860B"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>)}
                </div>
                <div style={{ flex:1, height:8, background:'#F0E6D0', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${d.pct}%`, background:'linear-gradient(90deg,#C89030,#A06820)', borderRadius:4, transition:'width 0.8s ease' }}/>
                </div>
                <span style={{ fontSize:12, color:'#2A1F0E', ...FF, width:40, textAlign:'right' }}>{d.count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Review cards */}
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
            <div style={{ width:36, height:36, border:'3px solid #F0E6D0', borderTopColor:'#B8860B', borderRadius:'50%', animation:'spin 0.9s linear infinite' }}/>
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C0A870" strokeWidth="1" style={{ marginBottom:14 }}>
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
            <p style={{ ...FF, color:'#3D2B0E', fontSize:15 }}>No reviews yet for this book.</p>
          </div>
        ) : reviews.map((r, i) => (
          <div key={r._id} className="review-card" style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:14, padding:20, marginBottom:14, boxShadow:'0 3px 12px rgba(80,50,15,.06)', transition:'all 0.2s', animation:`fadeUp 0.4s ${i*0.04}s ease both` }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: r.review ? 12 : 0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:36, height:36, background:'linear-gradient(135deg,#C89030,#A06820)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:13, ...SER, flexShrink:0 }}>
                  {(r.reader_name||'R')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#2A1F0E', ...FF }}>{r.reader_name}</div>
                  <div style={{ fontSize:13, color:'#3D2B0E', ...FF }}>{r.rating_date ? new Date(r.rating_date).toLocaleDateString() : '—'}</div>
                </div>
              </div>
              <Stars n={r.rating} />
            </div>
            {r.review && (
              <div style={{ fontSize:14, color:'#4A3822', ...FF, lineHeight:1.7, paddingTop:12, borderTop:'1px solid #F0E6D0' }}>
                "{r.review}"
              </div>
            )}
            {!r.review && <div style={{ fontSize:12, color:'#7A5A2A', ...FF, fontStyle:'italic', marginTop:4 }}>No written review — rating only.</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
