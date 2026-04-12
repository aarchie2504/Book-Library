import { api, imgUrl, pdfUrl } from "./api";
import { useToast } from './ToastProvider.jsx';
import { Alert } from './ToastProvider.jsx';
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeSlideUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmerGold{0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes pulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.7;transform:scale(1.04)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes checkIn{from{transform:scale(0) rotate(-10deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}
  .gl-star-btn{background:none;border:none;cursor:pointer;padding:2px;transition:transform 0.15s}
  .gl-star-btn:hover{transform:scale(1.28)}
  .gl-read-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(180,120,30,.40)!important}
  .gl-submit-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(180,120,30,.40)!important}
  .gl-textarea:focus{border-color:#B8860B!important;outline:none;box-shadow:0 0 0 3px rgba(184,134,11,.1)!important}
`;

export default function Reader_View_Book_Detail() {
  const toast = useToast();
  const readerid = localStorage.getItem("readerid");
  const params   = useParams();
  const navigate = useNavigate();
  const [book,       setBook]       = useState(null);
  const [rating,     setRating]     = useState(0);
  const [review,     setReview]     = useState("");
  const [hovered,    setHovered]    = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg,        setMsg]        = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);

  const toggleBookmark = async () => {
    try {
      const res = await api.readerToggleBookmark(params.bid);
      setIsBookmarked(res.bookmarked);
    } catch {}
  };

  useEffect(() => {
    Promise.all([
      api.getSingleBook(params.bid),
      api.getReaderRating(params.bid, readerid),
      api.readerCheckBookmark(params.bid).catch(() => ({ bookmarked: false })),
    ]).then(([bk, rt, bm]) => {
      setBook(bk);
      if (rt && rt.rating) { setRating(rt.rating); setReview(rt.review || ""); }
      setIsBookmarked(bm.bookmarked || false);
    }).finally(() => setLoading(false));
    // Track this book as recently viewed
    api.readerTrackRecent(params.bid).catch(() => {});
  }, [params.bid, readerid]);

  const submitRating = async e => {
    e.preventDefault();
    if (!rating) { setMsg("empty"); return; }
    setSubmitting(true);
    try {
      await api.submitRating(params.bid, rating, readerid, review);
      setMsg("success");
      setTimeout(() => navigate("/reader_view_all_books"), 1800);
    } catch { setMsg("error"); }
    setSubmitting(false);
  };

  const ratingLabels = ["","Poor","Fair","Good","Great","Excellent"];

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(160deg,#FDF8F0,#F5ECE0)" }}>
      <style>{GL}</style>
      <div style={{ width:"44px",height:"44px",borderRadius:"50%",border:"3px solid #F0E6D0",borderTopColor:"#B8860B",animation:"spin 0.9s linear infinite" }}/>
    </div>
  );

  if (!book) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(160deg,#FDF8F0,#F5ECE0)" }}>
      <style>{GL}</style>
      <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", color:"#3D2B0E" }}>Book not found.</p>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#FDF8F0 0%,#F8F0E0 40%,#F5ECE0 100%)", fontFamily:"'Lato',sans-serif", position:"relative", overflow:"hidden" }}>
      <style>{GL}</style>
      <div style={{ position:"absolute",top:"-10%",right:"-5%",width:"500px",height:"500px",borderRadius:"50%",background:"radial-gradient(circle,rgba(210,165,80,.10) 0%,transparent 70%)",animation:"pulse 14s ease-in-out infinite",pointerEvents:"none" }}/>
      <div style={{ position:"absolute",bottom:0,left:"-5%",width:"380px",height:"380px",borderRadius:"50%",background:"radial-gradient(circle,rgba(185,110,50,.08) 0%,transparent 70%)",animation:"pulse 14s ease-in-out 5s infinite",pointerEvents:"none" }}/>

      <div style={{ maxWidth:"1100px",margin:"0 auto",padding:"72px 24px 80px",position:"relative",zIndex:2 }}>
        <div style={{ marginBottom:"40px",animation:"fadeSlideUp 0.6s ease both" }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:"10px",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:"4px",textTransform:"uppercase",color:"#B8860B",marginBottom:"10px" }}>
            <div style={{ width:"24px",height:"1.5px",background:"#B8860B",borderRadius:"2px" }}/>Book Detail
          </div>
          <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:"900",lineHeight:1.1,background:"linear-gradient(135deg,#3D2B0E 0%,#8B5E0A 30%,#C49020 55%,#7A4A08 80%,#3D2B0E 100%)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"shimmerGold 6s linear infinite",margin:0 }}>{book.book_name}</h1>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"280px 1fr",gap:"40px",alignItems:"start" }}>
          {/* Cover */}
          <div style={{ animation:"fadeSlideUp 0.7s 0.05s ease both" }}>
            <div style={{ borderRadius:"18px",overflow:"hidden",border:"1px solid #E2D5BA",boxShadow:"0 12px 40px rgba(80,50,15,.18)",marginBottom:"16px" }}>
              {book.cover_img
                ? <img src={imgUrl(book.cover_img)} style={{ width:"100%",aspectRatio:"3/4",objectFit:"cover",display:"block" }} alt={book.book_name}/>
                : <div style={{ width:"100%",aspectRatio:"3/4",background:"linear-gradient(145deg,#F5EDD8,#EDE0C0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"72px",opacity:0.5 }}>📚</div>
              }
            </div>
            <a href={pdfUrl(book.book_pdf)} target="_blank" rel="noreferrer" className="gl-read-btn" style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",width:"100%",padding:"14px",background:"linear-gradient(135deg,#C89030,#A06820)",border:"none",borderRadius:"12px",color:"white",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:"1px",fontWeight:"600",textDecoration:"none",boxShadow:"0 4px 16px rgba(180,120,30,.28)",transition:"all 0.25s" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
              Read Book
            </a>
            <button onClick={toggleBookmark} style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",width:"100%",padding:"11px",background:isBookmarked?"linear-gradient(135deg,#C89030,#A06820)":"transparent",border:"1.5px solid #D8C898",borderRadius:"12px",color:isBookmarked?"white":"#8A6040",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:"1px",cursor:"pointer",transition:"all 0.25s",marginTop:"10px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={isBookmarked?"white":"none"} stroke={isBookmarked?"white":"#8A6040"} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
              {isBookmarked ? "Bookmarked" : "Add to Bookmarks"}
            </button>
          </div>

          {/* Detail + Rating */}
          <div style={{ animation:"fadeSlideUp 0.7s 0.1s ease both" }}>
            <p style={{ fontFamily:"'Lato',sans-serif",fontSize:"16px",color:"#5A4832",lineHeight:1.85,marginBottom:"36px" }}>{book.description}</p>
            <div style={{ height:"1px",background:"linear-gradient(to right,transparent,#D4C090,transparent)",marginBottom:"36px" }}/>

            {/* Rating + Review card */}
            <div style={{ background:"linear-gradient(160deg,#FFFEF8 0%,#FBF4E4 100%)",border:"1px solid #E2D5BA",borderRadius:"20px",padding:"36px 40px",boxShadow:"0 8px 40px rgba(80,50,15,.10)" }}>
              <div style={{ fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:'1.5px',color:"#B8860B",marginBottom:"10px" }}>RATE THIS BOOK</div>
              <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:"24px",fontWeight:"800",color:"#2A1F0E",marginBottom:"6px" }}>Share Your Opinion</h3>
              <p style={{ fontFamily:"'Lato',sans-serif",fontSize:"14px",color:"#3D2B0E",marginBottom:"28px" }}>Your rating and review help other readers discover great books.</p>

              {msg==="success" && <Alert type="success" message="Rating submitted! Redirecting…" />}
              {msg==="error" && <Alert type="error" message="Error submitting. Please try again." onClose={() => setMsg("")} />}
              {msg==="empty" && <Alert type="warning" message="Please select a star rating first." onClose={() => setMsg("")} />}

              <form onSubmit={submitRating}>
                {/* Stars */}
                <div style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px" }}>
                  {[1,2,3,4,5].map(n => (
                    <button type="button" key={n} className="gl-star-btn"
                      onMouseEnter={()=>setHovered(n)} onMouseLeave={()=>setHovered(0)} onClick={()=>setRating(n)}>
                      <span style={{ fontSize:"36px",color:(hovered||rating)>=n?"#D4900A":"#E8D8C0",transition:"color 0.15s",lineHeight:1 }}>★</span>
                    </button>
                  ))}
                  {(hovered||rating) > 0 && (
                    <span style={{ fontFamily:"'Cinzel',serif",fontSize:13,color:"#B8860B",marginLeft:"8px",fontWeight:600 }}>
                      {ratingLabels[hovered||rating]}
                    </span>
                  )}
                </div>

                {/* Review textarea */}
                <div style={{ marginBottom:"24px",marginTop:"16px" }}>
                  <label style={{ display:"block",marginBottom:"7px",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:"1.5px",textTransform:"uppercase",color:"#3D2B0E" }}>
                    Written Review <span style={{ color:"#7A5A2A",fontFamily:"'Lato',sans-serif",letterSpacing:0,textTransform:"none",fontSize:13 }}>(optional)</span>
                  </label>
                  <textarea className="gl-textarea"
                    value={review} onChange={e=>setReview(e.target.value)}
                    maxLength={1000} rows={3}
                    placeholder="What did you think about this book?"
                    style={{ width:"100%",padding:"12px 15px",background:"#FBF6ED",border:"1.5px solid #E0CFA8",borderRadius:"10px",fontFamily:"'Lato',sans-serif",fontSize:"14px",color:"#2A1F0E",resize:"vertical",transition:"all 0.2s",boxSizing:"border-box",lineHeight:1.6 }}
                  />
                  <div style={{ textAlign:"right",fontSize:"12px",color:"#3D2B0E",fontFamily:"'Lato',sans-serif",marginTop:4 }}>{review.length}/1000</div>
                </div>

                <button type="submit" className="gl-submit-btn" disabled={submitting||msg==="success"}
                  style={{ display:"inline-flex",alignItems:"center",gap:"8px",padding:"14px 32px",background:(submitting||msg==="success")?"#C0A060":"linear-gradient(135deg,#C89030,#A06820)",border:"none",borderRadius:"12px",color:"white",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:"1px",fontWeight:"600",cursor:(submitting||msg==="success")?"not-allowed":"pointer",boxShadow:"0 4px 16px rgba(180,120,30,.28)",transition:"all 0.25s" }}>
                  {submitting?"Submitting…":"Submit Rating"}
                  {!submitting&&msg!=="success"&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
