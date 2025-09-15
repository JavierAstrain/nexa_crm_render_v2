import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  name: { type:String, required:true, index:true },
  email: { type:String, index:true },
  company: String,
  phone: String,
  score: { type:Number, default:10, index:true },
  lastActivityAt: { type:Date, default:Date.now }
},{ timestamps:true });

LeadSchema.index({ name: 'text', company:'text', email:'text' });

export default mongoose.model('Lead', LeadSchema);
