import { Router } from 'express';
import Task from '../models/Task.js';

const r = Router();
r.get('/', async (req,res)=>{
  const page = Number(req.query.page||1), limit = Number(req.query.limit||50);
  const total = await Task.countDocuments();
  const items = await Task.find().sort({ dueDate:1 }).skip((page-1)*limit).limit(limit);
  res.json({ items, total, page, pages: Math.ceil(total/limit) });
});
r.post('/', async (req,res)=>{
  const t = await Task.create(req.body);
  // notificación realtime
  req.app.get('io').emit('task.created', { id:t._id, title:t.title });
  res.json(t);
});
export default r;
