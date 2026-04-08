import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getRole } from "./api";

function FloatingBook({ style, color, spine }) {
  return (
    <div style={{ position: "absolute", ...style, perspective: "300px", pointerEvents: "none" }}>
      <div style={{
        width: "28px", height: "40px", position: "relative",
        animation: "floatBook 9s ease-in-out infinite",
        animationDelay: style.animationDelay || "0s",
      }}>
        <div style={{
          position: "absolute", width: "28px", height: "40px",
          background: `linear-gradient(160deg, ${color}BB 0%, ${spine}DD 100%)`,
          borderRadius: "1px 4px 4px 1px",
          boxShadow: "2px 3px 10px rgba(0,0,0,0.10)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ width: "1.5px", height: "28px", background: "rgba(255,255,255,0.3)", borderRadius: "1px" }} />
        </div>
        <div style={{
          position: "absolute", width: "5px", height: "40px",
          background: spine + "CC", left: "-4px", borderRadius: "1px 0 0 1px",
        }} />
      </div>
    </div>
  );
}

const floatingBooksData = [
  { color: "#B5451B", spine: "#8C3415", style: { left: "5%",  top: "12%", opacity: 0.07, animationDelay: "0s",   transform: "rotate(-15deg)" } },
  { color: "#2C5F7A", spine: "#1A3D50", style: { left: "88%", top: "8%",  opacity: 0.06, animationDelay: "1.2s", transform: "rotate(20deg)"  } },
  { color: "#3D3D5C", spine: "#252540", style: { left: "92%", top: "55%", opacity: 0.05, animationDelay: "2.4s", transform: "rotate(-8deg)"  } },
  { color: "#8B4A7E", spine: "#6A3660", style: { left: "3%",  top: "65%", opacity: 0.06, animationDelay: "3.6s", transform: "rotate(12deg)"  } },
  { color: "#2D6A30", spine: "#1C4420", style: { left: "78%", top: "82%", opacity: 0.05, animationDelay: "0.8s", transform: "rotate(-22deg)" } },
  { color: "#C05C1A", spine: "#944515", style: { left: "18%", top: "88%", opacity: 0.06, animationDelay: "4.2s", transform: "rotate(18deg)"  } },
  { color: "#B8860B", spine: "#8C6708", style: { left: "55%", top: "5%",  opacity: 0.05, animationDelay: "5.0s", transform: "rotate(-10deg)" } },
  { color: "#7A5018", spine: "#573A10", style: { left: "42%", top: "92%", opacity: 0.04, animationDelay: "1.8s", transform: "rotate(25deg)"  } },
];

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M14 3l7 7-10 10H4v-7z" fill="#B5451B" fillOpacity="0.2"/>
        <path d="M14 3l7 7-10 10H4v-7z" stroke="#B5451B" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M12 5l7 7" stroke="#B5451B" strokeWidth="1.4" strokeOpacity="0.55"/>
        <circle cx="5.5" cy="18.5" r="1" fill="#B5451B" fillOpacity="0.5"/>
      </svg>
    ),
    title: "Publish Your Work",
    desc: "Writers upload books in PDF with beautiful cover images for readers worldwide to discover.",
    color: "#B5451B",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" fill="#2C5F7A" fillOpacity="0.15" stroke="#2C5F7A" strokeWidth="1.8"/>
        <circle cx="11" cy="11" r="3.5" fill="#2C5F7A" fillOpacity="0.25"/>
        <path d="M17.5 17.5L21 21" stroke="#2C5F7A" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: "Discover & Read",
    desc: "Browse thousands of books by category. Preview and read directly in your browser.",
    color: "#2C5F7A",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#B8860B" fillOpacity="0.2" stroke="#B8860B" strokeWidth="1.8" strokeLinejoin="round"/>
        <polygon points="12,5.5 14.2,9.8 19,10.5 15.5,13.8 16.4,18.5 12,16.3 7.6,18.5 8.5,13.8 5,10.5 9.8,9.8" fill="#B8860B" fillOpacity="0.4"/>
      </svg>
    ),
    title: "Rate & Inspire",
    desc: "Give ratings from 1–5 stars. Help great books rise to the top and inspire authors.",
    color: "#B8860B",
  },
];

