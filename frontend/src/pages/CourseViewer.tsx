import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronDown, ChevronRight, PlayCircle, BookOpen, FileText, CheckCircle, X, ArrowLeft, List } from 'lucide-react';
import socket from '../utils/socket';

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
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<number[]>([]);
  const [userRole, setUserRole] = useState<string>('etudiant');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
        
        // Auto-expand first module and select first lesson
        if (response.data.modules.length > 0) {
          setExpandedModules([response.data.modules[0].id]);
          if (response.data.modules[0].lessons.length > 0) {
            setActiveLessonId(response.data.modules[0].lessons[0].id);
          }
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            navigate('/login');
          } else if (err.response?.status === 403) {
            alert(err.response.data.message || 'Accès refusé à ce cours.');
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
    if (!activeLessonId) return;

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

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
    );
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
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1rem', padding: 0, display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}
            >
              ← Retour au tableau de bord
            </button>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{course.title}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{course.volumeHoraire}</p>
          </div>
          <button className="hidden-desktop" onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '1rem' }}>
          {course.modules.map((mod) => (
            <div key={mod.id} style={{ marginBottom: '0.5rem' }}>
              <button 
                onClick={() => toggleModule(mod.id)}
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '1rem', 
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}
              >
                {expandedModules.includes(mod.id) ? <ChevronDown size={18} style={{ marginRight: '0.5rem' }} /> : <ChevronRight size={18} style={{ marginRight: '0.5rem' }} />}
                <span style={{ flex: 1 }}>{mod.title}</span>
              </button>
              
              {expandedModules.includes(mod.id) && (
                <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '1.5rem', paddingLeft: '0.5rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
                  {mod.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setActiveLessonId(lesson.id);
                        setIsSidebarOpen(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        backgroundColor: activeLessonId === lesson.id ? 'var(--bg-primary)' : 'transparent',
                        border: 'none',
                        borderLeft: activeLessonId === lesson.id ? '3px solid var(--accent-primary)' : '3px solid transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: activeLessonId === lesson.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontSize: '0.95rem',
                        fontWeight: activeLessonId === lesson.id ? 600 : 400,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {activeLessonId === lesson.id ? <PlayCircle size={16} style={{ marginRight: '0.5rem' }} /> : <FileText size={16} style={{ marginRight: '0.5rem' }} />}
                      {lesson.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          {activeLessonContent ? (
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
                <button className="btn btn-secondary" style={{ flex: '1 1 200px' }}>Leçon précédente</button>
                <button className="btn btn-primary" style={{ flex: '1 1 200px' }}>
                  Terminer et continuer
                  <CheckCircle size={18} style={{ marginLeft: '0.5rem' }} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '5rem' }}>
              Sélectionnez une leçon dans le menu pour commencer.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
