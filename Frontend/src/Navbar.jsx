import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { clearSession, getRole } from "./api";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Re-read from localStorage on every route change so login/logout reflects immediately
  const [role,  setRole]  = useState(() => getRole());
  const [uname, setUname] = useState(() => localStorage.getItem("uname") || "");

  useEffect(() => {
    setRole(getRole());
    setUname(localStorage.getItem("uname") || "");
  }, [location.pathname]);

  const isAdmin  = role === "admin";
  const isWriter = role === "writer";
  const isReader = role === "reader";
  const isLoggedIn = !!role;

  const [scrolled,     setScrolled]     = useState(false);
  const [manageOpen,   setManageOpen]   = useState(false);
  const [joinOpen,     setJoinOpen]     = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [notifCount,   setNotifCount]   = useState(0);

  const manageRef  = useRef(null);
  const joinRef    = useRef(null);
  const profileRef = useRef(null);

  const logout = () => { clearSession(); navigate("/"); setProfileOpen(false); };
  const isActive = (path) => location.pathname === path;

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Fetch writer notification count
  useEffect(() => {
    if (!isWriter) return;
    const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${BASE}/writer/notifications`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : (d.notifications || []);
        setNotifCount(list.length);
      })
      .catch(() => {});
  }, [isWriter]);

  // Close dropdowns on outside click
  useEffect(() => {
    const fn = (e) => {
      if (manageRef.current  && !manageRef.current.contains(e.target))  setManageOpen(false);
      if (joinRef.current    && !joinRef.current.contains(e.target))    setJoinOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // ── initials avatar ──────────────────────────────────────────────────────────
  const initials = uname
    ? uname.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : role?.[0]?.toUpperCase() || "U";

  const roleColor = isAdmin ? "#C2410C" : isWriter ? "#B5451B" : "#2C5F7A";
  const roleBg    = isAdmin ? "linear-gradient(135deg,#EA580C,#C2410C)"
                 : isWriter ? "linear-gradient(135deg,#C89030,#A06820)"
                 : "linear-gradient(135deg,#2C5F7A,#1A3D50)";
  const roleLabel = isAdmin ? "Admin" : isWriter ? "Writer" : "Reader";

  // ── nav link style ───────────────────────────────────────────────────────────
  const navLink = (path) => ({
    display: "inline-flex", alignItems: "center", gap: "5px",
    padding: "7px 12px",
    fontFamily: "'Cinzel', serif",
    fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase",
    textDecoration: "none",
    color: isActive(path) ? "#B8860B" : "#7A6040",
    background: isActive(path) ? "rgba(184,134,11,0.10)" : "transparent",
    borderRadius: "8px",
    transition: "all 0.18s",
    fontWeight: isActive(path) ? "700" : "400",
    borderBottom: isActive(path) ? "1.5px solid #B8860B" : "1.5px solid transparent",
    whiteSpace: "nowrap",
  });

  const dropPanel = (right = false) => ({
    position: "absolute",
    top: "calc(100% + 10px)",
    [right ? "right" : "left"]: 0,
    background: "linear-gradient(160deg, #FFFEF8, #FBF4E4)",
    border: "1px solid #E2D5BA",
    borderRadius: "16px",
    minWidth: "220px",
    boxShadow: "0 24px 70px rgba(80,50,15,0.22), 0 4px 18px rgba(80,50,15,0.08)",
    overflow: "hidden",
    zIndex: 400,
    animation: "dropIn 0.2s cubic-bezier(0.16,1,0.3,1) both",
  });

  const dropItem = {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "11px 18px",
    fontFamily: "'Cinzel', serif", fontSize: "10px",
    letterSpacing: "1px", textTransform: "uppercase",
    color: "#5A4832", textDecoration: "none",
    transition: "all 0.15s",
    borderBottom: "1px solid #F0E6D0",
    cursor: "pointer",
  };

  const DropIcon = ({ d, fill }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={fill || "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.7 }}>
      <path d={d} />
    </svg>
  );

  // ── Profile dropdown items per role ─────────────────────────────────────────
  const profileItems = isAdmin ? [
    { to: "/admin_dashboard",    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", label: "Dashboard" },
    { to: "/change_password",    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", label: "Change Password" },
  ] : isWriter ? [
    { to: "/writer_profile",     icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", label: "My Profile" },
    { to: "/writer_analytics",   icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", label: "Analytics" },
    { to: "/change_password",    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", label: "Change Password" },
  ] : [
    { to: "/reader_profile",     icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", label: "My Profile" },
    { to: "/reader_bookmarks",   icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z", label: "Bookmarks" },
    { to: "/reader_reading_history", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", label: "Reading History" },
    { to: "/reader_following",   icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", label: "Following" },
    { to: "/change_password",    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", label: "Change Password" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Cinzel:wght@400;600;700&display=swap');
        .nl:hover { color: #B8860B !important; background: rgba(184,134,11,0.08) !important; }
        .di:hover { background: #FDF6E8 !important; color: #B8860B !important; }
        .di:hover svg { opacity: 1 !important; }
        .logout-di:hover { background: rgba(239,68,68,0.06) !important; color: #ef4444 !important; }
        .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(180,120,30,0.38) !important; }
        .avatar-btn:hover { box-shadow: 0 0 0 3px rgba(184,134,11,0.25) !important; transform: scale(1.04); }
        .bell-btn:hover { border-color: #B8860B !important; background: rgba(184,134,11,0.10) !important; }
        @keyframes dropIn { from { opacity:0; transform:translateY(-8px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes mobileIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        .ham:hover { background: rgba(184,134,11,0.1) !important; }
      `}</style>

      <nav style={{
        position: "sticky", top: 0, zIndex: 200,
        background: scrolled ? "rgba(253,248,240,0.97)" : "rgba(253,248,240,0.92)",
        backdropFilter: "blur(18px)",
        borderBottom: "1px solid #E8DFC8",
        boxShadow: scrolled ? "0 4px 28px rgba(100,70,30,0.12)" : "0 1px 8px rgba(100,70,30,0.06)",
        transition: "all 0.3s",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>

          {/* ── Brand ── */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "11px", textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: "40px", height: "40px", background: "linear-gradient(145deg,#F5E8C8,#E8D0A0)", border: "1.5px solid #D4B870", borderRadius: "11px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(180,130,50,0.22)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#92621a" strokeWidth="1.6">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                <line x1="8" y1="7" x2="16" y2="7" strokeWidth="1.2"/>
                <line x1="8" y1="11" x2="14" y2="11" strokeWidth="1.2"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "900", color: "#2A1F0E", letterSpacing: "-0.01em" }}>
              Book<span style={{ color: "#B8860B" }}>Library</span>
            </span>
          </Link>

          {/* ── Desktop nav links ── */}
          <ul style={{ display: "flex", alignItems: "center", gap: "2px", listStyle: "none", margin: 0, padding: 0, flex: 1, justifyContent: "center" }}
              className="desktop-nav">

            {/* PUBLIC */}
            {!isLoggedIn && (<>
              <li><Link to="/"       className="nl" style={navLink("/")}>Home</Link></li>
              <li><Link to="/about"  className="nl" style={navLink("/about")}>About</Link></li>
              <li><Link to="/contact"className="nl" style={navLink("/contact")}>Contact</Link></li>
            </>)}

            {/* ADMIN nav */}
            {isAdmin && (<>
              <li><Link to="/admin_dashboard"      className="nl" style={navLink("/admin_dashboard")}>Dashboard</Link></li>
              <li><Link to="/admin_view_category"  className="nl" style={navLink("/admin_view_category")}>Categories</Link></li>
              <li><Link to="/admin_view_books"     className="nl" style={navLink("/admin_view_books")}>Books</Link></li>
              {/* Manage dropdown */}
              <li style={{ position: "relative" }} ref={manageRef}>
                <button onClick={e => { e.stopPropagation(); setManageOpen(p => !p); }} className="nl"
                  style={{ ...navLink(""), cursor: "pointer", background: manageOpen ? "rgba(184,134,11,0.10)" : "transparent", border: "none", color: manageOpen ? "#B8860B" : "#7A6040", fontWeight: manageOpen ? "700" : "400" }}>
                  Manage
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: manageOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="M6 9l6 6 6-6"/></svg>
                </button>
                {manageOpen && (
                  <div style={dropPanel()}>
                    {[
                      { to: "/admin_manage_readers",           label: "Manage Readers",   icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" },
                      { to: "/admin_manage_writers",           label: "Manage Writers",   icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
                      { to: "/admin_borrow_management",        label: "Borrow Records",   icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
                      { to: "/admin_featured_books",           label: "Featured Books",   icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
                      { to: "/admin_announcement",             label: "Announcement",     icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" },
                      { to: "/admin_site_search",              label: "Site Search",      icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },

                      { to: "/admin_export_reports",           label: "Export Reports",   icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
                    ].map((item, idx, arr) => (
                      <Link key={item.to} to={item.to} className="di"
                        style={{ ...dropItem, borderBottom: idx === arr.length - 1 ? "none" : "1px solid #F0E6D0" }}
                        onClick={() => setManageOpen(false)}>
                        <DropIcon d={item.icon} />{item.label}
                      </Link>
                    ))}
                    {/* Reports sub-section */}
                    <div style={{ padding: "8px 18px 4px", fontSize: 9, letterSpacing: "1.5px", color: "#B8860B", fontFamily: "'Cinzel',serif", fontWeight: 700, textTransform: "uppercase", background: "rgba(184,134,11,0.04)", borderTop: "1px solid #F0E6D0" }}>Reports</div>
                    {[
                      { to: "/admin_view_books_detail_report",      label: "Books Report"   },
                      { to: "/admin_view_writer_detail_report",     label: "Writers Report" },
                      { to: "/admin_view_reader_detail_report",     label: "Readers Report" },
                    ].map((item, idx, arr) => (
                      <Link key={item.to} to={item.to} className="di"
                        style={{ ...dropItem, borderBottom: idx === arr.length - 1 ? "none" : "1px solid #F0E6D0" }}
                        onClick={() => setManageOpen(false)}>
                        <DropIcon d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            </>)}

            {/* WRITER nav */}
            {isWriter && (<>
              <li><Link to="/writer_view_uploaded_books" className="nl" style={navLink("/writer_view_uploaded_books")}>My Books</Link></li>
              <li><Link to="/writer_view_all_books"      className="nl" style={navLink("/writer_view_all_books")}>Browse</Link></li>
              <li><Link to="/writer_add_books"           className="nl" style={navLink("/writer_add_books")}>Upload</Link></li>
              <li><Link to="/writer_analytics"           className="nl" style={navLink("/writer_analytics")}>Analytics</Link></li>
            </>)}

            {/* READER nav */}
            {isReader && (<>
              <li><Link to="/reader_view_all_books"    className="nl" style={navLink("/reader_view_all_books")}>Browse</Link></li>
              <li><Link to="/reader_bookmarks"         className="nl" style={navLink("/reader_bookmarks")}>Bookmarks</Link></li>
              <li><Link to="/reader_recommendations"   className="nl" style={navLink("/reader_recommendations")}>For You</Link></li>
              <li><Link to="/reader_following"         className="nl" style={navLink("/reader_following")}>Following</Link></li>
            </>)}
          </ul>

          {/* ── Right side ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>

            {/* NOT logged in */}
            {!isLoggedIn && (<>
              {/* Join dropdown */}
              <div style={{ position: "relative" }} ref={joinRef}>
                <button onClick={() => setJoinOpen(p => !p)} className="nl"
                  style={{ ...navLink(""), cursor: "pointer", background: joinOpen ? "rgba(184,134,11,0.10)" : "transparent", border: "none", color: joinOpen ? "#B8860B" : "#7A6040" }}>
                  Join
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: joinOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="M6 9l6 6 6-6"/></svg>
                </button>
                {joinOpen && (
                  <div style={{ ...dropPanel(true), minWidth: "200px" }}>
                    <Link to="/writer_registration" className="di" style={dropItem} onClick={() => setJoinOpen(false)}>
                      <DropIcon d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      Writer Registration
                    </Link>
                    <Link to="/reader_registration" className="di" style={{ ...dropItem, borderBottom: "none" }} onClick={() => setJoinOpen(false)}>
                      <DropIcon d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      Reader Registration
                    </Link>
                  </div>
                )}
              </div>
              <Link to="/login" className="nav-cta" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 20px", background: "linear-gradient(135deg,#C89030,#A06820)", color: "white", textDecoration: "none", fontFamily: "'Cinzel',serif", fontSize: "11px", letterSpacing: "1px", fontWeight: "600", borderRadius: "10px", boxShadow: "0 3px 12px rgba(180,120,30,0.25)", transition: "all 0.22s" }}>
                Sign In
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </>)}

            {/* LOGGED IN — Notification bell (writer only) */}
            {isWriter && (
              <Link to="/writer_notifications"
                title="Notifications"
                style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "38px", height: "38px", borderRadius: "10px", background: location.pathname === "/writer_notifications" ? "rgba(184,134,11,0.12)" : "rgba(0,0,0,0.04)", border: "1.5px solid", borderColor: location.pathname === "/writer_notifications" ? "#B8860B" : "#E0CFA8", textDecoration: "none", transition: "all 0.2s", flexShrink: 0 }}
                className="bell-btn">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={location.pathname === "/writer_notifications" ? "#B8860B" : "#7A6040"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                {notifCount > 0 && (
                  <span style={{ position: "absolute", top: "-4px", right: "-4px", minWidth: "17px", height: "17px", borderRadius: "10px", background: "linear-gradient(135deg,#EA580C,#C2410C)", color: "white", fontSize: "9px", fontWeight: "700", fontFamily: "'Lato',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", border: "2px solid #FDF8F0", boxShadow: "0 1px 4px rgba(234,88,12,0.5)" }}>
                    {notifCount > 99 ? "99+" : notifCount}
                  </span>
                )}
              </Link>
            )}

            {/* LOGGED IN — Profile avatar */}
            {isLoggedIn && (
              <div style={{ position: "relative" }} ref={profileRef}>
                <button className="avatar-btn"
                  onClick={() => setProfileOpen(p => !p)}
                  style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "1.5px solid #E2D5BA", borderRadius: "50px", padding: "4px 12px 4px 4px", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(100,70,30,0.10)" }}>
                  {/* Avatar circle */}
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: roleBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: "12px", fontWeight: "700", color: "white", letterSpacing: "0.5px" }}>{initials}</span>
                  </div>
                  {/* Name + role */}
                  <div style={{ textAlign: "left", lineHeight: 1.2 }}>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: "11px", fontWeight: "700", color: "#2A1F0E", maxWidth: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {uname || roleLabel}
                    </div>
                    <div style={{ fontFamily: "'Lato',sans-serif", fontSize: "10px", color: roleColor, fontWeight: "600", letterSpacing: "0.5px" }}>{roleLabel}</div>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7A6040" strokeWidth="2.5" style={{ transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}><path d="M6 9l6 6 6-6"/></svg>
                </button>

                {profileOpen && (
                  <div style={{ ...dropPanel(true), minWidth: "240px" }}>
                    {/* Profile header card */}
                    <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid #F0E6D0", background: "rgba(184,134,11,0.04)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: roleBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}>
                          <span style={{ fontFamily: "'Cinzel',serif", fontSize: "16px", fontWeight: "700", color: "white" }}>{initials}</span>
                        </div>
                        <div>
                          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "15px", fontWeight: "700", color: "#2A1F0E" }}>{uname || roleLabel}</div>
                          <div style={{ display: "inline-block", marginTop: "4px", padding: "2px 10px", borderRadius: "20px", background: `${roleColor}18`, border: `1px solid ${roleColor}30`, fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: roleColor, fontWeight: "700" }}>{roleLabel}</div>
                        </div>
                      </div>
                    </div>

                    {/* Nav items */}
                    {profileItems.map((item, idx) => (
                      <Link key={item.to} to={item.to} className="di"
                        style={{ ...dropItem, borderBottom: "1px solid #F0E6D0" }}
                        onClick={() => setProfileOpen(false)}>
                        <DropIcon d={item.icon} />
                        {item.label}
                      </Link>
                    ))}

                    {/* Logout */}
                    <button className="logout-di"
                      onClick={logout}
                      style={{ ...dropItem, borderBottom: "none", width: "100%", background: "none", border: "none", textAlign: "left", color: "#ef4444", fontFamily: "'Cinzel',serif", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0, opacity: 0.8 }}>
                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Hamburger (mobile) */}
            <button className="ham" onClick={() => setMobileOpen(p => !p)}
              style={{ display: "none", width: "36px", height: "36px", background: "transparent", border: "1px solid #E0CFA8", borderRadius: "8px", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }}
              id="hamburger">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A6040" strokeWidth="2" strokeLinecap="round">
                {mobileOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div style={{ borderTop: "1px solid #E8DFC8", background: "rgba(253,248,240,0.98)", padding: "12px 24px 20px", animation: "mobileIn 0.2s ease both" }}>
            {/* Mobile links based on role */}
            {[
              ...(!isLoggedIn ? [
                { to: "/",       label: "Home"    },
                { to: "/about",  label: "About"   },
                { to: "/contact",label: "Contact" },
                { to: "/writer_registration", label: "Writer Registration" },
                { to: "/reader_registration", label: "Reader Registration" },
              ] : []),
              ...(isAdmin ? [
                { to: "/admin_dashboard",    label: "Dashboard"   },
                { to: "/admin_view_category",label: "Categories"  },
                { to: "/admin_view_books",   label: "Books"       },
                { to: "/admin_manage_readers",label: "Manage Readers" },
                { to: "/admin_manage_writers",label: "Manage Writers" },
                { to: "/admin_borrow_management",label: "Borrow Records" },
                { to: "/admin_featured_books",label: "Featured Books" },
                { to: "/admin_announcement", label: "Announcement" },
                { to: "/admin_export_reports",label: "Export Reports" },
              ] : []),
              ...(isWriter ? [
                { to: "/writer_view_uploaded_books", label: "My Books"      },
                { to: "/writer_view_all_books",      label: "Browse"        },
                { to: "/writer_add_books",           label: "Upload Book"   },
                { to: "/writer_analytics",           label: "Analytics"     },
                { to: "/writer_profile",             label: "My Profile"    },
                { to: "/writer_notifications",       label: "Notifications" },
              ] : []),
              ...(isReader ? [
                { to: "/reader_view_all_books",    label: "Browse"          },
                { to: "/reader_bookmarks",         label: "Bookmarks"       },
                { to: "/reader_recommendations",   label: "For You"         },
                { to: "/reader_following",         label: "Following"       },
                { to: "/reader_profile",           label: "My Profile"      },
                { to: "/reader_reading_history",   label: "Reading History" },
              ] : []),
              ...(isLoggedIn ? [{ to: "/change_password", label: "Change Password" }] : []),
            ].map(item => (
              <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                style={{ display: "block", padding: "11px 0", fontFamily: "'Cinzel',serif", fontSize: "11px", letterSpacing: "1.2px", textTransform: "uppercase", color: isActive(item.to) ? "#B8860B" : "#5A4832", textDecoration: "none", borderBottom: "1px solid #F5EDD8", fontWeight: isActive(item.to) ? "700" : "400" }}>
                {item.label}
              </Link>
            ))}

            {isLoggedIn ? (
              <button onClick={logout} style={{ marginTop: "12px", width: "100%", padding: "12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", fontFamily: "'Cinzel',serif", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "#ef4444", cursor: "pointer", fontWeight: "600" }}>
                Sign Out
              </button>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} style={{ display: "block", marginTop: "12px", padding: "12px", background: "linear-gradient(135deg,#C89030,#A06820)", borderRadius: "10px", fontFamily: "'Cinzel',serif", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "white", textDecoration: "none", textAlign: "center", fontWeight: "600" }}>
                Sign In
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          #hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}