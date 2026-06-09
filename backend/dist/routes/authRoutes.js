"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.post('/logout', authController_1.logout);
// Protected routes for 2FA setup
router.post('/2fa/enable', authMiddleware_1.protect, authController_1.enable2FA);
router.post('/2fa/verify', authMiddleware_1.protect, authController_1.verify2FA);
// Password reset routes
router.post('/forgot-password', authController_1.forgotPassword);
router.post('/reset-password/:token', authController_1.resetPassword);
// User profile routes
router.get('/me', authMiddleware_1.protect, authController_1.getMe);
router.put('/me', authMiddleware_1.protect, authController_1.updateProfile);
router.put('/password', authMiddleware_1.protect, authController_1.updatePassword);
exports.default = router;
