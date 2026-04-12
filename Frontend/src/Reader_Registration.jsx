import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, FieldError } from './ToastProvider.jsx';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeSlideUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmerGold{0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes pulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.7;transform:scale(1.04)}}
  .gl-input:focus{border-color:#B8860B!important;box-shadow:0 0 0 3px rgba(184,134,11,.12)!important;background:#FFFEF8!important;outline:none}
  .gl-input::placeholder{color:#C0A870}
  .gl-btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(180,120,30,.40)!important}
  .gl-btn-g:hover{border-color:#B8860B!important;color:#B8860B!important;background:rgba(184,134,11,.06)!important}
`;
const inp={width:"100%",padding:"12px 15px",background:"#FBF6ED",border:"1.5px solid #E0CFA8",borderRadius:"10px",color:"#2A1F0E",fontSize:"15px",fontFamily:"'Lato',sans-serif",outline:"none",transition:"all 0.2s",boxSizing:"border-box"};
const lbl={display:"block",marginBottom:"5px",fontSize:"11px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#B8860B",fontFamily:"'Cinzel',serif",fontWeight:700};
const g2={display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"};

function pwdStrength(p){
  if(!p) return {score:0,label:"",color:"#E0CFA8"};
  if(p.length<6) return {score:1,label:"Too short",color:"#ef4444"};
  let s=0;
  if(p.length>=8) s++;
  if(/[A-Z]/.test(p)) s++;
  if(/[0-9]/.test(p)) s++;
  if(/[^A-Za-z0-9]/.test(p)) s++;
  const levels=[
    {score:1,label:"Weak",color:"#ef4444"},
    {score:2,label:"Fair",color:"#f97316"},
    {score:3,label:"Good",color:"#eab308"},
    {score:4,label:"Strong",color:"#22c55e"},
  ];
  return levels[Math.min(s,4)-1] || levels[0];
}

export default function Reader_Registration() {
  const navigate=useNavigate();
  const [form,setForm]=useState({name:"",address:"",city:"",mno:"",email:"",pwd:"",confirmPwd:""});
  const [errors,setErrors]=useState({});
  const [loading,setLoading]=useState(false);
  const [showPwd,setShowPwd]=useState(false);
  const [showConfirm,setShowConfirm]=useState(false);
  const strength=pwdStrength(form.pwd);

  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  const validate=()=>{
    const x={};
    if(!form.name.trim()) x.name="Name is required";
    if(!form.address.trim()) x.address="Address is required";
    if(!form.city.trim()) x.city="City is required";
    if(!form.mno.trim()) x.mno="Mobile required";
    else if(!/^[0-9]{10}$/.test(form.mno)) x.mno="Must be exactly 10 digits";
    if(!form.email.trim()) x.email="Email is required";
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) x.email="Invalid email address";
    if(!form.pwd) x.pwd="Password required";
    else if(form.pwd.length<6) x.pwd="At least 6 characters";
    if(!form.confirmPwd) x.confirmPwd="Please confirm your password";
    else if(form.pwd!==form.confirmPwd) x.confirmPwd="Passwords do not match";
    return x;
  };

  const handleSubmit=async e=>{
    e.preventDefault();
    const x=validate(); setErrors(x);
    if(Object.values(x).some(Boolean)) return;
    setLoading(true);
    try{
      const BASE=import.meta.env.VITE_API_BASE||"http://localhost:5000";
      const res=await fetch(`${BASE}/regisreader`,{method:"POST",body:JSON.stringify({name:form.name,address:form.address,city:form.city,mno:form.mno,email:form.email,pwd:form.pwd}),headers:{"Content-Type":"application/json"}});
      const data=await res.json();
      if(data.result==="Email Id Already Exists") setErrors({email:"This email is already registered"});
      else if(data.result==="Reader Registration Successful") navigate("/login");
      else setErrors({email:data.result||"Registration failed. Please try again."});
    }catch{ setErrors({email:"Server error. Please try again."}); }
    setLoading(false);
  };

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#FDF8F0 0%,#F8F0E0 40%,#F5ECE0 100%)",fontFamily:"'Lato',sans-serif",position:"relative",overflow:"hidden"}}>
      <style>{GL}</style>
      <div style={{position:"absolute",top:"-10%",right:"-5%",width:"500px",height:"500px",borderRadius:"50%",background:"radial-gradient(circle,rgba(210,165,80,.10) 0%,transparent 70%)",animation:"pulse 14s ease-in-out infinite",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:0,left:"-5%",width:"380px",height:"380px",borderRadius:"50%",background:"radial-gradient(circle,rgba(185,110,50,.08) 0%,transparent 70%)",animation:"pulse 14s ease-in-out 5s infinite",pointerEvents:"none"}}/>
      <div style={{maxWidth:"720px",margin:"0 auto",padding:"72px 24px 80px",position:"relative",zIndex:2}}>
        <div style={{marginBottom:"36px",animation:"fadeSlideUp 0.7s ease both"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:"10px",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:"4px",textTransform:"uppercase",color:"#2C5F7A",marginBottom:"12px"}}>
            <div style={{width:"24px",height:"1.5px",background:"#2C5F7A",borderRadius:"2px"}}/>Join as Reader
          </div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(32px,4vw,48px)",fontWeight:"900",lineHeight:1.1,background:"linear-gradient(135deg,#3D2B0E 0%,#8B5E0A 30%,#C49020 55%,#7A4A08 80%,#3D2B0E 100%)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"shimmerGold 6s linear infinite",margin:0}}>Reader Registration</h1>
        </div>
        <div style={{background:"linear-gradient(160deg,#FFFEF8 0%,#FBF4E4 100%)",border:"1px solid #E2D5BA",borderRadius:"22px",padding:"40px 44px",boxShadow:"0 8px 40px rgba(80,50,15,.10)",animation:"fadeSlideUp 0.8s 0.1s ease both"}}>
          <form onSubmit={handleSubmit} noValidate>
            <div style={g2}>
              <div style={{marginBottom:"20px"}}>
                <label style={lbl}>Full Name *</label>
                <input className="gl-input" style={{...inp,borderColor:errors.name?"#ef4444":undefined}} placeholder="Your full name" value={form.name} onChange={set("name")}/>
                {errors.name&&<FieldError message={errors.name} />}
              </div>
              <div style={{marginBottom:"20px"}}>
                <label style={lbl}>City *</label>
                <input className="gl-input" style={{...inp,borderColor:errors.city?"#ef4444":undefined}} placeholder="Your city" value={form.city} onChange={set("city")}/>
                {errors.city&&<FieldError message={errors.city} />}
              </div>
            </div>
            <div style={{marginBottom:"20px"}}>
              <label style={lbl}>Address *</label>
              <input className="gl-input" style={{...inp,borderColor:errors.address?"#ef4444":undefined}} placeholder="Full address" value={form.address} onChange={set("address")}/>
              {errors.address&&<FieldError message={errors.address} />}
            </div>
            <div style={g2}>
              <div style={{marginBottom:"20px"}}>
                <label style={lbl}>Mobile Number *</label>
                <input className="gl-input" style={{...inp,borderColor:errors.mno?"#ef4444":undefined}} placeholder="10-digit number" value={form.mno} onChange={set("mno")} maxLength={10} inputMode="numeric"/>
                {errors.mno&&<FieldError message={errors.mno} />}
              </div>
              <div style={{marginBottom:"20px"}}>
                <label style={lbl}>Email Address *</label>
                <input className="gl-input" style={{...inp,borderColor:errors.email?"#ef4444":undefined}} type="email" placeholder="email@example.com" value={form.email} onChange={set("email")}/>
                {errors.email&&<FieldError message={errors.email} />}
              </div>
            </div>
            {/* Password with show/hide + strength */}
            <div style={{marginBottom:"20px"}}>
              <label style={lbl}>Password *</label>
              <div style={{position:"relative"}}>
                <input className="gl-input" style={{...inp,borderColor:errors.pwd?"#ef4444":undefined,paddingRight:"44px"}} type={showPwd?"text":"password"} placeholder="Min 6 characters" value={form.pwd} onChange={set("pwd")}/>
                <button type="button" onClick={()=>setShowPwd(p=>!p)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#7A6040",padding:4}}>
                  {showPwd?"🙈":"👁️"}
                </button>
              </div>
              {form.pwd && (
                <div style={{marginTop:6,display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1,height:4,background:"#F0E6D0",borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${strength.score*25}%`,background:strength.color,borderRadius:4,transition:"all 0.3s"}}/>
                  </div>
                  <span style={{fontSize:11,color:strength.color,fontFamily:"'Cinzel',serif",letterSpacing:"0.5px",fontWeight:600}}>{strength.label}</span>
                </div>
              )}
              {errors.pwd&&<FieldError message={errors.pwd} />}
            </div>
            {/* Confirm password */}
            <div style={{marginBottom:"28px"}}>
              <label style={lbl}>Confirm Password *</label>
              <div style={{position:"relative"}}>
                <input className="gl-input" style={{...inp,borderColor:errors.confirmPwd?"#ef4444":(form.confirmPwd&&form.confirmPwd===form.pwd?"#22c55e":undefined),paddingRight:"44px"}} type={showConfirm?"text":"password"} placeholder="Repeat your password" value={form.confirmPwd} onChange={set("confirmPwd")}/>
                <button type="button" onClick={()=>setShowConfirm(p=>!p)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#7A6040",padding:4}}>
                  {showConfirm?"🙈":"👁️"}
                </button>
              </div>
              {errors.confirmPwd&&<FieldError message={errors.confirmPwd} />}
              {form.confirmPwd&&form.confirmPwd===form.pwd&&!errors.confirmPwd&&<span style={{display:"block",fontSize:12,color:"#22c55e",fontFamily:"'Lato',sans-serif",marginTop:4}}>✓ Passwords match</span>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"16px",flexWrap:"wrap"}}>
              <button type="submit" className="gl-btn-p" disabled={loading} style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"13px 28px",background:loading?"#C0A060":"linear-gradient(135deg,#C89030,#A06820)",border:"none",borderRadius:"10px",color:"white",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:"1px",fontWeight:"600",cursor:loading?"not-allowed":"pointer",boxShadow:"0 4px 16px rgba(180,120,30,.25)",transition:"all 0.22s"}}>
                {loading?"Registering…":"Register as Reader"}
                {!loading&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
              </button>
              <Link to="/login" className="gl-btn-g" style={{display:"inline-flex",alignItems:"center",padding:"13px 22px",background:"rgba(255,250,238,.8)",border:"1.5px solid #D8C898",borderRadius:"10px",color:"#3D2B0E",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:"1px",textDecoration:"none",transition:"all 0.2s"}}>Already have an account?</Link>
            </div>
          </form>
        </div>
        <p style={{textAlign:"center",marginTop:20,fontFamily:"'Lato',sans-serif",fontSize:13,color:"#7A6040"}}>
          Want to publish books instead?{" "}
          <Link to="/writer_registration" style={{color:"#B8860B",fontWeight:700,textDecoration:"none"}}>Join as Writer</Link>
        </p>
      </div>
    </div>
  );
}
