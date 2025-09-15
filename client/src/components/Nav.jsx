import React from 'react'
import { FaTachometerAlt, FaProjectDiagram, FaUsers, FaBolt, FaListUl } from 'react-icons/fa'

export default function Nav({active,setActive, theme, setTheme}){
  const tabs = [
    { id:'dashboard', label:'Dashboard', icon:<FaTachometerAlt/> },
    { id:'pipeline',  label:'Pipeline',  icon:<FaProjectDiagram/> },
    { id:'leads',     label:'Contactos', icon:<FaUsers/> },
    { id:'tasks',     label:'Tareas',    icon:<FaListUl/> },
    { id:'ia',        label:'IA',        icon:<FaBolt/> }
  ]
  return (
    <div className="nav">
      <div className="brand">Nexa CRM</div>
      <div className="spacer" />
      <button onClick={()=>setTheme(theme==='dark'?'light':'dark')} className="btn small">{theme==='dark'?'☀️':'🌙'}</button>
      {tabs.map(t=>(
        <button key={t.id} className={`btn ${active===t.id?'primary':''}`} onClick={()=>setActive(t.id)}>{t.icon} <span>{t.label}</span></button>
      ))}
    </div>
  )
}
