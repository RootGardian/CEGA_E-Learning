import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware';
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
  getAllGrades,
  getResources,
  addResource,
  deleteResource,
  getCourseStructure,
  updateStudentFormation
} from '../controllers/adminController';

import { getCourseStudents, toggleGlobalAccess, toggleStudentAccess } from '../controllers/teacherController';

const router = Router();

// Toutes les routes admin nécessitent l'authentification et les rôles admin/directeur
router.use(protect, restrictTo('admin', 'directeur_formation'));

router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

router.get('/stats', getDashboardStats);

router.get('/students', getStudents);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.patch('/students/:id/status', updateStudentStatus);
router.patch('/students/:id/block', toggleStudentBlock);
router.patch('/students/:id/formation', updateStudentFormation);
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

// Resources
router.get('/resources', protect, restrictTo('admin', 'directeur_formation'), getResources);
router.post('/resources', protect, restrictTo('admin', 'directeur_formation'), addResource);
router.delete('/resources/:id', protect, restrictTo('admin', 'directeur_formation'), deleteResource);

// Course Management for Admins (common courses)
router.get('/courses/:id/structure', getCourseStructure);
router.get('/courses/:id/students', protect, restrictTo('admin', 'directeur_formation'), getCourseStudents);
router.post('/courses/:id/unlock-global', protect, restrictTo('admin', 'directeur_formation'), toggleGlobalAccess);
router.post('/courses/:id/unlock-student', protect, restrictTo('admin', 'directeur_formation'), toggleStudentAccess);

export default router;
