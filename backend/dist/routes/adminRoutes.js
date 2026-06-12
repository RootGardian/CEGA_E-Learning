"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
// Toutes les routes admin nécessitent l'authentification et le rôle admin
router.use(authMiddleware_1.protect, (0, authMiddleware_1.requireRole)('admin'));
router.get('/settings', adminController_1.getSystemSettings);
router.put('/settings', adminController_1.updateSystemSettings);
router.get('/stats', adminController_1.getDashboardStats);
router.get('/students', adminController_1.getStudents);
router.post('/students', adminController_1.createStudent);
router.put('/students/:id', adminController_1.updateStudent);
router.patch('/students/:id/status', adminController_1.updateStudentStatus);
router.patch('/students/:id/block', adminController_1.toggleStudentBlock);
router.patch('/students/:id/formation', adminController_1.updateStudentFormation);
router.delete('/students/:id', adminController_1.deleteStudent);
router.get('/enrollments', adminController_1.getEnrollments);
// Formateurs CRUD
router.get('/formateurs', adminController_1.getFormateurs);
router.post('/formateurs', adminController_1.createFormateur);
router.put('/formateurs/:id', adminController_1.updateFormateur);
router.patch('/formateurs/:id/block', adminController_1.toggleFormateurBlock);
router.delete('/formateurs/:id', adminController_1.deleteFormateur);
// Course assignment
router.get('/courses', adminController_1.getCourses);
router.get('/formateurs/:id/courses', adminController_1.getFormateurCourses);
router.post('/formateurs/assign-course', adminController_1.assignCourseToFormateur);
router.post('/formateurs/unassign-course', adminController_1.unassignCourseFromFormateur);
// Notes / Grades
router.get('/grades', adminController_1.getAllGrades);
// Resources
router.get('/resources', adminController_1.getResources);
router.post('/resources', adminController_1.addResource);
router.delete('/resources/:id', adminController_1.deleteResource);
router.get('/courses/:id/structure', adminController_1.getCourseStructure);
exports.default = router;
