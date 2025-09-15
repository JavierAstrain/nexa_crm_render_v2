import { Router } from 'express';
import User from '../models/User.js';
import { hash, verify, signToken } from '../utils/auth.js';

const r = Router();

r.post('/register', async (req,res)=>{
  const { email, name, password, role='rep' } = req.body;
  const exists = await User.findOne({ email });
  if(exists) return res.status(409).json({ error:'Email ya registrado' });
  const user = await User.create({ email, name, password: await hash(password), role });
  const token = signToken({ id: user._id, role: user.role, email: user.email });
  res.json({ token, user: { id:user._id, email:user.email, name:user.name, role:user.role } });
});

r.post('/login', async (req,res)=>{
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if(!user) return res.status(404).json({ error:'Usuario no encontrado' });
  const ok = await verify(user.password, password);
  if(!ok) return res.status(401).json({ error:'Credenciales inválidas' });
  const token = signToken({ id: user._id, role: user.role, email: user.email });
  res.json({ token, user: { id:user._id, email:user.email, name:user.name, role:user.role } });
});

export default r;
