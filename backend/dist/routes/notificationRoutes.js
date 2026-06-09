"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Toutes les routes de notifications nécessitent d'être connecté
router.use(authMiddleware_1.protect);
router.get('/', notificationController_1.getNotifications);
router.put('/read-all', notificationController_1.markAllAsRead);
router.put('/:id/read', notificationController_1.markAsRead);
exports.default = router;
