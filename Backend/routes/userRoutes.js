import express from 'express';
import { getAllUsers, getUserById, updateUserRole, deleteUser, getDashboardStats } from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, adminOnly); // All user routes are admin-only

router.get('/stats', getDashboardStats);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;
