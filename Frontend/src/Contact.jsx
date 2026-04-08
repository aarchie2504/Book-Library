import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const contacts = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      label: "Email",
      value: "admin@booklibrary.com",
      color: "#2C5F7A",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.15 1.23 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
        </svg>
      ),
      label: "Phone",
      value: "+91 9696964242",
      color: "#2D6A30",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      label: "Location",
      value: "Ahmedabad, Gujarat, India",
      color: "#B5451B",
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
        @keyframes checkIn { from{transform:scale(0) rotate(-10deg);opacity:0} to{transform:scale(1) rotate(0);opacity:1} }
        .contact-input:focus { border-color: #B8860B !important; box-shadow: 0 0 0 3px rgba(184,134,11,0.12) !important; background: #FFFEF8 !important; }
        .contact-input::placeholder { color: #C0A870; }
        .contact-card:hover { transform: translateX(4px); border-left-color: currentColor; }
        .send-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 28px rgba(180,120,30,0.40) !important; }
      `}</style>

      {/* BG orbs */}
      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(210,165,80,0.10) 0%, transparent 70%)", animation: "pulse 14s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "0", left: "-5%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(185,110,50,0.08) 0%, transparent 70%)", animation: "pulse 14s ease-in-out 5s infinite", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 2 }}>

        {/* Header */}
        <div style={{ marginBottom: "56px", animation: "fadeSlideUp 0.7s ease both" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            fontFamily: "'Cinzel', serif", fontSize: "10px",
            letterSpacing: "4px", textTransform: "uppercase",
            color: "#B8860B", marginBottom: "14px",
          }}>
            <div style={{ width: "24px", height: "1.5px", background: "#B8860B", borderRadius: "2px" }} />
            Get in Touch
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(38px, 5vw, 56px)",
            fontWeight: "900", lineHeight: 1.1,
            background: "linear-gradient(135deg, #3D2B0E 0%, #8B5E0A 30%, #C49020 55%, #7A4A08 80%, #3D2B0E 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shimmerGold 6s linear infinite",
          }}>Contact Us</h1>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.6fr",
          gap: "40px", alignItems: "start",
        }}>

          {/* LEFT — contact info */}
          <div style={{ animation: "fadeSlideUp 0.8s 0.1s ease both" }}>
            <p style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: "16px", color: "#7A6248",
              lineHeight: 1.85, marginBottom: "36px",
              fontWeight: 300,
            }}>
              Have questions, suggestions, or just want to say hello?
              We'd love to hear from you.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {contacts.map((c, i) => (
                <div key={i} className="contact-card" style={{
                  display: "flex", alignItems: "flex-start", gap: "16px",
                  padding: "20px 20px",
                  background: "linear-gradient(160deg, rgba(255,252,242,0.9), rgba(250,242,224,0.9))",
                  border: "1px solid #E8DFC8",
                  borderLeft: `3px solid ${c.color}55`,
                  borderRadius: "14px",
                  transition: "all 0.25s",
                }}>
                  <div style={{
                    width: "44px", height: "44px", flexShrink: 0,
                    background: `linear-gradient(145deg, ${c.color}18, ${c.color}30)`,
                    border: `1px solid ${c.color}30`,
                    borderRadius: "12px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: c.color,
                  }}>
                    {c.icon}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "'Cinzel', serif", fontSize: "9px",
                      letterSpacing: "1.5px", textTransform: "uppercase",
                      color: "#B0A070", marginBottom: "5px",
                    }}>{c.label}</div>
                    <div style={{
                      fontFamily: "'Lato', sans-serif",
                      fontSize: "15px", color: "#4A3822", fontWeight: "400",
                    }}>{c.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Decorative ornament */}
            <div style={{ marginTop: "36px", textAlign: "left" }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: "10px",
                letterSpacing: "3px", color: "#C0A060",
              }}>✦ BOOK LIBRARY</div>
            </div>
          </div>

          {/* RIGHT — form */}
          <div style={{
            background: "linear-gradient(160deg, #FFFEF8 0%, #FBF4E4 100%)",
            border: "1px solid #E2D5BA", borderRadius: "24px",
            padding: "44px 44px",
            boxShadow: "0 8px 40px rgba(80,50,15,0.10), 0 2px 8px rgba(80,50,15,0.06)",
            animation: "fadeSlideUp 0.9s 0.15s ease both",
          }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{
                  width: "80px", height: "80px", margin: "0 auto 24px",
                  background: "linear-gradient(145deg, #2D6A3018, #2D6A3030)",
                  border: "1px solid #2D6A3035",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  animation: "checkIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both",
                }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2D6A30" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "26px", fontWeight: "800",
                  color: "#2A1F0E", marginBottom: "10px",
                }}>Message Sent!</h3>
                <p style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: "15px", color: "#8A7055",
                }}>We'll get back to you soon.</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "28px" }}>
                  <div style={{
                    fontFamily: "'Cinzel', serif", fontSize: "10px",
                    letterSpacing: "3px", color: "#B8860B", marginBottom: "8px",
                  }}>SEND A MESSAGE</div>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "24px", fontWeight: "800",
                    color: "#2A1F0E",
                  }}>We'd love to hear from you</h3>
                </div>

                {/* Divider */}
                <div style={{ height: "1px", background: "linear-gradient(to right, transparent, #D4C090, transparent)", marginBottom: "28px" }} />

                <form onSubmit={e => { e.preventDefault(); setSent(true); }}>
                  {/* Name */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{
                      display: "block", marginBottom: "8px",
                      fontFamily: "'Cinzel', serif", fontSize: "9px",
                      letterSpacing: "1.5px", textTransform: "uppercase",
                      color: "#8A7055",
                    }}>Your Name</label>
                    <input
                      className="contact-input"
                      placeholder="Jane Austen"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                      style={{
                        width: "100%", padding: "13px 16px",
                        background: "#FBF6ED",
                        border: "1.5px solid #E0CFA8", borderRadius: "11px",
                        color: "#2A1F0E", fontSize: "15px",
                        fontFamily: "'Lato', sans-serif",
                        outline: "none", transition: "all 0.2s",
                      }}
                    />
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{
                      display: "block", marginBottom: "8px",
                      fontFamily: "'Cinzel', serif", fontSize: "9px",
                      letterSpacing: "1.5px", textTransform: "uppercase",
                      color: "#8A7055",
                    }}>Email Address</label>
                    <input
                      type="email"
                      className="contact-input"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      required
                      style={{
                        width: "100%", padding: "13px 16px",
                        background: "#FBF6ED",
                        border: "1.5px solid #E0CFA8", borderRadius: "11px",
                        color: "#2A1F0E", fontSize: "15px",
                        fontFamily: "'Lato', sans-serif",
                        outline: "none", transition: "all 0.2s",
                      }}
                    />
                  </div>

                  {/* Message */}
                  <div style={{ marginBottom: "28px" }}>
                    <label style={{
                      display: "block", marginBottom: "8px",
                      fontFamily: "'Cinzel', serif", fontSize: "9px",
                      letterSpacing: "1.5px", textTransform: "uppercase",
                      color: "#8A7055",
                    }}>Your Message</label>
                    <textarea
                      className="contact-input"
                      placeholder="Tell us what's on your mind…"
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      required
                      rows={5}
                      style={{
                        width: "100%", padding: "13px 16px",
                        background: "#FBF6ED",
                        border: "1.5px solid #E0CFA8", borderRadius: "11px",
                        color: "#2A1F0E", fontSize: "15px",
                        fontFamily: "'Lato', sans-serif",
                        outline: "none", transition: "all 0.2s",
                        resize: "vertical", lineHeight: 1.7,
                      }}
                    />
                  </div>

                  <button type="submit" className="send-btn" style={{
                    width: "100%", padding: "15px",
                    background: "linear-gradient(135deg, #C89030, #A06820)",
                    border: "none", borderRadius: "12px",
                    color: "white", cursor: "pointer",
                    fontFamily: "'Cinzel', serif", fontSize: "12px",
                    letterSpacing: "1.5px", fontWeight: "600",
                    boxShadow: "0 4px 16px rgba(180,120,30,0.28)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                    transition: "all 0.25s",
                  }}>
                    Send Message
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
