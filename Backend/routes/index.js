import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { loginUser, registerWriter, registerReader } from '../controllers/authController.js';
import * as category from '../controllers/categoryController.js';
import * as book from '../controllers/bookController.js';
import * as rating from '../controllers/ratingController.js';
import * as user from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const router = express.Router();

// ── Multer with file type validation and size limits ─────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'image1') cb(null, 'uploads/book_img/');
    else if (file.fieldname === 'pdf1') cb(null, 'uploads/book_pdf/');
    else cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image1') {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.mimetype)) {
        return cb(new Error('Only JPEG, PNG, WebP images allowed for cover image.'));
      }
    }
    if (file.fieldname === 'pdf1') {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Only PDF files allowed for book file.'));
      }
    }
    cb(null, true);
  },
});

const uploadFields = upload.fields([{ name: 'image1' }, { name: 'pdf1' }]);

// ── Auth (legacy) ─────────────────────────────────────────────────────────────
router.post('/loginuser',   loginUser);
router.post('/regiswriter', registerWriter);
router.post('/regisreader', registerReader);

// ── Categories (public reads, protected writes) ───────────────────────────────
router.get('/getcategorydetail',            category.getAllCategories);
router.get('/getsinglecategorydetail/:cid', category.getSingleCategory);
router.post('/savecategory',                protect, adminOnly, category.saveCategory);
router.put('/updatecategory/:cid',          protect, adminOnly, category.updateCategory);
router.delete('/deletecat/:cid',            protect, adminOnly, category.deleteCategory);

// ── Books (Admin) ─────────────────────────────────────────────────────────────
router.get('/getbookdetail',            book.getBookDetail);
router.get('/getallbookdetail',         book.getAllBookDetail);
router.get('/getsinglebookdetail/:bid', book.getSingleBook);
router.post('/savebook',                protect, adminOnly, uploadFields, book.saveBook);
router.put('/updatebook/:bid',          protect, adminOnly, uploadFields, book.updateBook_legacy);
router.delete('/deletebook/:bid',       protect, adminOnly, book.deleteBook_legacy);

// ── Books (Reader) ────────────────────────────────────────────────────────────
router.get('/readergetbookdetail',               book.readerGetBooks);
router.get('/readerfetchcatwisebookdetail/:cid', book.readerGetCatWiseBooks);

// ── Books (Writer) ────────────────────────────────────────────────────────────
router.post('/writersavebook',                  protect, uploadFields, book.writerSaveBook);
router.put('/writerupdatebook/:bid',            protect, uploadFields, book.writerUpdateBook);
router.get('/writergetuploadedbookdetail/:wid', book.writerGetUploadedBooks);
router.get('/writergetallbookdetail/:wid',      book.writerGetAllBooks);

// ── Ratings ───────────────────────────────────────────────────────────────────
router.post('/submitrating',                    protect, rating.submitRating);
router.get('/readerfetchrating/:bid/:readerid', rating.getReaderRating);
router.get('/getbookwiseratingdetail/:bid',     rating.getBookWiseRating);
router.get('/getreaderwiseratingdetail/:rid',   rating.getReaderWiseRating);

// ── Reports ───────────────────────────────────────────────────────────────────
router.get('/getallreaderdetail', protect, adminOnly, user.getAllReaders);
router.get('/getallwriterdetail', protect, adminOnly, user.getAllWriters);

export default router;