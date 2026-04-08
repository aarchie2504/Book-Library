import User from '../models/User.js';
import Book from '../models/Book.js';

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = search
      ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] }
      : {};

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), users });
  } catch (error) { next(error); }
};

// @desc    Get user by ID (Admin)
// @route   GET /api/users/:id
// @access  Private (Admin)
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate({ path: 'borrowedBooks.book', select: 'title author genre coverImage' });

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
};

// @desc    Update user role (Admin)
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'writer', 'reader'].includes(role))
      return res.status(400).json({ success: false, message: 'Invalid role. Must be admin, writer, or reader.' });

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.status(200).json({ success: true, message: `User role updated to ${role}.`, user });
  } catch (error) { next(error); }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) { next(error); }
};

// @desc    Get dashboard stats (Admin)
// @route   GET /api/users/stats
// @access  Private (Admin)
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalBooks    = await Book.countDocuments();
    const totalReaders  = await User.countDocuments({ role: 'reader' });
    const totalWriters  = await User.countDocuments({ role: 'writer' });
    const availableBooks = await Book.countDocuments({ availableCopies: { $gt: 0 } });
    const borrowedBooks = await Book.aggregate([
      { $project: { borrowed: { $subtract: ['$totalCopies', '$availableCopies'] } } },
      { $group: { _id: null, total: { $sum: '$borrowed' } } },
    ]);

    const recentBooks   = await Book.find().sort({ createdAt: -1 }).limit(5).select('title author genre createdAt');
    const recentReaders = await User.find({ role: 'reader' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt');

    res.status(200).json({
      success: true,
      stats: {
        totalBooks, totalReaders, totalWriters, availableBooks,
        borrowedBooks: borrowedBooks[0]?.total || 0,
      },
      recentBooks,
      recentReaders,
    });
  } catch (error) { next(error); }
};

// ── Legacy report endpoints ───────────────────────────────────────────────────

// GET /getallreaderdetail
export const getAllReaders = async (req, res, next) => {
  try {
    const readers = await User.find({ role: 'reader' }).select('-password').sort({ createdAt: -1 }).lean();
    res.json(readers.map(r => ({
      reader_id:      String(r._id),
      _id:            r._id,
      reader_name:    r.name,
      reader_email:   r.email,
      reader_address: r.address || '—',
      reader_city:    r.city    || '—',
      mno:            r.phone   || '—',
      createdAt:      r.createdAt,
    })));
  } catch (error) { next(error); }
};

// GET /getallwriterdetail
export const getAllWriters = async (req, res, next) => {
  try {
    const writers = await User.find({ role: 'writer' }).select('-password').sort({ createdAt: -1 }).lean();
    res.json(writers.map(w => ({
      writer_id:          String(w._id),
      _id:                w._id,
      writer_name:        w.name,
      writer_email:       w.email,
      writer_address:     w.address     || '—',
      writer_city:        w.city        || '—',
      mno:                w.phone       || '—',
      writer_description: w.bio         || '—',
      createdAt:          w.createdAt,
    })));
  } catch (error) { next(error); }
};
