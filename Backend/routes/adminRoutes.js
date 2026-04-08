import express from 'express';
import {
  getDashboard,
  getReaders, toggleBlockUser, deleteUserAdmin,
  getWriters,
  deleteRating, getBookRatingsAdmin,
  siteSearch,
  toggleFeatured,
  getAnnouncement, setAnnouncement,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// ── Public routes (no auth needed) ──────────────────────────────────────────
router.get('/announcement',               getAnnouncement);

// ── All other admin routes require JWT + admin role ──────────────────────────
router.use(protect, adminOnly);

router.get('/dashboard',                  getDashboard);
router.get('/readers',                    getReaders);
router.put('/users/:id/block',            toggleBlockUser);
router.delete('/users/:id',               deleteUserAdmin);
router.get('/writers',                    getWriters);
router.get('/books/:bid/ratings',         getBookRatingsAdmin);
router.delete('/ratings/:id',             deleteRating);
router.get('/search',                     siteSearch);
router.put('/books/:bid/feature',         toggleFeatured);
router.post('/announcement',              setAnnouncement);

export default router;
