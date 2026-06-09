import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Lock, Unlock, ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherCourseAccess: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [students, setStudents] = useState<any[]>([]);
  const [globalUnlocked, setGlobalUnlocked] = useState(false);
  const navigate = useNavigate();
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('/api/teacher/courses', { withCredentials: true });
        setCourses(res.data);
      } catch (err) {
        console.error('Erreur chargement cours:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const fetchStudents = async (courseId: number) => {
    setLoadingStudents(true);
    try {
      const res = await axios.get(`/api/teacher/courses/${courseId}/students`, { withCredentials: true });
      setStudents(res.data.students);
      setGlobalUnlocked(res.data.globalUnlocked);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectCourse = (course: any) => {
    setSelectedCourse(course);
    setStudentSearch('');
    fetchStudents(course.id);
  };

  const handleGlobalToggle = async (isUnlocked: boolean) => {
    if (!selectedCourse) return;
    try {
      await axios.post(`/api/teacher/courses/${selectedCourse.id}/unlock-global`, { isUnlocked }, { withCredentials: true });
      // Rafraîchir les étudiants
      fetchStudents(selectedCourse.id);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la modification de l\'accès global');
    }
  };

  const handleStudentToggle = async (etudiantId: number, targetStatus: boolean) => {
    if (!selectedCourse) return;
    try {
      await axios.post(`/api/teacher/courses/${selectedCourse.id}/unlock-student`, {
        etudiantId,
        isUnlocked: targetStatus
      }, { withCredentials: true });
      // Mettre à jour l'UI localement pour plus de fluidité
      setStudents(students.map(s => s.id === etudiantId ? { ...s, isUnlocked: targetStatus } : s));
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la modification de l\'accès étudiant');
    }
  };


  if (loading) return <div>Chargement...</div>;

  return (
    <div className="dashboard-content animate-fade-in">
      <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={() => navigate('/teacher/dashboard')}
          className="btn btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', width: 'auto' }}
        >
          <ArrowLeft size={18} /> Retour
        </button>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.2rem', marginTop: 0 }}>
            Contrôle d'Accès
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Gérez l'accès à vos cours : déblocage global ou individuel.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Liste des cours */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Vos Cours</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {courses.map(course => (
              <div
                key={course.id}
                onClick={() => handleSelectCourse(course)}
                style={{
                  padding: '1rem',
                  border: `1px solid ${selectedCourse?.id === course.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  backgroundColor: selectedCourse?.id === course.id ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>{course.title}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Actif
                  </span>
                </div>
              </div>
            ))}
            {courses.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Aucun cours disponible.</p>}
          </div>
        </div>

        {/* Détails du cours sélectionné */}
        {selectedCourse ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Actions Globales */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {selectedCourse.title}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={18} /> Déblocage Promotion
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Autoriser l'accès à ce module pour toute la promotion (département).
                  </p>
                  <div style={{ display: 'flex', gap: '1rem' }}>
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
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>Déblocage Individuel</h2>
                <input 
                  type="text" 
                  placeholder="Rechercher par nom ou email..." 
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

              {loadingStudents ? (
                <p>Chargement des étudiants...</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
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
                      {students.filter(s => 
                        s.firstName?.toLowerCase().includes(studentSearch.toLowerCase()) || 
                        s.lastName?.toLowerCase().includes(studentSearch.toLowerCase()) || 
                        s.email?.toLowerCase().includes(studentSearch.toLowerCase())
                      ).map(student => (
                        <tr key={student.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>{student.firstName} {student.lastName}</td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{student.email}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor: student.isUnlocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
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
                                  borderRadius: '6px', 
                                  border: 'none', 
                                  backgroundColor: student.isUnlocked ? 'var(--bg-secondary)' : 'var(--success)', 
                                  color: student.isUnlocked ? 'var(--text-secondary)' : 'white',
                                  cursor: student.isUnlocked ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  fontSize: '0.85rem'
                                }}>
                                <Unlock size={14} /> Débloquer
                              </button>
                              <button 
                                onClick={() => handleStudentToggle(student.id, false)} 
                                disabled={!student.isUnlocked}
                                style={{ 
                                  padding: '0.4rem 0.8rem', 
                                  borderRadius: '6px', 
                                  border: 'none', 
                                  backgroundColor: !student.isUnlocked ? 'var(--bg-secondary)' : 'var(--error)', 
                                  color: !student.isUnlocked ? 'var(--text-secondary)' : 'white',
                                  cursor: !student.isUnlocked ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  fontSize: '0.85rem'
                                }}>
                                <Lock size={14} /> Bloquer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {students.length === 0 && (
                        <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Aucun étudiant trouvé dans ce département.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Sélectionnez un cours pour gérer ses accès.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCourseAccess;
