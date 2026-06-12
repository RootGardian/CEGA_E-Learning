import { Request, Response } from 'express';
import Course from '../models/Course';
import Module from '../models/Module';
import Lesson from '../models/Lesson';
import CourseAccess from '../models/CourseAccess';
import StudentProgress from '../models/StudentProgress';

export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    // We need to fetch the Etudiant to get the department
    const Etudiant = require('../models/Etudiant').default;
    const etudiant = await Etudiant.findByPk(userId);
    const userDepartment = etudiant?.department;

    const courses = await Course.findAll({
      order: [['id', 'ASC']],
      include: [
        {
          model: Module,
          as: 'modules',
          attributes: ['id'],
          include: [
            {
              model: Lesson,
              as: 'lessons',
              attributes: ['id']
            }
          ]
        }
      ]
    });

    const courseIds = courses.map(course => course.id);
    const accesses = await CourseAccess.findAll({
      where: { courseId: courseIds }
    });

    const progresses = await StudentProgress.findAll({
      where: {
        etudiantId: userId,
        courseId: courseIds,
        isCompleted: true
      }
    });

    const enrichedCourses = courses.map(course => {
      const specificAccess = accesses.find(access => access.courseId == course.id && access.etudiantId == userId);
      const globalAccess = accesses.find(access => access.courseId == course.id && (access.department === userDepartment || access.department === 'all' || course.department === 'all') && access.etudiantId === null);
      const isUnlocked = specificAccess ? specificAccess.isUnlocked : (globalAccess ? globalAccess.isUnlocked : false);

      // Calculate progress
      const completedLessons = progresses.filter(p => p.courseId === course.id).length;
      const courseJson = course.toJSON();
      const totalLessons = courseJson.modules?.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0) || 0;
      const progress = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

      // Remove the large modules array from the response to save bandwidth
      delete courseJson.modules;

      return {
        ...courseJson,
        isUnlocked,
        progress,
        completedLessonsCount: completedLessons,
        totalLessonsCount: totalLessons
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
    const globalAccess = accesses.find(access => (access.department === userDepartment || access.department === 'all' || course.department === 'all') && access.etudiantId === null);
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
    const globalAccess = accesses.find(access => (access.department === userDepartment || access.department === 'all' || course?.department === 'all') && access.etudiantId === null);
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

export const getStudentProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = req.params.courseId;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const progresses = await StudentProgress.findAll({
      where: {
        courseId,
        etudiantId: userId
      }
    });

    res.status(200).json(progresses);
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const saveStudentProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const lessonId = req.params.lessonId;
    const userId = (req as any).user?.id;
    const { courseId, isCompleted, quizScore, progressData } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const [progress, created] = await StudentProgress.findOrCreate({
      where: { etudiantId: userId, lessonId },
      defaults: {
        etudiantId: userId,
        lessonId,
        courseId,
        isCompleted: isCompleted || false,
        quizScore: quizScore || null,
        progressData: progressData || {}
      }
    });

    if (!created) {
      if (isCompleted !== undefined) progress.isCompleted = isCompleted;
      if (quizScore !== undefined) progress.quizScore = quizScore;
      if (progressData !== undefined) progress.progressData = progressData;
      await progress.save();
    }

    res.status(200).json(progress);
  } catch (error) {
    console.error('Save student progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentResources = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    // We need to fetch the Etudiant to get the department
    const Etudiant = require('../models/Etudiant').default;
    const etudiant = await Etudiant.findByPk(userId);
    const userDepartment = etudiant?.department;

    const accesses = await CourseAccess.findAll();
    const courses = await Course.findAll();
    
    const unlockedCourseIds = courses.filter(course => {
      const specificAccess = accesses.find(a => a.courseId == course.id && a.etudiantId == userId);
      const globalAccess = accesses.find(a => a.courseId == course.id && (a.department === userDepartment || a.department === 'all' || course.department === 'all') && a.etudiantId === null);
      return specificAccess ? specificAccess.isUnlocked : (globalAccess ? globalAccess.isUnlocked : false);
    }).map(c => c.id);

    const Resource = require('../models/Resource').default;
    const resources = await Resource.findAll({
      include: [
        {
          model: Lesson,
          as: 'lesson',
          required: true,
          include: [
            {
              model: Module,
              as: 'module',
              required: true,
              where: {
                courseId: unlockedCourseIds
              },
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
    console.error('Get student resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCourseUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id as string);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const Etudiant = require('../models/Etudiant').default;
    const students = await Etudiant.findAll({
      attributes: ['id', 'firstName', 'lastName', 'department']
    });

    const User = require('../models/User').default;
    const teachers = await User.findAll({
      attributes: ['id', 'nom', 'prenom', 'role']
    });

    const formattedUsers = [
      ...students.map((s: any) => ({ id: s.id.toString(), type: 'etudiant', name: `${s.firstName} ${s.lastName}`.trim() || 'Étudiant Anonyme' })),
      ...teachers.map((t: any) => ({ id: t.id.toString(), type: t.role, name: `${t.prenom || ''} ${t.nom || ''}`.trim() || t.role }))
    ];

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Error fetching course users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
