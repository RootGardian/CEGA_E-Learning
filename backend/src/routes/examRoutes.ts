import express from 'express';
import { getExamData, submitExam } from '../controllers/examController';
import { protect, requireRole } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/:id/exam', protect, requireRole('etudiant'), getExamData);
router.post('/:id/submit-qcm', protect, requireRole('etudiant'), submitExam);

export default router;
