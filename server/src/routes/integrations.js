import { Router } from 'express';
const r = Router();

// Stub de OAuth: guía rápida (ver README). En producción usar passport-google-oauth20
r.get('/google/auth', (req,res)=>{
  res.status(501).json({ error: 'Configura OAuth de Google Calendar y callback en /api/integrations/google/callback' });
});
r.get('/google/callback', (req,res)=> res.json({ ok:true, message:'Recibirías tokens aquí.' }));

export default r;
