"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseController_1 = require("../controllers/courseController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get('/resources', authMiddleware_1.protect, courseController_1.getStudentResources);
router.get('/', authMiddleware_1.protect, courseController_1.getCourses);
router.get('/lessons/:id', authMiddleware_1.protect, courseController_1.getLesson);
router.get('/:id', authMiddleware_1.protect, courseController_1.getCourseDetails);
router.get('/:id/users', authMiddleware_1.protect, courseController_1.getCourseUsers);
// Progress routes
router.get('/:courseId/progress', authMiddleware_1.protect, courseController_1.getStudentProgress);
router.post('/lessons/:lessonId/progress', authMiddleware_1.protect, courseController_1.saveStudentProgress);
exports.default = router;
