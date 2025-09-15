import { Router } from 'express';
import Deal from '../models/Deal.js';
import Task from '../models/Task.js';

const r = Router();
r.get('/', async (req,res)=>{
  const stages = ['Lead','Qualified','Proposal','Negotiation','Won','Lost'];
  const counts = await Promise.all(stages.map(s => Deal.countDocuments({ stage:s })));
  const values = await Promise.all(stages.map(async s => (await Deal.aggregate([ { $match:{ stage:s } }, { $group:{ _id:null, sum:{ $sum:'$value' } } ]) )[0]?.sum || 0 )));
  const overdue = await Task.countDocuments({ status:'open', dueDate:{ $lt: new Date() } });
  const win = await Deal.countDocuments({ stage:'Won' });
  const lost = await Deal.countDocuments({ stage:'Lost' });
  const wr = (win+lost) ? (win/(win+lost))*100 : 0;
  res.json({ stages, counts, values, winRate: wr, overdue });
});
export default r;
