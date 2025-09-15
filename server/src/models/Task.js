import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: { type:String, required:true },
  dueDate: Date,
  status: { type:String, enum:['open','done'], default:'open', index:true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref:'User', index:true }
},{ timestamps:true });

export default mongoose.model('Task', TaskSchema);
