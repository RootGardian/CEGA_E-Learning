import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { Calendar, Plus, Edit, Trash2, BookOpen, ClipboardList, X, MoreVertical, Settings, Users, Lock, Unlock, Shield } from 'lucide-react';
import { usePopup } from '../contexts/PopupContext';

interface Evaluation {
  id: number;
  title: string;
  type: string;
  description: string;
  date: string;
  duration: string;
  documentLink?: string;
  courseId: number;
  isGlobal?: boolean;
  targetStudentId?: number | null;
  targetStudent?: { id: number; firstName: string; lastName: string };
  course?: { id: number; title: string; department?: string };
  qcmQuestions?: number[];
  status?: string;
}

interface CourseStudent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  formationType?: string;
  isUnlocked?: boolean;
}

interface GradeData {
  etudiantId: number;
  name: string;
  score: number | string;
  feedback: string;
}

interface Course {
  id: number;
  title: string;
  department?: string;
}

const AdminEvaluations: React.FC = () => {
  useOutletContext();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { showAlert, showConfirm } = usePopup();

  // Tabs state
  const [activeTab, setActiveTab] = useState<'access' | 'evaluations'>('evaluations');

  // Evaluaton Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Examen Final',
    description: '',
    date: '',
    duration: '',
    documentLink: '',
    courseId: '',
    isGlobal: true,
    targetStudentId: '',
    qcmQuestions: [] as number[]
  });

  const [courseStudents, setCourseStudents] = useState<CourseStudent[]>([]);

  // States for Grading Modal
  const [gradesModalEval, setGradesModalEval] = useState<Evaluation | null>(null);
  const [gradesData, setGradesData] = useState<GradeData[]>([]);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [gradesSearch, setGradesSearch] = useState('');

  // States for QCM Modal
  const [isQcmModalOpen, setIsQcmModalOpen] = useState(false);
  const [activeQcmEvalId, setActiveQcmEvalId] = useState<number | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [qcmSaving, setQcmSaving] = useState(false);
  
  // Menu state
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Access Control States
  const [selectedAccessCourse, setSelectedAccessCourse] = useState<Course | null>(null);
  const [accessStudents, setAccessStudents] = useState<CourseStudent[]>([]);
  const [globalUnlocked, setGlobalUnlocked] = useState(false);
  const [loadingAccessStudents, setLoadingAccessStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchEvaluations = async () => {
    try {
      const res = await axios.get('/api/evaluations/teacher', { withCredentials: true });
      const commonEvals = res.data.filter((ev: Evaluation) => ev.course && ev.course.department === 'all');
      setEvaluations(commonEvals);
    } catch (err) {
      console.error('Erreur chargement évaluations:', err);
      showAlert('Erreur lors du chargement des évaluations.', 'error');
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/api/admin/courses', { withCredentials: true });
      const commonCourses = res.data.filter((c: Course) => c.department === 'all');
      setCourses(commonCourses);
    } catch (err) {
      console.error('Erreur chargement cours:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchEvaluations(), fetchCourses()]);
      setLoading(false);
    };
    init();
  }, []);

  // Use admin endpoints for evaluation target students
  useEffect(() => {
    if (formData.courseId && !formData.isGlobal) {
      const fetchEvalStudents = async () => {
        try {
          const res = await axios.get(`/api/admin/courses/${formData.courseId}/students`, { withCredentials: true });
          setCourseStudents(res.data.students || res.data); // Support both structures
        } catch (err) {
          console.error('Erreur chargement etudiants du cours:', err);
        }
      };
      fetchEvalStudents();
    }
  }, [formData.courseId, formData.isGlobal]);

  /* ====================================================
     ACCESS CONTROL LOGIC
  ==================================================== */
  const fetchAccessData = async (courseId: number) => {
    setLoadingAccessStudents(true);
    try {
      const res = await axios.get(`/api/admin/courses/${courseId}/students`, { withCredentials: true });
      setAccessStudents(res.data.students || res.data);
      setGlobalUnlocked(res.data.globalUnlocked || false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAccessStudents(false);
    }
  };

  const handleSelectAccessCourse = (course: Course) => {
    setSelectedAccessCourse(course);
    setStudentSearch('');
    fetchAccessData(course.id);
  };

  const handleGlobalToggle = async (isUnlocked: boolean) => {
    if (!selectedAccessCourse) return;
    try {
      await axios.post(`/api/admin/courses/${selectedAccessCourse.id}/unlock-global`, { isUnlocked }, { withCredentials: true });
      fetchAccessData(selectedAccessCourse.id);
    } catch (err) {
      console.error(err);
      showAlert('Erreur lors de la modification de l\'accès global', 'error');
    }
  };

  const handleStudentToggle = async (etudiantId: number, targetStatus: boolean) => {
    if (!selectedAccessCourse) return;
    try {
      await axios.post(`/api/admin/courses/${selectedAccessCourse.id}/unlock-student`, {
        etudiantId,
        isUnlocked: targetStatus
      }, { withCredentials: true });
      setAccessStudents(accessStudents.map(s => s.id === etudiantId ? { ...s, isUnlocked: targetStatus } : s));
    } catch (err) {
      console.error(err);
      showAlert('Erreur lors de la modification de l\'accès étudiant', 'error');
    }
  };

  /* ====================================================
     EVALUATION LOGIC
  ==================================================== */
  const handleOpenModal = (evaluation?: Evaluation) => {
    if (evaluation) {
      setEditingId(evaluation.id);
      setFormData({
        title: evaluation.title,
        type: evaluation.type,
        description: evaluation.description || '',
        date: evaluation.date ? new Date(evaluation.date).toISOString().slice(0, 16) : '',
        duration: evaluation.duration || '',
        documentLink: evaluation.documentLink || '',
        courseId: evaluation.courseId.toString(),
        isGlobal: evaluation.isGlobal !== false,
        targetStudentId: evaluation.targetStudentId ? evaluation.targetStudentId.toString() : '',
        qcmQuestions: evaluation.qcmQuestions || []
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        type: 'Examen Final',
        description: '',
        date: '',
        duration: '',
        documentLink: '',
        courseId: courses.length > 0 ? courses[0].id.toString() : '',
        isGlobal: true,
        targetStudentId: '',
        qcmQuestions: []
      });
    }
    setIsModalOpen(true);
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    
    if (val.length >= 3) {
      val = val.substring(0, 2) + ':' + val.substring(2);
    }
    setFormData({ ...formData, duration: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        courseId: parseInt(formData.courseId, 10),
        targetStudentId: !formData.isGlobal && formData.targetStudentId ? parseInt(formData.targetStudentId, 10) : null
      };

      if (editingId) {
        await axios.put(`/api/evaluations/${editingId}`, payload, { withCredentials: true });
        showAlert('Évaluation modifiée avec succès.', 'success');
      } else {
        await axios.post('/api/evaluations', payload, { withCredentials: true });
        showAlert('Évaluation créée avec succès.', 'success');
      }
      setIsModalOpen(false);
      fetchEvaluations();
    } catch (err) {
      console.error('Erreur sauvegarde évaluation:', err);
      showAlert('Erreur lors de la sauvegarde.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = await showConfirm('Supprimer cette évaluation ?');
    if (!confirm) return;

    try {
      await axios.delete(`/api/evaluations/${id}`, { withCredentials: true });
      showAlert('Évaluation supprimée.', 'success');
      fetchEvaluations();
    } catch (err) {
      console.error('Erreur suppression:', err);
      showAlert('Erreur lors de la suppression.', 'error');
    }
  };

  const handleOpenGradesModal = async (evaluation: Evaluation) => {
    setGradesLoading(true);
    setGradesModalEval(evaluation);
    
    try {
      const res = await axios.get(`/api/evaluations/${evaluation.id}/grades`, { withCredentials: true });
      const studentsData = res.data;
      
      const formattedGrades = studentsData.map((item: any) => ({
        etudiantId: item.etudiant.id,
        name: `${item.etudiant.firstName} ${item.etudiant.lastName}`,
        score: item.grade ? item.grade.score : '',
        feedback: item.grade ? item.grade.feedback : ''
      }));
      
      setGradesData(formattedGrades);
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
      showAlert('Erreur lors du chargement des notes.', 'error');
    } finally {
      setGradesLoading(false);
    }
  };

  const handleGradeChange = (etudiantId: number, field: 'score' | 'feedback', value: string) => {
    setGradesData(prev => prev.map(g => {
      if (g.etudiantId === etudiantId) {
        return { ...g, [field]: value };
      }
      return g;
    }));
  };

  const handleSaveGrades = async () => {
    if (!gradesModalEval) return;
    
    try {
      await axios.put(`/api/evaluations/${gradesModalEval.id}/grades`, { grades: gradesData }, { withCredentials: true });
      showAlert('Notes sauvegardées avec succès.', 'success');
      setGradesModalEval(null);
    } catch (error) {
      console.error('Erreur sauvegarde notes:', error);
      showAlert('Erreur lors de la sauvegarde des notes.', 'error');
    }
  };

  const handleDeleteStudentGrade = async (etudiantId: number) => {
    if (!gradesModalEval) return;
    const confirm = await showConfirm("Confirmez-vous la suppression de la note pour cet étudiant ? Il pourra recommencer l'évaluation.");
    if (!confirm) return;

    try {
      await axios.delete(`/api/evaluations/${gradesModalEval.id}/grades/${etudiantId}`, { withCredentials: true });
      showAlert('Note supprimée avec succès.', 'success');
      
      setGradesData(prev => prev.map(g => {
        if (g.etudiantId === etudiantId) {
          return { ...g, score: '', feedback: '' };
        }
        return g;
      }));
    } catch (error) {
      console.error('Erreur suppression note étudiant:', error);
      showAlert('Erreur lors de la suppression de la note.', 'error');
    }
  };

  const handleValidateGrades = async (evalId: number) => {
    const confirm = await showConfirm("Êtes-vous sûr de vouloir valider les notes ? Cela publiera définitivement les résultats et supprimera les questions de la base de données.");
    if (!confirm) return;

    try {
      await axios.post(`/api/evaluations/${evalId}/validate`, {}, { withCredentials: true });
      showAlert('Notes validées et évaluation clôturée.', 'success');
      fetchEvaluations();
    } catch (error) {
      console.error('Erreur validation notes:', error);
      showAlert('Erreur lors de la validation des notes.', 'error');
    }
  };

  const handleOpenQcmModal = (evaluation: Evaluation) => {
    setActiveQcmEvalId(evaluation.id);
    setIsQcmModalOpen(true);
    setExcelFile(null);
  };

  const downloadExcelTemplate = async () => {
    try {
      const response = await axios.get('/api/evaluations/excel/template', {
        withCredentials: true,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Modele_Questions_CEGA.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      showAlert('Erreur lors du téléchargement du modèle.', 'error');
    }
  };

  const handleExcelUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelFile || !activeQcmEvalId) {
      showAlert('Veuillez sélectionner un fichier Excel.', 'error');
      return;
    }

    setQcmSaving(true);
    const formData = new FormData();
    formData.append('file', excelFile);

    try {
      const response = await axios.post(`/api/evaluations/${activeQcmEvalId}/upload-questions`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showAlert(`${response.data.questionsCount} questions importées avec succès.`, 'success');
      setIsQcmModalOpen(false);
      fetchEvaluations();
    } catch (error) {
      console.error('Erreur import Excel:', error);
      showAlert('Erreur lors de l\'importation du fichier Excel.', 'error');
    } finally {
      setQcmSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Chargement...</div>;
  }

  return (
    <div className="dashboard-content animate-fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Gestion des Cours Communs
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Gérez l'accès aux cours et planifiez les évaluations.
          </p>
        </div>
        {activeTab === 'evaluations' && (
          <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
            <Plus size={20} /> Nouvelle Évaluation
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('evaluations')}
          style={{
            background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer',
            color: activeTab === 'evaluations' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'evaluations' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            fontWeight: activeTab === 'evaluations' ? 600 : 400
          }}
        >
          Évaluations
        </button>
        <button
          onClick={() => setActiveTab('access')}
          style={{
            background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer',
            color: activeTab === 'access' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'access' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            fontWeight: activeTab === 'access' ? 600 : 400
          }}
        >
          Contrôle d'Accès
        </button>
      </div>

      {activeTab === 'evaluations' && (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {evaluations.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>
              Aucune évaluation programmée.
            </div>
          ) : (
            evaluations.map(ev => (
              <div key={ev.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-secondary)', padding: '0.2rem 0.5rem', border: '1px solid var(--accent-secondary)' }}>
                    {ev.type}
                  </span>
                  {ev.isGlobal === false && ev.targetStudent && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning)', padding: '0.2rem 0.5rem', border: '1px solid var(--warning)' }} title="Rattrapage">
                      Rattrapage : {ev.targetStudent.firstName} {ev.targetStudent.lastName}
                    </span>
                  )}
                  {ev.documentLink && (
                    <a href={ev.documentLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', padding: '0.2rem 0.5rem', border: '1px solid var(--border-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--bg-secondary)' }} title="Lien des ressources">
                      <BookOpen size={12} /> Ressources
                    </a>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === ev.id ? null : ev.id);
                      }} 
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem' }}
                    >
                      <MoreVertical size={20} />
                    </button>

                    {activeMenuId === ev.id && (
                      <div className="glass-panel animate-fade-in" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', minWidth: '220px', zIndex: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <button 
                          onClick={() => { setActiveMenuId(null); handleOpenGradesModal(ev); }} 
                          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'none', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                        >
                          <ClipboardList size={16} /> Saisir les notes
                        </button>
                        {ev.status !== 'validated' && (
                          <button 
                            onClick={() => { setActiveMenuId(null); handleOpenModal(ev); }} 
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'none', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                          >
                            <Edit size={16} /> Modifier l'évaluation
                          </button>
                        )}
                        {ev.type === "QCM (En ligne sur l'application)" && ev.status !== 'validated' && (
                          <>
                            {!(new Date(ev.date).getTime() + (ev.duration ? (parseInt(ev.duration.split(':')[0] || '0') * 60 + parseInt(ev.duration.split(':')[1] || '0')) * 60000 : 0) < new Date().getTime()) && (
                              <button 
                                onClick={() => { setActiveMenuId(null); handleOpenQcmModal(ev); }} 
                                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'none', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                              >
                                <Settings size={16} /> Importer Questions (Excel)
                              </button>
                            )}
                            <button 
                              onClick={() => { setActiveMenuId(null); handleValidateGrades(ev.id); }} 
                              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'none', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--success)', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                            >
                              <ClipboardList size={16} /> Valider les notes
                            </button>
                          </>
                        )}

                        <button 
                          onClick={() => { setActiveMenuId(null); handleDelete(ev.id); }} 
                          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                        >
                          <Trash2 size={16} /> Supprimer l'évaluation
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{ev.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <BookOpen size={14} /> {ev.course?.title || 'Cours inconnu'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <Calendar size={14} /> {new Date(ev.date).toLocaleString('fr-FR')} {ev.duration ? `(${ev.duration})` : ''}
                </div>
                {ev.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    {ev.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'access' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          {/* Liste des cours communs */}
          <div className="glass-panel" style={{ flex: '1 1 min(100%, 300px)', padding: 'clamp(1rem, 3vw, 1.5rem)', width: '100%' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Cours Communs</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {courses.map(course => (
                <div
                  key={course.id}
                  onClick={() => handleSelectAccessCourse(course)}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '8px',
                    border: `1px solid ${selectedAccessCourse?.id === course.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    backgroundColor: selectedAccessCourse?.id === course.id ? 'rgba(var(--accent-primary-rgb), 0.05)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
                    <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', margin: '0 0 0.5rem 0', lineHeight: 1.4, wordBreak: 'break-word' }}>{course.title}</h3>
                  </div>
                </div>
              ))}
              {courses.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Aucun cours commun disponible.</p>}
            </div>
          </div>

          {/* Détails du cours sélectionné */}
          {selectedAccessCourse ? (
            <div style={{ flex: '2 1 min(100%, 400px)', display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0, width: '100%' }}>

              {/* Actions Globales */}
              <div className="glass-panel" style={{ padding: 'clamp(1rem, 4vw, 2rem)' }}>
                <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', lineHeight: 1.3, wordBreak: 'break-word' }}>
                  {selectedAccessCourse.title}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={18} /> Déblocage Global
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                      Autoriser l'accès à ce cours pour tous les étudiants.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => handleGlobalToggle(true)} 
                        disabled={globalUnlocked}
                        className={`btn ${!globalUnlocked ? 'btn-primary' : ''}`} 
                        style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem', opacity: globalUnlocked ? 0.5 : 1, cursor: globalUnlocked ? 'not-allowed' : 'pointer', backgroundColor: globalUnlocked ? 'var(--bg-secondary)' : '', color: globalUnlocked ? 'var(--text-secondary)' : '' }}>
                        <Unlock size={16} /> Débloquer pour tous
                      </button>
                      <button 
                        onClick={() => handleGlobalToggle(false)} 
                        disabled={!globalUnlocked}
                        className={`btn ${globalUnlocked ? 'btn-secondary' : ''}`} 
                        style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem', opacity: !globalUnlocked ? 0.5 : 1, cursor: !globalUnlocked ? 'not-allowed' : 'pointer', backgroundColor: !globalUnlocked ? 'var(--bg-secondary)' : '', color: !globalUnlocked ? 'var(--text-secondary)' : '' }}>
                        <Lock size={16} /> Restreindre
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des étudiants (Déblocage individuel) */}
              <div className="glass-panel" style={{ padding: 'clamp(1rem, 4vw, 2rem)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>Déblocage Individuel</h2>
                  <input 
                    type="text" 
                    placeholder="Rechercher..." 
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      minWidth: '250px'
                    }}
                  />
                </div>

                {loadingAccessStudents ? (
                  <p style={{ color: 'var(--text-secondary)' }}>Chargement des étudiants...</p>
                ) : (
                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                          <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Étudiant</th>
                          <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Email</th>
                          <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Statut d'Accès</th>
                          <th style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accessStudents.filter(s => 
                          s.firstName?.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          s.lastName?.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          s.email?.toLowerCase().includes(studentSearch.toLowerCase())
                        ).map(student => (
                          <tr key={student.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                              {student.firstName} {student.lastName}
                            </td>
                            <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{student.email}</td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                backgroundColor: student.isUnlocked ? 'rgba(var(--accent-primary-rgb), 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: student.isUnlocked ? 'var(--success)' : 'var(--error)',
                                fontSize: '0.85rem',
                                fontWeight: 600
                              }}>
                                {student.isUnlocked ? 'Autorisé' : 'Bloqué'}
                              </span>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button 
                                  onClick={() => handleStudentToggle(student.id, true)} 
                                  disabled={student.isUnlocked}
                                  style={{ 
                                    padding: '0.4rem 0.8rem', 
                                    border: '1px solid var(--success)', 
                                    backgroundColor: student.isUnlocked ? 'var(--bg-secondary)' : 'rgba(var(--success-rgb), 0.1)',
                                    color: student.isUnlocked ? 'var(--text-secondary)' : 'var(--success)',
                                    borderRadius: '6px',
                                    cursor: student.isUnlocked ? 'not-allowed' : 'pointer',
                                    opacity: student.isUnlocked ? 0.5 : 1
                                  }}
                                >
                                  Débloquer
                                </button>
                                <button 
                                  onClick={() => handleStudentToggle(student.id, false)} 
                                  disabled={!student.isUnlocked}
                                  style={{ 
                                    padding: '0.4rem 0.8rem', 
                                    border: '1px solid var(--error)', 
                                    backgroundColor: !student.isUnlocked ? 'var(--bg-secondary)' : 'rgba(var(--error-rgb), 0.1)',
                                    color: !student.isUnlocked ? 'var(--text-secondary)' : 'var(--error)',
                                    borderRadius: '6px',
                                    cursor: !student.isUnlocked ? 'not-allowed' : 'pointer',
                                    opacity: !student.isUnlocked ? 0.5 : 1
                                  }}
                                >
                                  Bloquer
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {accessStudents.length === 0 && (
                          <tr>
                            <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                              Aucun étudiant trouvé.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ flex: '2 1 min(100%, 400px)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center' }}>
              <Shield size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Sélectionnez un cours commun pour gérer son accès</p>
            </div>
          )}
        </div>
      )}

      {/* Evaluations Modals */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', paddingTop: 'max(1rem, 80px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>
                {editingId ? "Modifier l'évaluation" : "Nouvelle évaluation"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Titre de l'évaluation</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="input-field" 
                  required
                  placeholder="Ex: Examen Final - Semestre 1"
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Cours Commun</label>
                <select 
                  value={formData.courseId} 
                  onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                  className="input-field"
                  required
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                >
                  {courses.length === 0 && <option value="">Aucun cours disponible</option>}
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Type d'évaluation</label>
                <select 
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="input-field"
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                >
                  <option value="Examen Final">Examen Final (sur papier)</option>
                  <option value="Contrôle Continu">Contrôle Continu</option>
                  <option value="Projet">Projet Pratique</option>
                  <option value="QCM (En ligne sur l'application)">QCM (En ligne sur l'application)</option>
                </select>
              </div>

              {formData.type !== "QCM (En ligne sur l'application)" && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Lien des ressources / Sujet (Optionnel)</label>
                  <input 
                    type="url" 
                    value={formData.documentLink} 
                    onChange={(e) => setFormData({...formData, documentLink: e.target.value})}
                    className="input-field"
                    placeholder="https://drive.google.com/..."
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                  />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Lien Drive ou autre contenant le sujet de l'examen.</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Date et Heure</label>
                  <input 
                    type="datetime-local" 
                    value={formData.date} 
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="input-field" 
                    required
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Durée (HH:MM)</label>
                  <input 
                    type="text" 
                    value={formData.duration} 
                    onChange={handleDurationChange}
                    className="input-field" 
                    placeholder="02:30"
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Cible</label>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <input type="radio" checked={formData.isGlobal} onChange={() => setFormData({...formData, isGlobal: true, targetStudentId: ''})} />
                    Toute la promotion
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <input type="radio" checked={!formData.isGlobal} onChange={() => setFormData({...formData, isGlobal: false})} />
                    Étudiant spécifique (Rattrapage)
                  </label>
                </div>
                
                {!formData.isGlobal && (
                  <select 
                    value={formData.targetStudentId} 
                    onChange={(e) => setFormData({...formData, targetStudentId: e.target.value})}
                    className="input-field"
                    required
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                  >
                    <option value="">Sélectionner un étudiant</option>
                    {courseStudents.map(s => (
                      <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Description / Consignes</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field" 
                  rows={3}
                  placeholder="Calculatrice autorisée, documents interdits..."
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Mettre à jour' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grades Modal */}
      {gradesModalEval && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', paddingTop: 'max(1rem, 80px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '800px', padding: '2rem', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>Saisie des notes</h2>
                <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>{gradesModalEval.title}</p>
              </div>
              <button onClick={() => setGradesModalEval(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <input 
              type="text" 
              placeholder="Rechercher un étudiant..." 
              value={gradesSearch}
              onChange={(e) => setGradesSearch(e.target.value)}
              className="input-field"
              style={{ marginBottom: '1.5rem', padding: '0.75rem', width: '100%', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
            />

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
              {gradesLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Chargement des étudiants...</div>
              ) : gradesData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Aucun étudiant inscrit à ce cours.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Étudiant</th>
                      <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Note (/20)</th>
                      <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Commentaire (Optionnel)</th>
                      <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradesData
                      .filter(g => g.name.toLowerCase().includes(gradesSearch.toLowerCase()))
                      .map(grade => (
                      <tr key={grade.etudiantId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{grade.name}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <input 
                            type="number" 
                            min="0" max="20" step="0.25"
                            value={grade.score}
                            onChange={(e) => handleGradeChange(grade.etudiantId, 'score', e.target.value)}
                            style={{ width: '80px', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                          />
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <input 
                            type="text" 
                            value={grade.feedback}
                            placeholder="Bon travail..."
                            onChange={(e) => handleGradeChange(grade.etudiantId, 'feedback', e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                          />
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {grade.score !== '' && (
                            <button 
                              onClick={() => handleDeleteStudentGrade(grade.etudiantId)}
                              style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}
                              title="Autoriser à recommencer (Supprime la note)"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setGradesModalEval(null)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSaveGrades} disabled={gradesLoading}>Enregistrer les notes</button>
            </div>
          </div>
        </div>
      )}

      {/* QCM Modal */}
      {isQcmModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', paddingTop: 'max(1rem, 80px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>Importer un QCM</h2>
              <button onClick={() => setIsQcmModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                1. Téléchargez le modèle Excel.<br/>
                2. Remplissez vos questions.<br/>
                3. Importez le fichier complété ci-dessous.
              </p>
              <button 
                onClick={downloadExcelTemplate}
                className="btn btn-secondary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <ClipboardList size={18} /> Télécharger le Modèle Excel
              </button>
            </div>

            <form onSubmit={handleExcelUpload}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Fichier complété (.xlsx)</label>
                <input 
                  type="file" 
                  accept=".xlsx, .xls"
                  onChange={(e) => setExcelFile(e.target.files ? e.target.files[0] : null)}
                  className="input-field" 
                  required
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsQcmModalOpen(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={qcmSaving || !excelFile}>
                  {qcmSaving ? 'Importation...' : 'Importer les questions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvaluations;
