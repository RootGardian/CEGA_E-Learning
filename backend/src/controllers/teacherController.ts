import { Request, Response } from 'express';
import Course from '../models/Course';
import Etudiant from '../models/Etudiant';
import CourseAccess from '../models/CourseAccess';
import Notification from '../models/Notification';
import { getIO } from '../utils/socket';

// Obtenir les stats du dashboard
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const Intervenant = require('../models/Intervenant').default;
    const teacher = await Intervenant.findByPk((req as any).user.id);
    if (!teacher) {
      res.status(404).json({ message: 'Teacher not found' });
      return;
    }

    const courseCount = await Course.count({ where: { department: teacher.department } });
    const studentCount = await Etudiant.count({ where: { department: teacher.department } });

    res.status(200).json({ courses: courseCount, students: studentCount });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Obtenir la liste des cours de l'enseignant (selon son département)
export const getTeacherCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const teacherDept = (req as any).user.department; // We need to make sure user in request has department, wait, `req.user` only has `{ id, role }` from JWT.
    
    // We should fetch the teacher
    const Intervenant = require('../models/Intervenant').default;
    const teacher = await Intervenant.findByPk((req as any).user.id);
    if (!teacher) {
      res.status(404).json({ message: 'Teacher not found' });
      return;
    }

    const courses = await Course.findAll({
      where: { department: teacher.department },
      order: [['id', 'ASC']]
    });

    res.status(200).json(courses);
  } catch (error) {
    console.error('getTeacherCourses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Obtenir les étudiants et leur accès pour un cours donné
export const getCourseStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const course = await Course.findByPk(courseId as string);
    
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Tous les étudiants du même département que le cours
    const students = await Etudiant.findAll({
      where: { department: course.department },
      attributes: ['id', 'firstName', 'lastName', 'email', 'department']
    });

    const accesses = await CourseAccess.findAll({
      where: { courseId }
    });

    const globalAccessStatus = accesses.find(a => a.department === course.department && a.etudiantId === null);
    const globalUnlocked = globalAccessStatus ? globalAccessStatus.isUnlocked : false;

    // Construire la réponse combinée
    const result = students.map(student => {
      // Un étudiant a accès si :
      // - Il y a un accès global pour le département
      // - OU il y a un accès spécifique pour lui
      const globalAccess = accesses.find(a => a.department === student.department && a.etudiantId === null);
      const specificAccess = accesses.find(a => a.etudiantId === student.id);
      
      const isUnlocked = specificAccess
        ? specificAccess.isUnlocked
        : (globalAccess ? globalAccess.isUnlocked : false);

      return {
        ...student.toJSON(),
        isUnlocked
      };
    });

    res.status(200).json({
      students: result,
      globalUnlocked
    });
  } catch (error) {
    console.error('getCourseStudents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Déblocage / Blocage global
export const toggleGlobalAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { isUnlocked } = req.body;
    const teacherId = (req as any).user.id;

    const course = await Course.findByPk(courseId as string);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    let access = await CourseAccess.findOne({
      where: { courseId, department: course.department, etudiantId: null }
    });

    if (access) {
      access.isUnlocked = isUnlocked;
      access.unlockedBy = teacherId;
      await access.save();
    } else {
      await CourseAccess.create({
        courseId,
        department: course.department,
        etudiantId: null,
        isUnlocked,
        unlockedBy: teacherId
      });
    }

    if (isUnlocked) {
      const studentsInDept = await Etudiant.findAll({ where: { department: course.department } });
      const notifications = studentsInDept.map(student => ({
        etudiantId: student.id,
        title: 'Nouveau cours disponible',
        message: `Le cours "${course.title}" a été débloqué pour votre promotion.`,
        type: 'success'
      }));
      await Notification.bulkCreate(notifications);
      getIO().to(`dept_${course.department}`).emit('new_notification');
    }
    
    getIO().to(`dept_${course.department}`).emit('course_updated');

    res.status(200).json({ message: 'Global access updated' });
  } catch (error) {
    console.error('toggleGlobalAccess error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Déblocage / Blocage individuel
export const toggleStudentAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { etudiantId, isUnlocked } = req.body;
    const teacherId = (req as any).user.id;

    let access = await CourseAccess.findOne({
      where: { courseId, etudiantId }
    });

    if (access) {
      access.isUnlocked = isUnlocked;
      access.unlockedBy = teacherId;
      await access.save();
    } else {
      await CourseAccess.create({
        courseId,
        etudiantId,
        isUnlocked,
        unlockedBy: teacherId
      });
    }

    const course = await Course.findByPk(courseId as string);

    if (isUnlocked && course) {
      await Notification.create({
        etudiantId,
        title: 'Accès exceptionnel accordé',
        message: `L'accès au cours "${course.title}" vous a été accordé.`,
        type: 'success'
      });
      getIO().to(`user_${etudiantId}`).emit('new_notification');
    }

    getIO().to(`user_${etudiantId}`).emit('course_updated');

    res.status(200).json({ message: 'Student access updated' });
  } catch (error) {
    console.error('toggleStudentAccess error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Blocage d'urgence du cours
export const emergencyLock = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { isLocked } = req.body;

    const course = await Course.findByPk(courseId as string);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    course.isLocked = isLocked;
    await course.save();

    res.status(200).json({ message: 'Emergency lock updated', isLocked });
  } catch (error) {
    console.error('emergencyLock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
