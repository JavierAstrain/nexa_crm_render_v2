import { Router } from 'express';
import Deal from '../models/Deal.js';

const r = Router();

r.get('/', async (req,res)=>{
  const page = Number(req.query.page||1), limit = Number(req.query.limit||50);
  const total = await Deal.countDocuments();
  const items = await Deal.find().sort({ updatedAt:-1 }).skip((page-1)*limit).limit(limit);
  res.json({ items, total, page, pages: Math.ceil(total/limit) });
});

r.post('/', async (req,res)=>{
  const d = await Deal.create(req.body);
  res.json(d);
});

r.patch('/:id/move', async (req,res)=>{
  const { stage, probability } = req.body;
  const d = await Deal.findByIdAndUpdate(req.params.id, { stage, probability }, { new:true });
  // Emitir evento realtime
  req.app.get('io').emit('deal.moved', { id: d._id, stage: d.stage, probability: d.probability });
  res.json(d);
});

r.post('/:id/interaction', async (req,res)=>{
  const { type='note', notes='' } = req.body;
  const d = await Deal.findById(req.params.id);
  d.interactions.push({ type, notes, at:new Date() });
  await d.save();
  res.json({ ok:true });
});

export default r;
