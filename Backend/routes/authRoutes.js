import express from 'express';
import {
  register, login, getMe, updateProfile,
  changePassword, forgotPassword, resetPassword,
  sendChangePasswordOtp
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register',                  register);
router.post('/login',                     login);
router.get('/me',                         protect, getMe);
router.put('/update-profile',             protect, updateProfile);
router.post('/send-change-password-otp',  protect, sendChangePasswordOtp);
router.put('/change-password',            protect, changePassword);
router.post('/forgot-password',           forgotPassword);
router.post('/reset-password',            resetPassword);

export default router;
