import Book from '../models/Book.js';
import User from '../models/User.js';
import Rating from '../models/Rating.js';

// POST /submitrating
export const submitRating = async (req, res) => {
  try {
    const { bid, rating, readerid, review } = req.body;
    const existing = await Rating.findOne({ book_id: bid, reader_id: readerid });
    if (existing) {
      existing.rating = rating;
      existing.rating_date = new Date();
      if (review !== undefined) existing.review = review;
      await existing.save();
      return res.json({ result: 'Rating Updated' });
    }
    await new Rating({ book_id: bid, reader_id: readerid, rating, review: review || '' }).save();
    res.json({ result: 'Rating Submitted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /readerfetchrating/:bid/:readerid
export const getReaderRating = async (req, res) => {
  try {
    const r = await Rating.findOne({ book_id: req.params.bid, reader_id: req.params.readerid });
    res.json(r || {});
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /getbookwiseratingdetail/:bid
export const getBookWiseRating = async (req, res) => {
  try {
    const ratings = await Rating.find({ book_id: req.params.bid })
      .populate('reader_id', 'name')
      .populate('book_id', 'title')
      .sort({ rating_date: -1 })
      .lean();

    const result = ratings.map(r => ({
      _id: r._id, rating: r.rating, review: r.review, rating_date: r.rating_date,
      reader: [{ reader_name: r.reader_id?.name || '—' }],
      book:   [{ book_name:   r.book_id?.title  || '—' }],
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /getreaderwiseratingdetail/:rid
export const getReaderWiseRating = async (req, res) => {
  try {
    const ratings = await Rating.find({ reader_id: req.params.rid })
      .populate('reader_id', 'name')
      .populate('book_id', 'title')
      .sort({ rating_date: -1 })
      .lean();

    const result = ratings.map(r => ({
      _id: r._id, rating: r.rating, review: r.review, rating_date: r.rating_date,
      reader: [{ reader_name: r.reader_id?.name || '—' }],
      book:   [{ book_name:   r.book_id?.title  || '—' }],
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
};