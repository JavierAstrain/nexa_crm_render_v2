import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export function signToken(payload){
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });
}

export function authMiddleware(roles=[]){
  return (req,res,next)=>{
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if(!token) return res.status(401).json({ error:'No token' });
    try{
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if(roles.length && !roles.includes(user.role)) return res.status(403).json({ error:'Forbidden' });
      req.user = user;
      next();
    }catch(e){ return res.status(401).json({ error:'Invalid token' }); }
  }
}

export async function hash(p){ return bcrypt.hash(p, 10); }
export async function verify(h,p){ return bcrypt.compare(p,h); }
