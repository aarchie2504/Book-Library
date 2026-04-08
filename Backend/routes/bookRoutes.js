import express from 'express';
import {
  getBooks, getBook, addBook, updateBook, deleteBook,
  borrowBook, returnBook, getGenres,
} from '../controllers/bookController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/genres', getGenres);
router.get('/', getBooks);
router.get('/:id', getBook);
router.post('/', protect, adminOnly, addBook);
router.put('/:id', protect, adminOnly, updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);
router.post('/:id/borrow', protect, borrowBook);
router.post('/:id/return', protect, returnBook);

export default router;
