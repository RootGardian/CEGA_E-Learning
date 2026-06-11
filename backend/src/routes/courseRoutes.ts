import express from 'express';
import { getCourses, getCourseDetails, getLesson, getStudentProgress, saveStudentProgress, getStudentResources, getCourseUsers } from '../controllers/courseController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/resources', protect, getStudentResources);
router.get('/', protect, getCourses);
router.get('/lessons/:id', protect, getLesson);
router.get('/:id', protect, getCourseDetails);
router.get('/:id/users', protect, getCourseUsers);

// Progress routes
router.get('/:courseId/progress', protect, getStudentProgress);
router.post('/lessons/:lessonId/progress', protect, saveStudentProgress);

export default router;
