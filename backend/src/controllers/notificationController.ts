import { Request, Response } from 'express';
import Notification from '../models/Notification';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const notifications = await Notification.findAll({
      where: { etudiantId: userId },
      order: [['created_at', 'DESC']],
      limit: 50, // On limite aux 50 dernières pour la performance
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Erreur getNotifications:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const notificationId = req.params.id;

    const notification = await Notification.findOne({
      where: { id: notificationId, etudiantId: userId }
    });

    if (!notification) {
      res.status(404).json({ message: 'Notification non trouvée' });
      return;
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    console.error('Erreur markAsRead:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    await Notification.update(
      { isRead: true },
      { where: { etudiantId: userId, isRead: false } }
    );

    res.status(200).json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    console.error('Erreur markAllAsRead:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
