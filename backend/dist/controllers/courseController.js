"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLesson = exports.getCourseDetails = exports.getCourses = void 0;
const Course_1 = __importDefault(require("../models/Course"));
const Module_1 = __importDefault(require("../models/Module"));
const Lesson_1 = __importDefault(require("../models/Lesson"));
const CourseAccess_1 = __importDefault(require("../models/CourseAccess"));
const getCourses = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userDepartment = req.user?.department;
        const courses = await Course_1.default.findAll({
            order: [['id', 'ASC']]
        });
        const courseIds = courses.map(course => course.id);
        const accesses = await CourseAccess_1.default.findAll({
            where: { courseId: courseIds }
        });
        const enrichedCourses = courses.map(course => {
            const specificAccess = accesses.find(access => access.courseId === course.id && access.etudiantId === userId);
            const globalAccess = accesses.find(access => access.courseId === course.id && access.department === userDepartment && access.etudiantId === null);
            const isUnlocked = specificAccess ? specificAccess.isUnlocked : (globalAccess ? globalAccess.isUnlocked : false);
            return {
                ...course.toJSON(),
                isUnlocked
            };
        });
        res.status(200).json(enrichedCourses);
    }
    catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getCourses = getCourses;
const getCourseDetails = async (req, res) => {
    try {
        const courseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const course = await Course_1.default.findByPk(courseId, {
            include: [
                {
                    model: Module_1.default,
                    as: 'modules',
                    include: [
                        {
                            model: Lesson_1.default,
                            as: 'lessons',
                            attributes: ['id', 'title', 'order'] // Don't send content here for performance
                        }
                    ]
                }
            ],
            order: [
                [{ model: Module_1.default, as: 'modules' }, 'order', 'ASC'],
                [{ model: Module_1.default, as: 'modules' }, { model: Lesson_1.default, as: 'lessons' }, 'order', 'ASC']
            ]
        });
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }
        res.status(200).json(course);
    }
    catch (error) {
        console.error('Get course details error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getCourseDetails = getCourseDetails;
const getLesson = async (req, res) => {
    try {
        const lessonId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const lesson = await Lesson_1.default.findByPk(lessonId);
        if (!lesson) {
            res.status(404).json({ message: 'Lesson not found' });
            return;
        }
        res.status(200).json(lesson);
    }
    catch (error) {
        console.error('Get lesson error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getLesson = getLesson;
