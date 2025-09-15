import { Router } from 'express';
import User from '../models/User.js';

const r = Router();
r.get('/', async (req,res)=>{
  const page = Number(req.query.page||1), limit = Number(req.query.limit||20);
  const total = await User.countDocuments();
  const items = await User.find().sort({ createdAt:-1 }).skip((page-1)*limit).limit(limit);
  res.json({ items, total, page, pages: Math.ceil(total/limit) });
});
r.patch('/:id/role', async (req,res)=>{
  const u = await User.findByIdAndUpdate(req.params.id, { role:req.body.role }, { new:true });
  res.json(u);
});
export default r;
