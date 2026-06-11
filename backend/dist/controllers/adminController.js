"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleFormateurBlock = exports.toggleStudentBlock = exports.unassignCourseFromFormateur = exports.assignCourseToFormateur = exports.getFormateurCourses = exports.getCourses = exports.deleteFormateur = exports.updateFormateur = exports.createFormateur = exports.getFormateurs = exports.getDashboardStats = exports.deleteStudent = exports.updateStudent = exports.updateStudentStatus = exports.createStudent = exports.getEnrollments = exports.getStudents = exports.updateSystemSettings = exports.getSystemSettings = void 0;
const stripe_1 = __importDefault(require("stripe"));
const Etudiant_1 = __importDefault(require("../models/Etudiant"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const SystemSetting_1 = __importDefault(require("../models/SystemSetting"));
const Intervenant_1 = __importDefault(require("../models/Intervenant"));
const Course_1 = __importDefault(require("../models/Course"));
const CourseAccess_1 = __importDefault(require("../models/CourseAccess"));
const auth_1 = require("../utils/auth");
const socket_1 = require("../utils/socket");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});
const getSystemSettings = async (req, res) => {
    try {
        const settings = await SystemSetting_1.default.findAll();
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });
        // Valeurs par défaut si absentes
        if (!settingsMap['formationPrice'])
            settingsMap['formationPrice'] = '500';
        if (!settingsMap['exportFormat'])
            settingsMap['exportFormat'] = 'PDF';
        if (!settingsMap['modulePassGrade'])
            settingsMap['modulePassGrade'] = '10';
        if (!settingsMap['theme'])
            settingsMap['theme'] = 'dark';
        if (!settingsMap['siteName'])
            settingsMap['siteName'] = 'CEGA E-Learning';
        if (!settingsMap['supportEmail'])
            settingsMap['supportEmail'] = 'support@cega.edu';
        if (!settingsMap['maintenanceMode'])
            settingsMap['maintenanceMode'] = 'false';
        res.status(200).json(settingsMap);
    }
    catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getSystemSettings = getSystemSettings;
