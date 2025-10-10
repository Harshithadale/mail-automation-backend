import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  body: { 
    type: String, 
    required: true 
  },
  delay: { 
    type: Number, 
    default: 0 
  },
  
  plink:{
    type:String,
    required:true,
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('Campaign', campaignSchema);
