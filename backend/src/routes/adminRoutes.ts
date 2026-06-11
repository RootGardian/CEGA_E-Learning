import { Router } from 'express';
import { protect, requireRole } from '../middlewares/authMiddleware';
import {
  getSystemSettings,
  updateSystemSettings,
  getStudents,
  getEnrollments,
  createStudent,
  updateStudentStatus,
  updateStudent,
  deleteStudent,
  getDashboardStats,
  getFormateurs,
  createFormateur,
  updateFormateur,
  deleteFormateur,
  getCourses,
  getFormateurCourses,
  assignCourseToFormateur,
  unassignCourseFromFormateur,
  toggleStudentBlock,
  toggleFormateurBlock,
  getAllGrades
} from '../controllers/adminController';

const router = Router();

// Toutes les routes admin nécessitent l'authentification et le rôle admin
router.use(protect, requireRole('admin'));

router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

router.get('/stats', getDashboardStats);

router.get('/students', getStudents);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.patch('/students/:id/status', updateStudentStatus);
router.patch('/students/:id/block', toggleStudentBlock);
router.delete('/students/:id', deleteStudent);
router.get('/enrollments', getEnrollments);

// Formateurs CRUD
router.get('/formateurs', getFormateurs);
router.post('/formateurs', createFormateur);
router.put('/formateurs/:id', updateFormateur);
router.patch('/formateurs/:id/block', toggleFormateurBlock);
router.delete('/formateurs/:id', deleteFormateur);

// Course assignment
router.get('/courses', getCourses);
router.get('/formateurs/:id/courses', getFormateurCourses);
router.post('/formateurs/assign-course', assignCourseToFormateur);
router.post('/formateurs/unassign-course', unassignCourseFromFormateur);

// Notes / Grades
router.get('/grades', getAllGrades);

export default router;
