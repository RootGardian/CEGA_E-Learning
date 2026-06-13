import { Request, Response } from 'express';
import Stripe from 'stripe';
import Etudiant from '../models/Etudiant';
import Transaction from '../models/Transaction';
import SystemSetting from '../models/SystemSetting';
import Intervenant from '../models/Intervenant';
import Course from '../models/Course';
import CourseAccess from '../models/CourseAccess';
import Module from '../models/Module';
import Lesson from '../models/Lesson';
import Resource from '../models/Resource';
import { hashPassword } from '../utils/auth';
import { getIO } from '../utils/socket';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

export const getSystemSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await SystemSetting.findAll();
    const settingsMap: Record<string, string | null> = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });
    
    // Valeurs par défaut si absentes
    if (!settingsMap['formationPrice']) settingsMap['formationPrice'] = '500';
    if (!settingsMap['exportFormat']) settingsMap['exportFormat'] = 'PDF';
    if (!settingsMap['modulePassGrade']) settingsMap['modulePassGrade'] = '10';
    if (!settingsMap['theme']) settingsMap['theme'] = 'dark';
    if (!settingsMap['siteName']) settingsMap['siteName'] = 'CEGA E-Learning';
    if (!settingsMap['supportEmail']) settingsMap['supportEmail'] = 'support@cega.sn';
    if (!settingsMap['supportPhone']) settingsMap['supportPhone'] = '+221 77 000 00 00';
    if (!settingsMap['supportDescription']) settingsMap['supportDescription'] = "Notre équipe est là pour vous aider. N'hésitez pas à nous contacter si vous rencontrez des problèmes ou si vous avez des questions.";
    if (!settingsMap['supportFormEnabled']) settingsMap['supportFormEnabled'] = 'true';
    if (!settingsMap['maintenanceMode']) settingsMap['maintenanceMode'] = 'false';

    res.status(200).json(settingsMap);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSystemSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const updates = req.body;
    
    for (const [key, value] of Object.entries(updates)) {
      let setting = await SystemSetting.findOne({ where: { key } });
      if (setting) {
        setting.value = String(value);
        await setting.save();
      } else {
        await SystemSetting.create({
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
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { Op } = require('sequelize');
    const students = await Etudiant.findAll({
      where: {
        subscriptionStatus: { [Op.ne]: 'pending' }
      },
      attributes: { exclude: ['password', 'twoFactorSecret'] },
      order: [['created_at', 'DESC']]
    });
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEnrollments = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.findAll({
      where: { status: 'succeeded' },
      include: [{ model: Etudiant, attributes: ['firstName', 'lastName', 'email', 'department'] }],
      order: [['created_at', 'DESC']]
    });
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, department } = req.body;
    
    const lowerEmail = email.toLowerCase().trim();
    const existing = await Etudiant.findOne({ where: { email: lowerEmail } });
    if (existing) {
      res.status(400).json({ message: 'Cet email est déjà utilisé.' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const newStudent = await Etudiant.create({
      firstName,
      lastName,
      email: lowerEmail,
      password: hashedPassword,
      department,
      subscriptionStatus: 'active'
    });

    res.status(201).json({ message: 'Étudiant créé avec succès', student: newStudent });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStudentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active', 'expired', 'pending'
    
    const student = await Etudiant.findByPk(parseInt(id as string, 10));
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
    } else if (status === 'expired' || status === 'pending') {
      student.accessExpirationDate = null;
    }

    await student.save();
    res.status(200).json({ message: 'Statut mis à jour avec succès', student });
  } catch (error) {
    console.error('Error updating student status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStudentFormation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { formationType } = req.body;
    
    const student = await Etudiant.findByPk(parseInt(id as string, 10));
    if (!student) {
      res.status(404).json({ message: 'Étudiant introuvable.' });
      return;
    }

    student.formationType = formationType;
    await student.save();
    res.status(200).json({ message: 'Type de formation mis à jour avec succès', student });
  } catch (error) {
    console.error('Error updating student formation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, department } = req.body;
    
    const student = await Etudiant.findByPk(parseInt(id as string, 10));
    if (!student) {
      res.status(404).json({ message: 'Étudiant introuvable.' });
      return;
    }

    if (firstName) student.firstName = firstName;
    if (lastName) student.lastName = lastName;
    if (email) student.email = email;
    if (department) student.department = department;

    await student.save();
    res.status(200).json({ message: 'Étudiant mis à jour avec succès', student });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const student = await Etudiant.findByPk(parseInt(id as string, 10));
    if (!student) {
      res.status(404).json({ message: 'Étudiant introuvable.' });
      return;
    }

    // Optionally delete associated transactions or other records if needed, 
    // or rely on ON DELETE CASCADE in the DB
    await student.destroy();
    
    res.status(200).json({ message: 'Étudiant supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCourseStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { Op } = require('sequelize');
    const courseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const Course = require('../models/Course').default;
    const course = await Course.findByPk(courseId as string);
    
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    let whereCondition: any = { subscriptionStatus: { [Op.ne]: 'pending' } };
    if (course.department !== 'all') {
      whereCondition.department = course.department;
    }

    const students = await Etudiant.findAll({
      where: whereCondition,
      attributes: ['id', 'firstName', 'lastName', 'email', 'department', 'formationType']
    });

    res.status(200).json({ students });
  } catch (error) {
    console.error('getCourseStudents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Un étudiant est considéré comme inscrit uniquement s'il n'est pas "pending"
    const { Op } = require('sequelize');
    const totalStudents = await Etudiant.count({
      where: { subscriptionStatus: { [Op.ne]: 'pending' } }
    });
    const activeStudents = await Etudiant.count({ where: { subscriptionStatus: 'active' } });
    const successfulPayments = await Transaction.count({ where: { status: 'succeeded' } });
    
    // Revenue total (somme de toutes les transactions réussies)
    const transactions = await Transaction.findAll({ where: { status: 'succeeded' } });
    const totalRevenue = transactions.reduce((acc, txn) => acc + (Number(txn.amount) || 0), 0);

    // Calcul des étudiants par département (pour un éventuel graphique), en excluant les pending
    const studentsByDepartment = await Etudiant.findAll({
      attributes: ['department', [Etudiant.sequelize!.fn('COUNT', Etudiant.sequelize!.col('id')), 'count']],
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
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==========================================
// FORMATEURS CRUD
// ==========================================

export const getFormateurs = async (req: Request, res: Response): Promise<void> => {
  try {
    const formateurs = await Intervenant.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });
    res.status(200).json(formateurs);
  } catch (error) {
    console.error('Error fetching formateurs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createFormateur = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, department } = req.body;
    
    const existing = await Intervenant.findOne({ where: { email } });
    if (existing) {
      res.status(400).json({ message: 'Cet email est d\u00e9j\u00e0 utilis\u00e9.' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const newFormateur = await Intervenant.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      department
    });

    res.status(201).json({ message: 'Formateur cr\u00e9\u00e9 avec succ\u00e8s', formateur: newFormateur });
  } catch (error) {
    console.error('Error creating formateur:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateFormateur = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, department } = req.body;
    
    const formateur = await Intervenant.findByPk(parseInt(id as string, 10));
    if (!formateur) {
      res.status(404).json({ message: 'Formateur introuvable.' });
      return;
    }

    if (firstName) formateur.firstName = firstName;
    if (lastName) formateur.lastName = lastName;
    if (email) formateur.email = email;
    if (department) formateur.department = department;

    await formateur.save();
    res.status(200).json({ message: 'Formateur mis \u00e0 jour avec succ\u00e8s', formateur });
  } catch (error) {
    console.error('Error updating formateur:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteFormateur = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const formateur = await Intervenant.findByPk(parseInt(id as string, 10));
    if (!formateur) {
      res.status(404).json({ message: 'Formateur introuvable.' });
      return;
    }

    await formateur.destroy();
    res.status(200).json({ message: 'Formateur supprim\u00e9 avec succ\u00e8s' });
  } catch (error) {
    console.error('Error deleting formateur:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==========================================
// COURSE ASSIGNMENT
// ==========================================

export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await Course.findAll({ order: [['title', 'ASC']] });
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFormateurCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const accesses = await CourseAccess.findAll({
      where: { unlockedBy: parseInt(id as string, 10) },
      include: [{ model: Course, as: 'course', attributes: ['id', 'title', 'department'] }]
    });
    const courses = accesses.map((a: any) => a.course).filter(Boolean);
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching formateur courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const assignCourseToFormateur = async (req: Request, res: Response): Promise<void> => {
  try {
    const { formateurId, courseId } = req.body;
    
    // Check if already assigned
    const existing = await CourseAccess.findOne({
      where: { courseId, unlockedBy: formateurId, etudiantId: null, department: null }
    });
    if (existing) {
      res.status(400).json({ message: 'Ce cours est d\u00e9j\u00e0 assign\u00e9 \u00e0 ce formateur.' });
      return;
    }

    await CourseAccess.create({
      courseId,
      etudiantId: null,
      department: null,
      isUnlocked: true,
      unlockedBy: formateurId
    });

    res.status(201).json({ message: 'Cours assign\u00e9 avec succ\u00e8s' });
  } catch (error) {
    console.error('Error assigning course:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const unassignCourseFromFormateur = async (req: Request, res: Response): Promise<void> => {
  try {
    const { formateurId, courseId } = req.body;
    
    const access = await CourseAccess.findOne({
      where: { courseId, unlockedBy: formateurId, etudiantId: null, department: null }
    });
    if (!access) {
      res.status(404).json({ message: 'Assignation introuvable.' });
      return;
    }

    await access.destroy();
    res.status(200).json({ message: 'Cours retir\u00e9 avec succ\u00e8s' });
  } catch (error) {
    console.error('Error unassigning course:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleStudentBlock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const student = await Etudiant.findByPk(parseInt(id as string, 10));
    if (!student) {
      res.status(404).json({ message: 'Étudiant introuvable.' });
      return;
    }
    student.is_active = is_active;
    await student.save();
    
    if (is_active === false) {
      getIO().to(`user_${student.id}`).emit('force_logout');
    }
    
    res.status(200).json({ message: `L'accès a été ${is_active ? 'débloqué' : 'bloqué'} avec succès`, student });
  } catch (error) {
    console.error('Error toggling student block status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleFormateurBlock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const formateur = await Intervenant.findByPk(parseInt(id as string, 10));
    if (!formateur) {
      res.status(404).json({ message: 'Formateur introuvable.' });
      return;
    }
    formateur.is_active = is_active;
    await formateur.save();
    
    if (is_active === false) {
      getIO().to(`user_${formateur.id}`).emit('force_logout');
    }
    
    res.status(200).json({ message: `L'accès a été ${is_active ? 'débloqué' : 'bloqué'} avec succès`, formateur });
  } catch (error) {
    console.error('Error toggling formateur block status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==========================================
// GRADES (Toutes les notes pour l'admin)
// ==========================================

export const getAllGrades = async (req: Request, res: Response): Promise<void> => {
  try {
    const Grade = require('../models/Grade').default;
    const Etudiant = require('../models/Etudiant').default;
    const Evaluation = require('../models/Evaluation').default;

    const grades = await Grade.findAll({
      include: [
        { model: Etudiant, as: 'etudiant', attributes: ['id', 'firstName', 'lastName', 'email', 'department'] },
        { model: Evaluation, as: 'evaluation', attributes: ['id', 'title'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(grades);
  } catch (error) {
    console.error('Error fetching all grades:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// ==========================================
// RESOURCES
// ==========================================

export const getResources = async (req: Request, res: Response): Promise<void> => {
  try {
    const resources = await Resource.findAll({
      include: [
        {
          model: Lesson,
          as: 'lesson',
          include: [
            {
              model: Module,
              as: 'module',
              include: [
                {
                  model: Course,
                  as: 'course',
                  attributes: ['id', 'title', 'department']
                }
              ]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addResource = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, url, lessonId } = req.body;
    
    if (!title || !url || !lessonId) {
      res.status(400).json({ message: 'Titre, URL et séance (lesson) sont requis.' });
      return;
    }

    const resource = await Resource.create({ title, url, lessonId });
    res.status(201).json({ message: 'Ressource ajoutée avec succès.', resource });
  } catch (error) {
    console.error('Error adding resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteResource = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByPk(parseInt(id as string, 10));
    
    if (!resource) {
      res.status(404).json({ message: 'Ressource introuvable.' });
      return;
    }

    await resource.destroy();
    res.status(200).json({ message: 'Ressource supprimée avec succès.' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCourseStructure = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Course ID
    const course = await Course.findByPk(parseInt(id as string, 10), {
      include: [
        {
          model: Module,
          as: 'modules',
          include: [
            {
              model: Lesson,
              as: 'lessons'
            }
          ]
        }
      ],
      order: [
        [{ model: Module, as: 'modules' }, 'order', 'ASC'],
        [{ model: Module, as: 'modules' }, { model: Lesson, as: 'lessons' }, 'order', 'ASC']
      ]
    });

    if (!course) {
      res.status(404).json({ message: 'Cours introuvable.' });
      return;
    }

    res.status(200).json(course);
  } catch (error) {
    console.error('Error fetching course structure:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
