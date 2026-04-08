import express from 'express';
import {
  getProfile, updateProfile,
  getAnalytics,
  getBookReviews,
  togglePublish,
  deleteOwnBook,
  getNotifications,
  getFollowers,
} from '../controllers/writerController.js';
import { protect, writerOnly } from '../middleware/auth.js';

const router = express.Router();

// Public
router.get('/profile/:wid',          getProfile);
router.get('/books/:bid/reviews',     getBookReviews);

// Protected (writer must be logged in)
router.use(protect, writerOnly);
router.put('/profile',               updateProfile);
router.get('/analytics/:wid',        getAnalytics);
router.put('/books/:bid/publish',    togglePublish);
router.delete('/books/:bid',         deleteOwnBook);
router.get('/notifications',         getNotifications);
router.get('/followers',             getFollowers);

export default router;
