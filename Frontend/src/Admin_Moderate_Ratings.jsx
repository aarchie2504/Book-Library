import { useState, useEffect } from 'react';
import { useToast, useConfirm } from './ToastProvider.jsx';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from './api';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .trow:hover{background:#FDF6E8!important}
  .btn-del:hover{background:#F09595!important;transform:translateY(-1px)}
`;
const ff = { fontFamily:"'Lato',sans-serif" };
const serif = { fontFamily:"'Cinzel',serif" };

const Stars = ({ n }) => (
  <div style={{ display:'flex', gap:2 }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width="14" height="14" viewBox="0 0 24 24"
        fill={i<=n ? '#B8860B' : 'none'}
        stroke={i<=n ? '#B8860B' : '#C0A870'}
        strokeWidth="1.5">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
      </svg>
    ))}
  </div>
);

export default function Admin_Moderate_Ratings() {
  const toast = useToast();
  const confirm = useConfirm();
  const { bid }       = useParams();
  const navigate      = useNavigate();
  const [ratings, setRatings] = useState([]);
  const [bookName, setBookName] = useState('');
  const [loading, setLoading]   = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.adminGetBookRatings(bid),
      api.getSingleBook(bid),
    ]).then(([rats, book]) => {
      setRatings(Array.isArray(rats) ? rats : (rats?.data || []));
      setBookName(book?.book_name || book?.title || 'Book');
    }).catch(() => toast.error('Failed to load ratings.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [bid]);

  const handleDelete = async (id) => {
    if (!await confirm({ title: "Confirm Action", message: 'Delete this rating permanently?', confirmLabel: "Yes, proceed", cancelLabel: "Cancel", variant: "danger" })) return;
    await api.adminDeleteRating(id);
    toast.success('Rating deleted.');
    load();
  };

  const avg = ratings.length
    ? (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1)
    : '—';

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FDF8F0,#F5ECE0)', padding:'48px 24px 80px' }}>
      <style>{GL}</style>

      

      <div style={{ maxWidth:900, margin:'0 auto' }}>
        <button onClick={() => navigate(-1)}
          style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'#B8860B', ...serif, fontSize:13, letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:28 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/></svg>
          Back
        </button>

        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:12, letterSpacing:'2px', fontFamily:"'Cinzel',serif", color:'#B8860B', textTransform:'uppercase', marginBottom:8, fontWeight:600 }}>Ratings Moderation</div>
          <h1 style={{ fontSize:28, fontWeight:900, fontFamily:"'Playfair Display',serif", color:'#2A1F0E', margin:'0 0 6px' }}>{bookName}</h1>
          <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
            <span style={{ fontSize:13, ...ff, color:'#2A1F0E' }}>{ratings.length} rating{ratings.length!==1?'s':''}</span>
            <span style={{ fontSize:13, ...ff, color:'#2A1F0E' }}>Average: <strong style={{ color:'#B8860B' }}>{avg}</strong> / 5</span>
          </div>
        </div>

        <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:16, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1.5px solid #E2D5BA', background:'rgba(240,230,208,0.4)' }}>
                {['#','Reader','Email','Rating','Date','Action'].map((h,i) => (
                  <th key={i} style={{ padding:'13px 16px', textAlign:'left', fontSize:13, ...serif, letterSpacing:'1.5px', textTransform:'uppercase', color:'#1A1208' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding:40, textAlign:'center' }}>
                  <div style={{ width:32,height:32, border:'2.5px solid #F0E6D0', borderTopColor:'#B8860B', borderRadius:'50%', animation:'spin 0.9s linear infinite', margin:'0 auto' }} />
                </td></tr>
              ) : ratings.length === 0 ? (
                <tr><td colSpan={6} style={{ padding:32, textAlign:'center', ...ff, color:'#3D2B0E', fontSize:14 }}>No ratings for this book.</td></tr>
              ) : ratings.map((r, i) => (
                <tr key={r._id} className="trow" style={{ borderBottom:'1px solid #F0E6D0', transition:'0.15s' }}>
                  <td style={{ padding:'12px 16px', fontSize:12, color:'#3D2B0E', ...ff }}>{i+1}</td>
                  <td style={{ padding:'12px 16px', fontSize:13, fontWeight:600, color:'#2A1F0E', ...ff }}>{r.reader_name}</td>
                  <td style={{ padding:'12px 16px', fontSize:12, color:'#2A1F0E', ...ff }}>{r.reader_email}</td>
                  <td style={{ padding:'12px 16px' }}><Stars n={r.rating} /></td>
                  <td style={{ padding:'12px 16px', fontSize:12, color:'#2A1F0E', ...ff }}>
                    {r.rating_date ? new Date(r.rating_date).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <button className="btn-del" onClick={() => handleDelete(r._id)}
                      style={{ padding:'5px 14px', border:'none', borderRadius:7, background:'#FCEBEB', color:'#A32D2D', fontSize:13, ...serif, cursor:'pointer', transition:'all 0.15s' }}>
                      Delete
                    </button>
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
