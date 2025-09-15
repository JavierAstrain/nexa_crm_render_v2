import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type:String, unique:true, required:true, index:true },
  name: { type:String, required:true },
  password: { type:String, required:true },
  role: { type:String, enum:['admin','manager','rep'], default:'rep', index:true }
},{ timestamps:true });

export default mongoose.model('User', UserSchema);
