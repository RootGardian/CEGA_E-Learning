import { Router } from 'express';
import { verifyEmail, login, logout, googleAuth, enable2FA, verify2FA, forgotPassword, resetPassword, getMe, updateProfile, updatePassword, getPublicSettings, getPublicFormations, trackTime } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/logout', logout);
router.post('/google', googleAuth);

// Global public settings (e.g. price)
router.get('/public/settings', getPublicSettings);

// Public formations list
router.get('/public/formations', getPublicFormations);

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
router.post('/track-time', protect, trackTime);

export default router;
