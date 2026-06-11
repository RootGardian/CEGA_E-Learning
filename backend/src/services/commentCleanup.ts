import { Op } from 'sequelize';
import Comment from '../models/Comment';
import { getIO } from '../utils/socket';

export const startCommentCleanupJob = () => {
  // Run cleanup every hour (3600000 ms)
  setInterval(async () => {
    try {
      const cutoffDate = new Date(Date.now() - 72 * 60 * 60 * 1000);
      
      const oldComments = await Comment.findAll({
        where: {
          createdAt: {
            [Op.lt]: cutoffDate
          }
        }
      });

      if (oldComments.length > 0) {
        // Emit delete event for each to keep clients in sync
        for (const comment of oldComments) {
          getIO().to(`module_${comment.moduleId}`).emit('delete_comment', comment.id.toString());
        }

        await Comment.destroy({
          where: {
            createdAt: {
              [Op.lt]: cutoffDate
            }
          }
        });
        console.log(`[Cleanup] Deleted ${oldComments.length} old comments.`);
      }
    } catch (err) {
      console.error('Error cleaning up comments:', err);
    }
  }, 3600000);

  console.log('Comment cleanup job started (runs every hour).');
};
