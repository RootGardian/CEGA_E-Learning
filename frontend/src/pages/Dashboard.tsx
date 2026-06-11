import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getDeptName } from '../utils/departments';
import type { UserProfile } from '../components/SidebarLayout';
import axios from 'axios';
import socket from '../utils/socket';
import {
  BookOpen,
  Award,
  Clock,
  PlayCircle
} from 'lucide-react';

// Interfaces

interface Course {
  id: number;
  title: string;
  department: string;
  progress: number;
  lastViewed: boolean;
  upcomingEvaluation?: boolean;
  isLocked?: boolean;
  isUnlocked?: boolean;
  completedLessonsCount?: number;
  totalLessonsCount?: number;
}

interface Evaluation {
  id: number;
  title: string;
  type: string;
  date: string;
  duration: string | null;
  course?: { id: number; title: string };
  studentGrade?: { score: number | null };
}



const Dashboard: React.FC = () => {
  const { user } = useOutletContext<{ user: UserProfile }>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesRes = await axios.get(`/api/courses?t=${Date.now()}`, { 
          withCredentials: true,
          headers: { 'Cache-Control': 'no-cache' }
        });

        // Provide a default if progress is undefined
        const enrichedCourses = coursesRes.data.map((c: any) => ({
          ...c,
          progress: c.progress || 0,
          lastViewed: false
        }));
        setCourses(enrichedCourses);

      } catch (err) {
        console.error('Erreur de chargement:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchEvaluations = async () => {
      try {
        const evalsRes = await axios.get('/api/evaluations', { withCredentials: true });
        setEvaluations(evalsRes.data);
      } catch (err) {
        console.error('Erreur de chargement evals:', err);
      }
    };

    fetchCourses();
    fetchEvaluations();

    socket.on('course_updated', () => {
      fetchCourses();
    });

    return () => {
      socket.off('course_updated');
    };
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', fontWeight: 500 }}>Chargement de votre espace...</div>
      </div>
    );
  }

  // Filtrage intelligent du catalogue (inclure les cours transversaux "all")
  const myCourses = courses.filter(c => c.department === user.department || c.department === 'geosciences' || c.department === 'all');
  const isCourseBlocked = (course: Course) => Boolean(course.isLocked || course.isUnlocked === false);
  const lastViewedCourses = myCourses.filter(c => c.lastViewed);
  
  // Upcoming evaluations: pending (no grade)
  const upcomingEvaluations = evaluations
    .filter(ev => !ev.studentGrade)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const totalCompletedLessons = myCourses.reduce((sum, c) => sum + (c.completedLessonsCount || 0), 0);
  
  const studyMinutes = user.studyTime || 0;
  const studyHours = Math.floor(studyMinutes / 60);
  const studyRemainingMinutes = studyMinutes % 60;
  const studyTimeString = studyHours > 0 
    ? `${studyHours}h${studyRemainingMinutes > 0 ? ' ' + studyRemainingMinutes + 'm' : ''}`
    : `${studyMinutes}m`;


  return (
    <div className="dashboard-content animate-fade-in">
      <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2rem)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        Tableau de Bord
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Voici un résumé de votre progression aujourd'hui.</p>

        {/* KPIs / Raccourcis */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: '0', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--accent-primary)' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{myCourses.length}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cours dans votre filière</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: '0', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--accent-secondary)' }}>
              <Clock size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{studyTimeString}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Temps passé sur la plateforme</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: '0', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--success)' }}>
              <Award size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{totalCompletedLessons}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Séances terminées</p>
            </div>
          </div>
        </div>

        {/* Section Principale: Cours et Evaluations */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>

          {/* Liste des cours filtrés avec barres de progression */}
          <section style={{ flex: '2 1 min(100%, 500px)' }}>
            <h2 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.25rem)', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Mes Cours ({getDeptName(user.department)})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myCourses.map(course => (
                <div
                  key={course.id}
                  className="glass-panel"
                  style={{
                    padding: 'clamp(1rem, 3vw, 1.5rem)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: isCourseBlocked(course) ? 0.65 : 1,
                    filter: isCourseBlocked(course) ? 'grayscale(0.25)' : 'none'
                  }}
                >
                  <div style={{ flex: '1 1 min(100%, 250px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-primary)' }}>{course.title}</h4>
                      {isCourseBlocked(course) && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Bloqué
                        </span>
                      )}
                    </div>

                    {/* Progress Bar Container */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '0', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${course.progress}%`,
                          backgroundColor: course.progress === 100 ? 'var(--accent-primary)' : 'var(--accent-secondary)',
                          borderRadius: '0',
                          transition: 'width 1s ease-in-out'
                        }} />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', minWidth: '40px' }}>{course.progress}%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="btn btn-secondary"
                    disabled={isCourseBlocked(course)}
                    style={{ width: 'auto', flex: '0 0 auto', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isCourseBlocked(course) ? 0.7 : 1 }}
                  >
                    <PlayCircle size={18} />
                    Commencer
                  </button>
                </div>
              ))}
              {myCourses.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '0' }}>
                  Aucun cours n'est encore disponible pour votre filière.
                </div>
              )}
            </div>
          </section>

          {/* Sidebar de droite: Activité récente et Évaluations */}
          <section style={{ flex: '1 1 min(100%, 300px)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Reprendre l'étude */}
            {lastViewedCourses.length > 0 && (
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Reprendre l'étude</h3>
                <div style={{ padding: '1rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>{lastViewedCourses[0].title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Module 3 : Les bases</p>
                  <button className="btn btn-primary" style={{ width: '100%', padding: '0.6rem', fontSize: '0.9rem' }}>Continuer</button>
                </div>
              </div>
            )}

            {/* Prochaines évaluations */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Prochaines Évaluations</h3>
              {upcomingEvaluations.length === 0 ? (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Aucune évaluation prévue prochainement.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {upcomingEvaluations.slice(0, 3).map(ev => (
                    <div key={ev.id} style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                      <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{ev.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        {new Date(ev.date).toLocaleDateString('fr-FR')} à {new Date(ev.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <button 
                        onClick={() => navigate('/evaluations')} 
                        className="btn btn-secondary" 
                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
                      >
                        Voir les détails
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </section>
        </div>
    </div>
  );
};

export default Dashboard;
