"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudentGrade = exports.getFraudAlerts = exports.deleteEvaluationGrades = exports.saveEvaluationGrades = exports.getEvaluationGrades = exports.deleteEvaluation = exports.updateQcmConfig = exports.updateEvaluation = exports.createEvaluation = exports.getTeacherEvaluations = exports.getStudentEvaluations = void 0;
const Evaluation_1 = __importDefault(require("../models/Evaluation"));
const Course_1 = __importDefault(require("../models/Course"));
const CourseAccess_1 = __importDefault(require("../models/CourseAccess"));
const Notification_1 = __importDefault(require("../models/Notification"));
const Grade_1 = __importDefault(require("../models/Grade"));
const Etudiant_1 = __importDefault(require("../models/Etudiant"));
const socket_1 = require("../utils/socket");
const sequelize_1 = require("sequelize");
const notifyStudentsForCourse = async (courseId, title, message, type = 'info') => {
    try {
        const course = await Course_1.default.findByPk(courseId);
        if (!course)
            return;
        const accesses = await CourseAccess_1.default.findAll({ where: { courseId, isUnlocked: true } });
        const specificStudentIds = accesses.filter(a => a.etudiantId).map(a => a.etudiantId);
        const globalDepartments = accesses.filter(a => a.department && !a.etudiantId).map(a => a.department);
        const Etudiant = require('../models/Etudiant').default;
        const studentsToNotify = await Etudiant.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { id: specificStudentIds },
                    { department: globalDepartments }
                ]
            }
        });
        if (studentsToNotify.length === 0)
            return;
        const notifications = studentsToNotify.map((student) => ({
            etudiantId: student.id,
            title,
            message,
            type
        }));
        await Notification_1.default.bulkCreate(notifications);
        const io = (0, socket_1.getIO)();
        studentsToNotify.forEach((student) => {
            io.to(`user_${student.id}`).emit('new_notification', {
                title,
                message,
                type,
                createdAt: new Date()
            });
        });
    }
    catch (error) {
        console.error('Error notifying students:', error);
    }
};
const notifyStudent = async (etudiantId, title, message, type = 'info') => {
    try {
        await Notification_1.default.create({ etudiantId, title, message, type });
        const io = (0, socket_1.getIO)();
        io.to(`user_${etudiantId}`).emit('new_notification', { title, message, type, createdAt: new Date() });
    }
    catch (err) {
        console.error('Error notifying specific student:', err);
    }
};
const getStudentEvaluations = async (req, res) => {
    try {
        const userId = req.user?.id;
        const Etudiant = require('../models/Etudiant').default;
        const etudiant = await Etudiant.findByPk(userId);
        const userDepartment = etudiant?.department;
        // Get all courses the student has access to
        const courses = await Course_1.default.findAll();
        const courseIds = courses.map(c => c.id);
        const accesses = await CourseAccess_1.default.findAll({
            where: { courseId: courseIds }
        });
        const unlockedCourseIds = courses.filter(course => {
            const specificAccess = accesses.find(a => a.courseId == course.id && a.etudiantId == userId);
            const globalAccess = accesses.find(a => a.courseId == course.id && a.department === userDepartment && a.etudiantId === null);
            return specificAccess ? specificAccess.isUnlocked : (globalAccess ? globalAccess.isUnlocked : false);
        }).map(c => c.id);
        // Fetch evaluations for these courses
        const evaluations = await Evaluation_1.default.findAll({
            where: {
                courseId: unlockedCourseIds,
                [sequelize_1.Op.or]: [
                    { isGlobal: true },
                    { targetStudentId: userId }
                ]
            },
            include: [
                { model: Course_1.default, as: 'course', attributes: ['id', 'title'] },
                { model: Grade_1.default, as: 'grades', attributes: ['etudiantId', 'score', 'feedback'] }
            ],
            order: [['date', 'ASC']]
        });
        const result = evaluations.map((ev) => {
            const grades = ev.grades || [];
            const studentGradeObj = grades.find((g) => g.etudiantId === userId);
            let average = null;
            if (grades.length > 0) {
                const scoredGrades = grades.filter((g) => g.score !== null && g.score !== undefined && g.score !== '');
                if (scoredGrades.length > 0) {
                    const total = scoredGrades.reduce((sum, g) => sum + Number(g.score), 0);
                    average = (total / scoredGrades.length).toFixed(2);
                }
            }
            const evJSON = ev.toJSON();
            delete evJSON.grades;
            return {
                ...evJSON,
                studentGrade: studentGradeObj || null,
                classAverage: average
            };
        });
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error fetching student evaluations:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getStudentEvaluations = getStudentEvaluations;
const getTeacherEvaluations = async (req, res) => {
    try {
        const intervenantId = req.user?.id;
        const evaluations = await Evaluation_1.default.findAll({
            where: { intervenantId },
            include: [
                { model: Course_1.default, as: 'course', attributes: ['id', 'title'] },
                { model: Etudiant_1.default, as: 'targetStudent', attributes: ['id', 'firstName', 'lastName'] }
            ],
            order: [['date', 'ASC']]
        });
        res.status(200).json(evaluations);
    }
    catch (error) {
        console.error('Error fetching teacher evaluations:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getTeacherEvaluations = getTeacherEvaluations;
const createEvaluation = async (req, res) => {
    try {
        const intervenantId = req.user?.id;
        const { title, type, description, date, duration, courseId, documentLink, isGlobal, targetStudentId } = req.body;
        const evaluation = await Evaluation_1.default.create({
            title,
            type,
            description,
            date,
            duration,
            courseId,
            intervenantId,
            documentLink,
            isGlobal: isGlobal !== undefined ? isGlobal : true,
            targetStudentId: isGlobal === false ? targetStudentId : null
        });
        // Notify students
        const course = await Course_1.default.findByPk(courseId);
        const courseTitle = course ? course.title : 'votre cours';
        if (evaluation.isGlobal) {
            await notifyStudentsForCourse(courseId, `Nouvelle Évaluation : ${title}`, `Une nouvelle évaluation a été programmée pour le cours "${courseTitle}". Date : ${new Date(date).toLocaleString('fr-FR')}`, 'info');
        }
        else if (evaluation.targetStudentId) {
            await notifyStudent(evaluation.targetStudentId, `Nouvelle Évaluation de Rattrapage : ${title}`, `Une évaluation spécifique vous a été programmée pour le cours "${courseTitle}". Date : ${new Date(date).toLocaleString('fr-FR')}`, 'info');
        }
        res.status(201).json(evaluation);
    }
    catch (error) {
        console.error('Error creating evaluation:', error);
        require('fs').writeFileSync('eval_error.txt', error.toString() + '\n' + (error.stack || '') + '\n' + JSON.stringify(error, null, 2));
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};
exports.createEvaluation = createEvaluation;
const updateEvaluation = async (req, res) => {
    try {
        const intervenantId = req.user?.id;
        const { id } = req.params;
        const { title, type, description, date, duration, courseId, documentLink, isGlobal, targetStudentId } = req.body;
        const evaluation = await Evaluation_1.default.findOne({ where: { id, intervenantId } });
        if (!evaluation) {
            res.status(404).json({ message: 'Evaluation not found or unauthorized' });
            return;
        }
        await evaluation.update({
            title,
            type,
            description,
            date,
            duration,
            courseId,
            documentLink,
            isGlobal: isGlobal !== undefined ? isGlobal : true,
            targetStudentId: isGlobal === false ? targetStudentId : null
        });
        const course = await Course_1.default.findByPk(courseId);
        const courseTitle = course ? course.title : 'votre cours';
        if (evaluation.isGlobal) {
            await notifyStudentsForCourse(courseId, `Évaluation Modifiée : ${title}`, `L'évaluation "${title}" pour le cours "${courseTitle}" a été modifiée. Nouvelle date : ${new Date(date).toLocaleString('fr-FR')}`, 'warning');
        }
        else if (evaluation.targetStudentId) {
            await notifyStudent(evaluation.targetStudentId, `Évaluation Modifiée : ${title}`, `L'évaluation spécifique "${title}" pour le cours "${courseTitle}" a été modifiée. Nouvelle date : ${new Date(date).toLocaleString('fr-FR')}`, 'warning');
        }
        res.status(200).json(evaluation);
    }
    catch (error) {
        console.error('Error updating evaluation:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateEvaluation = updateEvaluation;
const updateQcmConfig = async (req, res) => {
    try {
        const intervenantId = req.user?.id;
        const { id } = req.params;
        const { qcmQuestions } = req.body;
        const evaluation = await Evaluation_1.default.findOne({ where: { id, intervenantId } });
        if (!evaluation) {
            res.status(404).json({ message: 'Evaluation not found or unauthorized' });
            return;
        }
        await evaluation.update({ qcmQuestions });
        res.status(200).json(evaluation);
    }
    catch (error) {
        console.error('Error updating QCM config:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateQcmConfig = updateQcmConfig;
const deleteEvaluation = async (req, res) => {
    try {
        const intervenantId = req.user?.id;
        const { id } = req.params;
        const evaluation = await Evaluation_1.default.findOne({ where: { id, intervenantId } });
        if (!evaluation) {
            res.status(404).json({ message: 'Evaluation not found or unauthorized' });
            return;
        }
        const evalTitle = evaluation.title;
        const courseId = evaluation.courseId;
        await evaluation.destroy();
        const course = await Course_1.default.findByPk(courseId);
        const courseTitle = course ? course.title : 'un de vos cours';
        await notifyStudentsForCourse(courseId, `Évaluation Annulée : ${evalTitle}`, `L'évaluation "${evalTitle}" pour le cours "${courseTitle}" a été annulée.`, 'info');
        res.status(200).json({ message: 'Evaluation deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting evaluation:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteEvaluation = deleteEvaluation;
const getEvaluationGrades = async (req, res) => {
    try {
        const { id } = req.params;
        const intervenantId = req.user?.id;
        const evaluation = await Evaluation_1.default.findOne({ where: { id, intervenantId } });
        if (!evaluation) {
            res.status(404).json({ message: 'Evaluation not found or unauthorized' });
            return;
        }
        const courseId = evaluation.courseId;
        const accesses = await CourseAccess_1.default.findAll({ where: { courseId, isUnlocked: true } });
        const specificStudentIds = accesses.filter(a => a.etudiantId).map(a => a.etudiantId);
        const globalDepartments = accesses.filter(a => a.department && !a.etudiantId).map(a => a.department);
        const Etudiant = require('../models/Etudiant').default;
        const students = await Etudiant.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { id: specificStudentIds },
                    { department: globalDepartments }
                ]
            },
            attributes: ['id', 'firstName', 'lastName', 'email', 'department']
        });
        const grades = await Grade_1.default.findAll({ where: { evaluationId: id } });
        const results = students.map((student) => {
            const studentGrade = grades.find(g => g.etudiantId === student.id);
            return {
                etudiant: student,
                grade: studentGrade || null
            };
        });
        res.status(200).json(results);
    }
    catch (error) {
        console.error('Error fetching grades:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getEvaluationGrades = getEvaluationGrades;
const saveEvaluationGrades = async (req, res) => {
    try {
        const { id } = req.params;
        const intervenantId = req.user?.id;
        const { grades } = req.body;
        const evaluation = await Evaluation_1.default.findOne({ where: { id, intervenantId } });
        if (!evaluation) {
            res.status(404).json({ message: 'Evaluation not found or unauthorized' });
            return;
        }
        for (const g of grades) {
            // Allow clearing grade if score is empty/null
            const scoreToSave = (g.score === '' || g.score === null || g.score === undefined) ? null : parseFloat(g.score);
            const existing = await Grade_1.default.findOne({ where: { evaluationId: id, etudiantId: g.etudiantId } });
            let wasUpdated = false;
            if (existing) {
                if (existing.score !== scoreToSave) {
                    await existing.update({ score: scoreToSave, feedback: g.feedback });
                    wasUpdated = true;
                }
                else {
                    await existing.update({ feedback: g.feedback });
                }
            }
            else if (scoreToSave !== null || g.feedback) {
                await Grade_1.default.create({ evaluationId: id, etudiantId: g.etudiantId, score: scoreToSave, feedback: g.feedback });
                wasUpdated = true;
            }
            if (wasUpdated && scoreToSave !== null) {
                // We notify the student that a grade was published
                const course = await Course_1.default.findByPk(evaluation.courseId);
                const courseTitle = course ? course.title : 'Cours inconnu';
                await notifyStudent(g.etudiantId, 'Nouvelle Note Publiée', `Votre note pour l'évaluation "${evaluation.title}" (${courseTitle}) a été publiée : ${scoreToSave}`, 'success');
            }
        }
        res.status(200).json({ message: 'Grades saved successfully' });
    }
    catch (error) {
        console.error('Error saving grades:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.saveEvaluationGrades = saveEvaluationGrades;
const deleteEvaluationGrades = async (req, res) => {
    try {
        const { id } = req.params;
        const intervenantId = req.user?.id;
        const evaluation = await Evaluation_1.default.findOne({ where: { id, intervenantId } });
        if (!evaluation) {
            res.status(404).json({ message: 'Evaluation not found or unauthorized' });
            return;
        }
        await Grade_1.default.destroy({ where: { evaluationId: id } });
        res.status(200).json({ message: 'Grades deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting grades:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteEvaluationGrades = deleteEvaluationGrades;
// Fraud Alerts
const getFraudAlerts = async (req, res) => {
    try {
        const intervenantId = req.user?.id;
        // On trouve toutes les notes (Grades) de cet intervenant dont le feedback commence par 'FRAUDE'
        const grades = await Grade_1.default.findAll({
            where: {
                feedback: { [sequelize_1.Op.like]: 'FRAUDE D%TECT%E%' },
                createdAt: { [sequelize_1.Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            },
            include: [
                {
                    model: Evaluation_1.default,
                    as: 'evaluation',
                    where: { intervenantId },
                    attributes: ['id', 'title']
                },
                {
                    model: Etudiant_1.default,
                    as: 'etudiant',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(grades);
    }
    catch (error) {
        console.error('Error fetching fraud alerts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getFraudAlerts = getFraudAlerts;
const deleteStudentGrade = async (req, res) => {
    try {
        const { id, etudiantId } = req.params;
        const intervenantId = req.user?.id;
        const evaluation = await Evaluation_1.default.findOne({ where: { id, intervenantId } });
        if (!evaluation) {
            res.status(404).json({ message: 'Evaluation not found or unauthorized' });
            return;
        }
        // Autoriser à recommencer = supprimer sa note
        await Grade_1.default.destroy({ where: { evaluationId: id, etudiantId } });
        res.status(200).json({ message: 'Grade deleted successfully, student can retake exam.' });
    }
    catch (error) {
        console.error('Error deleting student grade:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteStudentGrade = deleteStudentGrade;
