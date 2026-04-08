import mongoose from 'mongoose';
import User from '../models/User.js';
import Book from '../models/Book.js';
import Rating from '../models/Rating.js';

// ── 1. READER PROFILE  GET /reader/profile/:rid ───────────────────────────────
export const getProfile = async (req, res, next) => {
  try {
    const reader = await User.findById(req.params.rid).select('-password').lean();
    if (!reader) return res.status(404).json({ message: 'Reader not found.' });

    const ratings     = await Rating.find({ reader_id: req.params.rid }).lean();
    const bookmarks   = reader.bookmarks || [];
    const recentBooks = reader.recentlyViewed || [];

    res.json({
      reader,
      stats: {
        totalRatings:   ratings.length,
        totalBookmarks: bookmarks.length,
        avgGiven: ratings.length
          ? (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1)
          : '0.0',
      },
    });
  } catch (e) { next(e); }
};

// ── 2. UPDATE PROFILE  PUT /reader/profile ────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const { name, city, phone, address } = req.body;
    const reader = await User.findByIdAndUpdate(
      req.user._id,
      { name, city, phone, address },
      { new: true, runValidators: true }
    ).select('-password');
    if (!reader) return res.status(404).json({ message: 'Reader not found.' });
    res.json({ message: 'Profile updated.', reader });
  } catch (e) { next(e); }
};

// ── 3. BOOKMARKS  GET /reader/bookmarks ───────────────────────────────────────
export const getBookmarks = async (req, res, next) => {
  try {
    const reader = await User.findById(req.user._id).lean();
    const bookmarkIds = reader.bookmarks || [];
    if (!bookmarkIds.length) return res.json([]);
    const books = await Book.find({ _id: { $in: bookmarkIds } }).lean();
    res.json(books.map(b => ({
      _id: b._id, book_id: String(b._id), book_name: b.title,
      cover_img: b.coverImage, genre: b.genre, cat_id: b.genre,
      description: b.description, book_pdf: b.pdfFile,
    })));
  } catch (e) { next(e); }
};

// ── 4. TOGGLE BOOKMARK  POST /reader/bookmarks/:bid ──────────────────────────
export const toggleBookmark = async (req, res, next) => {
  try {
    const reader  = await User.findById(req.user._id);
    const bid     = new mongoose.Types.ObjectId(req.params.bid);
    const already = reader.bookmarks.some(id => id.equals(bid));
    if (already) {
      reader.bookmarks = reader.bookmarks.filter(id => !id.equals(bid));
    } else {
      reader.bookmarks.push(bid);
    }
    await reader.save();
    res.json({ bookmarked: !already, message: !already ? 'Bookmarked!' : 'Removed from bookmarks.' });
  } catch (e) { next(e); }
};

// ── 5. CHECK BOOKMARK STATUS  GET /reader/bookmarks/:bid/status ──────────────
export const checkBookmark = async (req, res, next) => {
  try {
    const reader  = await User.findById(req.user._id).lean();
    const bid     = new mongoose.Types.ObjectId(req.params.bid);
    const bookmarked = (reader.bookmarks || []).some(id => id.equals(bid));
    res.json({ bookmarked });
  } catch (e) { next(e); }
};

// ── 6. RECENTLY VIEWED  GET /reader/recent ────────────────────────────────────
export const getRecentlyViewed = async (req, res, next) => {
  try {
    const reader = await User.findById(req.user._id).lean();
    const ids    = (reader.recentlyViewed || []).slice(0, 8);
    if (!ids.length) return res.json([]);
    const books  = await Book.find({ _id: { $in: ids } }).lean();
    const ordered = ids.map(id => books.find(b => b._id.equals(id))).filter(Boolean);
    res.json(ordered.map(b => ({
      _id: b._id, book_id: String(b._id), book_name: b.title,
      cover_img: b.coverImage, genre: b.genre, cat_id: b.genre,
      description: b.description, book_pdf: b.pdfFile,
    })));
  } catch (e) { next(e); }
};

// ── 7. TRACK RECENTLY VIEWED  POST /reader/recent/:bid ────────────────────────
export const trackRecentlyViewed = async (req, res, next) => {
  try {
    const reader = await User.findById(req.user._id);
    const bid    = new mongoose.Types.ObjectId(req.params.bid);
    reader.recentlyViewed = [
      bid,
      ...(reader.recentlyViewed || []).filter(id => !id.equals(bid)),
    ].slice(0, 10);
    await reader.save();
    res.json({ ok: true });
  } catch (e) { next(e); }
};

// ── 8. MY RATINGS  GET /reader/ratings ────────────────────────────────────────
export const getMyRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find({ reader_id: req.user._id })
      .populate('book_id', 'title coverImage genre')
      .sort({ rating_date: -1 })
      .lean();

    const full = ratings.map(r => ({
      _id: r._id, rating: r.rating, review: r.review, rating_date: r.rating_date,
      book_id:   String(r.book_id?._id || r.book_id),
      book_name: r.book_id?.title      || '—',
      cover_img: r.book_id?.coverImage || '',
      genre:     r.book_id?.genre      || '—',
    }));
    res.json(full);
  } catch (e) { next(e); }
};