const updateSystemSettings = async (req, res) => {
    try {
        const updates = req.body;
        for (const [key, value] of Object.entries(updates)) {
            let setting = await SystemSetting_1.default.findOne({ where: { key } });
            if (setting) {
                setting.value = String(value);
                await setting.save();
            }
            else {
                await SystemSetting_1.default.create({
                    key,
                    value: String(value),
                    type: 'string'
                });
            }
            // Si on modifie le prix, on doit potentiellement mettre à jour Stripe (ou informer qu'un nouveau Product/Price est requis)
            if (key === 'formationPrice') {
                // Optionnel : créer un nouveau Price Stripe dynamique si vous utilisez Stripe Checkout Session avec un Price ID
                console.log(`Le prix a été mis à jour à ${value} XAF/EUR.`);
            }
        }
        res.status(200).json({ message: 'Settings updated successfully' });
    }
    catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateSystemSettings = updateSystemSettings;
const getStudents = async (req, res) => {
    try {
        const students = await Etudiant_1.default.findAll({
            attributes: { exclude: ['password', 'twoFactorSecret'] },
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(students);
    }
    catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getStudents = getStudents;
const getEnrollments = async (req, res) => {
    try {
        const transactions = await Transaction_1.default.findAll({
            where: { status: 'succeeded' },
            include: [{ model: Etudiant_1.default, attributes: ['firstName', 'lastName', 'email', 'department'] }],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(transactions);
    }
    catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getEnrollments = getEnrollments;
const createStudent = async (req, res) => {
    try {
        const { firstName, lastName, email, password, department } = req.body;
        const existing = await Etudiant_1.default.findOne({ where: { email } });
        if (existing) {
            res.status(400).json({ message: 'Cet email est déjà utilisé.' });
            return;
        }
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        const newStudent = await Etudiant_1.default.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            department,
            subscriptionStatus: 'pending'
        });
        res.status(201).json({ message: 'Étudiant créé avec succès', student: newStudent });
    }
    catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createStudent = createStudent;
const updateStudentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'active', 'expired', 'pending'
        const student = await Etudiant_1.default.findByPk(parseInt(id, 10));
        if (!student) {
            res.status(404).json({ message: 'Étudiant introuvable.' });
            return;
        }
        student.subscriptionStatus = status;
        if (status === 'active') {
            // S'il devient actif, on lui donne 1 an d'accès
            const newExpDate = new Date();
            newExpDate.setFullYear(newExpDate.getFullYear() + 1);
            student.accessExpirationDate = newExpDate;
        }
        else if (status === 'expired' || status === 'pending') {
            student.accessExpirationDate = null;
        }
        await student.save();
        res.status(200).json({ message: 'Statut mis à jour avec succès', student });
    }
    catch (error) {
        console.error('Error updating student status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateStudentStatus = updateStudentStatus;
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, department } = req.body;
        const student = await Etudiant_1.default.findByPk(parseInt(id, 10));
        if (!student) {
            res.status(404).json({ message: 'Étudiant introuvable.' });
            return;
        }
        if (firstName)
            student.firstName = firstName;
        if (lastName)
            student.lastName = lastName;
        if (email)
            student.email = email;
        if (department)
            student.department = department;
        await student.save();
        res.status(200).json({ message: 'Étudiant mis à jour avec succès', student });
    }
    catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateStudent = updateStudent;
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Etudiant_1.default.findByPk(parseInt(id, 10));
        if (!student) {
            res.status(404).json({ message: 'Étudiant introuvable.' });
            return;
        }
        // Optionally delete associated transactions or other records if needed, 
        // or rely on ON DELETE CASCADE in the DB
        await student.destroy();
        res.status(200).json({ message: 'Étudiant supprimé avec succès' });
    }
    catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteStudent = deleteStudent;
const getDashboardStats = async (req, res) => {
    try {
        // Un étudiant est considéré comme inscrit uniquement s'il n'est pas "pending"
        const { Op } = require('sequelize');
        const totalStudents = await Etudiant_1.default.count({
            where: { subscriptionStatus: { [Op.ne]: 'pending' } }
        });
        const activeStudents = await Etudiant_1.default.count({ where: { subscriptionStatus: 'active' } });
        const successfulPayments = await Transaction_1.default.count({ where: { status: 'succeeded' } });
        // Revenue total (somme de toutes les transactions réussies)
        const transactions = await Transaction_1.default.findAll({ where: { status: 'succeeded' } });
        const totalRevenue = transactions.reduce((acc, txn) => acc + (Number(txn.amount) || 0), 0);
        // Calcul des étudiants par département (pour un éventuel graphique), en excluant les pending
        const studentsByDepartment = await Etudiant_1.default.findAll({
            attributes: ['department', [Etudiant_1.default.sequelize.fn('COUNT', Etudiant_1.default.sequelize.col('id')), 'count']],
            where: { subscriptionStatus: { [Op.ne]: 'pending' } },
            group: ['department']
        });
        res.status(200).json({
            totalStudents,
            activeStudents,
            successfulPayments,
            totalRevenue,
            studentsByDepartment
        });
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getDashboardStats = getDashboardStats;
// ==========================================
// FORMATEURS CRUD
// ==========================================
const getFormateurs = async (req, res) => {
    try {
        const formateurs = await Intervenant_1.default.findAll({
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(formateurs);
    }
    catch (error) {
        console.error('Error fetching formateurs:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getFormateurs = getFormateurs;
const createFormateur = async (req, res) => {
    try {
        const { firstName, lastName, email, password, department } = req.body;
        const existing = await Intervenant_1.default.findOne({ where: { email } });
        if (existing) {
            res.status(400).json({ message: 'Cet email est d\u00e9j\u00e0 utilis\u00e9.' });
            return;
        }
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        const newFormateur = await Intervenant_1.default.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            department
        });
        res.status(201).json({ message: 'Formateur cr\u00e9\u00e9 avec succ\u00e8s', formateur: newFormateur });
    }
    catch (error) {
        console.error('Error creating formateur:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createFormateur = createFormateur;
const updateFormateur = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, department } = req.body;
        const formateur = await Intervenant_1.default.findByPk(parseInt(id, 10));
        if (!formateur) {
            res.status(404).json({ message: 'Formateur introuvable.' });
            return;
        }
        if (firstName)
            formateur.firstName = firstName;
        if (lastName)
            formateur.lastName = lastName;
        if (email)
            formateur.email = email;
        if (department)
            formateur.department = department;
        await formateur.save();
        res.status(200).json({ message: 'Formateur mis \u00e0 jour avec succ\u00e8s', formateur });
    }
    catch (error) {
        console.error('Error updating formateur:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateFormateur = updateFormateur;
const deleteFormateur = async (req, res) => {
    try {
        const { id } = req.params;
        const formateur = await Intervenant_1.default.findByPk(parseInt(id, 10));
        if (!formateur) {
            res.status(404).json({ message: 'Formateur introuvable.' });
            return;
        }
        await formateur.destroy();
        res.status(200).json({ message: 'Formateur supprim\u00e9 avec succ\u00e8s' });
    }
    catch (error) {
        console.error('Error deleting formateur:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteFormateur = deleteFormateur;
// ==========================================
// COURSE ASSIGNMENT
// ==========================================
const getCourses = async (req, res) => {
    try {
        const courses = await Course_1.default.findAll({ order: [['title', 'ASC']] });
        res.status(200).json(courses);
    }
    catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getCourses = getCourses;
const getFormateurCourses = async (req, res) => {
    try {
        const { id } = req.params;
        const accesses = await CourseAccess_1.default.findAll({
            where: { unlockedBy: parseInt(id, 10) },
            include: [{ model: Course_1.default, as: 'course', attributes: ['id', 'title', 'department'] }]
        });
        const courses = accesses.map((a) => a.course).filter(Boolean);
        res.status(200).json(courses);
    }
    catch (error) {
        console.error('Error fetching formateur courses:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getFormateurCourses = getFormateurCourses;
const assignCourseToFormateur = async (req, res) => {
    try {
        const { formateurId, courseId } = req.body;
        // Check if already assigned
        const existing = await CourseAccess_1.default.findOne({
            where: { courseId, unlockedBy: formateurId, etudiantId: null, department: null }
        });
        if (existing) {
            res.status(400).json({ message: 'Ce cours est d\u00e9j\u00e0 assign\u00e9 \u00e0 ce formateur.' });
            return;
        }
        await CourseAccess_1.default.create({
            courseId,
            etudiantId: null,
            department: null,
            isUnlocked: true,
            unlockedBy: formateurId
        });
        res.status(201).json({ message: 'Cours assign\u00e9 avec succ\u00e8s' });
    }
    catch (error) {
        console.error('Error assigning course:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.assignCourseToFormateur = assignCourseToFormateur;
const unassignCourseFromFormateur = async (req, res) => {
    try {
        const { formateurId, courseId } = req.body;
        const access = await CourseAccess_1.default.findOne({
            where: { courseId, unlockedBy: formateurId, etudiantId: null, department: null }
        });
        if (!access) {
            res.status(404).json({ message: 'Assignation introuvable.' });
            return;
        }
        await access.destroy();
        res.status(200).json({ message: 'Cours retir\u00e9 avec succ\u00e8s' });
    }
    catch (error) {
        console.error('Error unassigning course:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.unassignCourseFromFormateur = unassignCourseFromFormateur;
const toggleStudentBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        const student = await Etudiant_1.default.findByPk(parseInt(id, 10));
        if (!student) {
            res.status(404).json({ message: 'Étudiant introuvable.' });
            return;
        }
        student.is_active = is_active;
        await student.save();
        if (is_active === false) {
            (0, socket_1.getIO)().to(`user_${student.id}`).emit('force_logout');
        }
        res.status(200).json({ message: `L'accès a été ${is_active ? 'débloqué' : 'bloqué'} avec succès`, student });
    }
    catch (error) {
        console.error('Error toggling student block status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.toggleStudentBlock = toggleStudentBlock;
const toggleFormateurBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        const formateur = await Intervenant_1.default.findByPk(parseInt(id, 10));
        if (!formateur) {
            res.status(404).json({ message: 'Formateur introuvable.' });
            return;
        }
        formateur.is_active = is_active;
        await formateur.save();
        if (is_active === false) {
            (0, socket_1.getIO)().to(`user_${formateur.id}`).emit('force_logout');
        }
        res.status(200).json({ message: `L'accès a été ${is_active ? 'débloqué' : 'bloqué'} avec succès`, formateur });
    }
    catch (error) {
        console.error('Error toggling formateur block status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.toggleFormateurBlock = toggleFormateurBlock;
