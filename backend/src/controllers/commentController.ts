import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Etudiant from '../models/Etudiant';
import User from '../models/User';
import Notification from '../models/Notification';
import { getIO } from '../utils/socket';
import { Op } from 'sequelize';

export const getComments = async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    const comments = await Comment.findAll({
      where: { moduleId, parentId: null },
      include: [
        {
          model: Comment,
          as: 'replies',
          order: [['created_at', 'ASC']],
        }
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(comments);
  } catch (err: any) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    const { content, parentId, mentions } = req.body;
    const user = (req as any).user;

    // Determine author type and name
    let authorType = 'etudiant';
    let authorName = '';
    
    if (user.role === 'etudiant') {
      const student = await Etudiant.findByPk(user.id);
      if (!student) return res.status(404).json({ error: 'Student not found' });
      authorName = `${student.firstName} ${student.lastName}`;
    } else {
      const intervenant = await User.findByPk(user.id);
      if (!intervenant) return res.status(404).json({ error: 'User not found' });
      authorType = 'enseignant';
      authorName = `${intervenant.nom || ''} ${intervenant.prenom || ''}`.trim() || intervenant.email;
    }

    const comment = await Comment.create({
      content,
      moduleId: parseInt(moduleId as string, 10),
      authorId: user.id.toString(),
      authorType,
      authorName,
      parentId: parentId || null
    });

    // Handle Mentions
    // mentions is expected to be an array of objects: { id, type }
    if (mentions && Array.isArray(mentions)) {
      for (const mention of mentions) {
        let notifData: any = {
          title: 'Nouvelle mention',
          message: `${authorName} vous a mentionné : "${content.substring(0, 60)}${content.length > 60 ? '...' : ''}"`,
          type: 'info'
        };
        
        let targetSocketRoom = '';

        if (mention.type === 'etudiant') {
          notifData.etudiantId = mention.id;
          targetSocketRoom = `user_${mention.id}`;
        } else {
          notifData.userId = mention.id;
          targetSocketRoom = `user_${mention.id}`;
        }

        const newNotif = await Notification.create(notifData);
        getIO().to(targetSocketRoom).emit('new_notification', newNotif);
      }
    }

    // Emit socket event to module room
    getIO().to(`module_${moduleId}`).emit('new_comment', comment);

    res.status(201).json(comment);
  } catch (err: any) {
    console.error('Error creating comment:', err);
    res.status(500).json({ error: 'Erreur lors de la création du commentaire' });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const comment = await Comment.findByPk(id as string);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    // Allow deletion if admin, or if author is the current user
    if (user.role !== 'admin' && user.role !== 'directeur_formation' && comment.authorId !== user.id.toString()) {
      return res.status(403).json({ error: 'Non autorisé à supprimer ce commentaire' });
    }

    const moduleId = comment.moduleId;
    await comment.destroy();

    getIO().to(`module_${moduleId}`).emit('delete_comment', id);

    res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};
