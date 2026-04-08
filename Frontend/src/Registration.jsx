import { Link } from "react-router-dom";

export default function Registration() {
  const options = [
    {
      to: "/writer_registration",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M14 3l7 7-10 10H4v-7z" fill="#B5451B" fillOpacity="0.2"/>
          <path d="M14 3l7 7-10 10H4v-7z" stroke="#B5451B" strokeWidth="1.8" strokeLinejoin="round"/>
          <path d="M12 5l7 7" stroke="#B5451B" strokeWidth="1.4" strokeOpacity="0.5"/>
        </svg>
      ),
      title: "Join as Writer",
      desc: "Upload your books, share your stories, and reach readers around the world.",
      color: "#B5451B",
    },
    {
      to: "/reader_registration",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5z" fill="#2C5F7A" fillOpacity="0.18"/>
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="#2C5F7A" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="#2C5F7A" strokeWidth="1.8"/>
          <line x1="9" y1="7" x2="15" y2="7" stroke="#2C5F7A" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.6"/>
          <line x1="9" y1="11" x2="13" y2="11" stroke="#2C5F7A" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.6"/>
        </svg>
      ),
      title: "Join as Reader",
      desc: "Discover thousands of books, read PDFs in-browser, and rate your favourites.",
      color: "#2C5F7A",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #FDF8F0 0%, #F8F0E0 40%, #F5ECE0 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "60px 24px", position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmerGold{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes pulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.7;transform:scale(1.04)}}
        .reg-card:hover{transform:translateY(-8px) scale(1.02);box-shadow:0 28px 70px rgba(100,70,30,.18)!important}
      `}</style>

      <div style={{ position:"absolute", top:"-10%", right:"-5%", width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle, rgba(210,165,80,.10) 0%, transparent 70%)", animation:"pulse 14s ease-in-out infinite", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:0, left:"-5%", width:"380px", height:"380px", borderRadius:"50%", background:"radial-gradient(circle, rgba(185,110,50,.08) 0%, transparent 70%)", animation:"pulse 14s ease-in-out 5s infinite", pointerEvents:"none" }} />

      <div style={{ maxWidth:"760px", width:"100%", textAlign:"center", position:"relative", zIndex:2 }}>
        {/* Header */}
        <div style={{ marginBottom:"52px", animation:"fadeSlideUp 0.7s ease both" }}>
          <div style={{ width:"60px", height:"60px", margin:"0 auto 24px", background:"linear-gradient(145deg,#F5E8C8,#E8D0A0)", border:"1.5px solid #D4B870", borderRadius:"16px", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 20px rgba(180,130,50,.20)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5z" fill="#B8860B" fillOpacity="0.2"/>
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="#B8860B" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="#B8860B" strokeWidth="1.6"/>
            </svg>
          </div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:13, letterSpacing:"4px", color:"#B8860B", marginBottom:"14px" }}>CREATE AN ACCOUNT</div>
          <h1 style={{
            fontFamily:"'Playfair Display',serif", fontSize:"clamp(36px,5vw,52px)", fontWeight:"900", lineHeight:1.1,
            background:"linear-gradient(135deg,#3D2B0E 0%,#8B5E0A 30%,#C49020 55%,#7A4A08 80%,#3D2B0E 100%)",
            backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            animation:"shimmerGold 6s linear infinite", margin:"0 0 12px",
          }}>How would you like to join?</h1>
          <p style={{ fontFamily:"'Lato',sans-serif", fontSize:"16px", color:"#3D2B0E", fontWeight:300 }}>
            Choose your role to get started with BookLibrary
          </p>
        </div>

        {/* Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"24px", marginBottom:"40px" }}>
          {options.map((opt, i) => (
            <Link key={i} to={opt.to} className="reg-card" style={{
              display:"block", textDecoration:"none",
              background:"linear-gradient(160deg,#FFFEF8 0%,#FBF4E4 100%)",
              border:"1px solid #E2D5BA", borderRadius:"22px",
              padding:"40px 32px",
              boxShadow:"0 8px 40px rgba(80,50,15,.10)",
              transition:"all 0.35s cubic-bezier(0.175,0.885,0.32,1.275)",
              textAlign:"left",
            }}>
              <div style={{ width:"60px", height:"60px", background:`linear-gradient(145deg,${opt.color}18,${opt.color}30)`, border:`1px solid ${opt.color}35`, borderRadius:"16px", display:"flex", alignItems:"center", justifyContent:"center", color:opt.color, marginBottom:"20px" }}>
                {opt.icon}
              </div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", fontWeight:"800", color:"#2A1F0E", marginBottom:"10px" }}>{opt.title}</h2>
              <p style={{ fontFamily:"'Lato',sans-serif", fontSize:"14px", color:"#3D2B0E", lineHeight:1.7, margin:"0 0 24px" }}>{opt.desc}</p>
              <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", fontFamily:"'Cinzel',serif", fontSize:13, letterSpacing:"1px", color:opt.color, fontWeight:"600" }}>
                Get Started
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </Link>
          ))}
        </div>

        <p style={{ fontFamily:"'Lato',sans-serif", fontSize:"14px", color:"#3D2B0E" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color:"#B8860B", textDecoration:"none", fontWeight:700 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
