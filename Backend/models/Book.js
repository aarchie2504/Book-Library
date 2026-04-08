import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters'],
      default: '',
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    genre: {
      type: String,
      trim: true,
      default: 'Other',
    },
    coverImage: {
      type: String,
      default: '',
    },
    pdfFile: {
      type: String,
      default: '',
    },
    totalCopies: {
      type: Number,
      required: [true, 'Total copies is required'],
      min: [1, 'Must have at least 1 copy'],
      default: 1,
    },
    availableCopies: {
      type: Number,
      min: [0, 'Available copies cannot be negative'],
      default: function () {
        return this.totalCopies;
      },
    },
    publishedYear: {
      type: Number,
      min: [1000, 'Invalid year'],
      max: [new Date().getFullYear(), 'Year cannot be in the future'],
    },
    publisher: {
      type: String,
      trim: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // ── Admin feature: featured book ─────────────────────────────────────────
    featured: {
      type: Boolean,
      default: false,
    },
    // ── Writer feature: draft / publish toggle ────────────────────────────────
    isDraft: {
      type: Boolean,
      default: false,
    },
    borrowHistory: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        borrowedAt: { type: Date, default: Date.now },
        dueDate: { type: Date },
        returnedAt: { type: Date, default: null },
      },
    ],
  },
  { timestamps: true }
);

// Full-text search index
bookSchema.index({ title: 'text', author: 'text', description: 'text' });

const Book = mongoose.model('Book', bookSchema);
export default Book;
