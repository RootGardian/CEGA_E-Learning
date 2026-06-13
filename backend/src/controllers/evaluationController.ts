import { Request, Response } from 'express';
import Evaluation from '../models/Evaluation';
import Course from '../models/Course';
import Intervenant from '../models/Intervenant';
import CourseAccess from '../models/CourseAccess';
import Notification from '../models/Notification';
import Grade from '../models/Grade';
import Etudiant from '../models/Etudiant';
import { getIO } from '../utils/socket';
import { Op } from 'sequelize';
import * as xlsx from 'xlsx';

const notifyStudentsForCourse = async (courseId: number, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  try {
    const course = await Course.findByPk(courseId);
    if (!course) return;

    const Etudiant = require('../models/Etudiant').default;
    let studentsToNotify;

    if (course.department === 'all') {
      studentsToNotify = await Etudiant.findAll();
    } else {
      const accesses = await CourseAccess.findAll({ where: { courseId, isUnlocked: true } });
      const specificStudentIds = accesses.filter(a => a.etudiantId).map(a => a.etudiantId);
      const globalDepartments = accesses.filter(a => a.department && !a.etudiantId).map(a => a.department);

      studentsToNotify = await Etudiant.findAll({
        where: {
          [Op.or]: [
            { id: specificStudentIds },
            { department: globalDepartments }
          ]
        }
      });
    }

    if (studentsToNotify.length === 0) return;

    const notifications = studentsToNotify.map((student: any) => ({
      etudiantId: student.id,
      title,
      message,
      type
    }));

    await Notification.bulkCreate(notifications);

    const io = getIO();
    studentsToNotify.forEach((student: any) => {
      io.to(`user_${student.id}`).emit('new_notification', {
        title,
        message,
        type,
        createdAt: new Date()
      });
    });
  } catch (error) {
    console.error('Error notifying students:', error);
  }
};

const notifyStudent = async (etudiantId: number, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  try {
    await Notification.create({ etudiantId, title, message, type });
    const io = getIO();
    io.to(`user_${etudiantId}`).emit('new_notification', { title, message, type, createdAt: new Date() });
  } catch (err) {
    console.error('Error notifying specific student:', err);
  }
};

