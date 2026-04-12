import { api, imgUrl, pdfUrl } from "./api";
// ── Shared constants ────────────────────────────────────────────────────────
const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeSlideUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmerGold{0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes pulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.7;transform:scale(1.04)}}
  .gl-input:focus{border-color:#B8860B!important;box-shadow:0 0 0 3px rgba(184,134,11,.12)!important;background:#FFFEF8!important;outline:none}
  .gl-input::placeholder{color:#C0A870}
  .gl-btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(180,120,30,.40)!important}
  .gl-btn-g:hover{border-color:#B8860B!important;color:#B8860B!important;background:rgba(184,134,11,.06)!important}
  .gl-file:hover{border-color:#B8860B!important;background:rgba(184,134,11,.04)!important}
`;
const inp={width:"100%",padding:"12px 15px",background:"#FBF6ED",border:"1.5px solid #E0CFA8",borderRadius:"10px",color:"#2A1F0E",fontSize:"15px",fontFamily:"'Lato',sans-serif",outline:"none",transition:"all 0.2s"};
const sel={...inp,backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23B8860B' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 14px center",paddingRight:"40px",appearance:"none",WebkitAppearance:"none",cursor:"pointer"};
const lbl={display:"block",marginBottom:"5px",fontSize:"11px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#B8860B",fontFamily:"'Cinzel',serif",fontWeight:700};
const g2={display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"};
const pageWrap={minHeight:"100vh",background:"linear-gradient(160deg,#FDF8F0 0%,#F8F0E0 40%,#F5ECE0 100%)",fontFamily:"'Lato',sans-serif",position:"relative",overflow:"hidden"};
const orb1={position:"absolute",top:"-10%",right:"-5%",width:"500px",height:"500px",borderRadius:"50%",background:"radial-gradient(circle,rgba(210,165,80,.10) 0%,transparent 70%)",animation:"pulse 14s ease-in-out infinite",pointerEvents:"none"};
const orb2={position:"absolute",bottom:0,left:"-5%",width:"380px",height:"380px",borderRadius:"50%",background:"radial-gradient(circle,rgba(185,110,50,.08) 0%,transparent 70%)",animation:"pulse 14s ease-in-out 5s infinite",pointerEvents:"none"};
const card={background:"linear-gradient(160deg,#FFFEF8 0%,#FBF4E4 100%)",border:"1px solid #E2D5BA",borderRadius:"22px",padding:"40px 44px",boxShadow:"0 8px 40px rgba(80,50,15,.10)",animation:"fadeSlideUp 0.8s 0.1s ease both"};

const BtnP=({loading,label,disabled})=>(
  <button type="submit" className="gl-btn-p" disabled={loading||disabled} style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"13px 28px",background:(loading||disabled)?"#C0A060":"linear-gradient(135deg,#C89030,#A06820)",border:"none",borderRadius:"10px",color:"white",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:"1px",fontWeight:"600",cursor:(loading||disabled)?"not-allowed":"pointer",boxShadow:"0 4px 16px rgba(180,120,30,.25)",transition:"all 0.22s"}}>
    {loading?"Saving…":label}{!loading&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
  </button>
);

import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert, FieldError } from './ToastProvider.jsx';

// ── FILE ZONE ───────────────────────────────────────────────────────────────
function FileZone({ icon, file, onFile, accept, placeholder, replaced }) {
  return (
    <label className="gl-file" style={{display:"flex",alignItems:"center",gap:"12px",padding:"14px 16px",background:"#FBF6ED",border:"2px dashed #D8C898",borderRadius:"10px",cursor:"pointer",transition:"all 0.2s"}}>
      <div style={{width:"40px",height:"40px",background:"rgba(184,134,11,.12)",border:"1px solid rgba(184,134,11,.25)",borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:"18px"}}>{icon}</div>
      <span style={{fontFamily:"'Lato',sans-serif",fontSize:"14px",color:file?"#2A1F0E":"#C0A870"}}>
        {file ? <span style={{color:"#B8860B",fontWeight:600}}>{file.name}</span> : <span><span style={{color:"#B8860B",fontWeight:600}}>{replaced||"Choose file"}</span> {placeholder}</span>}
      </span>
      <input type="file" accept={accept} onChange={e=>onFile(e.target.files[0])} style={{display:"none"}}/>
    </label>
  );
}

// ── PAGE SHELL ──────────────────────────────────────────────────────────────
function PageShell({ tag, title, maxWidth="760px", children }) {
  return (
    <div style={pageWrap}>
      <style>{GL}</style>
      <div style={orb1}/><div style={orb2}/>
      <div style={{maxWidth,margin:"0 auto",padding:"72px 24px 80px",position:"relative",zIndex:2}}>
        <div style={{marginBottom:"32px",animation:"fadeSlideUp 0.7s ease both"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:"10px",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:"4px",textTransform:"uppercase",color:"#B8860B",marginBottom:"10px"}}>
            <div style={{width:"24px",height:"1.5px",background:"#B8860B",borderRadius:"2px"}}/>{tag}
          </div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(30px,4vw,44px)",fontWeight:"900",lineHeight:1.1,background:"linear-gradient(135deg,#3D2B0E 0%,#8B5E0A 30%,#C49020 55%,#7A4A08 80%,#3D2B0E 100%)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"shimmerGold 6s linear infinite",margin:0}}>{title}</h1>
        </div>
        <div style={card}>{children}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export function Admin_Add_Books() {
  const navigate=useNavigate();
  const [name,setName]=useState(""); const [desc,setDesc]=useState(""); const [cid,setCid]=useState("0");
  const [imgFile,setImgFile]=useState(null); const [pdfFile,setPdfFile]=useState(null);
  const [cat,setCat]=useState([]); const [errors,setErrors]=useState({}); const [loading,setLoading]=useState(false);
  useEffect(()=>{api.getCategories().then(setCat).catch(()=>{});},[]);
  const handleSubmit=async e=>{
    e.preventDefault();
    const x={};
    if(!name.trim()) x.name="Required"; if(cid==="0") x.cid="Select category";
    if(!desc.trim()) x.desc="Required"; if(!imgFile) x.img="Cover image required"; if(!pdfFile) x.pdf="PDF required";
    setErrors(x); if(Object.values(x).some(Boolean)) return;
    setLoading(true);
    const fd=new FormData(); fd.append("name",name); fd.append("desc",desc); fd.append("catid",cid); fd.append("image1",imgFile); fd.append("pdf1",pdfFile);
    try{await api.saveBook(fd); navigate("/admin_view_books");}
    catch{setErrors({name:"Server error."});}
    setLoading(false);
  };
  return (
    <PageShell tag="Admin Panel" title="Add New Book">
      <form onSubmit={handleSubmit}>
        <div style={g2}>
          <div style={{marginBottom:"20px"}}><label style={lbl}>Book Title</label><input className="gl-input" style={inp} placeholder="Enter title" value={name} onChange={e=>setName(e.target.value)}/>{errors.name&&<FieldError message={errors.name} />}</div>
          <div style={{marginBottom:"20px"}}>
            <label style={lbl}>Category</label>
            <select className="gl-input" style={sel} value={cid} onChange={e=>setCid(e.target.value)}>
              <option value="0">-- Select --</option>
              {cat.map(c=><option key={c.cat_id} value={c.cat_id}>{c.category}</option>)}
            </select>
            {errors.cid&&<FieldError message={errors.cid} />}
          </div>
        </div>
        <div style={{marginBottom:"20px"}}><label style={lbl}>Description</label><textarea className="gl-input" style={{...inp,minHeight:"90px",resize:"vertical",lineHeight:1.7}} placeholder="Book description…" value={desc} onChange={e=>setDesc(e.target.value)}/>{errors.desc&&<FieldError message={errors.desc} />}</div>
        <div style={{...g2,marginBottom:"28px"}}>
          <div><label style={lbl}>Cover Image</label><FileZone icon="🖼️" file={imgFile} onFile={setImgFile} accept="image/*" placeholder="(jpg/png)"/>{errors.img&&<FieldError message={errors.img} />}</div>
          <div><label style={lbl}>Book PDF</label><FileZone icon="📄" file={pdfFile} onFile={setPdfFile} accept=".pdf" placeholder="(.pdf)"/>{errors.pdf&&<FieldError message={errors.pdf} />}</div>
        </div>
        <div style={{display:"flex",gap:"12px"}}>
          <BtnP loading={loading} label="Save Book"/>
          <Link to="/admin_view_books" className="gl-btn-g" style={{display:"inline-flex",alignItems:"center",padding:"13px 22px",background:"rgba(255,250,238,.8)",border:"1.5px solid #D8C898",borderRadius:"10px",color:"#3D2B0E",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:'1px',textDecoration:"none",transition:"all 0.2s"}}>Cancel</Link>
        </div>
      </form>
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export function Admin_Add_Category() {
  const navigate=useNavigate();
  const [cat,setCat]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  const handleSubmit=async e=>{
    e.preventDefault();
    if(!cat.trim()){setError("Category name is required"); return;}
    setLoading(true);
    try{await api.saveCategory(cat); navigate("/admin_view_category");}
    catch{setError("Server error.");}
    setLoading(false);
  };
  return (
    <PageShell tag="Admin Panel" title="Add Category" maxWidth="560px">
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom:"28px"}}><label style={lbl}>Category Name</label><input className="gl-input" style={inp} placeholder="e.g. Science Fiction" value={cat} onChange={e=>setCat(e.target.value)}/>{error&&<FieldError message={error} />}</div>
        <div style={{display:"flex",gap:"12px"}}>
          <BtnP loading={loading} label="Save Category"/>
          <Link to="/admin_view_category" className="gl-btn-g" style={{display:"inline-flex",alignItems:"center",padding:"13px 22px",background:"rgba(255,250,238,.8)",border:"1.5px solid #D8C898",borderRadius:"10px",color:"#3D2B0E",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:'1px',textDecoration:"none",transition:"all 0.2s"}}>Cancel</Link>
        </div>
      </form>
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export function Admin_Update_Book() {
  const navigate=useNavigate(); const params=useParams();
  const [name,setName]=useState(""); const [desc,setDesc]=useState(""); const [cid,setCid]=useState("0");
  const [imgFile,setImgFile]=useState(null); const [pdfFile,setPdfFile]=useState(null);
  const [cat,setCat]=useState([]); const [errors,setErrors]=useState({}); const [loading,setLoading]=useState(false);
  useEffect(()=>{
    Promise.all([api.getCategories(),api.getSingleBook(params.bid)])
      .then(([cats,bk])=>{setCat(cats);setName(bk.book_name||"");setDesc(bk.description||"");setCid(String(bk.cat_id||"0"));}).catch(()=>{});
  },[params.bid]);
  const handleSubmit=async e=>{
    e.preventDefault();
    const x={}; if(!name.trim()) x.name="Required"; if(cid==="0") x.cid="Select"; if(!desc.trim()) x.desc="Required";
    setErrors(x); if(Object.values(x).some(Boolean)) return; setLoading(true);
    const fd=new FormData(); fd.append("bid",params.bid); fd.append("name",name); fd.append("desc",desc); fd.append("catid",cid);
    if(imgFile) fd.append("image1",imgFile); if(pdfFile) fd.append("pdf1",pdfFile);
    try{await api.updateBook(params.bid, fd); navigate("/admin_view_books");}
    catch{setErrors({name:"Server error."});}
    setLoading(false);
  };
  return (
    <PageShell tag="Admin Panel" title="Update Book">
      <form onSubmit={handleSubmit}>
        <div style={g2}>
          <div style={{marginBottom:"20px"}}><label style={lbl}>Book Title</label><input className="gl-input" style={inp} value={name} onChange={e=>setName(e.target.value)}/>{errors.name&&<FieldError message={errors.name} />}</div>
          <div style={{marginBottom:"20px"}}><label style={lbl}>Category</label><select className="gl-input" style={sel} value={cid} onChange={e=>setCid(e.target.value)}><option value="0">-- Select --</option>{cat.map(c=><option key={c.cat_id} value={c.cat_id}>{c.category}</option>)}</select>{errors.cid&&<FieldError message={errors.cid} />}</div>
        </div>
        <div style={{marginBottom:"20px"}}><label style={lbl}>Description</label><textarea className="gl-input" style={{...inp,minHeight:"90px",resize:"vertical",lineHeight:1.7}} value={desc} onChange={e=>setDesc(e.target.value)}/>{errors.desc&&<FieldError message={errors.desc} />}</div>
        <div style={{...g2,marginBottom:"28px"}}>
          <div><label style={lbl}>New Cover (optional)</label><FileZone icon="🖼️" file={imgFile} onFile={setImgFile} accept="image/*" replaced="Replace image"/></div>
          <div><label style={lbl}>New PDF (optional)</label><FileZone icon="📄" file={pdfFile} onFile={setPdfFile} accept=".pdf" replaced="Replace PDF"/></div>
        </div>
        <div style={{display:"flex",gap:"12px"}}>
          <BtnP loading={loading} label="Update Book"/>
          <Link to="/admin_view_books" className="gl-btn-g" style={{display:"inline-flex",alignItems:"center",padding:"13px 22px",background:"rgba(255,250,238,.8)",border:"1.5px solid #D8C898",borderRadius:"10px",color:"#3D2B0E",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:'1px',textDecoration:"none",transition:"all 0.2s"}}>Cancel</Link>
        </div>
      </form>
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export function Admin_Update_Category() {
  const navigate=useNavigate(); const params=useParams();
  const [cat,setCat]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  useEffect(()=>{api.getSingleCategory(params.cid).then(d=>setCat(d.category||"")).catch(()=>{});},[params.cid]);
  const handleSubmit=async e=>{
    e.preventDefault();
    if(!cat.trim()){setError("Category name is required"); return;}
    setLoading(true);
    try{await api.updateCategory(params.cid, cat); navigate("/admin_view_category");}
    catch{setError("Server error.");}
    setLoading(false);
  };
  return (
    <PageShell tag="Admin Panel" title="Update Category" maxWidth="560px">
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom:"28px"}}><label style={lbl}>Category Name</label><input className="gl-input" style={inp} value={cat} onChange={e=>setCat(e.target.value)}/>{error&&<FieldError message={error} />}</div>
        <div style={{display:"flex",gap:"12px"}}>
          <BtnP loading={loading} label="Update Category"/>
          <Link to="/admin_view_category" className="gl-btn-g" style={{display:"inline-flex",alignItems:"center",padding:"13px 22px",background:"rgba(255,250,238,.8)",border:"1.5px solid #D8C898",borderRadius:"10px",color:"#3D2B0E",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:'1px',textDecoration:"none",transition:"all 0.2s"}}>Cancel</Link>
        </div>
      </form>
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export function Writer_Add_Books() {
  const navigate=useNavigate(); const writerid=localStorage.getItem("writerid");
  const [name,setName]=useState(""); const [desc,setDesc]=useState(""); const [cid,setCid]=useState("0");
  const [imgFile,setImgFile]=useState(null); const [pdfFile,setPdfFile]=useState(null);
  const [cat,setCat]=useState([]); const [errors,setErrors]=useState({}); const [loading,setLoading]=useState(false);
  useEffect(()=>{api.getCategories().then(setCat).catch(()=>{});},[]);
  const handleSubmit=async e=>{
    e.preventDefault();
    const x={};
    if(!name.trim()) x.name="Required"; if(cid==="0") x.cid="Select"; if(!desc.trim()) x.desc="Required";
    if(!imgFile) x.img="Cover required"; if(!pdfFile) x.pdf="PDF required";
    setErrors(x); if(Object.values(x).some(Boolean)) return; setLoading(true);
    const fd=new FormData(); fd.append("name",name); fd.append("desc",desc); fd.append("catid",cid); fd.append("writerid",writerid); fd.append("image1",imgFile); fd.append("pdf1",pdfFile);
    try{await api.writerSaveBook(fd); navigate("/writer_view_uploaded_books");}
    catch{setErrors({name:"Server error."});}
    setLoading(false);
  };
  return (
    <PageShell tag="My Library" title="Upload a Book">
      <form onSubmit={handleSubmit}>
        <div style={g2}>
          <div style={{marginBottom:"20px"}}><label style={lbl}>Book Title</label><input className="gl-input" style={inp} placeholder="Enter title" value={name} onChange={e=>setName(e.target.value)}/>{errors.name&&<FieldError message={errors.name} />}</div>
          <div style={{marginBottom:"20px"}}><label style={lbl}>Category</label><select className="gl-input" style={sel} value={cid} onChange={e=>setCid(e.target.value)}><option value="0">-- Select --</option>{cat.map(c=><option key={c.cat_id} value={c.cat_id}>{c.category}</option>)}</select>{errors.cid&&<FieldError message={errors.cid} />}</div>
        </div>
        <div style={{marginBottom:"20px"}}><label style={lbl}>Description</label><textarea className="gl-input" style={{...inp,minHeight:"90px",resize:"vertical",lineHeight:1.7}} placeholder="What is this book about?" value={desc} onChange={e=>setDesc(e.target.value)}/>{errors.desc&&<FieldError message={errors.desc} />}</div>
        <div style={{...g2,marginBottom:"28px"}}>
          <div><label style={lbl}>Cover Image</label><FileZone icon="🖼️" file={imgFile} onFile={setImgFile} accept="image/*" placeholder="(jpg/png)"/>{errors.img&&<FieldError message={errors.img} />}</div>
          <div><label style={lbl}>Book PDF</label><FileZone icon="📄" file={pdfFile} onFile={setPdfFile} accept=".pdf" placeholder="(.pdf)"/>{errors.pdf&&<FieldError message={errors.pdf} />}</div>
        </div>
        <div style={{display:"flex",gap:"12px"}}>
          <BtnP loading={loading} label="Upload Book"/>
          <Link to="/writer_view_uploaded_books" className="gl-btn-g" style={{display:"inline-flex",alignItems:"center",padding:"13px 22px",background:"rgba(255,250,238,.8)",border:"1.5px solid #D8C898",borderRadius:"10px",color:"#3D2B0E",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:'1px',textDecoration:"none",transition:"all 0.2s"}}>Cancel</Link>
        </div>
      </form>
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export function Writer_Update_Book() {
  const navigate=useNavigate(); const params=useParams(); const writerid=localStorage.getItem("writerid");
  const [name,setName]=useState(""); const [desc,setDesc]=useState(""); const [cid,setCid]=useState("0");
  const [imgFile,setImgFile]=useState(null); const [pdfFile,setPdfFile]=useState(null);
  const [cat,setCat]=useState([]); const [errors,setErrors]=useState({}); const [loading,setLoading]=useState(false);
  useEffect(()=>{
    Promise.all([api.getCategories(),api.getSingleBook(params.bid)])
      .then(([cats,bk])=>{setCat(cats);setName(bk.book_name||"");setDesc(bk.description||"");setCid(String(bk.cat_id||"0"));}).catch(()=>{});
  },[params.bid]);
  const handleSubmit=async e=>{
    e.preventDefault();
    const x={}; if(!name.trim()) x.name="Required"; if(cid==="0") x.cid="Select"; if(!desc.trim()) x.desc="Required";
    setErrors(x); if(Object.values(x).some(Boolean)) return; setLoading(true);
    const fd=new FormData(); fd.append("bid",params.bid); fd.append("name",name); fd.append("desc",desc); fd.append("catid",cid); fd.append("writerid",writerid);
    if(imgFile) fd.append("image1",imgFile); if(pdfFile) fd.append("pdf1",pdfFile);
    try{await api.writerUpdateBook(params.bid, fd); navigate("/writer_view_uploaded_books");}
    catch{setErrors({name:"Server error."});}
    setLoading(false);
  };
  return (
    <PageShell tag="My Library" title="Edit Book">
      <form onSubmit={handleSubmit}>
        <div style={g2}>
          <div style={{marginBottom:"20px"}}><label style={lbl}>Book Title</label><input className="gl-input" style={inp} value={name} onChange={e=>setName(e.target.value)}/>{errors.name&&<FieldError message={errors.name} />}</div>
          <div style={{marginBottom:"20px"}}><label style={lbl}>Category</label><select className="gl-input" style={sel} value={cid} onChange={e=>setCid(e.target.value)}><option value="0">-- Select --</option>{cat.map(c=><option key={c.cat_id} value={c.cat_id}>{c.category}</option>)}</select>{errors.cid&&<FieldError message={errors.cid} />}</div>
        </div>
        <div style={{marginBottom:"20px"}}><label style={lbl}>Description</label><textarea className="gl-input" style={{...inp,minHeight:"90px",resize:"vertical",lineHeight:1.7}} value={desc} onChange={e=>setDesc(e.target.value)}/>{errors.desc&&<FieldError message={errors.desc} />}</div>
        <div style={{...g2,marginBottom:"28px"}}>
          <div><label style={lbl}>New Cover (optional)</label><FileZone icon="🖼️" file={imgFile} onFile={setImgFile} accept="image/*" replaced="Replace image"/></div>
          <div><label style={lbl}>New PDF (optional)</label><FileZone icon="📄" file={pdfFile} onFile={setPdfFile} accept=".pdf" replaced="Replace PDF"/></div>
        </div>
        <div style={{display:"flex",gap:"12px"}}>
          <BtnP loading={loading} label="Update Book"/>
          <Link to="/writer_view_uploaded_books" className="gl-btn-g" style={{display:"inline-flex",alignItems:"center",padding:"13px 22px",background:"rgba(255,250,238,.8)",border:"1.5px solid #D8C898",borderRadius:"10px",color:"#3D2B0E",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:'1px',textDecoration:"none",transition:"all 0.2s"}}>Cancel</Link>
        </div>
      </form>
    </PageShell>
  );
}

export default Admin_Add_Books;
