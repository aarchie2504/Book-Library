import { useState, useEffect } from 'react';
import { useToast } from './ToastProvider.jsx';
import { api } from './api';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .gl-textarea:focus{border-color:#B8860B!important;outline:none;box-shadow:0 0 0 3px rgba(184,134,11,.1)!important}
  .save-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(180,120,30,.35)!important}
`;
const ff = { fontFamily:"'Lato',sans-serif" };
const serif = { fontFamily:"'Cinzel',serif" };

export default function Admin_Announcement() {
  const toast = useToast();
  const [text, setText]       = useState('');
  const [saved, setSaved]     = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    api.adminGetAnnouncement()
      .then(d => { setText(d.announcement || ''); setSaved(d.announcement || ''); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.adminSetAnnouncement(text);
      setSaved(text);
      toast.info(text.trim() ? 'Announcement published!' : 'Announcement cleared.');
    } catch { toast.error('Failed to save.'); }
    setSaving(false);
  };

  const handleClear = async () => {
    setText('');
    setSaving(true);
    try {
      await api.adminSetAnnouncement('');
      setSaved('');
      toast.info('Announcement cleared.');
    } catch { toast.error('Failed to clear.'); }
    setSaving(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FDF8F0,#F5ECE0)', padding:'48px 24px 80px' }}>
      <style>{GL}</style>
      
      <div style={{ maxWidth:760, margin:'0 auto' }}>
        <div style={{ marginBottom:36 }}>
          <div style={{ fontSize:12, letterSpacing:'2px', fontFamily:"'Cinzel',serif", color:'#B8860B', textTransform:'uppercase', marginBottom:8, fontWeight:600 }}>Admin Panel</div>
          <h1 style={{ fontSize:32, fontWeight:900, fontFamily:"'Playfair Display',serif", color:'#2A1F0E', margin:'0 0 8px' }}>Announcement Banner</h1>
          <p style={{ fontSize:13, ...ff, color:'#2A1F0E', margin:0 }}>This message appears at the top of every page for all users. Leave blank to hide the banner.</p>
        </div>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
            <div style={{ width:36,height:36, border:'3px solid #F0E6D0', borderTopColor:'#B8860B', borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
          </div>
        ) : (
          <div style={{ animation:'fadeUp 0.5s ease both' }}>
            {text.trim() && (
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:22, fontWeight:800, fontFamily:"'Playfair Display',serif", color:'#1A1208', marginBottom:10 }}>Preview</div>
                <div style={{ background:'linear-gradient(135deg,#C89030,#A06820)', borderRadius:10, padding:'12px 20px', display:'flex', alignItems:'center', gap:12 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ flexShrink:0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span style={{ fontSize:13, ...ff, color:'white', flex:1 }}>{text}</span>
                </div>
              </div>
            )}
            <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:16, padding:'28px 28px 24px', boxShadow:'0 6px 24px rgba(80,50,15,.08)' }}>
              <label style={{ display:'block', marginBottom:8, fontSize:13, fontFamily:"'Cinzel',serif", letterSpacing:'1px', textTransform:'uppercase', color:'#1A1208', fontWeight:600 }}>Announcement Text</label>
              <textarea className="gl-textarea" value={text} onChange={e => setText(e.target.value)} maxLength={300} rows={4}
                style={{ width:'100%', padding:'12px 16px', background:'#FBF6ED', border:'1.5px solid #E0CFA8', borderRadius:10, ...ff, fontSize:14, color:'#2A1F0E', resize:'vertical', transition:'all 0.2s', boxSizing:'border-box', lineHeight:1.6 }}
                placeholder="e.g. New books added every week. Explore the latest collection!"
              />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:6 }}>
                <span style={{ fontSize:12, ...ff, color:'#3D2B0E' }}>{text.length}/300 characters</span>
                {saved.trim() && <span style={{ fontSize:12, ...ff, color:'#3B6D11', display:'flex', alignItems:'center', gap:4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Banner is live</span>}
              </div>
              <div style={{ display:'flex', gap:12, marginTop:20 }}>
                <button className="save-btn" onClick={handleSave} disabled={saving}
                  style={{ flex:1, padding:'13px', background: saving ? '#C0A060' : 'linear-gradient(135deg,#C89030,#A06820)', border:'none', borderRadius:10, color:'white', ...serif, fontSize:13, letterSpacing:'1.2px', cursor: saving ? 'not-allowed' : 'pointer', transition:'all 0.25s', boxShadow:'0 4px 16px rgba(180,120,30,.25)' }}>
                  {saving ? 'Saving…' : 'Publish Announcement'}
                </button>
                {text.trim() && (
                  <button onClick={handleClear} disabled={saving}
                    style={{ padding:'13px 22px', background:'transparent', border:'1.5px solid #E0CFA8', borderRadius:10, color:'#2A1F0E', ...serif, fontSize:13, letterSpacing:'1px', cursor:'pointer', transition:'all 0.2s' }}>
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div style={{ marginTop:20, background:'rgba(240,230,208,0.4)', border:'1px solid #E2D5BA', borderRadius:12, padding:'16px 20px' }}>
              <div style={{ fontSize:12, fontWeight:600, color:'#2A1F0E', ...ff, marginBottom:6 }}>How it works</div>
              <ul style={{ margin:0, paddingLeft:18 }}>
                {['The banner appears at the top of every page for all users.','Clearing the text hides the banner immediately.','Keep messages short and clear — 300 character limit.'].map((t,i) => (
                  <li key={i} style={{ fontSize:12, ...ff, color:'#2A1F0E', marginBottom:4 }}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
