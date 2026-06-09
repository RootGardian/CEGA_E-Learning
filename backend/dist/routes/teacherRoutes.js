"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teacherController_1 = require("../controllers/teacherController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Protect all routes and require 'enseignant' role
router.use(authMiddleware_1.protect);
router.use((0, authMiddleware_1.requireRole)('enseignant'));
router.get('/courses', teacherController_1.getTeacherCourses);
router.get('/courses/:id/students', teacherController_1.getCourseStudents);
router.post('/courses/:id/unlock-global', teacherController_1.toggleGlobalAccess);
router.post('/courses/:id/unlock-student', teacherController_1.toggleStudentAccess);
router.post('/courses/:id/lock', teacherController_1.emergencyLock);
exports.default = router;
