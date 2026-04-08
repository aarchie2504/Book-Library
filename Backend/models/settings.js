import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  announcement: { type: String, default: '', maxlength: 500 },
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);