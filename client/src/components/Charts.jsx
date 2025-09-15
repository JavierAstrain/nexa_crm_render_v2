import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export function LineMetric({data}){
  return <ResponsiveContainer width="100%" height={220}>
    <LineChart data={data}><XAxis dataKey="name"/><YAxis/><Tooltip/><Line type="monotone" dataKey="value" stroke="#82ca9d"/></LineChart>
  </ResponsiveContainer>
}

export function BarFunnel({data}){
  return <ResponsiveContainer width="100%" height={220}>
    <BarChart data={data}><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="value" fill="#5b8cff"/></BarChart>
  </ResponsiveContainer>
}

export function PieTasks({data}){
  const colors=['#5b8cff','#68f3b8','#ffd166','#ef476f','#06d6a0'];
  return <ResponsiveContainer width="100%" height={220}>
    <PieChart><Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
      {data.map((e,i)=>(<Cell key={i} fill={colors[i%colors.length]} />))}
    </Pie>
    </PieChart>
  </ResponsiveContainer>
}
