import mongoose from 'mongoose';

const InteractionSchema = new mongoose.Schema({
  at: { type:Date, default:Date.now },
  type: { type:String, enum:['note','call','email','meeting'], default:'note' },
  notes: String
},{ _id:false });

const DealSchema = new mongoose.Schema({
  title: { type:String, required:true },
  stage: { type:String, enum:['Lead','Qualified','Proposal','Negotiation','Won','Lost'], default:'Lead', index:true },
  value: { type:Number, default:0 },
  probability: { type:Number, default:10 },
  company: String,
  contact: String,
  interactions: [InteractionSchema],
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref:'User', index:true }
},{ timestamps:true });

export default mongoose.model('Deal', DealSchema);
