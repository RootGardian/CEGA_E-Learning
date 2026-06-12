"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const examController_1 = require("../controllers/examController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get('/:id/exam', authMiddleware_1.protect, (0, authMiddleware_1.requireRole)('etudiant'), examController_1.getExamData);
router.post('/:id/submit-qcm', authMiddleware_1.protect, (0, authMiddleware_1.requireRole)('etudiant'), examController_1.submitExam);
exports.default = router;
