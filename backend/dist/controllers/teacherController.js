"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emergencyLock = exports.toggleStudentAccess = exports.toggleGlobalAccess = exports.getCourseStudents = exports.getTeacherCourses = void 0;
const Course_1 = __importDefault(require("../models/Course"));
const Etudiant_1 = __importDefault(require("../models/Etudiant"));
const CourseAccess_1 = __importDefault(require("../models/CourseAccess"));
// Obtenir la liste des cours de l'enseignant (selon son département)
const getTeacherCourses = async (req, res) => {
    try {
        const teacherDept = req.user.department; // We need to make sure user in request has department, wait, `req.user` only has `{ id, role }` from JWT.
        // We should fetch the teacher
        const Intervenant = require('../models/Intervenant').default;
        const teacher = await Intervenant.findByPk(req.user.id);
        if (!teacher) {
            res.status(404).json({ message: 'Teacher not found' });
            return;
        }
        const courses = await Course_1.default.findAll({
            where: { department: teacher.department },
            order: [['id', 'ASC']]
        });
        res.status(200).json(courses);
    }
    catch (error) {
        console.error('getTeacherCourses error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getTeacherCourses = getTeacherCourses;
// Obtenir les étudiants et leur accès pour un cours donné
const getCourseStudents = async (req, res) => {
    try {
        const courseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const course = await Course_1.default.findByPk(courseId);
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }
        // Tous les étudiants du même département que le cours
        const students = await Etudiant_1.default.findAll({
            where: { department: course.department },
            attributes: ['id', 'firstName', 'lastName', 'email', 'department']
        });
        const accesses = await CourseAccess_1.default.findAll({
            where: { courseId }
        });
        // Construire la réponse combinée
        const result = students.map(student => {
            // Un étudiant a accès si :
            // - Il y a un accès global pour le département
            // - OU il y a un accès spécifique pour lui
            const globalAccess = accesses.find(a => a.department === student.department && a.etudiantId === null);
            const specificAccess = accesses.find(a => a.etudiantId === student.id);
            const isUnlocked = specificAccess
                ? specificAccess.isUnlocked
                : (globalAccess ? globalAccess.isUnlocked : true);
            return {
                ...student.toJSON(),
                isUnlocked
            };
        });
        res.status(200).json(result);
    }
    catch (error) {
        console.error('getCourseStudents error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getCourseStudents = getCourseStudents;
// Déblocage / Blocage global
const toggleGlobalAccess = async (req, res) => {
    try {
        const courseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { isUnlocked } = req.body;
        const teacherId = req.user.id;
        const course = await Course_1.default.findByPk(courseId);
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }
        let access = await CourseAccess_1.default.findOne({
            where: { courseId, department: course.department, etudiantId: null }
        });
        if (access) {
            access.isUnlocked = isUnlocked;
            access.unlockedBy = teacherId;
            await access.save();
        }
        else {
            await CourseAccess_1.default.create({
                courseId,
                department: course.department,
                etudiantId: null,
                isUnlocked,
                unlockedBy: teacherId
            });
        }
        res.status(200).json({ message: 'Global access updated' });
    }
    catch (error) {
        console.error('toggleGlobalAccess error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.toggleGlobalAccess = toggleGlobalAccess;
// Déblocage / Blocage individuel
const toggleStudentAccess = async (req, res) => {
    try {
        const courseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { etudiantId, isUnlocked } = req.body;
        const teacherId = req.user.id;
        let access = await CourseAccess_1.default.findOne({
            where: { courseId, etudiantId }
        });
        if (access) {
            access.isUnlocked = isUnlocked;
            access.unlockedBy = teacherId;
            await access.save();
        }
        else {
            await CourseAccess_1.default.create({
                courseId,
                etudiantId,
                isUnlocked,
                unlockedBy: teacherId
            });
        }
        res.status(200).json({ message: 'Student access updated' });
    }
    catch (error) {
        console.error('toggleStudentAccess error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.toggleStudentAccess = toggleStudentAccess;
// Blocage d'urgence du cours
const emergencyLock = async (req, res) => {
    try {
        const courseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { isLocked } = req.body;
        const course = await Course_1.default.findByPk(courseId);
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }
        course.isLocked = isLocked;
        await course.save();
        res.status(200).json({ message: 'Emergency lock updated', isLocked });
    }
    catch (error) {
        console.error('emergencyLock error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.emergencyLock = emergencyLock;
