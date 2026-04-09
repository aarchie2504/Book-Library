import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  book_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  reader_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:      { type: Number, min: 1, max: 5, required: true },
  review:      { type: String, trim: true, maxlength: 1000, default: '' },
  rating_date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Rating', ratingSchema);
