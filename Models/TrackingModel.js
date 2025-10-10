import mongoose from 'mongoose';

const trackingSchema = new mongoose.Schema({
  recipient: { type: String, required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  clicked: { type: Boolean, default: false },
  purchased: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Tracking', trackingSchema);
