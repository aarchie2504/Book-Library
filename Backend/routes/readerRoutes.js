import express from 'express';
import {
  getProfile, updateProfile,
  getBookmarks, toggleBookmark, checkBookmark,
  getRecentlyViewed, trackRecentlyViewed,
  getMyRatings,
  getRecommendations,
  searchBooks, getGenres,
  toggleFollow, getFollowing, checkFollow,
} from '../controllers/readerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public
router.get('/profile/:rid',         getProfile);
router.get('/search',               searchBooks);
router.get('/genres',               getGenres);

// Protected (reader must be logged in)
router.use(protect);
router.put('/profile',              updateProfile);
router.get('/bookmarks',            getBookmarks);
router.post('/bookmarks/:bid',      toggleBookmark);
router.get('/bookmarks/:bid/status',checkBookmark);
router.get('/recent',               getRecentlyViewed);
router.post('/recent/:bid',         trackRecentlyViewed);
router.get('/ratings',              getMyRatings);
router.get('/recommendations',      getRecommendations);
router.post('/follow/:wid',         toggleFollow);
router.get('/following',            getFollowing);
router.get('/follow/:wid/status',   checkFollow);

export default router;
