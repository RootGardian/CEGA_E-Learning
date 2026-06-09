import express from 'express';
import { getCourses, getCourseDetails, getLesson } from '../controllers/courseController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', protect, getCourses);
router.get('/lessons/:id', protect, getLesson);
router.get('/:id', protect, getCourseDetails);

export default router;
