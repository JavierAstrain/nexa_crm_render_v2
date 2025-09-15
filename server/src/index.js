import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import leadRoutes from './routes/leads.js';
import dealRoutes from './routes/deals.js';
import taskRoutes from './routes/tasks.js';
import dashboardRoutes from './routes/dashboard.js';
import integrationRoutes from './routes/integrations.js';

import { authMiddleware } from './utils/auth.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || '*', credentials: true }
});
app.set('io', io); // disponible en controladores

// Seguridad y parsers
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Rate limit básico
app.use('/api', rateLimit({ windowMs: 60_000, max: 120 }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware(['admin','manager']), userRoutes);
app.use('/api/leads', authMiddleware(['admin','manager','rep']), leadRoutes);
app.use('/api/deals', authMiddleware(['admin','manager','rep']), dealRoutes);
app.use('/api/tasks', authMiddleware(['admin','manager','rep']), taskRoutes);
app.use('/api/dashboard', authMiddleware(['admin','manager','rep']), dashboardRoutes);
app.use('/api/integrations', authMiddleware(['admin','manager']), integrationRoutes);

// Health
app.get('/health', (req,res)=>res.json({ ok:true, ts:Date.now() }));

// DB + start
const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGODB_URI).then(()=>{
  server.listen(PORT, ()=> console.log('API on :'+PORT));
}).catch(e=>{
  console.error('Mongo error', e.message);
  process.exit(1);
});

// Sockets
io.on('connection', (socket)=>{
  console.log('client connected', socket.id);
  socket.on('disconnect', ()=> console.log('client disconnected', socket.id));
});
