import { api, imgUrl, pdfUrl } from "./api";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

// ── SHARED STYLES ──────────────────────────────────────────────────────────
const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeSlideUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmerGold{0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes pulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.7;transform:scale(1.04)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .gl-tr:hover td{background:rgba(250,244,232,.8)!important}
  .gl-btn-o:hover{background:rgba(184,134,11,.08)!important;color:#B8860B!important;border-color:#B8860B!important}
  .gl-btn-d:hover{background:#b91c1c!important;transform:translateY(-1px)}
  .gl-btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(180,120,30,.40)!important}
  .gl-btn-g:hover{border-color:#B8860B!important;color:#B8860B!important;background:rgba(184,134,11,.06)!important}
  .gl-filter:hover{border-color:#B8860B!important;color:#B8860B!important;background:rgba(184,134,11,.06)!important}
  .gl-book-card:hover{transform:translateY(-6px);box-shadow:0 24px 60px rgba(100,70,30,.18)!important}
`;

const pageWrap={minHeight:"100vh",background:"linear-gradient(160deg,#FDF8F0 0%,#F8F0E0 40%,#F5ECE0 100%)",fontFamily:"'Lato',sans-serif",position:"relative",overflow:"hidden"};
const inner=(mw="1200px")=>({maxWidth:mw,margin:"0 auto",padding:"72px 24px 80px",position:"relative",zIndex:2});
const orb1={position:"absolute",top:"-10%",right:"-5%",width:"500px",height:"500px",borderRadius:"50%",background:"radial-gradient(circle,rgba(210,165,80,.10) 0%,transparent 70%)",animation:"pulse 14s ease-in-out infinite",pointerEvents:"none"};
const orb2={position:"absolute",bottom:0,left:"-5%",width:"380px",height:"380px",borderRadius:"50%",background:"radial-gradient(circle,rgba(185,110,50,.08) 0%,transparent 70%)",animation:"pulse 14s ease-in-out 5s infinite",pointerEvents:"none"};

// Shared components
const Spinner=()=><div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"80px 20px"}}><div style={{width:"44px",height:"44px",borderRadius:"50%",border:"3px solid #F0E6D0",borderTopColor:"#B8860B",animation:"spin 0.9s linear infinite"}}/></div>;
const Empty=({icon="📚",title,desc})=><div style={{textAlign:"center",padding:"80px 24px"}}><div style={{fontSize:"52px",marginBottom:"16px"}}>{icon}</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",color:"#4A3822",marginBottom:"8px"}}>{title}</div>{desc&&<div style={{fontFamily:"'Lato',sans-serif",fontSize:"14px",color:"#3D2B0E"}}>{desc}</div>}</div>;
const Stars=({r})=><div style={{display:"flex",alignItems:"center",gap:"2px"}}>{[1,2,3,4,5].map(n=><span key={n} style={{fontSize:"15px",color:n<=r?"#D4900A":"#DDD0B0"}}>★</span>)}<span style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"#B8780A",marginLeft:"5px",fontWeight:600}}>{r}/5</span></div>;
const Badge=({txt,c="#B8860B"})=><span style={{display:"inline-block",padding:"3px 12px",background:c+"15",border:`1px solid ${c}30`,borderRadius:"20px",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:'1px',textTransform:"uppercase",color:c}}>{txt}</span>;
const Thumb=({src})=>src?<img src={`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/book_img/${src}`} style={{width:"48px",height:"62px",objectFit:"cover",borderRadius:"7px",border:"1px solid #E2D5BA",boxShadow:"0 2px 8px rgba(0,0,0,.08)"}} alt=""/>:<span style={{color:"#CCC"}}>—</span>;

const BtnO=({to,label,onClick})=>to
  ?<Link to={to} className="gl-btn-o" style={{display:"inline-flex",alignItems:"center",padding:"7px 15px",background:"transparent",border:"1.5px solid #D8C898",borderRadius:"8px",color:"#2A1F0E",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:'1px',textDecoration:"none",transition:"all 0.2s",whiteSpace:"nowrap"}}>{label}</Link>
  :<button onClick={onClick} className="gl-btn-o" style={{display:"inline-flex",alignItems:"center",padding:"7px 15px",background:"transparent",border:"1.5px solid #D8C898",borderRadius:"8px",color:"#2A1F0E",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:'1px',cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap"}}>{label}</button>;

const BtnD=({onClick})=><button onClick={onClick} className="gl-btn-d" style={{display:"inline-flex",alignItems:"center",padding:"7px 15px",background:"#dc2626",border:"none",borderRadius:"8px",color:"white",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:'1px',cursor:"pointer",transition:"all 0.2s"}}>Delete</button>;
const BtnP=({to,label})=><Link to={to} className="gl-btn-p" style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"11px 22px",background:"linear-gradient(135deg,#C89030,#A06820)",border:"none",borderRadius:"10px",color:"white",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:"1px",fontWeight:"600",textDecoration:"none",boxShadow:"0 4px 16px rgba(180,120,30,.25)",transition:"all 0.22s"}}>+ {label}</Link>;
const BtnBack=({to,label})=><Link to={to} className="gl-btn-g" style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"10px 18px",background:"rgba(255,250,238,.8)",border:"1.5px solid #D8C898",borderRadius:"10px",color:"#2A1F0E",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:'1px',textDecoration:"none",transition:"all 0.2s"}}>← {label}</Link>;

const GlTable=({cols,children})=>(
  <div style={{background:"linear-gradient(160deg,#FFFEF8 0%,#FBF4E4 100%)",border:"1px solid #E2D5BA",borderRadius:"20px",overflow:"hidden",boxShadow:"0 8px 40px rgba(80,50,15,.10)",animation:"fadeSlideUp 0.7s ease both"}}>
    <table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr>{cols.map(c=><th key={c} style={{padding:"14px 20px",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:"1.5px",textTransform:"uppercase",color:"#A08860",background:"linear-gradient(to bottom,#FBF4E4,#F5EDD8)",borderBottom:"1.5px solid #E2D5BA",textAlign:"left",whiteSpace:"nowrap"}}>{c}</th>)}</tr></thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);
const GlTd=({children,strong})=><td style={{padding:"14px 20px",color:strong?"#2A1F0E":"#7A6248",fontSize:"14px",borderBottom:"1px solid #EDE0C8",verticalAlign:"middle",fontWeight:strong?600:400}}>{children}</td>;

function PageHeader({tag,title,action,backTo,backLabel}){
  return (
    <div style={{marginBottom:"36px",animation:"fadeSlideUp 0.6s ease both"}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:"16px"}}>
        <div>
          <div style={{display:"inline-flex",alignItems:"center",gap:"10px",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:"4px",textTransform:"uppercase",color:"#B8860B",marginBottom:"10px"}}><div style={{width:"24px",height:"1.5px",background:"#B8860B",borderRadius:"2px"}}/>{tag}</div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:"900",lineHeight:1.1,background:"linear-gradient(135deg,#3D2B0E 0%,#8B5E0A 30%,#C49020 55%,#7A4A08 80%,#3D2B0E 100%)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"shimmerGold 6s linear infinite",margin:0}}>{title}</h1>
        </div>
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
          {backTo&&<BtnBack to={backTo} label={backLabel||"Back"}/>}
          {action}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export function Admin_View_Category() {
  const [cat,setCat]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{api.getCategories().then(setCat).finally(()=>setLoading(false));},[]);
  const del=async id=>{if(!window.confirm("Delete this category?")) return; await api.deleteCategory(id); setCat(c=>c.filter(x=>x.cat_id!==id));};
  return (
    <div style={pageWrap}><style>{GL}</style><div style={orb1}/><div style={orb2}/>
      <div style={inner()}>
        <PageHeader tag="Admin Panel" title="Book Categories" action={<BtnP to="/admin_add_category" label="Add Category"/>}/>
        {loading?<Spinner/>:cat.length===0?<Empty icon="🗂️" title="No categories yet"/>:(
          <GlTable cols={["#","Category Name","Actions"]}>
            {cat.map(item=>(
              <tr key={item.cat_id} className="gl-tr">
                <GlTd>{item.cat_id}</GlTd>
                <GlTd strong>{item.category}</GlTd>
                <GlTd><div style={{display:"flex",gap:"8px"}}><BtnO to={`/admin_update_category/${item.cat_id}`} label="Edit"/><BtnD onClick={()=>del(item.cat_id)}/></div></GlTd>
              </tr>
            ))}
          </GlTable>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export function Admin_View_Books() {
  const [cat,setCat]=useState([]); const [books,setBooks]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{Promise.all([api.getCategories(),api.getBooks()]).then(([cats,bks])=>{setCat(cats);setBooks(bks);}).finally(()=>setLoading(false));},[]);
  const del=async id=>{if(!window.confirm("Delete this book?")) return; await api.deleteBook(id); setBooks(b=>b.filter(bk=>bk.book_id!==id));};
  const catName=id=>cat.find(c=>c.cat_id===id)?.category||"—";
  return (
    <div style={pageWrap}><style>{GL}</style><div style={orb1}/><div style={orb2}/>
      <div style={inner()}>
        <PageHeader tag="Admin Panel" title="Manage Books" action={<BtnP to="/admin_add_books" label="Add Book"/>}/>
        {loading?<Spinner/>:books.length===0?<Empty icon="📚" title="No books yet"/>:(
          <GlTable cols={["#","Cover","Title","Category","Description","PDF","Actions"]}>
            {books.map(item=>(
              <tr key={item.book_id} className="gl-tr">
                <GlTd>{item.book_id}</GlTd>
                <GlTd><Thumb src={item.cover_img}/></GlTd>
                <GlTd strong>{item.book_name}</GlTd>
                <GlTd><Badge txt={catName(item.cat_id)}/></GlTd>
                <GlTd><span style={{display:"block",maxWidth:"160px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:"13px"}}>{item.description}</span></GlTd>
                <GlTd><a href={pdfUrl(item.book_pdf)} target="_blank" rel="noreferrer" className="gl-btn-o" style={{display:"inline-flex",padding:"7px 14px",background:"transparent",border:"1.5px solid #D8C898",borderRadius:"8px",color:"#2A1F0E",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:'1px',textDecoration:"none",transition:"all 0.2s"}}>View</a></GlTd>
                <GlTd><div style={{display:"flex",gap:"8px"}}><BtnO to={`/admin_update_book/${item.book_id}`} label="Edit"/><BtnO to={`/admin_moderate_ratings/${item.book_id}`} label="Ratings"/><BtnD onClick={()=>del(item.book_id)}/></div></GlTd>
              </tr>
            ))}
          </GlTable>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export function Admin_View_Books_Detail_Report() {
  const [books,setBooks]=useState([]); const [cat,setCat]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{Promise.all([api.getCategories(),api.getAllBooks()]).then(([cats,bks])=>{setCat(cats);setBooks(bks);}).finally(()=>setLoading(false));},[]);
  const catName=id=>cat.find(c=>c.cat_id===id)?.category||"—";
  return (
    <div style={pageWrap}><style>{GL}</style><div style={orb1}/><div style={orb2}/>
      <div style={inner()}>
        <PageHeader tag="Reports" title="Books Detail Report"/>
        {loading?<Spinner/>:(
          <GlTable cols={["#","Cover","Book Name","Category","Description","PDF"]}>
            {books.map(item=>(
              <tr key={item.book_id} className="gl-tr">
                <GlTd>{item.book_id}</GlTd>
                <GlTd><Thumb src={item.cover_img}/></GlTd>
                <GlTd strong>{item.book_name}</GlTd>
                <GlTd><Badge txt={catName(item.cat_id)}/></GlTd>
                <GlTd><span style={{display:"block",maxWidth:"160px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:"13px"}}>{item.description}</span></GlTd>
                <GlTd><a href={pdfUrl(item.book_pdf)} target="_blank" rel="noreferrer" className="gl-btn-o" style={{display:"inline-flex",padding:"7px 14px",background:"transparent",border:"1.5px solid #D8C898",borderRadius:"8px",color:"#2A1F0E",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:'1px',textDecoration:"none",transition:"all 0.2s"}}>View</a></GlTd>
              </tr>
            ))}
          </GlTable>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export function Admin_View_Writer_Detail_Report() {
  const [writers,setWriters]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{api.getAllWriters().then(setWriters).finally(()=>setLoading(false));},[]);
  return (
    <div style={pageWrap}><style>{GL}</style><div style={orb1}/><div style={orb2}/>
      <div style={inner()}>
        <PageHeader tag="Reports" title="Writers Report"/>
        {loading?<Spinner/>:(
          <GlTable cols={["#","Name","Email","Mobile","City","Books"]}>
            {writers.map(w=>(
              <tr key={w.writer_id} className="gl-tr">
                <GlTd>{w.writer_id}</GlTd>
                <GlTd strong>{w.writer_name}</GlTd>
                <GlTd>{w.writer_email||w.email||"—"}</GlTd>
                <GlTd>{w.mno||"—"}</GlTd>
                <GlTd>{w.writer_city||w.city||"—"}</GlTd>
                <GlTd><BtnO to={`/admin_view_writerwise_books_report/${w.writer_id}`} label="View Books"/></GlTd>
              </tr>
            ))}
          </GlTable>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export function Admin_View_Reader_Detail_Report() {
  const [readers,setReaders]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{api.getAllReaders().then(setReaders).finally(()=>setLoading(false));},[]);
  return (
    <div style={pageWrap}><style>{GL}</style><div style={orb1}/><div style={orb2}/>
      <div style={inner()}>
        <PageHeader tag="Reports" title="Readers Report"/>
        {loading?<Spinner/>:(
          <GlTable cols={["#","Name","Email","Mobile","City","Ratings"]}>
            {readers.map(r=>(
              <tr key={r.reader_id} className="gl-tr">
                <GlTd>{r.reader_id}</GlTd>
                <GlTd strong>{r.reader_name}</GlTd>
                <GlTd>{r.reader_email||r.email||"—"}</GlTd>
                <GlTd>{r.mno||"—"}</GlTd>
                <GlTd>{r.reader_city||r.city||"—"}</GlTd>
                <GlTd><BtnO to={`/admin_view_readerwise_rating_report/${r.reader_id}`} label="View Ratings"/></GlTd>
              </tr>
            ))}
          </GlTable>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export function Admin_View_WriterWise_Book_Report() {
  const params=useParams(); const [books,setBooks]=useState([]); const [cat,setCat]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{Promise.all([api.getCategories(),api.writerGetUploaded(params.wid)]).then(([cats,bks])=>{setCat(cats);setBooks(bks);}).finally(()=>setLoading(false));},[params.wid]);
  const catName=id=>cat.find(c=>c.cat_id===id)?.category||"—";
  return (
    <div style={pageWrap}><style>{GL}</style><div style={orb1}/><div style={orb2}/>
      <div style={inner("960px")}>
        <PageHeader tag="Reports" title="Writer's Books" backTo="/admin_view_writer_detail_report" backLabel="Writers Report"/>
        {loading?<Spinner/>:(
          <GlTable cols={["#","Cover","Book Name","Category","Ratings"]}>
            {books.map(item=>(
              <tr key={item.book_id} className="gl-tr">
                <GlTd>{item.book_id}</GlTd>
                <GlTd><Thumb src={item.cover_img}/></GlTd>
                <GlTd strong>{item.book_name}</GlTd>
                <GlTd><Badge txt={catName(item.cat_id)}/></GlTd>
                <GlTd><BtnO to={`/admin_view_bookwise_rating/${item.book_id}`} label="View Ratings"/></GlTd>
              </tr>
            ))}
          </GlTable>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export function Admin_View_Bookwise_Rating() {
  const params=useParams(); const [ratings,setRatings]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{api.getBookWiseRating(params.bid).then(setRatings).finally(()=>setLoading(false));},[params.bid]);
  const bookName=ratings[0]?.book[0]?.book_name||`Book #${params.bid}`;
  return (
    <div style={pageWrap}><style>{GL}</style><div style={orb1}/><div style={orb2}/>
      <div style={inner("960px")}>
        <PageHeader tag="Reports" title={`Ratings — ${bookName}`} backTo="/admin_view_books_detail_report" backLabel="Books Report"/>
        {loading?<Spinner/>:ratings.length===0?<Empty icon="⭐" title="No ratings yet"/>:(
          <GlTable cols={["#","Reader","Rating","Date"]}>
            {ratings.map((item,i)=>(
              <tr key={item._id} className="gl-tr">
                <GlTd>{i+1}</GlTd>
                <GlTd strong>{item.reader[0]?.reader_name||"—"}</GlTd>
                <GlTd><Stars r={item.rating}/></GlTd>
                <GlTd>{new Date(item.rating_date).toLocaleDateString()}</GlTd>
              </tr>
            ))}
          </GlTable>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export function Admin_View_ReaderWise_Rating_Report() {
  const params=useParams(); const [ratings,setRatings]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{api.getReaderWiseRating(params.rid).then(setRatings).finally(()=>setLoading(false));},[params.rid]);
  const readerName=ratings[0]?.reader[0]?.reader_name||`Reader #${params.rid}`;
  return (
    <div style={pageWrap}><style>{GL}</style><div style={orb1}/><div style={orb2}/>
      <div style={inner("960px")}>
        <PageHeader tag="Reports" title={`${readerName}'s Ratings`} backTo="/admin_view_reader_detail_report" backLabel="Readers Report"/>
        {loading?<Spinner/>:ratings.length===0?<Empty icon="⭐" title="No ratings given"/>:(
          <GlTable cols={["#","Book Name","Rating","Date"]}>
            {ratings.map((item,i)=>(
              <tr key={item._id} className="gl-tr">
                <GlTd>{i+1}</GlTd>
                <GlTd strong>{item.book[0]?.book_name||"—"}</GlTd>
                <GlTd><Stars r={item.rating}/></GlTd>
                <GlTd>{new Date(item.rating_date).toLocaleDateString()}</GlTd>
              </tr>
            ))}
          </GlTable>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export function Writer_View_Uploaded_Books() {
  const writerid=localStorage.getItem("writerid")||localStorage.getItem("userid");
  const [cat,setCat]=useState([]); const [books,setBooks]=useState([]); const [loading,setLoading]=useState(true); const [toast,setToast]=useState("");
  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(""),2600);};
  useEffect(()=>{Promise.all([api.getCategories(),api.writerGetUploaded(writerid)]).then(([cats,bks])=>{setCat(cats);setBooks(bks);}).finally(()=>setLoading(false));},[writerid]);
  const del=async id=>{if(!window.confirm("Delete this book permanently?")) return; try{await api.writerDeleteBook(id); setBooks(b=>b.filter(bk=>(bk.book_id||bk._id)!==id)); showToast("Book deleted.");}catch{showToast("Delete failed.");}};
  const toggleDraft=async(id,isDraft)=>{try{await api.writerTogglePublish(id); setBooks(b=>b.map(bk=>(bk.book_id||bk._id)===id?{...bk,isDraft:!isDraft}:bk)); showToast(isDraft?"Book published!":"Book moved to drafts.");}catch{showToast("Failed.");}};
  const catName=id=>cat.find(c=>c.cat_id===id)?.category||"—";
  return (
    <div style={pageWrap}><style>{GL}</style><div style={orb1}/><div style={orb2}/>
      {toast&&<div style={{position:"fixed",top:24,right:24,background:"#2A1F0E",color:"#F5E8C8",padding:"12px 22px",borderRadius:12,fontSize:13,fontFamily:"'Lato',sans-serif",zIndex:999}}>{toast}</div>}
      <div style={inner()}>
        <PageHeader tag="My Library" title="My Uploaded Books" action={
          <div style={{display:"flex",gap:"10px"}}>
            <Link to="/writer_analytics" className="gl-btn-g" style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"11px 18px",background:"rgba(255,250,238,.8)",border:"1.5px solid #D8C898",borderRadius:"10px",color:"#2A1F0E",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:'1px',textDecoration:"none",transition:"all 0.2s"}}>Analytics</Link>
            <BtnP to="/writer_add_books" label="Upload Book"/>
          </div>
        }/>
        {loading?<Spinner/>:books.length===0?(
          <Empty icon="✍️" title="No books uploaded yet" desc="Share your stories with the world.">
            <div style={{marginTop:"24px"}}><Link to="/writer_add_books" style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"12px 24px",background:"linear-gradient(135deg,#C89030,#A06820)",color:"white",textDecoration:"none",borderRadius:"10px",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:"1px",fontWeight:"600",boxShadow:"0 4px 16px rgba(180,120,30,.25)"}}>Upload First Book</Link></div>
          </Empty>
        ):(
          <GlTable cols={["#","Cover","Title","Category","Status","PDF","Reviews","Actions"]}>
            {books.map((item,i)=>{
              const bid=item.book_id||item._id;
              return (
              <tr key={bid} className="gl-tr" style={{opacity:item.isDraft?0.65:1}}>
                <GlTd>{i+1}</GlTd>
                <GlTd><Thumb src={item.cover_img||item.coverImage}/></GlTd>
                <GlTd><div><span style={{fontWeight:600,color:"#2A1F0E"}}>{item.book_name||item.title}</span><div style={{fontSize:"12px",color:"#3D2B0E",marginTop:"2px",maxWidth:"180px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.description}</div></div></GlTd>
                <GlTd><Badge txt={catName(item.cat_id||item.genre)}/></GlTd>
                <GlTd>
                  <span style={{display:"inline-block",padding:"3px 10px",borderRadius:20,fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:'1px',textTransform:"uppercase",
                    background:item.isDraft?"#FDF6E8":"#EAF3DE",color:item.isDraft?"#8A6040":"#3B6D11",border:item.isDraft?"1px solid #E0CFA8":"1px solid #97C459"}}>
                    {item.isDraft?"Draft":"Published"}
                  </span>
                </GlTd>
                <GlTd><a href={pdfUrl(item.book_pdf||item.pdfFile)} target="_blank" rel="noreferrer" className="gl-btn-o" style={{display:"inline-flex",padding:"7px 14px",background:"transparent",border:"1.5px solid #D8C898",borderRadius:"8px",color:"#2A1F0E",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:'1px',textDecoration:"none",transition:"all 0.2s"}}>PDF</a></GlTd>
                <GlTd><BtnO to={`/writer_book_reviews/${bid}`} label="Reviews"/></GlTd>
                <GlTd>
                  <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                    <BtnO to={`/writer_update_book/${bid}`} label="Edit"/>
                    <BtnO onClick={()=>toggleDraft(bid,item.isDraft)} label={item.isDraft?"Publish":"Draft"}/>
                    <BtnD onClick={()=>del(bid)}/>
                  </div>
                </GlTd>
              </tr>
            );})}
          </GlTable>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export function Writer_View_BookWise_Rating() {
  const params=useParams(); const [ratings,setRatings]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{api.getBookWiseRating(params.bid).then(setRatings).finally(()=>setLoading(false));},[params.bid]);
  const bookName=ratings[0]?.book[0]?.book_name||`Book #${params.bid}`;
  return (
    <div style={pageWrap}><style>{GL}</style><div style={orb1}/><div style={orb2}/>
      <div style={inner("960px")}>
        <PageHeader tag="Ratings" title={bookName} backTo="/writer_view_uploaded_books" backLabel="My Books"/>
        {loading?<Spinner/>:ratings.length===0?<Empty icon="⭐" title="No ratings yet" desc="Your readers haven't rated this book yet."/>:(
          <GlTable cols={["#","Reader","Rating","Date"]}>
            {ratings.map((item,i)=>(
              <tr key={item._id} className="gl-tr">
                <GlTd>{i+1}</GlTd>
                <GlTd strong>{item.reader[0]?.reader_name||"—"}</GlTd>
                <GlTd><Stars r={item.rating}/></GlTd>
                <GlTd>{new Date(item.rating_date).toLocaleDateString()}</GlTd>
              </tr>
            ))}
          </GlTable>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Book grid card component shared by Reader and Writer browse views
function BookGrid({ books, catName, showRead=true, showRate=false, showRatings=false }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:"22px",animation:"fadeSlideUp 0.7s ease both"}}>
      {books.map(item=>(
        <div key={item.book_id} className="gl-book-card" style={{background:"linear-gradient(160deg,#FFFEF8 0%,#FBF4E4 100%)",border:"1px solid #E2D5BA",borderRadius:"18px",overflow:"hidden",boxShadow:"0 4px 20px rgba(80,50,15,.08)",transition:"all 0.35s cubic-bezier(0.175,0.885,0.32,1.275)"}}>
          <div style={{height:"200px",background:"linear-gradient(145deg,#F5EDD8,#EDE0C0)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
            {item.cover_img
              ?<img src={imgUrl(item.cover_img)} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={item.book_name}/>
              :<div style={{fontSize:"52px",opacity:0.5}}>📚</div>
            }
            <div style={{position:"absolute",top:"10px",right:"10px",background:"rgba(255,252,240,.92)",borderRadius:"20px",padding:"3px 10px",fontSize:12,color:"#B8860B",fontFamily:"'Cinzel',serif",letterSpacing:'1px',fontWeight:600,boxShadow:"0 1px 4px rgba(0,0,0,.08)"}}>{catName(item.cat_id)}</div>
          </div>
          <div style={{padding:"16px 16px 14px"}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"15px",fontWeight:"700",color:"#2A1F0E",marginBottom:"12px",lineHeight:1.3}}>{item.book_name}</div>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
              {showRead&&(pdfUrl(item.book_pdf)
                ?<a href={pdfUrl(item.book_pdf)} target="_blank" rel="noreferrer" className="gl-btn-o" style={{flex:1,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"8px 12px",background:"linear-gradient(135deg,#C89030,#A06820)",border:"none",borderRadius:"8px",color:"white",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:'1px',textDecoration:"none",fontWeight:600,transition:"all 0.2s"}}>Read</a>
                :<span style={{flex:1,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"8px 12px",background:"#D0C0A0",border:"none",borderRadius:"8px",color:"white",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:'1px',fontWeight:600,opacity:0.6,cursor:"not-allowed"}}>No PDF</span>
              )}
              {showRate&&<Link to={`/reader_view_book_detail/${item.book_id}`} className="gl-btn-o" style={{flex:1,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"8px 12px",background:"transparent",border:"1.5px solid #D8C898",borderRadius:"8px",color:"#2A1F0E",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:'1px',textDecoration:"none",transition:"all 0.2s"}}>Rate ★</Link>}
              {showRatings&&<Link to={`/writer_view_bookwise_rating/${item.book_id}`} className="gl-btn-o" style={{flex:1,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"8px 12px",background:"transparent",border:"1.5px solid #D8C898",borderRadius:"8px",color:"#2A1F0E",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:'1px',textDecoration:"none",transition:"all 0.2s"}}>★ Ratings</Link>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export function Reader_View_All_Books() {
  const [books,setBooks]=useState([]); const [cat,setCat]=useState([]); const [activeCat,setActiveCat]=useState(0);
  const [loading,setLoading]=useState(true); const [search,setSearch]=useState(""); const [sort,setSort]=useState("newest");
  const [recent,setRecent]=useState([]); const [bookmarks,setBookmarks]=useState(new Set()); const [toast,setToast]=useState("");
  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(""),2200);};
  useEffect(()=>{
    Promise.all([api.getCategories(),api.readerGetBooks(),api.readerGetRecent().catch(()=>[]),api.readerGetBookmarks().catch(()=>[])])
      .then(([cats,bks,rec,bms])=>{setCat(cats);setBooks(bks);setRecent(rec||[]);setBookmarks(new Set((bms||[]).map(b=>String(b._id||b.book_id))));})
      .finally(()=>setLoading(false));
  },[]);
  const filterBooks=async id=>{setActiveCat(id);setLoading(true);setSearch("");try{const bks=id===0?await api.readerGetBooks():await api.readerGetCatBooks(id);setBooks(bks);}catch{}setLoading(false);};
  const handleSearch=async e=>{e.preventDefault();if(!search.trim()){filterBooks(0);return;}setLoading(true);setActiveCat(-1);try{const bks=await api.readerSearch(search,"",sort);setBooks(bks);}catch{}setLoading(false);};
  const handleSort=async val=>{setSort(val);setLoading(true);try{const bks=search.trim()?await api.readerSearch(search,"",val):await api.readerGetBooks();setBooks(bks);}catch{}setLoading(false);};
  const toggleBookmark=async bid=>{try{const res=await api.readerToggleBookmark(bid);setBookmarks(prev=>{const n=new Set(prev);res.bookmarked?n.add(String(bid)):n.delete(String(bid));return n;});showToast(res.message||"Done");}catch{showToast("Please log in to bookmark.");}};
  const trackAndOpen=(bid,url)=>{api.readerTrackRecent(bid).catch(()=>{});window.open(url,"_blank");};
  const catName=id=>cat.find(c=>c.cat_id===id)?.category||String(id)||"—";
  const filterBtnS=(active)=>({display:"inline-flex",alignItems:"center",padding:"8px 18px",background:active?"linear-gradient(135deg,#C89030,#A06820)":"rgba(255,250,238,.85)",border:active?"none":"1.5px solid #D8C898",borderRadius:"20px",color:active?"white":"#8A6040",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:'1px',cursor:"pointer",fontWeight:active?600:400,boxShadow:active?"0 3px 10px rgba(180,120,30,.22)":"none",transition:"all 0.2s"});
  return (
    <div style={pageWrap}><style>{GL}</style><div style={orb1}/><div style={orb2}/>
      {toast&&<div style={{position:"fixed",top:24,right:24,background:"#2A1F0E",color:"#F5E8C8",padding:"12px 22px",borderRadius:12,fontSize:13,fontFamily:"'Lato',sans-serif",zIndex:999}}>{toast}</div>}
      <div style={inner()}>
        <PageHeader tag="Library" title="Browse Books"/>
        <form onSubmit={handleSearch} style={{display:"flex",gap:"10px",marginBottom:"20px",flexWrap:"wrap"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by title or author…" style={{flex:1,minWidth:200,padding:"10px 16px",background:"#FBF6ED",border:"1.5px solid #E0CFA8",borderRadius:10,fontFamily:"'Lato',sans-serif",fontSize:14,color:"#2A1F0E",outline:"none"}}/>
          <select value={sort} onChange={e=>handleSort(e.target.value)} style={{padding:"10px 14px",background:"#FBF6ED",border:"1.5px solid #E0CFA8",borderRadius:10,fontFamily:"'Cinzel',serif",fontSize:13,color:"#2A1F0E",cursor:"pointer",outline:"none"}}>
            <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option>
          </select>
          <button type="submit" style={{padding:"10px 22px",background:"linear-gradient(135deg,#C89030,#A06820)",border:"none",borderRadius:10,color:"white",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:"1px",cursor:"pointer"}}>Search</button>
          {search&&<button type="button" onClick={()=>{setSearch("");filterBooks(0);}} style={{padding:"10px 16px",background:"transparent",border:"1.5px solid #E0CFA8",borderRadius:10,color:"#2A1F0E",fontFamily:"'Cinzel',serif",fontSize:13,cursor:"pointer"}}>Clear</button>}
        </form>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"32px",padding:"18px 20px",background:"linear-gradient(160deg,rgba(255,252,242,.9),rgba(250,242,224,.9))",border:"1px solid #E0CFA8",borderRadius:"16px",backdropFilter:"blur(8px)"}}>
          <button className="gl-filter" style={filterBtnS(activeCat===0)} onClick={()=>filterBooks(0)}>All</button>
          {cat.map(c=><button key={c.cat_id} className="gl-filter" style={filterBtnS(activeCat===c.cat_id)} onClick={()=>filterBooks(c.cat_id)}>{c.category}</button>)}
        </div>
        {recent.length>0&&!search&&(
          <div style={{marginBottom:"32px"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:'1.2px',color:"#B09870",marginBottom:"12px"}}>CONTINUE READING</div>
            <div style={{display:"flex",gap:"12px",overflowX:"auto",paddingBottom:"8px"}}>
              {recent.map(b=>{const bid=String(b._id||b.book_id);const pdfSrc=b.book_pdf||b.pdfFile;const coverSrc=b.cover_img||b.coverImage;return(
                <div key={bid} style={{flexShrink:0,width:120,background:"linear-gradient(160deg,#FFFEF8,#FBF4E4)",border:"1px solid #E2D5BA",borderRadius:12,overflow:"hidden",cursor:"pointer"}}
                  onClick={()=>pdfSrc&&trackAndOpen(bid,`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/book_pdf/${pdfSrc}`)}>
                  <div style={{height:90,background:"#F0E6D0",overflow:"hidden"}}>{coverSrc?<img src={imgUrl(coverSrc)} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:null}</div>
                  <div style={{padding:"8px",fontFamily:"'Lato',sans-serif",fontSize:13,color:"#2A1F0E",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.book_name||b.title}</div>
                </div>
              );})}
            </div>
          </div>
        )}
        <div style={{marginBottom:"20px",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:'1.2px',color:"#B09870"}}>{books.length} {books.length===1?"VOLUME":"VOLUMES"} FOUND</div>
        {loading?<Spinner/>:books.length===0?<Empty icon="📖" title="No books found" desc="Try a different search or category"/>:(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:"22px",animation:"fadeSlideUp 0.7s ease both"}}>
            {books.map(item=>{
              const bid=String(item._id||item.book_id);const isBookmarked=bookmarks.has(bid);
              const pdfSrc=item.book_pdf||item.pdfFile;const coverSrc=item.cover_img||item.coverImage;
              const name=item.book_name||item.title;const genre=catName(item.cat_id||item.genre||"");
              return(
              <div key={bid} className="gl-book-card" style={{background:"linear-gradient(160deg,#FFFEF8 0%,#FBF4E4 100%)",border:"1px solid #E2D5BA",borderRadius:"18px",overflow:"hidden",boxShadow:"0 4px 20px rgba(80,50,15,.08)",transition:"all 0.35s cubic-bezier(0.175,0.885,0.32,1.275)"}}>
                <div style={{height:"200px",background:"linear-gradient(145deg,#F5EDD8,#EDE0C0)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
                  {coverSrc?<img src={imgUrl(coverSrc)} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={name}/>:<div style={{fontSize:"52px",opacity:0.5}}>📚</div>}
                  <div style={{position:"absolute",top:"10px",right:"10px",background:"rgba(255,252,240,.92)",borderRadius:"20px",padding:"3px 10px",fontSize:12,color:"#B8860B",fontFamily:"'Cinzel',serif",letterSpacing:'1px',fontWeight:600,boxShadow:"0 1px 4px rgba(0,0,0,.08)"}}>{genre}</div>
                  <button onClick={()=>toggleBookmark(bid)} style={{position:"absolute",top:"10px",left:"10px",width:28,height:28,background:"rgba(255,252,240,.92)",border:"none",borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 4px rgba(0,0,0,.12)"}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill={isBookmarked?"#B8860B":"none"} stroke="#B8860B" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                  </button>
                </div>
                <div style={{padding:"16px 16px 14px"}}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:"15px",fontWeight:"700",color:"#2A1F0E",marginBottom:"12px",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</div>
                  <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                    {pdfSrc?<button onClick={()=>trackAndOpen(bid,`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/book_pdf/${pdfSrc}`)} className="gl-btn-o" style={{flex:1,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"8px 12px",background:"linear-gradient(135deg,#C89030,#A06820)",border:"none",borderRadius:"8px",color:"white",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:'1px',fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}>Read</button>:<span style={{flex:1,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"8px 12px",background:"#D0C0A0",border:"none",borderRadius:"8px",color:"white",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:'1px',fontWeight:600,opacity:0.6,cursor:"not-allowed"}}>No PDF</span>}
                    <Link to={`/reader_view_book_detail/${bid}`} className="gl-btn-o" style={{flex:1,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"8px 12px",background:"transparent",border:"1.5px solid #D8C898",borderRadius:"8px",color:"#2A1F0E",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:'1px',textDecoration:"none",transition:"all 0.2s"}}>Rate ★</Link>
                  </div>
                </div>
              </div>
            );})}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export function Writer_View_All_Books() {
  const writerid=localStorage.getItem("writerid");
  const [books,setBooks]=useState([]); const [cat,setCat]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{Promise.all([api.getCategories(),api.writerGetAll(writerid)]).then(([cats,bks])=>{setCat(cats);setBooks(bks);}).finally(()=>setLoading(false));},[writerid]);
  const catName=id=>cat.find(c=>c.cat_id===id)?.category||"";
  return (
    <div style={pageWrap}><style>{GL}</style><div style={orb1}/><div style={orb2}/>
      <div style={inner()}>
        <PageHeader tag="Browse" title="All Books"/>
        {loading?<Spinner/>:books.length===0?<Empty icon="📖" title="No books found"/>:<BookGrid books={books} catName={catName} showRead/>}
      </div>
    </div>
  );
}

export default Admin_View_Books;
