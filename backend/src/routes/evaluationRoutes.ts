import express from 'express';
import { getStudentEvaluations, getTeacherEvaluations, createEvaluation, updateEvaluation, deleteEvaluation, getEvaluationGrades, saveEvaluationGrades, deleteEvaluationGrades, updateQcmConfig, getFraudAlerts, deleteStudentGrade } from '../controllers/evaluationController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = express.Router();

// Routes for students
router.get('/', protect, getStudentEvaluations);

// Routes for teachers
router.get('/teacher', protect, restrictTo('enseignant', 'admin', 'directeur_formation'), getTeacherEvaluations);
router.get('/:id/grades', protect, restrictTo('enseignant', 'admin', 'directeur_formation'), getEvaluationGrades);
router.put('/:id/grades', protect, restrictTo('enseignant', 'admin', 'directeur_formation'), saveEvaluationGrades);
router.delete('/:id/grades', protect, restrictTo('enseignant', 'admin', 'directeur_formation'), deleteEvaluationGrades);
router.delete('/:id/grades/:etudiantId', protect, restrictTo('enseignant', 'admin', 'directeur_formation'), deleteStudentGrade);

// Fraud alerts
router.get('/alerts/frauds', protect, restrictTo('enseignant', 'admin', 'directeur_formation'), getFraudAlerts);

router.post('/', protect, restrictTo('enseignant', 'admin', 'directeur_formation'), createEvaluation);
router.put('/:id', protect, restrictTo('enseignant', 'admin', 'directeur_formation'), updateEvaluation);
router.put('/:id/qcm', protect, restrictTo('enseignant', 'admin', 'directeur_formation'), updateQcmConfig);
router.delete('/:id', protect, restrictTo('enseignant', 'admin', 'directeur_formation'), deleteEvaluation);

export default router;
