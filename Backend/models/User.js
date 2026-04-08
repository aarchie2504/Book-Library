import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'writer', 'reader'],
      default: 'reader',
    },

    // ── Shared optional profile fields ──────────────────────────────────────
    address: { type: String, trim: true },
    city:    { type: String, trim: true },
    phone:   { type: String, trim: true },

    // ── Writer-only field ───────────────────────────────────────────────────
    bio: { type: String, trim: true },

    // ── Admin control ───────────────────────────────────────────────────────
    isBlocked: { type: Boolean, default: false },

    // ── Reader features ─────────────────────────────────────────────────────────
    bookmarks:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    following:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // ── Reader-only fields ──────────────────────────────────────────────────
    borrowedBooks: [
      {
        book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
        borrowedAt: { type: Date, default: Date.now },
        dueDate: { type: Date },
        returnedAt: { type: Date, default: null },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
