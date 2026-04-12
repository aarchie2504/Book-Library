import { useState } from 'react';
import { useToast } from './ToastProvider.jsx';
import { api } from './api';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .export-card:hover{transform:translateY(-3px);box-shadow:0 16px 48px rgba(80,50,15,.14)!important}
  .dl-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(180,120,30,.35)!important}
`;
const ff = { fontFamily:"'Lato',sans-serif" };
const serif = { fontFamily:"'Cinzel',serif" };

function toCSV(rows, headers) {
  const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.join(',')];
  rows.forEach(r => lines.push(headers.map(h => escape(r[h])).join(',')));
  return lines.join('\n');
}

function download(content, filename) {
  const blob = new Blob([content], { type:'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const reports = [
  {
    id: 'books',
    label: 'Books Report',
    desc: 'All books with title, genre, copies, and added date.',
    icon: <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>,
    color: '#B8860B',
    fetch: async () => {
      const data = await api.getAllBooks();
      const rows = (Array.isArray(data) ? data : []).map(b => ({
        Title: b.book_name || b.title,
        Genre: b.cat_id || b.genre || '—',
        TotalCopies: b.totalCopies || 1,
        AvailableCopies: b.availableCopies ?? '—',
        AddedOn: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—',
      }));
      return { rows, headers: ['Title','Genre','TotalCopies','AvailableCopies','AddedOn'], filename: 'books_report.csv' };
    },
  },
  {
    id: 'writers',
    label: 'Writers Report',
    desc: 'All registered writers with contact and bio.',
    icon: <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></>,
    color: '#2C5F7A',
    fetch: async () => {
      const data = await api.getAllWriters();
      const rows = (Array.isArray(data) ? data : []).map(w => ({
        Name: w.writer_name || w.name,
        Email: w.writer_email || w.email,
        City: w.writer_city || w.city || '—',
        Phone: w.mno || w.phone || '—',
        Bio: w.writer_description || w.bio || '—',
        JoinedOn: w.createdAt ? new Date(w.createdAt).toLocaleDateString() : '—',
      }));
      return { rows, headers: ['Name','Email','City','Phone','Bio','JoinedOn'], filename: 'writers_report.csv' };
    },
  },
  {
    id: 'readers',
    label: 'Readers Report',
    desc: 'All registered readers with contact details.',
    icon: <><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 018 0v2"/></>,
    color: '#3D6B30',
    fetch: async () => {
      const data = await api.getAllReaders();
      const rows = (Array.isArray(data) ? data : []).map(r => ({
        Name: r.reader_name || r.name,
        Email: r.reader_email || r.email,
        City: r.reader_city || r.city || '—',
        Phone: r.mno || r.phone || '—',
        JoinedOn: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—',
      }));
      return { rows, headers: ['Name','Email','City','Phone','JoinedOn'], filename: 'readers_report.csv' };
    },
  },
];

export default function Admin_Export_Reports() {
  const toast = useToast();
  const [loading, setLoading] = useState({});

  const handleExport = async (report) => {
    setLoading(p => ({ ...p, [report.id]: true }));
    try {
      const { rows, headers, filename } = await report.fetch();
      if (!rows.length) { toast.info('No data to export.'); return; }
      download(toCSV(rows, headers), filename);
      toast.success(`${report.label} downloaded (${rows.length} rows).`);
    } catch { toast.error('Export failed. Try again.'); }
    setLoading(p => ({ ...p, [report.id]: false }));
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FDF8F0,#F5ECE0)', padding:'48px 24px 80px' }}>
      <style>{GL}</style>

      

      <div style={{ maxWidth:900, margin:'0 auto' }}>
        <div style={{ marginBottom:40 }}>
          <div style={{ fontSize:12, letterSpacing:'2px', fontFamily:"'Cinzel',serif", color:'#B8860B', textTransform:'uppercase', marginBottom:8, fontWeight:600 }}>Admin Panel</div>
          <h1 style={{ fontSize:32, fontWeight:900, fontFamily:"'Playfair Display',serif", color:'#2A1F0E', margin:'0 0 8px' }}>Export Reports</h1>
          <p style={{ fontSize:13, ...ff, color:'#2A1F0E', margin:0 }}>Download data as CSV files you can open in Excel or Google Sheets.</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20 }}>
          {reports.map(r => (
            <div key={r.id} className="export-card"
              style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:18, padding:28, boxShadow:'0 6px 24px rgba(80,50,15,.08)', transition:'all 0.22s', animation:'fadeUp 0.5s ease both' }}>
              <div style={{ width:48, height:48, background:`${r.color}18`, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={r.color} strokeWidth="1.5">{r.icon}</svg>
              </div>
              <div style={{ fontSize:16, fontWeight:700, color:'#2A1F0E', ...ff, marginBottom:6 }}>{r.label}</div>
              <div style={{ fontSize:13, color:'#2A1F0E', ...ff, marginBottom:24, lineHeight:1.5 }}>{r.desc}</div>
              <button className="dl-btn" onClick={() => handleExport(r)} disabled={loading[r.id]}
                style={{ width:'100%', padding:'12px', background: loading[r.id] ? '#C0A060' : 'linear-gradient(135deg,#C89030,#A06820)', border:'none', borderRadius:10, color:'white', ...serif, fontSize:13, letterSpacing:'1.2px', cursor: loading[r.id] ? 'not-allowed' : 'pointer', transition:'all 0.25s', boxShadow:'0 4px 16px rgba(180,120,30,.22)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {loading[r.id]
                  ? <><div style={{ width:14,height:14, border:'2px solid rgba(255,255,255,.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />Exporting…</>
                  : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download CSV</>
                }
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop:32, background:'rgba(240,230,208,0.4)', border:'1px solid #E2D5BA', borderRadius:12, padding:'16px 20px' }}>
          <div style={{ fontSize:12, fontWeight:600, color:'#2A1F0E', ...ff, marginBottom:6 }}>About CSV exports</div>
          <p style={{ fontSize:12, ...ff, color:'#2A1F0E', margin:0, lineHeight:1.6 }}>
            CSV files open directly in Excel, Google Sheets, or any spreadsheet app. Data exports are snapshots of the current state — re-download at any time for the latest data.
          </p>
        </div>
      </div>
    </div>
  );
}
