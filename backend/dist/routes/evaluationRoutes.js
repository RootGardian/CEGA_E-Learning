"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const evaluationController_1 = require("../controllers/evaluationController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Routes for students
router.get('/', authMiddleware_1.protect, evaluationController_1.getStudentEvaluations);
// Routes for teachers
router.get('/teacher', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('enseignant', 'admin', 'directeur_formation'), evaluationController_1.getTeacherEvaluations);
router.get('/:id/grades', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('enseignant', 'admin', 'directeur_formation'), evaluationController_1.getEvaluationGrades);
router.put('/:id/grades', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('enseignant', 'admin', 'directeur_formation'), evaluationController_1.saveEvaluationGrades);
router.delete('/:id/grades', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('enseignant', 'admin', 'directeur_formation'), evaluationController_1.deleteEvaluationGrades);
router.delete('/:id/grades/:etudiantId', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('enseignant', 'admin', 'directeur_formation'), evaluationController_1.deleteStudentGrade);
// Fraud alerts
router.get('/alerts/frauds', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('enseignant', 'admin', 'directeur_formation'), evaluationController_1.getFraudAlerts);
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('enseignant', 'admin', 'directeur_formation'), evaluationController_1.createEvaluation);
router.put('/:id', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('enseignant', 'admin', 'directeur_formation'), evaluationController_1.updateEvaluation);
router.put('/:id/qcm', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('enseignant', 'admin', 'directeur_formation'), evaluationController_1.updateQcmConfig);
router.delete('/:id', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('enseignant', 'admin', 'directeur_formation'), evaluationController_1.deleteEvaluation);
exports.default = router;
