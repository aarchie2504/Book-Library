import User from '../models/User.js';
import Book from '../models/Book.js';
import Rating from '../models/Rating.js';

// ── 1. WRITER PROFILE  GET /writer/profile/:wid ──────────────────────────────
export const getProfile = async (req, res, next) => {
  try {
    const writer = await User.findById(req.params.wid).select('-password').lean();
    if (!writer) return res.status(404).json({ message: 'Writer not found.' });

    const books     = await Book.find({ addedBy: req.params.wid }).lean();
    const bookIds   = books.map(b => b._id);
    const totalRatings = await Rating.countDocuments({ book_id: { $in: bookIds } });
    const avgAgg    = await Rating.aggregate([
      { $match: { book_id: { $in: bookIds } } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);

    res.json({
      writer,
      stats: {
        totalBooks:   books.length,
        totalRatings,
        avgRating:    avgAgg[0]?.avg?.toFixed(1) || '0.0',
      },
    });
  } catch (e) { next(e); }
};

// ── 2. UPDATE PROFILE  PUT /writer/profile ───────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, city, phone, address } = req.body;
    const writer = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, city, phone, address },
      { new: true, runValidators: true }
    ).select('-password');
    if (!writer) return res.status(404).json({ message: 'Writer not found.' });
    res.json({ message: 'Profile updated.', writer });
  } catch (e) { next(e); }
};

// ── 3. ANALYTICS  GET /writer/analytics/:wid ─────────────────────────────────
export const getAnalytics = async (req, res, next) => {
  try {
    const books   = await Book.find({ addedBy: req.params.wid }).lean();
    const bookIds = books.map(b => b._id);

    // Per-book stats using one aggregation (fixes N+1)
    const ratingAggs = await Rating.aggregate([
      { $match: { book_id: { $in: bookIds } } },
      { $group: { _id: '$book_id', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const ratingMap = Object.fromEntries(ratingAggs.map(r => [String(r._id), r]));

    const bookStats = books.map(b => {
      const agg = ratingMap[String(b._id)];
      return {
        book_id:     String(b._id),
        book_name:   b.title,
        cover_img:   b.coverImage,
        genre:       b.genre,
        createdAt:   b.createdAt,
        avgRating:   agg?.avg?.toFixed(1) || '0.0',
        ratingCount: agg?.count || 0,
      };
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trend = await Rating.aggregate([
      { $match: { book_id: { $in: bookIds }, rating_date: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { year: { $year: '$rating_date' }, month: { $month: '$rating_date' } },
          count: { $sum: 1 },
          avg:   { $avg: '$rating' },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const totalRatings = bookStats.reduce((a, b) => a + b.ratingCount, 0);
    const totalBooks   = books.length;
    const avgRating    = totalRatings > 0
      ? (bookStats.reduce((a, b) => a + parseFloat(b.avgRating) * b.ratingCount, 0) / totalRatings).toFixed(1)
      : '0.0';

    res.json({ bookStats, trend, totals: { totalBooks, totalRatings, avgRating } });
  } catch (e) { next(e); }
};

// ── 4. TEXT REVIEWS  GET /writer/books/:bid/reviews ──────────────────────────
export const getBookReviews = async (req, res, next) => {
  try {
    const ratings = await Rating.find({ book_id: req.params.bid })
      .populate('reader_id', 'name')
      .sort({ rating_date: -1 })
      .lean();

    const full = ratings.map(r => ({ ...r, reader_name: r.reader_id?.name || '—' }));
    res.json(full);
  } catch (e) { next(e); }
};

// ── 5. DRAFT/PUBLISH TOGGLE  PUT /writer/books/:bid/publish ──────────────────
export const togglePublish = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.bid, addedBy: req.user._id });
    if (!book) return res.status(404).json({ message: 'Book not found.' });
    book.isDraft = !book.isDraft;
    await book.save();
    res.json({ message: book.isDraft ? 'Book moved to drafts.' : 'Book published!', isDraft: book.isDraft });
  } catch (e) { next(e); }
};

// ── 6. DELETE OWN BOOK  DELETE /writer/books/:bid ────────────────────────────
export const deleteOwnBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.bid, addedBy: req.user._id });
    if (!book) return res.status(404).json({ message: 'Book not found or not yours.' });
    await book.deleteOne();
    res.json({ message: 'Book deleted.' });
  } catch (e) { next(e); }
};

// ── 7. NOTIFICATIONS  GET /writer/notifications ──────────────────────────────
export const getNotifications = async (req, res, next) => {
  try {
    const books   = await Book.find({ addedBy: req.user._id }).select('_id title').lean();
    const bookIds = books.map(b => b._id);
    const bookMap = Object.fromEntries(books.map(b => [String(b._id), b.title]));

    const recent = await Rating.find({ book_id: { $in: bookIds } })
      .populate('reader_id', 'name')
      .sort({ rating_date: -1 })
      .limit(20)
      .lean();

    const notifications = recent.map(r => ({
      _id:         String(r._id),
      type:        'rating',
      book_name:   bookMap[String(r.book_id)] || '—',
      book_id:     String(r.book_id),
      reader_name: r.reader_id?.name || 'A reader',
      rating:      r.rating,
      review:      r.review || '',
      date:        r.rating_date,
    }));

    res.json(notifications);
  } catch (e) { next(e); }
};

// ── 8. GET FOLLOWERS  GET /writer/followers ───────────────────────────────────
export const getFollowers = async (req, res, next) => {
  try {
    const followers = await User.find({ following: req.user._id, role: 'reader' })
      .select('name email createdAt city').lean();
    res.json({ count: followers.length, followers });
  } catch (e) { next(e); }
};