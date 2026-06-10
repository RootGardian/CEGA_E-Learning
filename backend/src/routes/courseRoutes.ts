import express from 'express';
import { getCourses, getCourseDetails, getLesson, getStudentProgress, saveStudentProgress } from '../controllers/courseController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', protect, getCourses);
router.get('/lessons/:id', protect, getLesson);
router.get('/:id', protect, getCourseDetails);

// Progress routes
router.get('/:courseId/progress', protect, getStudentProgress);
router.post('/lessons/:lessonId/progress', protect, saveStudentProgress);

export default router;
