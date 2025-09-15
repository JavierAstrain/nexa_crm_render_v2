import mongoose from 'mongoose';
import 'dotenv/config';
import User from './models/User.js';
import Lead from './models/Lead.js';
import Deal from './models/Deal.js';
import Task from './models/Task.js';
import { hash } from './utils/auth.js';

await mongoose.connect(process.env.MONGODB_URI);
console.log('Seeding...');

await Promise.all([User.deleteMany({}), Lead.deleteMany({}), Deal.deleteMany({}), Task.deleteMany({})]);

const admin = await User.create({ email:'admin@nexa.test', name:'Admin', password: await hash('admin123'), role:'admin' });
const leads = await Lead.insertMany([
  { name:'Javier Astrain', email:'javier@acme.test', company:'Acme', score:60 },
  { name:'María Sales', email:'maria@globex.test', company:'Globex', score:40 }
]);
const deals = await Deal.insertMany([
  { title:'Nexa → Acme', stage:'Proposal', value:25000, probability:50, company:'Acme', contact:'Javier' },
  { title:'Nexa → Globex', stage:'Lead', value:8000, probability:10, company:'Globex', contact:'María' }
]);
await Task.create({ title:'Llamar a Javier', dueDate:new Date(Date.now()+86400000), status:'open' });

console.log('Seed OK'); process.exit(0);