export default function Home() {
  const canvasRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  // Redirect Get Started to the right dashboard if already logged in
  const role = getRole();
  const getStartedLink = role === "admin"  ? "/admin_dashboard"
                       : role === "writer" ? "/writer_view_uploaded_books"
                       : role === "reader" ? "/reader_view_all_books"
                       : "/register";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const motes = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.4,
      speed: Math.random() * 0.28 + 0.07,
      opacity: Math.random() * 0.25 + 0.04,
      hue: 28 + Math.random() * 28,
      sat: 55 + Math.random() * 30,
    }));
    let id;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      motes.forEach(m => {
        m.y -= m.speed;
        m.x += Math.sin(m.y * 0.008) * 0.35;
        if (m.y < -8) { m.y = canvas.height + 8; m.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${m.hue}, ${m.sat}%, 48%, ${m.opacity})`;
        ctx.fill();
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", onResize); window.removeEventListener("scroll", onScroll); };
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #FDF8F0 0%, #F8F0E0 35%, #FBF5E8 70%, #F5ECE0 100%)",
      color: "#2A1F0E",
      position: "relative",
      overflowX: "hidden",
      fontFamily: "'Lato', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        @keyframes floatBook { 0%,100%{transform:translateY(0px) rotateZ(0deg)} 30%{transform:translateY(-12px) rotateZ(3deg)} 70%{transform:translateY(8px) rotateZ(-2.5deg)} }
        @keyframes shimmerGold { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes rotateSlow { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.8;transform:scale(1.04)} }
        @keyframes bobDown { 0%,100%{transform:translateY(0)} 50%{transform:translateY(7px)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cardIn { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .home-feature-card { transition: all 0.35s cubic-bezier(0.175,0.885,0.32,1.275); }
        .home-feature-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 24px 60px rgba(100,70,30,0.16) !important; border-color: rgba(180,130,50,0.35) !important; }
        .hero-cta-primary { transition: all 0.25s; }
        .hero-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(146,98,26,0.40) !important; }
        .hero-cta-outline { transition: all 0.25s; }
        .hero-cta-outline:hover { background: rgba(146,98,26,0.10) !important; transform: translateY(-2px); }
      `}</style>

      {/* Dust mote canvas */}
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />

      {/* Floating decorative books */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {floatingBooksData.map((b, i) => (
          <FloatingBook key={i} style={b.style} color={b.color} spine={b.spine} />
        ))}
      </div>

      {/* Warm glow orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {[
          { top: "-8%",  left: "8%",  w: "600px", h: "500px", c: "rgba(210,165,80,0.10)", d: "0s"  },
          { bottom:"4%", right:"4%",  w: "420px", h: "420px", c: "rgba(185,110,50,0.07)", d: "5s"  },
          { top: "40%",  left: "45%", w: "350px", h: "350px", c: "rgba(200,155,70,0.06)", d: "10s" },
        ].map((o, i) => (
          <div key={i} style={{
            position: "absolute", ...o,
            background: `radial-gradient(ellipse, ${o.c} 0%, transparent 68%)`,
            animation: `pulse 14s ease-in-out infinite ${o.d}`,
          }} />
        ))}
      </div>

      {/* ── HERO ── */}
      <section style={{
        position: "relative", zIndex: 10,
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "100px 24px 80px",
        textAlign: "center",
      }}>
        {/* Orbital rings */}
        <div style={{
          position: "absolute", width: "520px", height: "520px",
          borderRadius: "50%", border: "1px solid rgba(180,130,50,0.12)",
          top: "50%", left: "50%",
          animation: "rotateSlow 48s linear infinite",
          pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute", width: "9px", height: "9px",
            background: "#D4A043", borderRadius: "50%",
            top: "-4px", left: "50%", marginLeft: "-4px",
            boxShadow: "0 0 12px 4px rgba(212,160,67,0.45)",
          }} />
        </div>
        <div style={{
          position: "absolute", width: "720px", height: "720px",
          borderRadius: "50%", border: "1px solid rgba(180,130,50,0.05)",
          top: "50%", left: "50%",
          animation: "rotateSlow 72s linear infinite reverse",
          pointerEvents: "none",
        }} />

        {/* Logo icon */}
        <div style={{
          width: "76px", height: "76px",
          background: "linear-gradient(145deg, #FDF6E8, #F5E8C8)",
          border: "1.5px solid #D8C090", borderRadius: "22px",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "28px",
          boxShadow: "0 4px 24px rgba(180,130,50,0.18), 0 1px 4px rgba(0,0,0,0.05)",
          animation: "fadeSlideUp 0.8s ease both",
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="1.4">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
          </svg>
        </div>

        <div style={{
          fontSize: "11px", letterSpacing: "5px", color: "#B8860B",
          fontFamily: "'Cinzel', serif", marginBottom: "18px", opacity: 0.8,
          animation: "fadeSlideUp 0.8s 0.1s ease both",
        }}>Online Book Library</div>

        <h1 style={{
          fontSize: "clamp(44px, 8vw, 84px)",
          fontFamily: "'Playfair Display', serif",
          fontWeight: "900", lineHeight: 1.05, marginBottom: "12px",
          background: "linear-gradient(135deg, #3D2B0E 0%, #8B5E0A 30%, #C49020 55%, #7A4A08 80%, #3D2B0E 100%)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "shimmerGold 6s linear infinite, fadeSlideUp 0.9s 0.15s ease both",
        }}>
          Read, Write &amp;<br /><em style={{ fontStyle: "italic" }}>Discover</em> Books
        </h1>

        <p style={{
          fontSize: "17px", color: "#7A6040",
          maxWidth: "440px", lineHeight: 1.8,
          marginBottom: "44px",
          fontFamily: "'Lato', sans-serif", fontWeight: 300,
          animation: "fadeSlideUp 0.9s 0.25s ease both",
        }}>
          A curated platform for passionate writers and curious readers.
          Share your stories, explore new worlds, and rate the books that move you.
        </p>

        {/* CTA buttons */}
        <div style={{
          display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center",
          marginBottom: "64px",
          animation: "fadeSlideUp 0.9s 0.35s ease both",
        }}>
          <Link to={getStartedLink} className="hero-cta-primary" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "14px 32px",
            background: "linear-gradient(135deg, #C89030, #A06820)",
            color: "white", textDecoration: "none",
            fontFamily: "'Cinzel', serif", fontSize: "12px", letterSpacing: "1px", fontWeight: "600",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(180,120,30,0.30)",
          }}>
            Get Started
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <Link to="/about" className="hero-cta-outline" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "14px 32px",
            background: "transparent", color: "#8B6020",
            border: "1.5px solid #C89030", textDecoration: "none",
            fontFamily: "'Cinzel', serif", fontSize: "12px", letterSpacing: "1px",
            borderRadius: "12px",
          }}>
            Learn More
          </Link>
        </div>

        {/* Feature cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px", maxWidth: "860px", width: "100%",
          animation: "fadeSlideUp 1s 0.45s ease both",
        }}>
          {features.map((f, i) => (
            <div key={i} className="home-feature-card" style={{
              background: "linear-gradient(160deg, rgba(255,252,242,0.94), rgba(250,242,224,0.94))",
              border: "1px solid #E8DFC8",
              borderRadius: "20px",
              padding: "30px 26px",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 20px rgba(100,70,30,0.08)",
              textAlign: "left",
            }}>
              <div style={{
                width: "52px", height: "52px",
                background: `linear-gradient(145deg, ${f.color}18, ${f.color}30)`,
                border: `1px solid ${f.color}35`,
                borderRadius: "14px",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: f.color, marginBottom: "16px",
              }}>
                {f.icon}
              </div>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "18px", fontWeight: "700",
                color: "#2A1F0E", marginBottom: "10px",
              }}>{f.title}</h3>
              <p style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: "14px", color: "#8A7055",
                lineHeight: 1.7, margin: 0,
              }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{
          marginTop: "60px", display: "flex", flexDirection: "column",
          alignItems: "center", gap: "6px",
          animation: "bobDown 2.2s ease-in-out infinite",
          opacity: 0.4,
        }}>
          <span style={{ fontSize: "10px", letterSpacing: "3px", color: "#A08050", fontFamily: "'Cinzel', serif" }}>EXPLORE</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A08050" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ position: "relative", zIndex: 10 }}>
        <div style={{
          background: "linear-gradient(135deg, #3D2B0E, #6B4A18)",
          padding: "48px 24px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0, opacity: 0.04,
            backgroundImage: "linear-gradient(rgba(255,220,120,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,220,120,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />
          <div style={{
            maxWidth: "800px", margin: "0 auto",
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            position: "relative", zIndex: 2,
          }}>
            {[
              { num: "Writers",  label: "Share books with readers" },
              { num: "Readers",  label: "Discover great reads"     },
              { num: "Ratings",  label: "Community feedback"       },
            ].map((s, i) => (
              <div key={i} style={{
                textAlign: "center",
                padding: "0 24px",
                borderRight: i < 2 ? "1px solid rgba(255,220,120,0.18)" : "none",
              }}>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "28px", fontWeight: "800",
                  color: "#F5D98A", lineHeight: 1, marginBottom: "8px",
                }}>{s.num}</div>
                <div style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "10px", letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  color: "rgba(245,217,138,0.65)",
                }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        position: "relative", zIndex: 10,
        borderTop: "1px solid #E0CFA8",
        padding: "32px 24px", textAlign: "center",
        fontSize: "11px", fontFamily: "'Cinzel', serif",
        letterSpacing: "3px", color: "#C0A060",
        background: "linear-gradient(to top, rgba(240,225,195,0.35), transparent)",
      }}>
        ✦ BOOK LIBRARY · WHERE EVERY STORY FINDS ITS READER ✦
      </footer>
    </div>
  );
}