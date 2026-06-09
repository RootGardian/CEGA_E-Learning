import { Router } from 'express';
import { getTeacherCourses, getCourseStudents, toggleGlobalAccess, toggleStudentAccess, emergencyLock, getDashboardStats } from '../controllers/teacherController';
import { protect, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Protect all routes and require 'enseignant' role
router.use(protect);
router.use(requireRole('enseignant'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/courses', getTeacherCourses);
router.get('/courses/:id/students', getCourseStudents);
router.post('/courses/:id/unlock-global', toggleGlobalAccess);
router.post('/courses/:id/unlock-student', toggleStudentAccess);
router.post('/courses/:id/lock', emergencyLock);

export default router;