// ── 9. RECOMMENDATIONS  GET /reader/recommendations ──────────────────────────
export const getRecommendations = async (req, res, next) => {
  try {
    const goodRatings = await Rating.find({ reader_id: req.user._id, rating: { $gte: 4 } }).lean();
    const ratedIds    = goodRatings.map(r => r.book_id);

    if (!goodRatings.length) {
      const top = await Rating.aggregate([
        { $group: { _id: '$book_id', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
        { $match: { count: { $gte: 1 } } },
        { $sort: { avg: -1 } },
        { $limit: 8 },
      ]);
      const bookIds = top.map(t => t._id);
      const books   = await Book.find({ _id: { $in: bookIds } }).lean();
      return res.json(books.map(b => ({
        _id: b._id, book_id: String(b._id), book_name: b.title,
        cover_img: b.coverImage, genre: b.genre, cat_id: b.genre,
        description: b.description, book_pdf: b.pdfFile,
        reason: 'Top rated',
      })));
    }

    const likedGenres = [...new Set(
      (await Book.find({ _id: { $in: ratedIds } }).select('genre').lean()).map(b => b.genre)
    )];

    const recs = await Book.find({
      genre: { $in: likedGenres },
      _id:   { $nin: ratedIds },
    }).limit(8).lean();

    res.json(recs.map(b => ({
      _id: b._id, book_id: String(b._id), book_name: b.title,
      cover_img: b.coverImage, genre: b.genre, cat_id: b.genre,
      description: b.description, book_pdf: b.pdfFile,
      reason: `Because you liked ${b.genre}`,
    })));
  } catch (e) { next(e); }
};

// ── 10. SEARCH BOOKS  GET /reader/search?q=&genre=&sort= ──────────────────────
export const searchBooks = async (req, res, next) => {
  try {
    const { q = '', genre, sort = 'newest' } = req.query;
    const query = {};
    if (q.trim()) query.$or = [
      { title:       new RegExp(q, 'i') },
      { author:      new RegExp(q, 'i') },
      { description: new RegExp(q, 'i') },
    ];
    if (genre) query.genre = genre;

    let sortOpt = { createdAt: -1 };
    if (sort === 'title') sortOpt = { title: 1 };
    if (sort === 'oldest') sortOpt = { createdAt: 1 };

    const books = await Book.find(query).sort(sortOpt).limit(40).lean();
    res.json(books.map(b => ({
      _id: b._id, book_id: String(b._id), book_name: b.title,
      cover_img: b.coverImage, genre: b.genre, cat_id: b.genre,
      description: b.description, book_pdf: b.pdfFile, author: b.author,
    })));
  } catch (e) { next(e); }
};

// ── 11. ALL GENRES  GET /reader/genres ────────────────────────────────────────
export const getGenres = async (req, res, next) => {
  try {
    const genres = await Book.distinct('genre');
    res.json(genres.filter(Boolean).sort());
  } catch (e) { next(e); }
};

// ── 12. FOLLOW / UNFOLLOW WRITER  POST /reader/follow/:wid ───────────────────
export const toggleFollow = async (req, res, next) => {
  try {
    const reader   = await User.findById(req.user._id);
    const wid      = new mongoose.Types.ObjectId(req.params.wid);
    const following= reader.following || [];
    const already  = following.some(id => id.equals(wid));
    if (already) {
      reader.following = following.filter(id => !id.equals(wid));
    } else {
      reader.following = [...following, wid];
    }
    await reader.save();
    res.json({ following: !already, message: !already ? 'Now following!' : 'Unfollowed.' });
  } catch (e) { next(e); }
};

// ── 13. GET FOLLOWED WRITERS  GET /reader/following ──────────────────────────
export const getFollowing = async (req, res, next) => {
  try {
    const reader   = await User.findById(req.user._id).lean();
    const ids      = reader.following || [];
    if (!ids.length) return res.json([]);
    const writers  = await User.find({ _id: { $in: ids }, role: 'writer' }).select('-password').lean();

    // Get book counts in one aggregation (fixes N+1)
    const bookCounts = await Book.aggregate([
      { $match: { addedBy: { $in: ids } } },
      { $group: { _id: '$addedBy', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(bookCounts.map(b => [String(b._id), b.count]));
    const withBooks = writers.map(w => ({ ...w, bookCount: countMap[String(w._id)] || 0 }));
    res.json(withBooks);
  } catch (e) { next(e); }
};

// ── 14. CHECK FOLLOW STATUS  GET /reader/follow/:wid/status ──────────────────
export const checkFollow = async (req, res, next) => {
  try {
    const reader = await User.findById(req.user._id).lean();
    const wid    = new mongoose.Types.ObjectId(req.params.wid);
    const following = (reader.following || []).some(id => id.equals(wid));
    res.json({ following });
  } catch (e) { next(e); }
};