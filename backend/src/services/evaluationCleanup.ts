import { Op } from 'sequelize';
import Evaluation from '../models/Evaluation';

export const startEvaluationCleanupJob = () => {
  // Exécuter toutes les 5 minutes (300000 ms)
  setInterval(async () => {
    try {
      const evaluations = await Evaluation.findAll({
        where: {
          qcmQuestions: { [Op.ne]: null }
        }
      });

      let count = 0;
      for (const ev of evaluations as any) {
        if (ev.date && ev.duration) {
          const startDate = new Date(ev.date).getTime();
          const durationParts = ev.duration.split(':');
          const hours = parseInt(durationParts[0]) || 0;
          const minutes = parseInt(durationParts[1]) || 0;
          const durationMs = (hours * 60 + minutes) * 60000;
          
          if (Date.now() >= startDate + durationMs) {
            await ev.update({ qcmQuestions: null });
            count++;
          }
        }
      }
      
      if (count > 0) {
        console.log(`[Cleanup] Deleted QCM questions for ${count} expired evaluations.`);
      }
    } catch (err) {
      console.error('Error cleaning up expired evaluations:', err);
    }
  }, 300000); // 5 minutes

  console.log('Evaluation cleanup job started (runs every 5 minutes).');
};
