"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification_1.default.findAll({
            where: { etudiantId: userId },
            order: [['createdAt', 'DESC']],
            limit: 50, // On limite aux 50 dernières pour la performance
        });
        res.status(200).json(notifications);
    }
    catch (error) {
        console.error('Erreur getNotifications:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;
        const notification = await Notification_1.default.findOne({
            where: { id: notificationId, etudiantId: userId }
        });
        if (!notification) {
            res.status(404).json({ message: 'Notification non trouvée' });
            return;
        }
        notification.isRead = true;
        await notification.save();
        res.status(200).json(notification);
    }
    catch (error) {
        console.error('Erreur markAsRead:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await Notification_1.default.update({ isRead: true }, { where: { etudiantId: userId, isRead: false } });
        res.status(200).json({ message: 'Toutes les notifications ont été marquées comme lues' });
    }
    catch (error) {
        console.error('Erreur markAllAsRead:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
exports.markAllAsRead = markAllAsRead;
