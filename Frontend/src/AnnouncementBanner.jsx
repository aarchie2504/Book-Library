import { useState, useEffect } from 'react';

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function AnnouncementBanner() {
  const [text, setText]       = useState('');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Fetch WITHOUT auth header — this is a public endpoint
    fetch(`${BASE}/admin/announcement`)
      .then(r => r.ok ? r.json() : { announcement: '' })
      .then(d => setText(d.announcement || ''))
      .catch(() => {});
  }, []);

  if (!text.trim() || !visible) return null;

  return (
    <div style={{ background:'linear-gradient(135deg,#C89030,#A06820)', padding:'10px 20px', display:'flex', alignItems:'center', gap:12, position:'relative', zIndex:50 }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ flexShrink:0 }}>
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span style={{ flex:1, fontSize:13, fontFamily:"'Lato',sans-serif", color:'white', textAlign:'center' }}>{text}</span>
      <button onClick={() => setVisible(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.75)', padding:'2px 6px', fontSize:16, lineHeight:1 }}>×</button>
    </div>
  );
}
