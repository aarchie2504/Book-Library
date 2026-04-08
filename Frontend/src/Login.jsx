import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, saveSession } from "./api";

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeSlideUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmerGold{0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes pulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.7;transform:scale(1.04)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .gl-input:focus{border-color:#B8860B!important;box-shadow:0 0 0 3px rgba(184,134,11,.12)!important;background:#FFFEF8!important;outline:none}
  .gl-input::placeholder{color:#C0A870}
  .gl-btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(180,120,30,.40)!important}
`;
const inp={width:"100%",padding:"12px 40px 12px 42px",background:"#FBF6ED",border:"1.5px solid #E0CFA8",borderRadius:"10px",color:"#2A1F0E",fontSize:"15px",fontFamily:"'Lato',sans-serif",outline:"none",transition:"all 0.2s"};

export default function Login(){
  const navigate=useNavigate();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [showPwd,setShowPwd]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const handleSubmit=async(e)=>{
    e.preventDefault();
    if(!email.trim()||!password.trim()){setError("Please enter email and password.");return;}
    setLoading(true);setError("");
    try{
      const data=await api.login(email,password);
      if(data.result==="Login Success"){
        saveSession(data);
        if(data.role==="admin") navigate("/admin_dashboard");
        else if(data.role==="writer") navigate("/writer_view_uploaded_books");
        else navigate("/reader_view_all_books");
      } else {
        setError(data.result||data.message||"Invalid credentials.");
      }
    }catch(err){setError("Server error. Please try again.");}
    setLoading(false);
  };

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#FDF8F0 0%,#F8F0E0 40%,#F5ECE0 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 16px",position:"relative",overflow:"hidden"}}>
      <style>{GL}</style>
      <div style={{position:"absolute",top:"-10%",right:"-5%",width:"500px",height:"500px",borderRadius:"50%",background:"radial-gradient(circle,rgba(210,165,80,.10) 0%,transparent 70%)",animation:"pulse 14s ease-in-out infinite",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:0,left:"-5%",width:"380px",height:"380px",borderRadius:"50%",background:"radial-gradient(circle,rgba(185,110,50,.08) 0%,transparent 70%)",animation:"pulse 14s ease-in-out 5s infinite",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:"920px",background:"linear-gradient(160deg,#FFFEF8,#FBF4E4)",border:"1px solid #E2D5BA",borderRadius:"28px",boxShadow:"0 20px 70px rgba(80,50,15,.16)",overflow:"hidden",display:"flex",animation:"fadeSlideUp 0.7s ease both",position:"relative",zIndex:2}}>
        {/* LEFT */}
        <div style={{flex:"0 0 360px",background:"linear-gradient(155deg,#2A1F0E 0%,#4A3218 45%,#3D2B0E 100%)",padding:"52px 44px",display:"flex",flexDirection:"column",justifyContent:"space-between",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:"-30px",right:"-30px",width:"220px",height:"220px",borderRadius:"50%",background:"radial-gradient(circle,rgba(210,165,80,.18) 0%,transparent 70%)"}}/>
          <div style={{position:"absolute",bottom:"-40px",left:"-20px",width:"200px",height:"200px",borderRadius:"50%",background:"radial-gradient(circle,rgba(185,110,50,.12) 0%,transparent 70%)"}}/>
          <div style={{position:"relative",zIndex:2}}>
            <div style={{width:"52px",height:"52px",background:"linear-gradient(145deg,#C89030,#8A5A10)",borderRadius:"14px",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"32px",boxShadow:"0 4px 18px rgba(200,144,48,.4)"}}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5z" fill="white" fillOpacity="0.25"/><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="white" strokeWidth="1.6" strokeLinecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="white" strokeWidth="1.6"/><line x1="8" y1="7" x2="14" y2="7" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6"/><line x1="8" y1="10.5" x2="12" y2="10.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6"/></svg>
            </div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:'1.5px',color:"rgba(210,165,80,.8)",marginBottom:"14px",textTransform:"uppercase"}}>Welcome back</div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"30px",fontWeight:"900",color:"#F5E8C8",lineHeight:1.2,marginBottom:"16px"}}>Your Next Great Read Awaits</h2>
            <p style={{fontFamily:"'Lato',sans-serif",fontSize:"14px",color:"rgba(245,232,200,0.9)",lineHeight:1.7,fontWeight:300}}>Sign in to access your personalised library dashboard.</p>
          </div>
          <div style={{position:"relative",zIndex:2}}>
            <div style={{height:"1px",background:"rgba(210,165,80,.2)",marginBottom:"24px"}}/>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:"1.5px",color:"rgba(210,165,80,.6)",marginBottom:"14px",textTransform:"uppercase"}}>New here?</p>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              <Link to="/reader_registration" style={{display:"inline-flex",alignItems:"center",gap:"8px",fontFamily:"'Lato',sans-serif",fontSize:"13px",color:"rgba(245,232,200,.8)",textDecoration:"none"}}>
                <span style={{width:"20px",height:"20px",background:"rgba(210,165,80,.15)",borderRadius:"5px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>📖</span>Join as a Reader
              </Link>
              <Link to="/writer_registration" style={{display:"inline-flex",alignItems:"center",gap:"8px",fontFamily:"'Lato',sans-serif",fontSize:"13px",color:"rgba(245,232,200,.8)",textDecoration:"none"}}>
                <span style={{width:"20px",height:"20px",background:"rgba(210,165,80,.15)",borderRadius:"5px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>✍️</span>Join as a Writer
              </Link>
            </div>
          </div>
        </div>
        {/* RIGHT */}
        <div style={{flex:1,padding:"52px 48px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
          <div style={{marginBottom:"36px"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:'1.5px',color:"#B8860B",marginBottom:"10px",textTransform:"uppercase"}}>Sign In</div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"32px",fontWeight:"900",background:"linear-gradient(135deg,#3D2B0E 0%,#8B5E0A 30%,#C49020 55%,#7A4A08 80%,#3D2B0E 100%)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"shimmerGold 6s linear infinite",margin:0}}>Access Your Library</h1>
          </div>
          {error&&<div style={{background:"rgba(239,68,68,.07)",border:"1px solid rgba(239,68,68,.3)",borderRadius:"10px",padding:"12px 16px",marginBottom:"20px",fontFamily:"'Lato',sans-serif",fontSize:"14px",color:"#dc2626"}}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:"20px"}}>
              <label style={{display:"block",marginBottom:"7px",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:"1.5px",textTransform:"uppercase",color:"#3D2B0E"}}>Email Address</label>
              <div style={{position:"relative"}}>
                <div style={{position:"absolute",left:"13px",top:"50%",transform:"translateY(-50%)",color:"#7A5A2A"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg></div>
                <input className="gl-input" style={inp} type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/>
              </div>
            </div>
            <div style={{marginBottom:"28px"}}>
              <label style={{display:"block",marginBottom:"7px",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:"1.5px",textTransform:"uppercase",color:"#3D2B0E"}}>Password</label>
              <div style={{position:"relative"}}>
                <div style={{position:"absolute",left:"13px",top:"50%",transform:"translateY(-50%)",color:"#7A5A2A"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></div>
                <input className="gl-input" style={{...inp,paddingRight:"42px"}} type={showPwd?"text":"password"} placeholder="Min 6 characters" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/>
                <button type="button" onClick={()=>setShowPwd(v=>!v)} style={{position:"absolute",right:"13px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#7A5A2A",padding:"2px"}}>
                  {showPwd?<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>
            </div>
            <button type="submit" className="gl-btn-p" disabled={loading} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",padding:"15px",background:loading?"#C0A060":"linear-gradient(135deg,#C89030,#A06820)",border:"none",borderRadius:"12px",color:"white",fontFamily:"'Cinzel',serif",fontSize:"12px",letterSpacing:"1.2px",fontWeight:"600",cursor:loading?"not-allowed":"pointer",boxShadow:"0 5px 20px rgba(180,120,30,.30)",transition:"all 0.25s"}}>
              {loading?<><div style={{width:"16px",height:"16px",border:"2px solid rgba(255,255,255,.4)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/> Signing in…</>:<>Sign In</>}
            </button>
          </form>
          <p style={{textAlign:"center",marginTop:"24px",fontFamily:"'Lato',sans-serif",fontSize:"13px",color:"#3D2B0E"}}>
            Join as a{" "}
            <Link to="/reader_registration" style={{color:"#B8860B",fontWeight:700,textDecoration:"none"}}>Reader</Link>
            {" "}or{" "}
            <Link to="/writer_registration" style={{color:"#B8860B",fontWeight:700,textDecoration:"none"}}>Writer</Link>
          </p>
          <p style={{textAlign:"center",marginTop:"10px",fontFamily:"'Lato',sans-serif",fontSize:"13px",color:"#3D2B0E"}}>
            <Link to="/forgot_password" style={{color:"#B8860B",textDecoration:"none"}}>Forgot your password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
