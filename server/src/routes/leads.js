import { Router } from 'express';
import Lead from '../models/Lead.js';

const r = Router();
r.get('/', async (req,res)=>{
  const page = Number(req.query.page||1), limit = Number(req.query.limit||20);
  const q = req.query.q ? { $text: { $search: req.query.q } } : {};
  const total = await Lead.countDocuments(q);
  const items = await Lead.find(q).sort({ updatedAt:-1 }).skip((page-1)*limit).limit(limit);
  res.json({ items, total, page, pages: Math.ceil(total/limit) });
});
r.post('/', async (req,res)=>{
  const l = await Lead.create(req.body);
  res.json(l);
});
r.post('/:id/score', async (req,res)=>{
  const { activity=0, recencyDays=0 } = req.body;
  const base = 10 + activity*5 - recencyDays*2;
  const score = Math.max(0, Math.min(100, base));
  const l = await Lead.findByIdAndUpdate(req.params.id, { score, lastActivityAt: new Date() }, { new:true });
  res.json({ id: l._id, score });
});
export default r;
