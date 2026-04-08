import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, imgUrl, pdfUrl } from './api';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .rec-card:hover{transform:translateY(-5px);box-shadow:0 20px 50px rgba(80,50,15,.16)!important}
`;
const FF  = { fontFamily:"'Lato',sans-serif" };
const SER = { fontFamily:"'Cinzel',serif" };

export default function Reader_Recommendations() {
  const [books,   setBooks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [reason,  setReason]  = useState('');

  useEffect(() => {
    api.readerGetRecommendations()
      .then(d => {
        setBooks(d || []);
        if (d?.length) setReason(d[0].reason || '');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FDF8F0,#F5ECE0)', padding:'48px 24px 80px' }}>
      <style>{GL}</style>

      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <div style={{ marginBottom:32, animation:'fadeUp 0.5s ease both' }}>
          <div style={{ fontSize:12, letterSpacing:'2px', fontFamily:"'Cinzel',serif", color:'#B8860B', textTransform:'uppercase', marginBottom:8, fontWeight:600 }}>Personalised For You</div>
          <h1 style={{ fontSize:34, fontWeight:900, fontFamily:"'Playfair Display',serif", color:'#2A1F0E', margin:'0 0 8px' }}>Recommended Books</h1>
          {reason && <p style={{ fontSize:13, ...FF, color:'#2A1F0E', margin:0 }}>{reason}</p>}
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:80 }}>
            <div style={{ width:40, height:40, border:'3px solid #F0E6D0', borderTopColor:'#B8860B', borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
          </div>
        ) : books.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 20px' }}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#C0A870" strokeWidth="1" style={{ marginBottom:14 }}>
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
            </svg>
            <div style={{ fontSize:20, fontWeight:700, fontFamily:"'Playfair Display',serif", color:'#4A3822', marginBottom:8 }}>No recommendations yet</div>
            <p style={{ fontSize:14, ...FF, color:'#3D2B0E', marginBottom:24 }}>Rate a few books and we'll suggest ones you'll love.</p>
            <Link to="/reader_view_all_books" style={{ padding:'12px 26px', background:'linear-gradient(135deg,#C89030,#A06820)', borderRadius:10, color:'white', ...SER, fontSize:13, letterSpacing:'1px', textDecoration:'none' }}>Browse Books</Link>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:22 }}>
            {books.map((book, i) => {
              const bid = String(book._id || book.book_id);
              return (
                <div key={bid} className="rec-card" style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:18, overflow:'hidden', boxShadow:'0 4px 20px rgba(80,50,15,.08)', transition:'all 0.3s', animation:`fadeUp 0.4s ${i*0.05}s ease both` }}>
                  <div style={{ height:200, background:'#F0E6D0', overflow:'hidden', position:'relative' }}>
                    {book.cover_img
                      ? <img src={imgUrl(book.cover_img)} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" />
                      : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:52, opacity:0.4 }}>📚</div>
                    }
                    <div style={{ position:'absolute', top:10, left:10, background:'linear-gradient(135deg,#C89030,#A06820)', borderRadius:20, padding:'3px 10px', fontSize:12, color:'white', ...SER, letterSpacing:'1px' }}>
                      {book.reason || 'Recommended'}
                    </div>
                  </div>
                  <div style={{ padding:'14px 16px' }}>
                    <div style={{ fontSize:14, fontWeight:700, fontFamily:"'Playfair Display',serif", color:'#2A1F0E', marginBottom:4, lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {book.book_name}
                    </div>
                    <div style={{ fontSize:13, color:'#3D2B0E', ...FF, marginBottom:12 }}>{book.genre || '—'}</div>
                    <div style={{ display:'flex', gap:8 }}>
                      {pdfUrl(book.book_pdf)
                        ? <a href={pdfUrl(book.book_pdf)} target="_blank" rel="noreferrer"
                            style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'7px', background:'linear-gradient(135deg,#C89030,#A06820)', borderRadius:8, color:'white', ...SER, fontSize:12, letterSpacing:'1px', textDecoration:'none' }}>
                            Read
                          </a>
                        : null
                      }
                      <Link to={`/reader_view_book_detail/${bid}`}
                        style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'7px', background:'transparent', border:'1px solid #D8C898', borderRadius:8, color:'#2A1F0E', ...SER, fontSize:12, letterSpacing:'1px', textDecoration:'none' }}>
                        Rate ★
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
