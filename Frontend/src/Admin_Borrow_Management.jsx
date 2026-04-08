import { useState, useEffect } from 'react';
import { api } from './api';

const GL = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .brow-row:hover{background:#FDF6E8!important}
`;
const FF  = { fontFamily:"'Lato',sans-serif" };
const SER = { fontFamily:"'Cinzel',serif" };

const StatusBadge = ({ status }) => {
  const map = {
    borrowed: { bg:'#EFF6FF', color:'#1D4ED8', border:'#BFDBFE', label:'ACTIVE'   },
    returned: { bg:'#F0FDF4', color:'#15803D', border:'#BBF7D0', label:'RETURNED' },
    overdue:  { bg:'#FFF7ED', color:'#C2410C', border:'#FED7AA', label:'OVERDUE'  },
  };
  const c = map[status] || map.borrowed;
  return (
    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, letterSpacing:'0.8px',
      background:c.bg, color:c.color, border:`1px solid ${c.border}`, ...SER }}>
      {c.label}
    </span>
  );
};

export default function Admin_Borrow_Management() {
  const [borrows,  setBorrows]  = useState([]);
  const [overdue,  setOverdue]  = useState([]);
  const [tab,      setTab]      = useState('all');
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [msg,      setMsg]      = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [allRes, ovRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/borrow/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }).then(r => r.json()),
        fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/borrow/overdue`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }).then(r => r.json()),
      ]);
      setBorrows(allRes.borrows || []);
      setOverdue(ovRes.overdue || []);
    } catch (e) {
      setMsg('Failed to load borrow records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const displayed = (tab === 'overdue' ? overdue : borrows).filter(b => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (b.user?.name  || '').toLowerCase().includes(q) ||
      (b.user?.email || '').toLowerCase().includes(q) ||
      (b.book?.title || '').toLowerCase().includes(q)
    );
  }).filter(b => {
    if (tab === 'active')   return b.status === 'borrowed';
    if (tab === 'returned') return b.status === 'returned';
    return true;
  });

  const stats = {
    total:    borrows.length,
    active:   borrows.filter(b => b.status === 'borrowed').length,
    returned: borrows.filter(b => b.status === 'returned').length,
    overdue:  overdue.length,
  };

  const TabBtn = ({ id, label, count, urgent }) => (
    <button onClick={() => setTab(id)}
      style={{ padding:'9px 20px', borderRadius:10, border: urgent && tab!==id ? '1.5px solid #FED7AA':'none',
        cursor:'pointer', transition:'all 0.15s', ...SER, fontSize:11, letterSpacing:'1.5px', textTransform:'uppercase',
        background: tab===id ? (urgent?'linear-gradient(135deg,#EA580C,#C2410C)':'linear-gradient(135deg,#C89030,#A06820)') : (urgent?'#FFF7ED':'rgba(0,0,0,0.04)'),
        color: tab===id ? 'white' : (urgent?'#C2410C':'#7A6040'),
        fontWeight: tab===id ? 700 : 400,
      }}>
      {label} <span style={{ opacity:0.8 }}>({count})</span>
    </button>
  );

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FDF8F0,#F5ECE0)', padding:'48px 24px 80px' }}>
      <style>{GL}</style>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom:28, animation:'fadeUp 0.5s ease both' }}>
          <div style={{ fontSize:11, letterSpacing:'2px', ...SER, color:'#B8860B', textTransform:'uppercase', marginBottom:6 }}>Admin Panel</div>
          <h1 style={{ fontSize:32, fontWeight:900, fontFamily:"'Playfair Display',serif", color:'#2A1F0E', margin:'0 0 20px' }}>Borrow Management</h1>

          {/* Stat cards */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:24 }}>
            {[
              { val:stats.total,    label:'Total Records', color:'#B8860B' },
              { val:stats.active,   label:'Currently Borrowed', color:'#1D4ED8' },
              { val:stats.returned, label:'Returned',      color:'#15803D' },
              { val:stats.overdue,  label:'Overdue',       color:'#C2410C' },
            ].map((s,i) => (
              <div key={i} style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:12, padding:'12px 20px', textAlign:'center', minWidth:110 }}>
                <div style={{ fontSize:24, fontWeight:700, color:s.color, ...FF }}>{s.val}</div>
                <div style={{ fontSize:10, letterSpacing:'1px', textTransform:'uppercase', color:'#7A6040', ...SER, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs + Search */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <TabBtn id="all"      label="All"      count={stats.total} />
              <TabBtn id="active"   label="Active"   count={stats.active} />
              <TabBtn id="returned" label="Returned" count={stats.returned} />
              <TabBtn id="overdue"  label="Overdue"  count={stats.overdue} urgent />
            </div>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by reader, email, or book…"
              style={{ padding:'9px 16px', borderRadius:10, border:'1.5px solid #E0CFA8', background:'#FFFEF8', ...FF, fontSize:13, color:'#2A1F0E', outline:'none', width:280 }}
            />
          </div>
        </div>

        {msg && <div style={{ background:'#FFF7ED', border:'1px solid #FED7AA', borderRadius:10, padding:'12px 20px', color:'#C2410C', ...FF, fontSize:14, marginBottom:16 }}>{msg}</div>}

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
            <div style={{ width:36, height:36, border:'2.5px solid #F0E6D0', borderTopColor:'#B8860B', borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', ...FF, color:'#7A6040', fontSize:15 }}>
            {search ? 'No records match your search.' : 'No borrow records found.'}
          </div>
        ) : (
          <div style={{ background:'linear-gradient(160deg,#FFFEF8,#FBF4E4)', border:'1px solid #E2D5BA', borderRadius:18, overflow:'hidden', animation:'fadeUp 0.4s ease both' }}>
            {/* Table header */}
            <div style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1fr 1fr 1fr 1fr', gap:8, padding:'12px 20px', borderBottom:'1px solid #E2D5BA', background:'rgba(184,134,11,0.06)' }}>
              {['Book','Reader','Status','Borrowed','Due Date','Returned'].map(h => (
                <div key={h} style={{ fontSize:10, letterSpacing:'1.5px', textTransform:'uppercase', color:'#B8860B', fontWeight:700, ...SER }}>{h}</div>
              ))}
            </div>

            {displayed.map((b, i) => {
              const due = b.dueDate ? new Date(b.dueDate) : null;
              const isOverdue = b.status === 'overdue';
              return (
                <div key={b._id} className="brow-row" style={{
                  display:'grid', gridTemplateColumns:'2fr 2fr 1fr 1fr 1fr 1fr', gap:8,
                  padding:'13px 20px', borderBottom: i < displayed.length-1 ? '1px solid #F0E6D0':'none',
                  transition:'0.15s', background: isOverdue ? 'rgba(234,88,12,0.03)':'transparent',
                }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#2A1F0E', ...FF, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {b.book?.title || '—'}
                  </div>
                  <div>
                    <div style={{ fontSize:13, color:'#2A1F0E', ...FF }}>{b.user?.name || '—'}</div>
                    <div style={{ fontSize:11, color:'#7A6040', ...FF }}>{b.user?.email || ''}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center' }}><StatusBadge status={b.status} /></div>
                  <div style={{ fontSize:12, color:'#7A6040', ...FF, display:'flex', alignItems:'center' }}>
                    {new Date(b.borrowedAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize:12, color: isOverdue?'#C2410C':'#7A6040', fontWeight: isOverdue?700:400, ...FF, display:'flex', alignItems:'center' }}>
                    {due ? due.toLocaleDateString() : '—'}
                    {isOverdue && ' ⚠️'}
                  </div>
                  <div style={{ fontSize:12, color:'#15803D', ...FF, display:'flex', alignItems:'center' }}>
                    {b.returnedAt ? new Date(b.returnedAt).toLocaleDateString() : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop:16, ...FF, fontSize:12, color:'#A08050', textAlign:'right' }}>
          Showing {displayed.length} of {tab==='overdue'?overdue.length:borrows.length} records
        </div>
      </div>
    </div>
  );
}
