import { Request, Response } from 'express';
import Course from '../models/Course';
import Module from '../models/Module';
import Lesson from '../models/Lesson';
import CourseAccess from '../models/CourseAccess';

export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    // We need to fetch the Etudiant to get the department
    const Etudiant = require('../models/Etudiant').default;
    const etudiant = await Etudiant.findByPk(userId);
    const userDepartment = etudiant?.department;

    const courses = await Course.findAll({
      order: [['id', 'ASC']]
    });

    const courseIds = courses.map(course => course.id);
    const accesses = await CourseAccess.findAll({
      where: { courseId: courseIds }
    });

    const enrichedCourses = courses.map(course => {
      const specificAccess = accesses.find(access => access.courseId == course.id && access.etudiantId == userId);
      const globalAccess = accesses.find(access => access.courseId == course.id && access.department === userDepartment && access.etudiantId === null);
      const isUnlocked = specificAccess ? specificAccess.isUnlocked : (globalAccess ? globalAccess.isUnlocked : false);

      return {
        ...course.toJSON(),
        isUnlocked
      };
    });

    res.status(200).json(enrichedCourses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCourseDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    
    // Check access
    const Etudiant = require('../models/Etudiant').default;
    const etudiant = await Etudiant.findByPk(userId);
    const userDepartment = etudiant?.department;

    const course = await Course.findByPk(courseId as string, {
      include: [
        {
          model: Module,
          as: 'modules',
          include: [
            {
              model: Lesson,
              as: 'lessons',
              attributes: ['id', 'title', 'order'] // Don't send content here for performance
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
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    if (course.isLocked && userRole !== 'enseignant') {
      res.status(403).json({ message: 'This course is locked by the administration.' });
      return;
    }

    if (userRole === 'enseignant') {
      res.status(200).json({ ...course.toJSON(), isUnlocked: true });
      return;
    }

    const accesses = await CourseAccess.findAll({ where: { courseId: course.id } });
    const specificAccess = accesses.find(access => access.etudiantId == userId);
    const globalAccess = accesses.find(access => access.department === userDepartment && access.etudiantId === null);
    const isUnlocked = specificAccess ? specificAccess.isUnlocked : (globalAccess ? globalAccess.isUnlocked : false);

    if (!isUnlocked) {
      res.status(403).json({ message: 'You do not have access to this course.' });
      return;
    }

    res.status(200).json({ ...course.toJSON(), isUnlocked });
  } catch (error) {
    console.error('Get course details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const lessonId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const lesson = await Lesson.findByPk(lessonId);

    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }

    // We need to verify access for this student
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const Etudiant = require('../models/Etudiant').default;
    const etudiant = await Etudiant.findByPk(userId);
    const userDepartment = etudiant?.department;
    
    // We need to find the course for this lesson
    const Module = require('../models/Module').default;
    const module = await Module.findByPk(lesson.moduleId);
    if (!module) {
      res.status(404).json({ message: 'Module not found' });
      return;
    }
    const courseId = module.courseId;

    const course = await Course.findByPk(courseId);
    
    
    if (course?.isLocked && userRole !== 'enseignant') {
      res.status(403).json({ message: 'This course is locked.' });
      return;
    }

    if (userRole === 'enseignant') {
      res.status(200).json(lesson);
      return;
    }

    const accesses = await CourseAccess.findAll({ where: { courseId } });
    const specificAccess = accesses.find(access => access.etudiantId == userId);
    const globalAccess = accesses.find(access => access.department === userDepartment && access.etudiantId === null);
    const isUnlocked = specificAccess ? specificAccess.isUnlocked : (globalAccess ? globalAccess.isUnlocked : false);

    if (!isUnlocked) {
      res.status(403).json({ message: 'You do not have access to this course.' });
      return;
    }

    res.status(200).json(lesson);
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
