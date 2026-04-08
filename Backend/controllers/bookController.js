import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import Book from '../models/Book.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// Ensure upload dirs exist
['uploads/book_img', 'uploads/book_pdf'].forEach(dir => {
  const full = path.join(__dirname, '..', dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});

// ── Shape a Mongoose Book doc into the legacy format the frontend expects ────
const toOld = (b) => ({
  book_id:     String(b._id),
  _id:         b._id,
  book_name:   b.title,
  description: b.description,
  cover_img:   b.coverImage  || null,
  book_pdf:    b.pdfFile     || null,
  cat_id:      b.genre       || '—',     // genre acts as category
  publishedYear: b.publishedYear,
  totalCopies:   b.totalCopies,
  availableCopies: b.availableCopies,
  addedBy:     b.addedBy,
  createdAt:   b.createdAt,
  // also keep new-style fields for any modern components
  title:       b.title,
  genre:       b.genre,
  coverImage:  b.coverImage,
  pdfFile:     b.pdfFile,
});

// ═════════════════════════════════════════════════════════════════════════════
// MODERN REST endpoints  (/api/books)
// ═════════════════════════════════════════════════════════════════════════════
export const getBooks = async (req, res, next) => {
  try {
    const { search, genre, available, sort, page = 1, limit = 12 } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    if (genre) query.genre = genre;
    if (available === 'true') query.availableCopies = { $gt: 0 };
    let sortOption = { createdAt: -1 };
    if (sort === 'title') sortOption = { title: 1 };
    if (sort === 'author') sortOption = { author: 1 };
    if (sort === 'year') sortOption = { publishedYear: -1 };
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Book.countDocuments(query);
    const books = await Book.find(query).sort(sortOption).skip(skip).limit(Number(limit)).populate('addedBy', 'name');
    res.status(200).json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), books });
  } catch (error) { next(error); }
};

export const getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('addedBy', 'name email');
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    res.status(200).json({ success: true, book });
  } catch (error) { next(error); }
};

export const addBook = async (req, res, next) => {
  try {
    const bookData = { ...req.body, addedBy: req.user.id, availableCopies: req.body.totalCopies };
    const book = await Book.create(bookData);
    res.status(201).json({ success: true, message: 'Book added!', book });
  } catch (error) { next(error); }
};

export const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    if (req.body.totalCopies !== undefined) {
      const diff = req.body.totalCopies - book.totalCopies;
      req.body.availableCopies = Math.max(0, book.availableCopies + diff);
    }
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: 'Book updated!', book: updated });
  } catch (error) { next(error); }
};

export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    await book.deleteOne();
    res.status(200).json({ success: true, message: 'Book deleted.' });
  } catch (error) { next(error); }
};

export const borrowBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    if (book.availableCopies < 1) return res.status(400).json({ success: false, message: 'No copies available.' });
    const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + 14);
    book.availableCopies -= 1;
    book.borrowHistory.push({ user: req.user.id, dueDate });
    await book.save();
    req.user.borrowedBooks.push({ book: book._id, dueDate });
    await req.user.save();
    res.status(200).json({ success: true, message: `Borrowed! Due: ${dueDate.toDateString()}`, dueDate });
  } catch (error) { next(error); }
};

export const returnBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    const rec = book.borrowHistory.find(h => h.user.toString() === req.user.id && !h.returnedAt);
    if (!rec) return res.status(400).json({ success: false, message: "You haven't borrowed this book." });
    rec.returnedAt = new Date(); book.availableCopies += 1; await book.save();
    const ur = req.user.borrowedBooks.find(b => b.book.toString() === req.params.id && !b.returnedAt);
    if (ur) { ur.returnedAt = new Date(); await req.user.save(); }
    res.status(200).json({ success: true, message: 'Book returned!' });
  } catch (error) { next(error); }
};

export const getGenres = async (req, res, next) => {
  try {
    const genres = await Book.distinct('genre');
    res.status(200).json({ success: true, genres });
  } catch (error) { next(error); }
};

// ═════════════════════════════════════════════════════════════════════════════
// LEGACY flat endpoints  — return data in old field-name format
// ═════════════════════════════════════════════════════════════════════════════

const fileOf = (files, field) => files?.[field]?.[0]?.filename || null;

