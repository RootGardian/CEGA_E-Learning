import { Op } from 'sequelize';
import Etudiant from '../models/Etudiant';

export const startStudentCleanupJob = () => {
  // Exécuter le nettoyage toutes les heures (3600000 ms)
  setInterval(async () => {
    try {
      const cutoffDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 jours
      
      const pendingStudents = await Etudiant.findAll({
        where: {
          subscriptionStatus: 'pending',
          createdAt: {
            [Op.lt]: cutoffDate
          }
        }
      });

      if (pendingStudents.length > 0) {
        await Etudiant.destroy({
          where: {
            subscriptionStatus: 'pending',
            createdAt: {
              [Op.lt]: cutoffDate
            }
          }
        });
        console.log(`[Cleanup] Deleted ${pendingStudents.length} pending students older than 3 days.`);
      }
    } catch (err) {
      console.error('Error cleaning up pending students:', err);
    }
  }, 3600000);

  console.log('Student cleanup job started (runs every hour).');
};
