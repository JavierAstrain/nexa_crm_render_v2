import React, { useEffect, useMemo, useState } from 'react';
import api, { setToken } from '../lib/api';
import Nav from '../components/Nav';
import { io } from 'socket.io-client';
import { LineMetric, BarFunnel, PieTasks } from '../components/Charts';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export default function App(){
  const [active,setActive] = useState('dashboard');
  const [theme,setTheme] = useState('dark');
  const [token,setTok] = useState(localStorage.getItem('token')||'');
  const [kpis,setKpis] = useState(null);
  const [pipeline,setPipeline] = useState([]);
  const [noti,setNoti] = useState([]);

  useEffect(()=>{ document.documentElement.setAttribute('data-theme', theme); },[theme]);
  useEffect(()=>{ setToken(token); },[token]);

  useEffect(()=>{
    async function boot(){
      try {
        if(!token){
          // auto-register demo user
          const r = await api.post('/api/auth/register', { email:'demo@nexa.test', name:'Demo', password:'demo123', role:'admin' }).catch(()=>null);
          const l = await api.post('/api/auth/login', { email:'demo@nexa.test', password:'demo123' });
          localStorage.setItem('token', l.data.token);
          setTok(l.data.token);
        }
        const d = await api.get('/api/dashboard'); setKpis(d.data);
        const deals = await api.get('/api/deals'); setPipeline(deals.data.items);
      } catch(e){ console.error(e); }
    }
    boot();
    const s = io(API, { transports:['websocket','polling'] });
    s.on('task.created', (p)=> setNoti(n=>[`Nueva tarea: ${p.title}`, ...n].slice(0,5)));
    s.on('deal.moved', (p)=> setNoti(n=>[`Oportunidad movida: ${p.id} → ${p.stage}`, ...n].slice(0,5)));
    return ()=> s.close();
  },[token]);

  const funnel = useMemo(()=> (kpis? kpis.stages.map((n,i)=>({ name:n, value:kpis.counts[i] })):[]),[kpis])
  const funnelValue = useMemo(()=> (kpis? kpis.stages.map((n,i)=>({ name:n, value:kpis.values[i] })):[]),[kpis])
  const lineData = useMemo(()=> ([{name:'Sem1',value:12},{name:'Sem2',value:18},{name:'Sem3',value:16},{name:'Sem4',value:22}]),[])
  const pieData = useMemo(()=> ([{name:'Abiertas',value:5},{name:'Vencidas',value:2},{name:'Done',value:3}]),[])

  return (
    <div className="app">
      <Nav active={active} setActive={setActive} theme={theme} setTheme={setTheme} />
      <div className="content">
        {active==='dashboard' && <Dashboard kpis={kpis} lineData={lineData} funnel={funnel} funnelValue={funnelValue} pie={pieData} noti={noti}/>}
        {active==='pipeline' && <Pipeline deals={pipeline} setDeals={setPipeline}/>}
        {active==='leads' && <Leads/>}
        {active==='tasks' && <Tasks/>}
        {active==='ia' && <IA/>}
      </div>
      <style>{css}</style>
    </div>
  )
}

function Dashboard({kpis,lineData,funnel,funnelValue,pie,noti}){
  return <div className="grid">
    <div className="card kpi"><div>Win Rate</div><h2>{kpis? kpis.winRate.toFixed(1):0}%</h2></div>
    <div className="card kpi"><div>Tareas vencidas</div><h2>{kpis? kpis.overdue:0}</h2></div>
    <div className="card"><h3>Actividad semanal</h3><LineMetric data={lineData}/></div>
    <div className="card"><h3>Oportunidades por etapa</h3><BarFunnel data={funnel}/></div>
    <div className="card"><h3>Valor por etapa</h3><BarFunnel data={funnelValue}/></div>
    <div className="card"><h3>Distribución de tareas</h3><PieTasks data={pie}/></div>
    <div className="card"><h3>Notificaciones</h3><ul>{noti.map((n,i)=>(<li key={i}>{n}</li>))}</ul></div>
  </div>
}

function Pipeline({deals,setDeals}){
  // Simplificado (sin dnd para minimizar deps)
  const stages=['Lead','Qualified','Proposal','Negotiation','Won','Lost'];
  return <div className="cols">
    {stages.map(st=> (
      <div className="card col" key={st}>
        <h3>{st}</h3>
        {deals.filter(d=>d.stage===st).map(d=>(<div className="deal" key={d._id}>
          <div className="t">{d.title}</div>
          <div className="s">${d.value} · {d.probability}%</div>
          <button className="btn small" onClick={async()=>{
            const ix = (stages.indexOf(st)+1) % stages.length;
            const res = await api.patch(`/api/deals/${d._id}/move`, { stage: stages[ix], probability: d.probability });
            setDeals(prev => prev.map(x=> x._id===d._id ? res.data : x));
          }}>Mover →</button>
        </div>))}
      </div>
    ))}
  </div>
}

