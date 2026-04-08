import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{
      background: "linear-gradient(160deg, #2A1F0E 0%, #3D2B0E 60%, #4A3218 100%)",
      borderTop: "1px solid rgba(184,134,11,0.20)",
      padding: "48px 24px 32px",
      position: "relative", overflow: "hidden",
      fontFamily: "'Lato', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .footer-link:hover { color: #F5D98A !important; }
      `}</style>

      {/* Grid texture */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(rgba(255,220,120,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,220,120,1) 1px, transparent 1px)",
        backgroundSize: "40px 40px", pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 2 }}>
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          gap: "40px", flexWrap: "wrap", marginBottom: "40px",
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{
                width: "36px", height: "36px",
                background: "rgba(245,217,138,0.12)",
                border: "1px solid rgba(245,217,138,0.25)",
                borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5D98A" strokeWidth="1.6">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                </svg>
              </div>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "20px", fontWeight: "900",
                color: "#F5D98A",
              }}>BookLibrary</span>
            </div>
            <p style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: "13px", color: "rgba(245,217,138,0.55)",
              lineHeight: 1.8, maxWidth: "220px", fontWeight: 300,
            }}>
              Where every story finds its reader.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: "56px", flexWrap: "wrap" }}>
            <div>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: "9px",
                letterSpacing: "2.5px", textTransform: "uppercase",
                color: "rgba(245,217,138,0.45)", marginBottom: "14px",
              }}>Explore</div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { to: "/",       label: "Home"    },
                  { to: "/about",  label: "About"   },
                  { to: "/contact",label: "Contact" },
                  { to: "/login",  label: "Sign In" },
                ].map(item => (
                  <li key={item.to}>
                    <Link to={item.to} className="footer-link" style={{
                      fontFamily: "'Lato', sans-serif",
                      fontSize: "13px", color: "rgba(245,217,138,0.60)",
                      textDecoration: "none", transition: "color 0.18s",
                    }}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: "9px",
                letterSpacing: "2.5px", textTransform: "uppercase",
                color: "rgba(245,217,138,0.45)", marginBottom: "14px",
              }}>Join</div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { to: "/reader_registration", label: "Reader Sign Up" },
                  { to: "/writer_registration", label: "Writer Sign Up" },
                ].map(item => (
                  <li key={item.to}>
                    <Link to={item.to} className="footer-link" style={{
                      fontFamily: "'Lato', sans-serif",
                      fontSize: "13px", color: "rgba(245,217,138,0.60)",
                      textDecoration: "none", transition: "color 0.18s",
                    }}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: "1px",
          background: "linear-gradient(to right, transparent, rgba(245,217,138,0.20), transparent)",
          marginBottom: "24px",
        }} />

        {/* Bottom bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "12px",
        }}>
          <div style={{
            fontFamily: "'Cinzel', serif", fontSize: "10px",
            letterSpacing: "3px", color: "rgba(245,217,138,0.35)",
          }}>
            ✦ THE BOOK LIBRARY · EST. MMXXV ✦
          </div>
          <div style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: "12px", color: "rgba(245,217,138,0.30)",
          }}>
            © {new Date().getFullYear()} BookLibrary. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
