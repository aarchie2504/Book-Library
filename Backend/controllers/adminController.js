import User from '../models/User.js';
import Book from '../models/Book.js';
import Rating from '../models/Rating.js';
import Settings from '../models/settings.js';

// ── 1. DASHBOARD STATS  GET /admin/dashboard ─────────────────────────────────
export const getDashboard = async (req, res, next) => {
  try {
    const [totalBooks, totalWriters, totalReaders, totalRatings] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: 'writer' }),
      User.countDocuments({ role: 'reader' }),
      Rating.countDocuments(),
    ]);

    const avgRatingAgg = await Rating.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    const avgRating = avgRatingAgg[0]?.avg?.toFixed(1) || '0.0';

    const recentBooks = await Book.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('addedBy', 'name')
      .lean();

    const recentReaders = await User.find({ role: 'reader' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt city')
      .lean();

    const recentWriters = await User.find({ role: 'writer' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt')
      .lean();

    const topRated = await Rating.aggregate([
      { $group: { _id: '$book_id', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
      { $sort: { avgRating: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' },
      { $project: { book_name: '$book.title', cover_img: '$book.coverImage', avgRating: 1, count: 1 } },
    ]);

    res.json({
      stats: { totalBooks, totalWriters, totalReaders, totalRatings, avgRating },
      recentBooks: recentBooks.map(b => ({
        _id: b._id, book_name: b.title, cover_img: b.coverImage,
        addedBy: b.addedBy?.name || '—', createdAt: b.createdAt,
      })),
      recentReaders,
      recentWriters,
      topRated,
    });
  } catch (e) { next(e); }
};

// ── 2. MANAGE READERS  GET /admin/readers ────────────────────────────────────
export const getReaders = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const query = { role: 'reader' };
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
    const total   = await User.countDocuments(query);
    const readers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    // Get rating counts for all readers in one aggregation (fixes N+1)
    const readerIds = readers.map(r => r._id);
    const ratingCounts = await Rating.aggregate([
      { $match: { reader_id: { $in: readerIds } } },
      { $group: { _id: '$reader_id', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(ratingCounts.map(r => [String(r._id), r.count]));
    const withStats = readers.map(r => ({ ...r, ratingCount: countMap[String(r._id)] || 0 }));

    res.json({ total, pages: Math.ceil(total / Number(limit)), page: Number(page), readers: withStats });
  } catch (e) { next(e); }
};

// ── 3. BLOCK/UNBLOCK USER  PUT /admin/users/:id/block ────────────────────────
export const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ message: user.isBlocked ? 'User blocked.' : 'User unblocked.', isBlocked: user.isBlocked });
  } catch (e) { next(e); }
};

// ── 4. DELETE USER  DELETE /admin/users/:id ───────────────────────────────────
export const deleteUserAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    await user.deleteOne();
    res.json({ message: 'User deleted.' });
  } catch (e) { next(e); }
};

// ── 5. MANAGE WRITERS  GET /admin/writers ────────────────────────────────────
export const getWriters = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const query = { role: 'writer' };
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
    const total   = await User.countDocuments(query);
    const writers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    // Get book counts in one aggregation (fixes N+1)
    const writerIds = writers.map(w => w._id);
    const bookCounts = await Book.aggregate([
      { $match: { addedBy: { $in: writerIds } } },
      { $group: { _id: '$addedBy', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(bookCounts.map(b => [String(b._id), b.count]));
    const withStats = writers.map(w => ({ ...w, bookCount: countMap[String(w._id)] || 0 }));

    res.json({ total, pages: Math.ceil(total / Number(limit)), page: Number(page), writers: withStats });
  } catch (e) { next(e); }
};

// ── 6. DELETE RATING  DELETE /admin/ratings/:id ───────────────────────────────
export const deleteRating = async (req, res, next) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) return res.status(404).json({ message: 'Rating not found.' });
    await rating.deleteOne();
    res.json({ message: 'Rating deleted.' });
  } catch (e) { next(e); }
};

// ── 7. ALL RATINGS FOR A BOOK  GET /admin/books/:bid/ratings ─────────────────
export const getBookRatingsAdmin = async (req, res, next) => {
  try {
    const ratings = await Rating.find({ book_id: req.params.bid })
      .populate('reader_id', 'name email')
      .sort({ rating_date: -1 })
      .lean();

    const full = ratings.map(r => ({
      ...r,
      reader_name:  r.reader_id?.name  || '—',
      reader_email: r.reader_id?.email || '—',
    }));
    res.json(full);
  } catch (e) { next(e); }
};

// ── 8. SITE-WIDE SEARCH  GET /admin/search?q= ────────────────────────────────
export const siteSearch = async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    if (!q.trim()) return res.json({ books: [], writers: [], readers: [] });
    const re = new RegExp(q, 'i');

    const [books, writers, readers] = await Promise.all([
      Book.find({ $or: [{ title: re }, { author: re }] }).limit(6).select('title coverImage genre').lean(),
      User.find({ role: 'writer', $or: [{ name: re }, { email: re }] }).limit(5).select('name email').lean(),
      User.find({ role: 'reader', $or: [{ name: re }, { email: re }] }).limit(5).select('name email').lean(),
    ]);

    res.json({
      books:   books.map(b  => ({ _id: b._id, book_name: b.title, cover_img: b.coverImage, genre: b.genre })),
      writers: writers.map(w => ({ _id: w._id, name: w.name, email: w.email })),
      readers: readers.map(r => ({ _id: r._id, name: r.name, email: r.email })),
    });
  } catch (e) { next(e); }
};

// ── 9. SET FEATURED BOOK  PUT /admin/books/:bid/feature ───────────────────────
export const toggleFeatured = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.bid);
    if (!book) return res.status(404).json({ message: 'Book not found.' });
    book.featured = !book.featured;
    await book.save();
    res.json({ message: book.featured ? 'Book featured.' : 'Book unfeatured.', featured: book.featured });
  } catch (e) { next(e); }
};

// ── 10. ANNOUNCEMENT  GET/POST /admin/announcement ───────────────────────────
// Now stored in MongoDB via Settings model (persists across restarts)
export const getAnnouncement = async (req, res, next) => {
  try {
    const settings = await Settings.findOne({});
    res.json({ announcement: settings?.announcement || '' });
  } catch (e) { next(e); }
};

export const setAnnouncement = async (req, res, next) => {
  try {
    const announcement = req.body.announcement || '';
    await Settings.findOneAndUpdate({}, { announcement }, { upsert: true, new: true });
    res.json({ message: 'Announcement updated.', announcement });
  } catch (e) { next(e); }
};