// GET /getbookdetail — books added by admin users (for Admin_View_Books)
export const getBookDetail = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }).lean();
    res.json(books.map(toOld));
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /getallbookdetail — all books
export const getAllBookDetail = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }).lean();
    res.json(books.map(toOld));
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /getsinglebookdetail/:bid
export const getSingleBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bid).lean();
    res.json(book ? toOld(book) : {});
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /savebook
export const saveBook = async (req, res) => {
  try {
    // Frontend sends: name, desc, catid  (FormData field names)
    const title       = req.body.name  || req.body.book_name  || '';
    const description = req.body.desc  || req.body.description || '';
    const genre       = req.body.catid || req.body.cat_id      || 'Other';
    const addedBy     = req.body.addedBy || undefined;
    const coverImage  = fileOf(req.files, 'image1');
    const pdfFile     = fileOf(req.files, 'pdf1');

    if (!title) return res.status(400).json({ error: 'Book title is required.' });

    const book = await Book.create({
      title,
      author: req.body.author || req.body.writer_name || 'Unknown',
      description, genre,
      totalCopies: 1, availableCopies: 1,
      ...(coverImage && { coverImage }),
      ...(pdfFile    && { pdfFile }),
      ...(addedBy    && { addedBy }),
    });
    res.json({ result: 'Book Saved', book_id: String(book._id) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PUT /updatebook/:bid
export const updateBook_legacy = async (req, res) => {
  try {
    const title       = req.body.name  || req.body.book_name  || undefined;
    const description = req.body.desc  || req.body.description || undefined;
    const genre       = req.body.catid || req.body.cat_id      || undefined;
    const updates = {};
    if (title)                updates.title       = title;
    if (description !== undefined) updates.description = description;
    if (genre)                updates.genre       = genre;
    // Only overwrite files if a new file was actually uploaded
    const newCover = fileOf(req.files, 'image1');
    const newPdf   = fileOf(req.files, 'pdf1');
    if (newCover) updates.coverImage = newCover;
    if (newPdf)   updates.pdfFile   = newPdf;
    await Book.findByIdAndUpdate(req.params.bid, updates);
    res.json({ result: 'Book Updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// DELETE /deletebook/:bid
export const deleteBook_legacy = async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.bid);
    res.json({ result: 'Book Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /readergetbookdetail
export const readerGetBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }).lean();
    res.json(books.map(toOld));
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /readerfetchcatwisebookdetail/:cid
export const readerGetCatWiseBooks = async (req, res) => {
  try {
    const books = await Book.find({ genre: req.params.cid }).sort({ createdAt: -1 }).lean();
    res.json(books.map(toOld));
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /writersavebook
export const writerSaveBook = async (req, res) => {
  try {
    const title       = req.body.name  || req.body.book_name  || '';
    const description = req.body.desc  || req.body.description || '';
    const genre       = req.body.catid || req.body.cat_id      || 'Other';
    const addedBy     = req.body.writerid || req.body.addedBy || undefined;
    const coverImage  = fileOf(req.files, 'image1');
    const pdfFile     = fileOf(req.files, 'pdf1');

    if (!title) return res.status(400).json({ error: 'Book title is required.' });

    const book = await Book.create({
      title,
      author: req.body.author || req.body.writer_name || 'Unknown',
      description, genre,
      totalCopies: 1, availableCopies: 1,
      ...(coverImage && { coverImage }),
      ...(pdfFile    && { pdfFile }),
      ...(addedBy    && { addedBy }),
    });
    res.json({ result: 'Book Saved', book_id: String(book._id) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PUT /writerupdatebook/:bid
export const writerUpdateBook = async (req, res) => {
  try {
    const title       = req.body.name  || req.body.book_name  || undefined;
    const description = req.body.desc  || req.body.description || undefined;
    const genre       = req.body.catid || req.body.cat_id      || undefined;
    const updates = {};
    if (title)                updates.title       = title;
    if (description !== undefined) updates.description = description;
    if (genre)                updates.genre       = genre;
    // Only overwrite files if a new file was actually uploaded
    const newCover = fileOf(req.files, 'image1');
    const newPdf   = fileOf(req.files, 'pdf1');
    if (newCover) updates.coverImage = newCover;
    if (newPdf)   updates.pdfFile   = newPdf;
    await Book.findByIdAndUpdate(req.params.bid, updates);
    res.json({ result: 'Book Updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /writergetuploadedbookdetail/:wid
export const writerGetUploadedBooks = async (req, res) => {
  try {
    const books = await Book.find({ addedBy: req.params.wid }).sort({ createdAt: -1 }).lean();
    res.json(books.map(toOld));
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /writergetallbookdetail/:wid
export const writerGetAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }).lean();
    res.json(books.map(toOld));
  } catch (e) { res.status(500).json({ error: e.message }); }
};
