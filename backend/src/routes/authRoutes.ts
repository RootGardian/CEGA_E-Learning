import { Router } from 'express';
import { register, login, logout, enable2FA, verify2FA, forgotPassword, resetPassword, getMe, updateProfile, updatePassword, getPublicSettings } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Global public settings (e.g. price)
router.get('/public/settings', getPublicSettings);

// Protected routes for 2FA setup
router.post('/2fa/enable', protect, enable2FA);
router.post('/2fa/verify', protect, verify2FA);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// User profile routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/password', protect, updatePassword);

export default router;