function Leads(){
  const [items,setItems] = useState([]);
  const [form,setForm] = useState({ name:'', email:'', company:'' });
  useEffect(()=>{ api.get('/api/leads').then(r=>setItems(r.data.items)); },[]);
  return <div className="grid">
    <div className="card">
      <h3>Nuevo lead</h3>
      <div className="row">
        <input placeholder="Nombre" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <input placeholder="Empresa" value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/>
        <button className="btn" onClick={async()=>{
          const r = await api.post('/api/leads', form);
          setItems([r.data, ...items]); setForm({ name:'', email:'', company:'' });
        }}>Crear</button>
      </div>
    </div>
    <div className="card"><h3>Leads</h3>
      <table><thead><tr><th>Nombre</th><th>Email</th><th>Empresa</th><th>Score</th></tr></thead>
      <tbody>{items.map(l=>(<tr key={l._id}><td>{l.name}</td><td>{l.email||''}</td><td>{l.company||''}</td><td>{l.score}</td></tr>))}</tbody></table>
    </div>
  </div>
}

function Tasks(){
  const [items,setItems] = useState([]);
  const [title,setTitle] = useState('');
  useEffect(()=>{ api.get('/api/tasks').then(r=>setItems(r.data.items)); },[]);
  return <div className="grid">
    <div className="card row">
      <input placeholder="Nueva tarea..." value={title} onChange={e=>setTitle(e.target.value)}/>
      <button className="btn" onClick={async()=>{
        const r = await api.post('/api/tasks', { title }); setItems([r.data, ...items]); setTitle('');
      }}>Crear</button>
    </div>
    <div className="card"><h3>Tareas</h3>
      <ul>{items.map(t=>(<li key={t._id}>{t.title} — {t.status}</li>))}</ul>
    </div>
  </div>
}

function IA(){
  const [dealId,setDealId] = useState('');
  const [hs,setHs] = useState(null);
  const [nba,setNba] = useState(null);
  return <div className="grid">
    <div className="card row">
      <input placeholder="ID de oportunidad" value={dealId} onChange={e=>setDealId(e.target.value)}/>
      <button className="btn" onClick={async()=>{ const r = await api.get('/api/ai/health-score', { params:{ dealId } }); setHs(r.data); }}>Health Score</button>
      <button className="btn" onClick={async()=>{ const r = await api.get('/api/ai/next-best-action', { params:{ dealId } }); setNba(r.data); }}>Next Best Action</button>
    </div>
    <div className="card"><pre>{JSON.stringify({ hs, nba }, null, 2)}</pre></div>
  </div>
}

const css = `
:root { --bg:#0b1220; --card:#0f1830; --text:#eaf2ff; --muted:#9fb1cc; --primary:#5b8cff; }
[data-theme="light"]{ --bg:#f7f9fc; --card:#fff; --text:#0b1220; --muted:#667; --primary:#1d4ed8; }
*{ box-sizing:border-box; font-family: Inter, system-ui, Segoe UI, Roboto, Arial }
body{ margin:0; background:var(--bg); color:var(--text) }
.nav{ display:flex; gap:8px; align-items:center; padding:10px 12px; border-bottom:1px solid #1e2b50; position:sticky; top:0; background:var(--bg); }
.brand{ font-weight:800 }
.btn{ background:transparent; border:1px solid #2a3a63; padding:8px 10px; border-radius:999px; color:var(--text); cursor:pointer }
.btn.primary{ background:var(--primary); border-color:transparent }
.btn.small{ padding:4px 8px; font-size:12px }
.content{ padding:16px; max-width:1200px; margin:0 auto }
.grid{ display:grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap:12px }
.card{ background:var(--card); border:1px solid #1e2b50; border-radius:14px; padding:12px }
.kpi{ display:flex; flex-direction:column; gap:6px; justify-content:center; align-items:flex-start }
.cols{ display:grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap:12px }
.col .deal{ border:1px solid #294172; border-radius:10px; padding:8px; margin:8px 0; background:#0c1630 }
.col h3{ margin:0 0 8px 0 }
.row{ display:flex; gap:8px; align-items:center }
input{ padding:8px 10px; border-radius:10px; border:1px solid #2a3a63; background:transparent; color:var(--text) }
table{ width:100%; border-collapse:collapse } th,td{ padding:8px; border-bottom:1px solid #233155 }
@media (max-width:900px){ .grid{ grid-template-columns:1fr } .cols{ grid-template-columns:1fr } }
`;
