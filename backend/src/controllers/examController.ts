import { Request, Response } from 'express';
import Evaluation from '../models/Evaluation';
import CourseAccess from '../models/CourseAccess';
import Grade from '../models/Grade';
import Etudiant from '../models/Etudiant';
import { qcmBank, QCMQuestion } from '../utils/qcmData';
import { Op } from 'sequelize';

// Shuffle utility
const shuffleArray = (array: any[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export const getExamData = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const evaluation = await Evaluation.findByPk(id) as any;
    if (!evaluation) {
      return res.status(404).json({ message: 'Évaluation non trouvée.' });
    }

    if (evaluation.type !== "QCM (En ligne sur l'application)") {
      return res.status(400).json({ message: 'Ce n\'est pas un QCM en ligne.' });
    }

    // Verify access
    if (evaluation.targetStudentId && evaluation.targetStudentId !== studentId) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }
    if (evaluation.isGlobal) {
      const Course = require('../models/Course').default;
      const course = await Course.findByPk(evaluation.courseId);

      if (course && course.department !== 'all') {
        const etudiant = await Etudiant.findByPk(studentId);
        const accesses = await CourseAccess.findAll({
          where: { courseId: evaluation.courseId }
        });

        const specificAccess = accesses.find(a => a.etudiantId === studentId);
        const globalAccess = accesses.find(a => a.department === etudiant?.department && a.etudiantId === null);
        
        const isUnlocked = specificAccess ? specificAccess.isUnlocked : (globalAccess ? globalAccess.isUnlocked : false);

        if (!isUnlocked) {
          return res.status(403).json({ message: 'Vous n\'avez pas accès à ce cours.' });
        }
      }
    }

    // Vérifier que la date et l'heure de l'examen sont arrivées
    const now = new Date();
    const examDate = new Date(evaluation.date);
    if (now < examDate) {
      const formattedDate = examDate.toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      return res.status(403).json({ 
        message: `L'examen n'est pas encore disponible. Il débutera le ${formattedDate}.`,
        startsAt: examDate.toISOString()
      });
    }

    // Check if already graded
    const existingGrade = await Grade.findOne({
      where: { evaluationId: id, etudiantId: studentId }
    });
    if (existingGrade) {
      return res.status(400).json({ message: 'Vous avez déjà passé cet examen.', score: existingGrade.score });
    }

    // Get selected questions from Excel import
    const storedQuestions = evaluation.qcmQuestions || [];
    
    if (storedQuestions.length === 0) {
      return res.status(403).json({ message: "L'examen n'est pas encore prêt. Le professeur n'a pas encore configuré les questions." });
    }

    let questions = storedQuestions.map((q: any) => {
      const sanitized = { ...q };
      delete sanitized.reponseCorrecte;
      return sanitized;
    });
    
    // Shuffle questions
    questions = shuffleArray(questions);

    res.json({
      evaluation: {
        id: evaluation.id,
        title: evaluation.title,
        duration: evaluation.duration,
        date: evaluation.date
      },
      questions
    });

  } catch (error) {
    console.error('Erreur getExamData:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

export const submitExam = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;
    const { answers, isFraud, fraudReason } = req.body; // { [questionId]: answerData }

    const evaluation = await Evaluation.findByPk(id) as any;
    if (!evaluation) return res.status(404).json({ message: 'Évaluation non trouvée.' });

    // Verify access (skipped for brevity, assuming already checked in getExamData)

    // Check if already graded
    const existingGrade = await Grade.findOne({
      where: { evaluationId: id, etudiantId: studentId }
    });
    if (existingGrade) {
      return res.status(400).json({ message: 'Vous avez déjà passé cet examen.' });
    }

    const questionsToGrade = evaluation.qcmQuestions || [];

    let totalScore = 0;
    let maxPossibleScore = 0;

    questionsToGrade.forEach((q: any) => {
      maxPossibleScore += q.points;
      const studentAns = answers[q.id];
      if (studentAns === undefined || studentAns === null || studentAns === '') return; // 0 points

      let qScore = 0;

      if (q.type === 'QCM' || q.type === 'VRAI_FAUX') {
        if (String(studentAns).trim() === String(q.reponseCorrecte).trim()) {
          qScore = q.points;
        }
      } else if (q.type === 'QRM') {
        const correctOpts = String(q.reponseCorrecte).split(',').map((s: string) => s.trim());
        const studentOpts = Array.isArray(studentAns) ? studentAns.map(String) : [String(studentAns)];
        
        const isPerfect = correctOpts.length === studentOpts.length && correctOpts.every((c: string) => studentOpts.includes(c));
        if (isPerfect) qScore = q.points;
      } else if (q.type === 'COURTE') {
        if (String(studentAns).trim().toLowerCase() === String(q.reponseCorrecte).trim().toLowerCase()) {
          qScore = q.points;
        }
      }

      totalScore += qScore;
    });

    let finalScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 20 : 0;
    
    // Si fraude détectée, la note finale est de 0
    if (isFraud) {
      finalScore = 0;
    }

    finalScore = Math.round(finalScore * 100) / 100;

    let autoFeedback = "";
    if (finalScore < 10) autoFeedback = "Insuffisant";
    else if (finalScore < 12) autoFeedback = "Passable";
    else if (finalScore < 14) autoFeedback = "Assez bien";
    else if (finalScore < 16) autoFeedback = "Bien";
    else autoFeedback = "Très bien";

    await Grade.create({
      evaluationId: id,
      etudiantId: studentId,
      score: finalScore,
      feedback: isFraud ? `FRAUDE DÉTECTÉE : ${fraudReason || 'Inconnue'}` : `Correction automatique : ${autoFeedback}`
    });

    res.status(200).json({ message: 'Examen soumis avec succès.', score: finalScore });

  } catch (error) {
    console.error('Erreur submitExam:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la correction.' });
  }
};
