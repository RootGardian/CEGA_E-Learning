import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, PlayCircle, BookOpen, CheckCircle, X, ArrowLeft, List, Terminal, Cpu, Layers, Milestone, Code } from 'lucide-react';
import socket from '../utils/socket';
import { usePopup } from '../contexts/PopupContext';
import LessonIA_Geo_S1 from '../components/LessonIA_Geo_S1';

interface LessonBlock {
  type: 'text' | 'definition' | 'analogy' | 'video' | 'image' | 'document';
  title?: string;
  content: string;
}

interface Lesson {
  id: number;
  title: string;
  order: number;
  content?: LessonBlock[];
}

interface Module {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  department: string;
  volumeHoraire: string;
  modules: Module[];
}

const CourseViewer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [activeLessonContent, setActiveLessonContent] = useState<Lesson | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [lessonProgressData, setLessonProgressData] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('etudiant');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { showAlert } = usePopup();
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const authRes = await axios.get('/api/auth/me', { withCredentials: true });
        setUserRole(authRes.data.role);

        const response = await axios.get(`/api/courses/${courseId}?t=${Date.now()}`, {
          withCredentials: true,
          headers: { 'Cache-Control': 'no-cache' }
        });
        setCourse(response.data);

        if (authRes.data.role === 'etudiant') {
          const progRes = await axios.get(`/api/courses/${courseId}/progress`, { withCredentials: true });
          const completedIds = progRes.data.filter((p: any) => p.isCompleted).map((p: any) => p.lessonId);
          setCompletedLessonIds(completedIds);
          
          const progData: Record<number, any> = {};
          progRes.data.forEach((p: any) => {
            progData[p.lessonId] = p;
          });
          setLessonProgressData(progData);
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            navigate('/login');
          } else if (err.response?.status === 403) {
            showAlert(err.response.data.message || 'Accès refusé à ce cours.', 'error');
            navigate('/dashboard');
          }
        }
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();

    socket.on('course_updated', () => {
      fetchCourse();
    });

    return () => {
      socket.off('course_updated');
    };
  }, [courseId, navigate]);

  useEffect(() => {
    if (!activeLessonId) {
      setActiveLessonContent(null);
      return;
    }

    document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchLessonContent = async () => {
      try {
        const response = await axios.get(`/api/courses/lessons/${activeLessonId}`, {
          withCredentials: true
        });
        setActiveLessonContent(response.data);
      } catch (err) {
        console.error('Error fetching lesson:', err);
      }
    };

    fetchLessonContent();
  }, [activeLessonId]);

  const allLessonsInOrder = course?.modules.flatMap(m => m.lessons) || [];

  const isLessonUnlocked = (lessonId: number) => {
    if (userRole === 'enseignant') return true;
    const lessonIndex = allLessonsInOrder.findIndex(l => l.id === lessonId);
    if (lessonIndex <= 0) return true;
    const previousLesson = allLessonsInOrder[lessonIndex - 1];
    return completedLessonIds.includes(previousLesson.id);
  };

  const isModuleUnlocked = (moduleId: number) => {
    if (userRole === 'enseignant') return true;
    const moduleIndex = course?.modules.findIndex(m => m.id === moduleId) ?? -1;
    if (moduleIndex <= 0) return true;
    const previousModule = course?.modules[moduleIndex - 1];
    if (!previousModule || previousModule.lessons.length === 0) return true;
    const lastLessonOfPreviousModule = previousModule.lessons[previousModule.lessons.length - 1];
    return completedLessonIds.includes(lastLessonOfPreviousModule.id);
  };

  const handleLessonComplete = async (lessonId: number, score?: number, progressData?: any) => {
    try {
      // Le quiz sert d'entraînement, on valide la leçon quel que soit le score
      await axios.post(`/api/courses/lessons/${lessonId}/progress`, {
        courseId,
        isCompleted: true,
        quizScore: score,
        progressData
      }, { withCredentials: true });
      
      // Update local state to unlock the next one immediately
      setCompletedLessonIds(prev => prev.includes(lessonId) ? prev : [...prev, lessonId]);
      
      if (progressData) {
        setLessonProgressData(prev => ({ ...prev, [lessonId]: { ...prev[lessonId], progressData } }));
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const handleLessonProgressUpdate = async (lessonId: number, progressData: any) => {
    try {
      await axios.post(`/api/courses/lessons/${lessonId}/progress`, {
        courseId,
        progressData
      }, { withCredentials: true });
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const renderContentBlock = (block: LessonBlock, index: number) => {
    switch (block.type) {
      case 'text':
        return <p key={index} style={{ marginBottom: '1.5rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{block.content}</p>;
      
      case 'definition':
        return (
          <div key={index} style={{ 
            marginBottom: '2rem', 
            padding: '1.5rem', 
            backgroundColor: 'var(--bg-secondary)', 
            border: '1px solid var(--border-color)', 
            borderLeft: '4px solid var(--accent-primary)',
            borderRadius: '0' 
          }}>
            <h4 style={{ display: 'flex', alignItems: 'center', color: 'var(--accent-primary)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
              <BookOpen size={20} style={{ marginRight: '0.5rem' }} />
              {block.title || 'Définition'}
            </h4>
            <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 500 }}>{block.content}</p>
          </div>
        );
      
      case 'analogy':
        return (
          <div key={index} style={{ 
            marginBottom: '2rem', 
            padding: '1.5rem', 
            backgroundColor: '#F8FAFC', 
            border: '1px solid var(--border-color)', 
            borderLeft: '4px solid #F59E0B',
            borderRadius: '0' 
          }}>
            <h4 style={{ display: 'flex', alignItems: 'center', color: '#D97706', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
              Analogie Pédagogique
            </h4>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontStyle: 'italic' }}>{block.content}</p>
          </div>
        );

      default:
        return <div key={index}>{block.content}</div>;
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement du cours...</div>;
  }

  if (!course) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cours introuvable.</div>;
  }

  return (
    <div className="app-container">
      {/* Mobile Topbar */}
      <div className="mobile-topbar hidden-desktop">
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, paddingRight: '1rem' }}>
          <button 
            onClick={() => navigate(userRole === 'enseignant' ? '/teacher/dashboard' : '/dashboard')} 
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-primary)', marginRight: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem', transition: 'all 0.2s ease' }}
            title="Retour"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="gradient-text" style={{ fontSize: '1.05rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
            {course.title}
          </h2>
        </div>
        <button onClick={toggleSidebar} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '0.5rem' }}>
          <List size={24} />
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'is-visible' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Sidebar / Syllabus */}
      <div className={`sidebar ${isSidebarOpen ? 'is-open' : ''}`} style={{ width: 'min(350px, 90vw)', padding: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <button 
              onClick={() => navigate(userRole === 'enseignant' ? '/teacher/dashboard' : '/dashboard')} 
              className="hidden-mobile"
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1rem', padding: 0, display: 'flex', alignItems: 'center', fontSize: '0.9rem', gap: '0.5rem', fontWeight: 500, transition: 'color 0.2s ease' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <ArrowLeft size={16} /> Retour au tableau de bord
            </button>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{course.title}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{course.volumeHoraire}</p>
          </div>
          <button className="hidden-desktop" onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <button 
              onClick={() => {
                setActiveModuleId(null);
                setActiveLessonId(null);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '0.8rem 1rem',
                backgroundColor: activeModuleId === null && activeLessonId === null ? 'var(--bg-primary)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: activeModuleId === null && activeLessonId === null ? 600 : 500,
                color: activeModuleId === null && activeLessonId === null ? 'var(--accent-primary)' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
            >
              <Milestone size={18} style={{ marginRight: '0.75rem' }} />
              Vue Globale du Parcours
            </button>
          </div>
          
          <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>Modules</h3>
          
          {course.modules.map((mod) => {
            const unlocked = isModuleUnlocked(mod.id);
            return (
            <div key={mod.id} style={{ marginBottom: '0.5rem' }}>
              <button 
                onClick={() => {
                  if (!unlocked) return;
                  setActiveModuleId(mod.id);
                  setActiveLessonId(null);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                disabled={!unlocked}
                title={!unlocked ? "Terminez le module précédent pour débloquer" : ""}
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '1rem', 
                  backgroundColor: activeModuleId === mod.id && !activeLessonId ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-secondary)',
                  border: '1px solid',
                  borderColor: activeModuleId === mod.id && !activeLessonId ? 'var(--accent-primary)' : 'var(--border-color)',
                  borderRadius: '8px',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: activeModuleId === mod.id && !activeLessonId ? 'var(--accent-primary)' : 'var(--text-primary)',
                  transition: 'all 0.2s ease',
                  opacity: unlocked ? 1 : 0.5
                }}
              >
                {unlocked ? (
                  <ChevronRight size={18} style={{ marginRight: '0.5rem', color: activeModuleId === mod.id && !activeLessonId ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
                ) : (
                  <span style={{ marginRight: '0.5rem', fontSize: '14px' }}>🔒</span>
                )}
                <span style={{ flex: 1, lineHeight: 1.3 }}>{mod.title}</span>
              </button>
            </div>
          )})}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          {activeLessonContent ? (
            activeLessonContent.title.includes('Introduction & démystification') ? (
              <LessonIA_Geo_S1 
                initialProgress={lessonProgressData[activeLessonContent.id]?.progressData}
                onComplete={(score, progressData) => handleLessonComplete(activeLessonContent.id, score, progressData)}
                onProgress={(progressData) => handleLessonProgressUpdate(activeLessonContent.id, progressData)}
              />
            ) : (
            <>
              <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', color: 'var(--text-primary)', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', lineHeight: 1.3 }}>
                {activeLessonContent.title}
              </h1>
              
              <div className="lesson-content">
                {activeLessonContent.content && activeLessonContent.content.length > 0 ? (
                  activeLessonContent.content.map((block, index) => renderContentBlock(block, index))
                ) : (
                  <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border-color)', color: 'var(--text-secondary)' }}>
                    Ce contenu est en cours de rédaction.
                  </div>
                )}
              </div>

              <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap-reverse', gap: '1rem', justifyContent: 'space-between' }}>
                <button onClick={() => setActiveLessonId(null)} className="btn btn-secondary" style={{ flex: '1 1 200px' }}>
                  <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Retour au module
                </button>
                <button className="btn btn-primary" style={{ flex: '1 1 200px' }}>
                  Terminer et continuer
                  <CheckCircle size={18} style={{ marginLeft: '0.5rem' }} />
                </button>
              </div>
            </>
            )
          ) : activeModuleId ? (
            <div className="module-overview animate-fade-in" style={{ padding: 'clamp(1rem, 2vw, 2rem)' }}>
              {(() => {
                const activeModule = course.modules.find(m => m.id === activeModuleId);
                if (!activeModule) return null;
                return (
                  <>
                    <button onClick={() => setActiveModuleId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '2rem', display: 'flex', alignItems: 'center', padding: 0, fontWeight: 500 }}>
                      <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Revenir à la vue globale
                    </button>
                    
                    <div style={{ 
                      backgroundColor: 'rgba(16, 185, 129, 0.05)', 
                      border: '1px solid rgba(16, 185, 129, 0.2)', 
                      borderRadius: '16px', 
                      padding: '2rem', 
                      marginBottom: '3rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem'
                    }}>
                      <div style={{ background: 'var(--accent-primary)', color: '#000', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={32} />
                      </div>
                      <div>
                        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: 'var(--text-primary)', margin: '0 0 0.5rem 0', fontWeight: 700 }}>
                          {activeModule.title}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.05rem' }}>
                          Sélectionnez une séance pour commencer votre apprentissage.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {activeModule.lessons.map((lesson, index) => {
                        const unlocked = isLessonUnlocked(lesson.id);
                        return (
                        <button
                          key={lesson.id}
                          onClick={() => { if (unlocked) setActiveLessonId(lesson.id); }}
                          disabled={!unlocked}
                          title={!unlocked ? "Terminez la séance précédente pour débloquer" : ""}
                          className="glass-panel"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1.5rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            cursor: unlocked ? 'pointer' : 'not-allowed',
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            width: '100%',
                            opacity: unlocked ? 1 : 0.5
                          }}
                          onMouseOver={(e) => {
                            if (!unlocked) return;
                            e.currentTarget.style.borderColor = 'var(--accent-primary)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3)';
                          }}
                          onMouseOut={(e) => {
                            if (!unlocked) return;
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                            <div style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '50%', 
                              backgroundColor: unlocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                              color: unlocked ? 'var(--accent-primary)' : 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              flexShrink: 0
                            }}>
                              {unlocked ? (index + 1) : '🔒'}
                            </div>
                            <div>
                              <h3 style={{ margin: '0 0 0.25rem 0', color: unlocked ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 600 }}>{lesson.title}</h3>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                <PlayCircle size={14} /> Séance interactive
                              </div>
                            </div>
                          </div>
                          {unlocked && <ChevronRight size={20} style={{ color: 'var(--text-secondary)' }} />}
                        </button>
                      )})}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="course-overview animate-fade-in" style={{ padding: 'clamp(1rem, 2vw, 2rem)' }}>
              {/* Hero Section */}
              <div style={{ 
                backgroundColor: 'rgba(16, 185, 129, 0.05)', 
                border: '1px solid rgba(16, 185, 129, 0.2)', 
                borderRadius: '16px', 
                padding: 'clamp(2rem, 4vw, 3rem)', 
                marginBottom: '3rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', position: 'relative', zIndex: 1 }}>
                  <div style={{ background: 'var(--accent-primary)', color: '#000', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Milestone size={28} />
                  </div>
                  <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>
                    Parcours d'Apprentissage
                  </h1>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '800px', margin: 0, position: 'relative', zIndex: 1 }}>
                  Bienvenue dans le cursus <strong>{course.title}</strong>. Ce parcours est conçu pour vous donner les bases solides nécessaires. Vous commencerez par les concepts fondamentaux avant de plonger dans des structures plus complexes.
                </p>
                <div style={{ position: 'absolute', right: '-5%', top: '-20%', opacity: 0.05, pointerEvents: 'none', zIndex: 0 }}>
                  <Layers size={300} />
                </div>
              </div>

              {/* Grid of Modules */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {course.modules.map((mod, modIndex) => {
                  const icons = [BookOpen, Terminal, Cpu, Code, Layers];
                  const Icon = icons[modIndex % icons.length];
                  const unlocked = isModuleUnlocked(mod.id);
                  
                  return (
                    <div key={mod.id} className="module-card glass-panel" style={{ 
                      padding: '1.75rem', 
                      display: 'flex', 
                      flexDirection: 'column',
                      border: '1px solid var(--border-color)',
                      transition: 'all 0.3s ease',
                      opacity: unlocked ? 1 : 0.6,
                      cursor: unlocked ? 'pointer' : 'not-allowed'
                    }}
                    onClick={() => {
                      if (!unlocked) return;
                      setActiveModuleId(mod.id);
                      document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    title={!unlocked ? "Terminez le module précédent pour débloquer" : ""}
                    >
                      <div style={{ 
                        background: 'rgba(16, 185, 129, 0.1)', 
                        color: 'var(--accent-primary)', 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginBottom: '1.25rem'
                      }}>
                        <Icon size={24} />
                      </div>
                      <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {mod.title}
                        {!unlocked && <span style={{ fontSize: '14px' }}>🔒</span>}
                      </h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', flex: 1 }}>
                        Découvrez les notions essentielles de ce module et maîtrisez les concepts clés pas à pas.
                      </p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {mod.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLessonId(lesson.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              background: 'transparent',
                              border: 'none',
                              padding: '0.6rem 0.5rem',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              color: 'var(--text-secondary)',
                              textAlign: 'left',
                              fontSize: '0.9rem',
                              transition: 'all 0.2s ease',
                              width: '100%'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)';
                              e.currentTarget.style.color = 'var(--text-primary)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                          >
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', flexShrink: 0 }}></div>
                            <span style={{ flex: 1, lineHeight: 1.4 }}>{lesson.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
