import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { Calendar, Plus, Edit, Trash2, BookOpen, ClipboardList, X, MoreVertical, Settings } from 'lucide-react';
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
  course?: { id: number; title: string };
  qcmQuestions?: number[];
  status?: string;
}

interface CourseStudent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
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

const TeacherEvaluations: React.FC = () => {
  useOutletContext();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { showAlert, showConfirm } = usePopup();

  // Form state
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

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchEvaluations = async () => {
    try {
      const res = await axios.get('/api/evaluations/teacher', { withCredentials: true });
      setEvaluations(res.data);
    } catch (err) {
      console.error('Erreur chargement évaluations:', err);
      showAlert('Erreur lors du chargement des évaluations.', 'error');
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/api/teacher/courses', { withCredentials: true });
      const filteredCourses = res.data.filter((c: Course) => c.department !== 'all');
      setCourses(filteredCourses);
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

  useEffect(() => {
    if (formData.courseId && !formData.isGlobal) {
      const fetchStudents = async () => {
        try {
          const res = await axios.get(`/api/teacher/courses/${formData.courseId}/students`, { withCredentials: true });
          setCourseStudents(res.data.students);
        } catch (err) {
          console.error('Erreur chargement etudiants du cours:', err);
        }
      };
      fetchStudents();
    }
  }, [formData.courseId, formData.isGlobal]);

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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
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
    if (!formData.courseId || !formData.title || !formData.date) {
      showAlert('Veuillez remplir les champs obligatoires.', 'error');
      return;
    }
    
    if (!formData.isGlobal && !formData.targetStudentId) {
      showAlert('Veuillez sélectionner un étudiant pour le rattrapage.', 'error');
      return;
    }

    try {
      const payload = {
        ...formData,
        targetStudentId: !formData.isGlobal ? parseInt(formData.targetStudentId) : null
      };

      if (editingId) {
        await axios.put(`/api/evaluations/${editingId}`, payload, { withCredentials: true });
        showAlert('Évaluation mise à jour avec succès.', 'success');
      } else {
        await axios.post('/api/evaluations', payload, { withCredentials: true });
        showAlert('Évaluation créée avec succès.', 'success');
      }
      fetchEvaluations();
      handleCloseModal();
    } catch (err) {
      console.error('Erreur form evaluation:', err);
      showAlert('Erreur lors de l\'enregistrement.', 'error');
    }
  };

  const handleOpenQcmModal = (ev: Evaluation) => {
    setActiveQcmEvalId(ev.id);
    setExcelFile(null);
    setIsQcmModalOpen(true);
  };

  const handleCloseQcmModal = () => {
    setIsQcmModalOpen(false);
    setActiveQcmEvalId(null);
    setExcelFile(null);
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get('/api/evaluations/excel/template', {
        responseType: 'blob',
        withCredentials: true
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Modele_Questions_CEGA.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Erreur telechargement modele:', err);
      showAlert('Erreur lors du téléchargement du modèle.', 'error');
    }
  };

  const handleQcmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQcmEvalId || !excelFile) {
      showAlert('Veuillez sélectionner un fichier Excel.', 'error');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', excelFile);

    setQcmSaving(true);
    try {
      const res = await axios.post(`/api/evaluations/${activeQcmEvalId}/upload-questions`, formData, { 
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true 
      });
      showAlert(`${res.data.questionsCount} questions importées avec succès.`, 'success');
      fetchEvaluations();
      handleCloseQcmModal();
    } catch (err) {
      console.error('Erreur upload excel:', err);
      showAlert('Erreur lors de l\'importation des questions.', 'error');
    } finally {
      setQcmSaving(false);
    }
  };

  const handleOpenGradesModal = async (evaluation: Evaluation) => {
    setGradesModalEval(evaluation);
    setGradesSearch('');
    setGradesLoading(true);
    try {
      const res = await axios.get(`/api/evaluations/${evaluation.id}/grades`, { withCredentials: true });
      const mappedData = res.data.map((item: { etudiant: { id: number; firstName: string; lastName: string }; grade?: { score: number; feedback: string } }) => ({
        etudiantId: item.etudiant.id,
        name: `${item.etudiant.firstName} ${item.etudiant.lastName}`,
        score: item.grade?.score ?? '',
        feedback: item.grade?.feedback ?? ''
      }));
      setGradesData(mappedData);
    } catch (err) {
      console.error('Erreur chargement notes:', err);
      showAlert('Erreur lors du chargement des notes.', 'error');
    } finally {
      setGradesLoading(false);
    }
  };

  const handleSaveGrades = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradesModalEval) return;
    try {
      await axios.put(`/api/evaluations/${gradesModalEval.id}/grades`, { grades: gradesData }, { withCredentials: true });
      showAlert('Notes enregistrées avec succès.', 'success');
      setGradesModalEval(null);
    } catch (err) {
      console.error('Erreur sauvegarde notes:', err);
      showAlert('Erreur lors de la sauvegarde des notes.', 'error');
    }
  };

  const handleValidateGrades = async (id: number) => {
    const confirmed = await showConfirm('Voulez-vous vraiment valider les notes ?');
    if (!confirmed) return;
    try {
      await axios.post(`/api/evaluations/${id}/validate`, {}, { withCredentials: true });
      showAlert('Notes validées avec succès.', 'success');
      fetchEvaluations();
    } catch (err) {
      console.error('Erreur validation notes:', err);
      showAlert('Erreur lors de la validation.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm('Voulez-vous vraiment supprimer cette évaluation ?');
    if (!confirmed) return;
    try {
      await axios.delete(`/api/evaluations/${id}`, { withCredentials: true });
      showAlert('Évaluation supprimée.', 'success');
      fetchEvaluations();
    } catch (err) {
      console.error('Erreur suppression:', err);
      showAlert('Erreur lors de la suppression.', 'error');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Chargement...</div>;
  }

  return (
    <div className="dashboard-content animate-fade-in">
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Planification des Évaluations
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Programmez les examens et QCM pour vos étudiants.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
          <Plus size={20} /> Nouvelle Évaluation
        </button>
      </div>

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

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', paddingTop: 'max(1rem, 80px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>
                {editingId ? 'Modifier l\'évaluation' : 'Nouvelle évaluation'}
              </h2>
              <button 
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cours (Matière) *</label>
                <select 
                  value={formData.courseId} 
                  onChange={e => {
                    setFormData({...formData, courseId: e.target.value, targetStudentId: ''});
                  }}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  required
                >
                  <option value="" disabled>Sélectionnez un cours</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Titre *</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  placeholder="Ex: Partiel de Mi-Semestre"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Type *</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    required
                  >
                    <option value="Examen Final">Examen Final</option>
                    <option value="Examen Partiel">Examen Partiel</option>
                    <option value="QCM (En ligne sur l'application)">QCM (En ligne sur l'application)</option>
                    <option value="QCM (Sur papier / En salle)">QCM (Sur papier / En salle)</option>
                    <option value="Projet Pratique">Projet Pratique</option>
                    <option value="Soutenance">Soutenance</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Durée</label>
                  <input 
                    type="text" 
                    value={formData.duration} 
                    onChange={handleDurationChange}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '1.1rem' }}
                    placeholder="Ex: 02:15"
                  />
                  {formData.duration && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Durée (HH:MM) : {formData.duration}</p>}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Date et Heure *</label>
                <input 
                  type="datetime-local" 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  onClick={(e) => { try { (e.target as HTMLInputElement).showPicker(); } catch { /* ignore */ } }}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Lien du sujet / Ressources (OneDrive, Google Drive...)</label>
                <input 
                  type="url" 
                  value={formData.documentLink} 
                  onChange={e => setFormData({...formData, documentLink: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  placeholder="https://..."
                />
              </div>



              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Appliquer à *</label>
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="isGlobal" 
                      checked={formData.isGlobal === true} 
                      onChange={() => setFormData({...formData, isGlobal: true, targetStudentId: ''})} 
                    />
                    Toute la promotion (Par défaut)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="isGlobal" 
                      checked={formData.isGlobal === false} 
                      onChange={() => setFormData({...formData, isGlobal: false})} 
                    />
                    Un étudiant spécifique (Rattrapage)
                  </label>
                </div>
                
                {!formData.isGlobal && (
                  <div className="animate-fade-in" style={{ marginBottom: '1rem', padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sélectionner l'étudiant *</label>
                    <select 
                      value={formData.targetStudentId} 
                      onChange={e => setFormData({...formData, targetStudentId: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      required={!formData.isGlobal}
                    >
                      <option value="" disabled>-- Choisir un étudiant --</option>
                      {courseStudents.map(s => (
                        <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.email})</option>
                      ))}
                    </select>
                    {courseStudents.length === 0 && formData.courseId && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: '0.5rem' }}>Aucun étudiant trouvé ou chargement en cours...</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Description / Consignes</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', minHeight: '80px', resize: 'vertical' }}
                  placeholder="Lien Zoom, informations supplémentaires..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={handleCloseModal} className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grades Modal */}
      {gradesModalEval && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '700px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                Saisir les notes : {gradesModalEval.title}
              </h2>
              <button onClick={() => setGradesModalEval(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            {gradesLoading ? (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Chargement des étudiants...</div>
            ) : gradesData.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Aucun étudiant inscrit à ce cours.</div>
            ) : (
              <form onSubmit={handleSaveGrades} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Rechercher un étudiant..."
                    value={gradesSearch}
                    onChange={(e) => setGradesSearch(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                  />
                </div>
                <div className="table-responsive">
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: 'var(--text-primary)' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>Étudiant</th>
                        <th style={{ padding: '0.75rem 0.5rem', fontWeight: 500, width: '100px' }}>Note /20</th>
                        <th style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>Commentaire</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gradesData
                        .filter(g => g.name.toLowerCase().includes(gradesSearch.toLowerCase()))
                        .map((gradeRow) => (
                        <tr key={gradeRow.etudiantId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem 0.5rem' }}>{gradeRow.name}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <input 
                              type="number" 
                              step="0.25"
                              min="0"
                              max="20"
                              value={gradeRow.score} 
                              onChange={e => {
                                const newData = [...gradesData];
                                const idx = newData.findIndex(d => d.etudiantId === gradeRow.etudiantId);
                                if (idx > -1) {
                                  newData[idx].score = e.target.value;
                                  setGradesData(newData);
                                }
                              }}
                              style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <input 
                              type="text" 
                              value={gradeRow.feedback} 
                              onChange={e => {
                                const newData = [...gradesData];
                                const idx = newData.findIndex(d => d.etudiantId === gradeRow.etudiantId);
                                if (idx > -1) {
                                  newData[idx].feedback = e.target.value;
                                  setGradesData(newData);
                                }
                              }}
                              style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                              placeholder="Appréciation..."
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" onClick={() => setGradesModalEval(null)} className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Fermer</button>
                  <button type="submit" className="btn btn-primary">Enregistrer les notes</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* QCM Configuration Modal */}
      {isQcmModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', paddingTop: 'max(1rem, 80px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>Configuration du QCM</h2>
              <button 
                onClick={handleCloseQcmModal}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleQcmSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>1. Télécharger le modèle</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Si vous n'avez pas encore préparé vos questions, téléchargez le fichier Excel modèle (Template) et remplissez-le en suivant les instructions.
                </p>
                <button 
                  type="button" 
                  onClick={handleDownloadTemplate} 
                  className="btn" 
                  style={{ backgroundColor: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', width: '100%' }}
                >
                  Télécharger le Modèle Excel
                </button>
              </div>

              <div style={{ padding: '1rem', border: '1px dashed var(--accent-secondary)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>2. Importer le fichier rempli</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Sélectionnez le fichier Excel (.xlsx) contenant vos questions. L'importation remplacera toutes les questions précédentes pour cette évaluation.
                </p>
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setExcelFile(e.target.files[0]);
                    }
                  }}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={handleCloseQcmModal} className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Annuler</button>
                <button type="submit" disabled={!excelFile || qcmSaving} className="btn btn-primary">{qcmSaving ? 'Importation en cours...' : 'Importer les questions'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeacherEvaluations;
