export default function About() {
  const pillars = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
        </svg>
      ),
      title: "Curated Collection",
      desc: "A growing library organised by category for easy discovery of thousands of books.",
      color: "#2C5F7A",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      ),
      title: "Empower Writers",
      desc: "Simple, elegant tools for authors to share their work with readers worldwide.",
      color: "#B5451B",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      ),
      title: "Reader Ratings",
      desc: "Community-driven ratings and reviews to surface the most beloved books.",
      color: "#B8860B",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #FDF8F0 0%, #F8F0E0 40%, #F5ECE0 100%)",
      fontFamily: "'Lato', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmerGold { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes pulse { 0%,100%{opacity:0.35;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.04)} }
        .pillar-card { transition: all 0.35s cubic-bezier(0.175,0.885,0.32,1.275); }
        .pillar-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 24px 60px rgba(100,70,30,0.14) !important; }
      `}</style>

      {/* BG orbs */}
      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(210,165,80,0.10) 0%, transparent 70%)", animation: "pulse 14s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "0", left: "-5%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(185,110,50,0.08) 0%, transparent 70%)", animation: "pulse 14s ease-in-out 5s infinite", pointerEvents: "none" }} />

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 2 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px", animation: "fadeSlideUp 0.7s ease both" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            fontFamily: "'Cinzel', serif", fontSize: "10px",
            letterSpacing: "4px", textTransform: "uppercase",
            color: "#B8860B", marginBottom: "16px",
          }}>
            <div style={{ width: "28px", height: "1.5px", background: "#B8860B", borderRadius: "2px" }} />
            Our Story
            <div style={{ width: "28px", height: "1.5px", background: "#B8860B", borderRadius: "2px" }} />
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(42px, 6vw, 62px)",
            fontWeight: "900", lineHeight: 1.1,
            background: "linear-gradient(135deg, #3D2B0E 0%, #8B5E0A 30%, #C49020 55%, #7A4A08 80%, #3D2B0E 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shimmerGold 6s linear infinite",
            marginBottom: "0",
          }}>About BookLibrary</h1>
        </div>

        {/* Main card */}
        <div style={{
          background: "linear-gradient(160deg, #FFFEF8 0%, #FBF4E4 100%)",
          border: "1px solid #E2D5BA", borderRadius: "24px",
          padding: "44px 48px", marginBottom: "28px",
          boxShadow: "0 8px 40px rgba(80,50,15,0.10), 0 2px 8px rgba(80,50,15,0.06)",
          animation: "fadeSlideUp 0.8s 0.1s ease both",
          position: "relative", overflow: "hidden",
        }}>
          {/* Decorative book icon */}
          <div style={{
            position: "absolute", top: "-20px", right: "-20px",
            width: "120px", height: "120px", opacity: 0.04,
          }}>
            <svg viewBox="0 0 24 24" fill="#B8860B">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
            </svg>
          </div>

          {/* Decorative rule */}
          <div style={{
            display: "flex", alignItems: "center", gap: "16px",
            marginBottom: "28px",
          }}>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, #D4C090)" }} />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#B8860B" opacity="0.6">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, #D4C090)" }} />
          </div>

          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "18px", fontStyle: "italic",
            color: "#4A3822", lineHeight: 1.9,
            marginBottom: "20px",
          }}>
            "A digital platform designed to connect passionate writers with curious readers.
            We believe every story deserves to be heard, and every reader deserves access to great literature."
          </p>
          <p style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: "15px", color: "#7A6248",
            lineHeight: 1.85,
          }}>
            Writers upload books with cover images and descriptions. Readers browse by category, read PDFs,
            and rate their favourites — creating a community that helps writers grow and readers discover great books.
          </p>
        </div>

        {/* Pillars */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "18px",
          animation: "fadeSlideUp 0.9s 0.2s ease both",
        }}>
          {pillars.map((p, i) => (
            <div key={i} className="pillar-card" style={{
              background: "linear-gradient(160deg, #FFFEF8 0%, #FBF4E4 100%)",
              border: "1px solid #E2D5BA",
              borderRadius: "20px", padding: "30px 26px",
              boxShadow: "0 4px 20px rgba(80,50,15,0.08)",
            }}>
              <div style={{
                width: "52px", height: "52px",
                background: `linear-gradient(145deg, ${p.color}18, ${p.color}30)`,
                border: `1px solid ${p.color}35`,
                borderRadius: "14px",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: p.color, marginBottom: "18px",
              }}>
                {p.icon}
              </div>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "17px", fontWeight: "700",
                color: "#2A1F0E", marginBottom: "10px",
              }}>{p.title}</h3>
              <p style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: "13px", color: "#8A7055",
                lineHeight: 1.7, margin: 0,
              }}>{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom ornament */}
        <div style={{ textAlign: "center", marginTop: "60px", animation: "fadeSlideUp 1s 0.3s ease both" }}>
          <div style={{
            display: "inline-block",
            fontFamily: "'Cinzel', serif", fontSize: "11px",
            letterSpacing: "4px", color: "#C0A060",
          }}>✦ WHERE EVERY STORY FINDS ITS READER ✦</div>
        </div>
      </div>
    </div>
  );
}
