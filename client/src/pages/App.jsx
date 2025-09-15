import React, { useEffect, useMemo, useState } from 'react';
import api, { setToken } from '../lib/api';
import { io } from 'socket.io-client';
import '../theme.css';

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
      try{
        if(!token){
          await api.post('/api/auth/register', { email:'demo@nexa.test', name:'Demo', password:'demo123', role:'admin' }).catch(()=>null);
          const l = await api.post('/api/auth/login', { email:'demo@nexa.test', password:'demo123' });
          localStorage.setItem('token', l.data.token); setTok(l.data.token);
        }
        const d = await api.get('/api/dashboard'); setKpis(d.data);
        const deals = await api.get('/api/deals'); setPipeline(deals.data.items);
      }catch(e){ console.error(e); }
    }
    boot();
    const s = io(API);
    s.on('task.created', p => setNoti(n=>[`Nueva tarea: ${p.title}`, ...n].slice(0,5)));
    s.on('deal.moved', p => setNoti(n=>[`Oportunidad movida: ${p.id} → ${p.stage}`, ...n].slice(0,5)));
    return ()=> s.close();
  },[token]);

  const stages = ['Lead','Qualified','Proposal','Negotiation','Won','Lost'];
  const funnel = useMemo(()=> (kpis? stages.map((n,i)=>({ name:n, value:kpis.counts[i]||0 })):[]),[kpis]);
  const funnelVal = useMemo(()=> (kpis? stages.map((n,i)=>({ name:n, value:kpis.values[i]||0 })):[]),[kpis]);

  return (
    <>
      <div className="topbar">
        <div className="brand">Nexa CRM</div>
        <div className="spacer" />
        <nav style={{display:'flex',gap:8}}>
          {['dashboard','pipeline','leads','tasks','ia'].map(t=>
            <button key={t} className={`btn ${active===t?'primary':''}`} onClick={()=>setActive(t)}>{t[0].toUpperCase()+t.slice(1)}</button>
          )}
        </nav>
        <button className="btn small" onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?'☀️':'🌙'}</button>
      </div>

      <div className="shell">
        {active==='dashboard' && <Dashboard kpis={kpis} funnel={funnel} funnelVal={funnelVal} noti={noti}/>}
        {active==='pipeline' && <Pipeline deals={pipeline} setDeals={setPipeline} stages={stages}/>}
        {active==='leads' && <Leads/>}
        {active==='tasks' && <Tasks/>}
        {active==='ia' && <IA/>}
      </div>
    </>
  );
}

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

function Dashboard({kpis,funnel,funnelVal,noti}){
  const line = [{name:'S1',value:12},{name:'S2',value:18},{name:'S3',value:16},{name:'S4',value:22}];
  return <div className="grid">
    <div className="card"><div className="subtle">Win rate</div><h2>{kpis? kpis.winRate.toFixed(1):0}%</h2></div>
    <div className="card"><div className="subtle">Tareas vencidas</div><h2>{kpis? kpis.overdue:0}</h2></div>
    <div className="card"><h3>Actividad semanal</h3>
      <div style={{height:220}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={line}><XAxis dataKey="name"/><YAxis/><Tooltip/><Line type="monotone" dataKey="value" stroke="#5b8cff"/></LineChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="card"><h3>Oportunidades por etapa</h3>
      <div style={{height:220}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={funnel}><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="value" fill="#5b8cff"/></BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="card"><h3>Valor por etapa</h3>
      <div style={{height:220}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={funnelVal}><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="value" fill="#7aa2ff"/></BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="card"><h3>Notificaciones</h3><ul>{noti.map((n,i)=>(<li key={i} className="subtle">{n}</li>))}</ul></div>
  </div>;
}

function Pipeline({deals,setDeals,stages}){
  return <div className="cols">
    {stages.map(st=>(
      <div className="card col" key={st}>
        <h3>{st}</h3>
        {deals.filter(d=>d.stage===st).map(d=>(
          <div className="deal" key={d._id}>
            <div className="t">{d.title}</div>
            <div className="s">${d.value} · {d.probability}%</div>
            <button className="btn small" onClick={async()=>{
              const ix = (stages.indexOf(st)+1) % stages.length;
              const res = await api.patch(`/api/deals/${d._id}/move`, { stage: stages[ix], probability: d.probability });
              setDeals(prev => prev.map(x=> x._id===d._id ? res.data : x));
            }}>Mover →</button>
          </div>
        ))}
      </div>
    ))}
  </div>;
}

function Leads(){
  const [items,setItems] = useState([]); const [form,setForm]=useState({name:'',email:'',company:''});
  useEffect(()=>{ api.get('/api/leads').then(r=>setItems(r.data.items)); },[]);
  return <div className="grid">
    <div className="card">
      <h3>Nuevo lead</h3>
      <div className="row">
        <input placeholder="Nombre" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <input placeholder="Empresa" value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/>
        <button className="btn" onClick={async()=>{ const r=await api.post('/api/leads',form); setItems([r.data,...items]); setForm({name:'',email:'',company:''}); }}>Crear</button>
      </div>
    </div>
    <div className="card"><h3>Leads</h3>
      <table><thead><tr><th>Nombre</th><th>Email</th><th>Empresa</th><th>Score</th></tr></thead>
      <tbody>{items.map(l=>(<tr key={l._id}><td>{l.name}</td><td>{l.email||''}</td><td>{l.company||''}</td><td>{l.score}</td></tr>))}</tbody></table>
    </div>
  </div>;
}

function Tasks(){
  const [items,setItems] = useState([]); const [title,setTitle]=useState('');
  useEffect(()=>{ api.get('/api/tasks').then(r=>setItems(r.data.items)); },[]);
  return <div className="grid">
    <div className="card row">
      <input placeholder="Nueva tarea..." value={title} onChange={e=>setTitle(e.target.value)}/>
      <button className="btn" onClick={async()=>{ const r=await api.post('/api/tasks',{title}); setItems([r.data,...items]); setTitle(''); }}>Crear</button>
    </div>
    <div className="card"><h3>Tareas</h3><ul>{items.map(t=>(<li key={t._id} className="subtle">{t.title} — {t.status}</li>))}</ul></div>
  </div>;
}

function IA(){
  const [dealId,setDealId]=useState(''); const [out,setOut]=useState(null);
  return <div className="grid">
    <div className="card row">
      <input placeholder="ID de oportunidad" value={dealId} onChange={e=>setDealId(e.target.value)}/>
      <button className="btn" onClick={async()=>{ const r=await api.get('/api/ai/health-score',{ params:{dealId} }); setOut(r.data); }}>Health Score</button>
      <button className="btn" onClick={async()=>{ const r=await api.get('/api/ai/next-best-action',{ params:{dealId} }); setOut(r.data); }}>Next Best Action</button>
    </div>
    <div className="card"><pre>{JSON.stringify(out,null,2)}</pre></div>
  </div>;
}