export const getStudentEvaluations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const Etudiant = require('../models/Etudiant').default;
    const etudiant = await Etudiant.findByPk(userId);
    const userDepartment = etudiant?.department;

    // Get all courses the student has access to
    const courses = await Course.findAll();
    const courseIds = courses.map(c => c.id);
    const accesses = await CourseAccess.findAll({
      where: { courseId: courseIds }
    });

    const unlockedCourseIds = courses.filter(course => {
      if (course.department === 'all') return true;
      const specificAccess = accesses.find(a => a.courseId == course.id && a.etudiantId == userId);
      const globalAccess = accesses.find(a => 
        a.courseId == course.id && 
        (a.department === userDepartment || (course.department === 'all' && a.department === null)) && 
        a.etudiantId === null
      );
      return specificAccess ? specificAccess.isUnlocked : (globalAccess ? globalAccess.isUnlocked : false);
    }).map(c => c.id);

    // Fetch evaluations for these courses
    const evaluations = await Evaluation.findAll({
      where: {
        courseId: unlockedCourseIds,
        [Op.or]: [
          { isGlobal: true },
          { targetStudentId: userId }
        ]
      },
      include: [
        { model: Course, as: 'course', attributes: ['id', 'title'] },
        { model: Grade, as: 'grades', attributes: ['etudiantId', 'score', 'feedback'] }
      ],
      order: [['date', 'ASC']]
    });

    const result = evaluations.map((ev: any) => {
      const grades = ev.grades || [];
      const studentGradeObj = grades.find((g: any) => g.etudiantId === userId);
      
      let average = null;
      if (grades.length > 0) {
        const scoredGrades = grades.filter((g: any) => g.score !== null && g.score !== undefined && g.score !== '');
        if (scoredGrades.length > 0) {
          const total = scoredGrades.reduce((sum: number, g: any) => sum + Number(g.score), 0);
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
  } catch (error) {
    console.error('Error fetching student evaluations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTeacherEvaluations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req as any).user?.role;
    const intervenantId = (req as any).user?.id;
    
    // If admin, they can see all evaluations? 
    // Wait, let's keep where: { intervenantId } if we want them to see what they created.
    // Actually, maybe admin should see ALL evaluations! Let's allow admin to see all evaluations.
    const whereClause: any = userRole === 'enseignant' ? { intervenantId } : {};

    const evaluations = await Evaluation.findAll({
      where: whereClause,
      include: [
        { model: Course, as: 'course', attributes: ['id', 'title', 'department'] },
        { model: Etudiant, as: 'targetStudent', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['date', 'ASC']]
    });

    let result = evaluations;
    if (userRole === 'enseignant') {
      result = evaluations.filter((ev: any) => ev.course && ev.course.department !== 'all');
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching teacher evaluations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createEvaluation = async (req: Request, res: Response): Promise<void> => {
  try {
    const intervenantId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { title, type, description, date, duration, courseId, documentLink, isGlobal, targetStudentId } = req.body;

    const course = await Course.findByPk(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    if (course.department === 'all' && userRole !== 'admin' && userRole !== 'directeur_formation') {
      res.status(403).json({ message: "Seul l'administrateur peut évaluer les cours communs." });
      return;
    }

    let finalIntervenantId = intervenantId;
    if (userRole === 'admin' || userRole === 'directeur_formation') {
      const User = require('../models/User').default;
      const Intervenant = require('../models/Intervenant').default;
      
      const dfUser = await User.findOne({ where: { role: 'directeur_formation' } });
      if (!dfUser) {
        res.status(400).json({ message: "Action impossible : aucun profil Directeur de Formation n'est configuré dans le système." });
        return;
      }

      let adminIntervenant = await Intervenant.findOne({ where: { email: dfUser.email } });
      if (!adminIntervenant) {
        adminIntervenant = await Intervenant.create({
          firstName: dfUser.prenom || 'Directeur',
          lastName: dfUser.nom || 'Formation',
          email: dfUser.email,
          password: 'dummy_password_no_login',
          department: 'all',
          is_active: false
        });
      }
      finalIntervenantId = adminIntervenant.id;
    }

    const evaluation = await Evaluation.create({
      title,
      type,
      description,
      date,
      duration,
      courseId,
      intervenantId: finalIntervenantId,
      documentLink,
      isGlobal: isGlobal !== undefined ? isGlobal : true,
      targetStudentId: isGlobal === false ? targetStudentId : null
    });

    // Notify students
    const courseTitle = course ? course.title : 'votre cours';
    
    if (evaluation.isGlobal) {
      await notifyStudentsForCourse(
        courseId,
        `Nouvelle Évaluation : ${title}`,
        `Une nouvelle évaluation a été programmée pour le cours "${courseTitle}". Date : ${new Date(date).toLocaleString('fr-FR')}`,
        'info'
      );
    } else if (evaluation.targetStudentId) {
      await notifyStudent(
        evaluation.targetStudentId,
        `Nouvelle Évaluation de Rattrapage : ${title}`,
        `Une évaluation spécifique vous a été programmée pour le cours "${courseTitle}". Date : ${new Date(date).toLocaleString('fr-FR')}`,
        'info'
      );
    }

    res.status(201).json(evaluation);
  } catch (error: any) {
    console.error('Error creating evaluation:', error);
    require('fs').writeFileSync('eval_error.txt', error.toString() + '\n' + (error.stack || '') + '\n' + JSON.stringify(error, null, 2));
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const updateEvaluation = async (req: Request, res: Response): Promise<void> => {
  try {
    const intervenantId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { id } = req.params;
    const { title, type, description, date, duration, courseId, documentLink, isGlobal, targetStudentId } = req.body;

    const whereClause: any = { id };
    if (userRole === 'enseignant') {
      whereClause.intervenantId = intervenantId;
    }

    const evaluation = await Evaluation.findOne({ where: whereClause }) as any;
    if (!evaluation) {
      res.status(404).json({ message: 'Evaluation not found or unauthorized' });
      return;
    }

    const isNewDateFuture = new Date(date) > new Date();
    const newStatus = (evaluation.status === 'validated' && isNewDateFuture) ? 'published' : evaluation.status || 'draft';

    await evaluation.update({
      title,
      type,
      description,
      date,
      duration,
      courseId,
      documentLink,
      isGlobal: isGlobal !== undefined ? isGlobal : true,
      targetStudentId: isGlobal === false ? targetStudentId : null,
      status: newStatus
    });

    const course = await Course.findByPk(courseId);
    const courseTitle = course ? course.title : 'votre cours';
    
    if (evaluation.isGlobal) {
      await notifyStudentsForCourse(
        courseId,
        `Évaluation Modifiée : ${title}`,
        `L'évaluation "${title}" pour le cours "${courseTitle}" a été modifiée. Nouvelle date : ${new Date(date).toLocaleString('fr-FR')}`,
        'warning'
      );
    } else if (evaluation.targetStudentId) {
      await notifyStudent(
        evaluation.targetStudentId,
        `Évaluation Modifiée : ${title}`,
        `L'évaluation spécifique "${title}" pour le cours "${courseTitle}" a été modifiée. Nouvelle date : ${new Date(date).toLocaleString('fr-FR')}`,
        'warning'
      );
    }

    res.status(200).json(evaluation);
  } catch (error) {
    console.error('Error updating evaluation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateQcmConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const intervenantId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { id } = req.params;
    const { qcmQuestions } = req.body;

    const whereClause: any = { id };
    if (userRole === 'enseignant') {
      whereClause.intervenantId = intervenantId;
    }

    const evaluation = await Evaluation.findOne({ where: whereClause }) as any;
    if (!evaluation) {
      res.status(404).json({ message: 'Evaluation not found or unauthorized' });
      return;
    }

    await evaluation.update({ qcmQuestions });
    res.status(200).json(evaluation);
  } catch (error) {
    console.error('Error updating QCM config:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteEvaluation = async (req: Request, res: Response): Promise<void> => {
  try {
    const intervenantId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { id } = req.params;

    const whereClause: any = { id };
    if (userRole === 'enseignant') {
      whereClause.intervenantId = intervenantId;
    }

    const evaluation = await Evaluation.findOne({ where: whereClause });
    if (!evaluation) {
      res.status(404).json({ message: 'Evaluation not found or unauthorized' });
      return;
    }

    const evalTitle = (evaluation as any).title;
    const courseId = (evaluation as any).courseId;
    await evaluation.destroy();

    const course = await Course.findByPk(courseId);
    const courseTitle = course ? course.title : 'un de vos cours';
    await notifyStudentsForCourse(
      courseId,
      `Évaluation Annulée : ${evalTitle}`,
      `L'évaluation "${evalTitle}" pour le cours "${courseTitle}" a été annulée.`,
      'info'
    );

    res.status(200).json({ message: 'Evaluation deleted successfully' });
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEvaluationGrades = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const intervenantId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    
    const whereClauseId: any = { id };
    if (userRole === 'enseignant') {
      whereClauseId.intervenantId = intervenantId;
    }

    const evaluation = await Evaluation.findOne({ where: whereClauseId });
    if (!evaluation) {
      res.status(404).json({ message: 'Evaluation not found or unauthorized' });
      return;
    }

    const courseId = evaluation.courseId;
    const course = await Course.findByPk(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    if (course.department === 'all' && userRole !== 'admin' && userRole !== 'directeur_formation') {
      res.status(403).json({ message: "Seul l'administrateur peut voir les notes des cours communs." });
      return;
    }

    let teacherDept: string | null = null;
    if (userRole === 'enseignant') {
      const Intervenant = require('../models/Intervenant').default;
      const teacher = await Intervenant.findByPk(intervenantId);
      if (teacher) teacherDept = teacher.department;
    }

    const accesses = await CourseAccess.findAll({ where: { courseId, isUnlocked: true } });
    const specificStudentIds = accesses.filter(a => a.etudiantId).map(a => a.etudiantId);
    const globalDepartments = accesses.filter(a => a.department && !a.etudiantId).map(a => a.department);

    if (course.department && course.department !== 'all' && !globalDepartments.includes(course.department)) {
      globalDepartments.push(course.department);
    }

    const Etudiant = require('../models/Etudiant').default;
    
    let whereClause: any = {
      subscriptionStatus: { [Op.ne]: 'pending' }
    };

    if (course.department !== 'all') {
      whereClause[Op.or] = [
        { id: specificStudentIds },
        { department: globalDepartments }
      ];
    }

    if (userRole === 'enseignant' && teacherDept) {
      whereClause.department = teacherDept;
    }

    const students = await Etudiant.findAll({
      where: whereClause,
      attributes: ['id', 'firstName', 'lastName', 'email', 'department']
    });

    const grades = await Grade.findAll({ where: { evaluationId: id } });

    const results = students.map((student: any) => {
      const studentGrade = grades.find(g => g.etudiantId === student.id);
      return {
        etudiant: student,
        grade: studentGrade || null
      };
    });

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const saveEvaluationGrades = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const intervenantId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { grades } = req.body; 
    const whereClause: any = { id };
    if (userRole === 'enseignant') {
      whereClause.intervenantId = intervenantId;
    }
    
    const evaluation = await Evaluation.findOne({ where: whereClause });
    if (!evaluation) {
      res.status(404).json({ message: 'Evaluation not found or unauthorized' });
      return;
    }

    for (const g of grades) {
      // Allow clearing grade if score is empty/null
      const scoreToSave = (g.score === '' || g.score === null || g.score === undefined) ? null : parseFloat(g.score);

      const existing = await Grade.findOne({ where: { evaluationId: id, etudiantId: g.etudiantId } });
      let wasUpdated = false;

      if (existing) {
        if (existing.score !== scoreToSave) {
          await existing.update({ score: scoreToSave, feedback: g.feedback });
          wasUpdated = true;
        } else {
          await existing.update({ feedback: g.feedback });
        }
      } else if (scoreToSave !== null || g.feedback) {
        await Grade.create({ evaluationId: id, etudiantId: g.etudiantId, score: scoreToSave, feedback: g.feedback });
        wasUpdated = true;
      }

      if (wasUpdated && scoreToSave !== null) {
        // We notify the student that a grade was published
        const course = await Course.findByPk(evaluation.courseId);
        const courseTitle = course ? course.title : 'Cours inconnu';
        await notifyStudent(
          g.etudiantId,
          'Nouvelle Note Publiée',
          `Votre note pour l'évaluation "${evaluation.title}" (${courseTitle}) a été publiée : ${scoreToSave}`,
          'success'
        );
      }
    }

    res.status(200).json({ message: 'Grades saved successfully' });
  } catch (error) {
    console.error('Error saving grades:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteEvaluationGrades = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const intervenantId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    
    const whereClause: any = { id };
    if (userRole === 'enseignant') {
      whereClause.intervenantId = intervenantId;
    }

    const evaluation = await Evaluation.findOne({ where: whereClause });
    if (!evaluation) {
      res.status(404).json({ message: 'Evaluation not found or unauthorized' });
      return;
    }

    await Grade.destroy({ where: { evaluationId: id } });
    
    res.status(200).json({ message: 'Grades deleted successfully' });
  } catch (error) {
    console.error('Error deleting grades:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fraud Alerts
export const getFraudAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const intervenantId = (req as any).user?.id;
    
    // On trouve toutes les notes (Grades) de cet intervenant dont le feedback commence par 'FRAUDE'
    const grades = await Grade.findAll({
      where: { 
        feedback: { [Op.like]: 'FRAUDE D%TECT%E%' },
        createdAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      },
      include: [
        { 
          model: Evaluation,
          as: 'evaluation',
          where: { intervenantId }, 
          attributes: ['id', 'title'] 
        },
        { 
          model: Etudiant,
          as: 'etudiant',
          attributes: ['id', 'firstName', 'lastName', 'email'] 
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(grades);
  } catch (error) {
    console.error('Error fetching fraud alerts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteStudentGrade = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, etudiantId } = req.params;
    const intervenantId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    
    const whereClause: any = { id };
    if (userRole === 'enseignant') {
      whereClause.intervenantId = intervenantId;
    }

    const evaluation = await Evaluation.findOne({ where: whereClause });
    if (!evaluation) {
      res.status(404).json({ message: 'Evaluation not found or unauthorized' });
      return;
    }

    // Autoriser à recommencer = supprimer sa note
    await Grade.destroy({ where: { evaluationId: id, etudiantId } });

    if ((evaluation as any).status === 'validated') {
      await (evaluation as any).update({ status: 'published' });
    }
    
    res.status(200).json({ message: 'Grade deleted successfully, student can retake exam.' });
  } catch (error) {
    console.error('Error deleting student grade:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const generateExcelTemplate = (req: Request, res: Response) => {
  try {
    const ws_data = [
      ['TYPE_QUESTION', 'QUESTION', 'POINTS', 'OPTION_1', 'OPTION_2', 'OPTION_3', 'OPTION_4', 'OPTION_5', 'REPONSE_CORRECTE'],
      ['QCM', 'Quelle est la capitale de la France ?', 2, 'Londres', 'Paris', 'Berlin', 'Madrid', '', '2'],
      ['QRM', 'Quels sont des langages Web ?', 2, 'HTML', 'Python', 'CSS', 'C++', '', '1,3'],
      ['VRAI_FAUX', 'Le soleil tourne autour de la terre.', 1, 'Vrai', 'Faux', '', '', '', '2'],
      ['COURTE', 'En quelle année a eu lieu la révolution française ?', 2, '', '', '', '', '', '1789'],
    ];

    const ws = xlsx.utils.aoa_to_sheet(ws_data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Questions");

    const excelBuffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="Modele_Questions_CEGA.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const uploadQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const intervenantId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'Aucun fichier fourni' });
      return;
    }

    const whereClause: any = { id };
    if (userRole === 'enseignant') {
      whereClause.intervenantId = intervenantId;
    }

    const evaluation = await Evaluation.findOne({ where: whereClause }) as any;
    if (!evaluation) {
      res.status(404).json({ message: 'Evaluation not found or unauthorized' });
      return;
    }

    const wb = xlsx.read(file.buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(ws);

    const questions = data.map((row: any, index: number) => {
      const type = row['TYPE_QUESTION']?.toUpperCase();
      const question = row['QUESTION'];
      const points = parseFloat(row['POINTS']) || 1;
      const options = [
        row['OPTION_1'],
        row['OPTION_2'],
        row['OPTION_3'],
        row['OPTION_4'],
        row['OPTION_5']
      ].filter(o => o !== undefined && o !== null && o !== '');
      const reponseCorrecte = String(row['REPONSE_CORRECTE']);

      return {
        id: index + 1,
        type,
        question,
        points,
        options,
        reponseCorrecte
      };
    });

    await evaluation.update({ qcmQuestions: questions, status: 'published' });

    res.status(200).json({ message: 'Questions importées avec succès', questionsCount: questions.length });
  } catch (error) {
    console.error('Error uploading questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const validateGrades = async (req: Request, res: Response): Promise<void> => {
  try {
    const intervenantId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { id } = req.params;

    const whereClause: any = { id };
    if (userRole === 'enseignant') {
      whereClause.intervenantId = intervenantId;
    }

    const evaluation = await Evaluation.findOne({ where: whereClause }) as any;
    if (!evaluation) {
      res.status(404).json({ message: 'Evaluation not found or unauthorized' });
      return;
    }

    await evaluation.update({ 
      status: 'validated'
    });

    res.status(200).json({ message: 'Notes validées avec succès' });
  } catch (error) {
    console.error('Error validating grades:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
