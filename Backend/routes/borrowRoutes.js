import express from 'express';
import {
  borrowBook,
  returnBook,
  getMyBorrows,
  getAllBorrows,
  getOverdueBooks,
} from '../controllers/borrowController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Reader: borrow & return
router.post('/:bookId/borrow',  protect, borrowBook);
router.put('/:borrowId/return', protect, returnBook);
router.get('/my',               protect, getMyBorrows);

// Admin only
router.get('/all',              protect, adminOnly, getAllBorrows);
router.get('/overdue',          protect, adminOnly, getOverdueBooks);

export default router;
