import Borrow from '../models/Borrow.js';
import Book from '../models/Book.js';
import User from '../models/User.js';

// @desc    Borrow a book
// @route   POST /api/borrow/:bookId
// @access  Private
export const borrowBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.bookId);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.availableCopies < 1) {
      return res.status(400).json({ success: false, message: 'No copies available to borrow' });
    }

    // Check if user already has this book borrowed
    const alreadyBorrowed = await Borrow.findOne({
      user: req.user._id,
      book: book._id,
      status: 'borrowed',
    });

    if (alreadyBorrowed) {
      return res.status(400).json({ success: false, message: 'You have already borrowed this book' });
    }

    // Due date: 14 days from today
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const borrow = await Borrow.create({
      user: req.user._id,
      book: book._id,
      dueDate,
    });

    // Decrease available copies
    book.availableCopies -= 1;
    await book.save();

    // Add to user's borrowedBooks
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        borrowedBooks: { book: book._id, dueDate },
      },
    });

    await borrow.populate('book', 'title author coverImage');

    res.status(201).json({
      success: true,
      message: `"${book.title}" borrowed successfully. Due date: ${dueDate.toDateString()}`,
      borrow,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Return a borrowed book
// @route   PUT /api/borrow/return/:borrowId
// @access  Private
export const returnBook = async (req, res, next) => {
  try {
    const borrow = await Borrow.findById(req.params.borrowId).populate('book');

    if (!borrow) {
      return res.status(404).json({ success: false, message: 'Borrow record not found' });
    }

    // Ensure the logged-in user owns this borrow (or is admin)
    if (borrow.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to return this book' });
    }

    if (borrow.status === 'returned') {
      return res.status(400).json({ success: false, message: 'Book has already been returned' });
    }

    borrow.returnedAt = new Date();
    borrow.status = 'returned';
    await borrow.save();

    // Increase available copies
    await Book.findByIdAndUpdate(borrow.book._id, { $inc: { availableCopies: 1 } });

    // Update user's borrowedBooks
    await User.findOneAndUpdate(
      { _id: borrow.user, 'borrowedBooks.book': borrow.book._id },
      { $set: { 'borrowedBooks.$.returnedAt': new Date() } }
    );

    res.status(200).json({
      success: true,
      message: `"${borrow.book.title}" returned successfully`,
      borrow,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's borrow history
// @route   GET /api/borrow/my-borrows
// @access  Private
export const getMyBorrows = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };

    if (status) query.status = status;

    const borrows = await Borrow.find(query)
      .populate('book', 'title author coverImage genre')
      .sort({ borrowedAt: -1 });

    res.status(200).json({ success: true, count: borrows.length, borrows });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ALL borrow records (admin)
// @route   GET /api/borrow/all
// @access  Private (Admin)
export const getAllBorrows = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Borrow.countDocuments(query);

    const borrows = await Borrow.find(query)
      .populate('user', 'name email')
      .populate('book', 'title author coverImage')
      .sort({ borrowedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, borrows });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overdue books (auto-mark overdue)
// @route   GET /api/borrow/overdue
// @access  Private (Admin)
export const getOverdueBooks = async (req, res, next) => {
  try {
    const now = new Date();

    // Mark overdue
    await Borrow.updateMany(
      { status: 'borrowed', dueDate: { $lt: now } },
      { $set: { status: 'overdue' } }
    );

    const overdue = await Borrow.find({ status: 'overdue' })
      .populate('user', 'name email')
      .populate('book', 'title author');

    res.status(200).json({ success: true, count: overdue.length, overdue });
  } catch (error) {
    next(error);
  }
};
