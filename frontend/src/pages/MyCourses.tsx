import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, PlayCircle, Search, Filter } from 'lucide-react';
import { getDeptName } from '../utils/departments';
import socket from '../utils/socket';
import type { UserProfile } from '../components/SidebarLayout';
import type { TeacherProfile } from '../components/TeacherSidebarLayout';

interface Course {
  id: number;
  title: string;
  department: string;
  volumeHoraire: string;
  isLocked?: boolean;
  isUnlocked?: boolean;
}

const MyCourses: React.FC = () => {
  const { user } = useOutletContext<{ user: UserProfile | TeacherProfile }>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`/api/courses?t=${Date.now()}`, { 
          withCredentials: true,
          headers: { 'Cache-Control': 'no-cache' }
        });
        // Filtrer les cours selon la filière de l'utilisateur
        const filtered = response.data.filter((c: Course) => 
          c.department === user.department || c.department === 'geosciences' || c.department === 'all'
        );
        setCourses(filtered);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();

    socket.on('course_updated', () => {
      console.log('Course updated, refreshing...');
      fetchCourses();
    });

    return () => {
      socket.off('course_updated');
    };
  }, [user.department]);

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const isCourseBlocked = (course: Course) => {
    if ((user as any).role === 'enseignant') return false;
    return Boolean(course.isLocked || course.isUnlocked === false);
  };

  return (
    <div className="dashboard-content animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Mes Cours</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Filière : {getDeptName(user.department)}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Rechercher un cours..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              padding: '0.75rem 1rem 0.75rem 3rem', 
              width: '100%', 
              maxWidth: '400px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
        <button className="btn btn-secondary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} /> Filtrer
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Chargement du catalogue...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {filteredCourses.map(course => (
            <div
              key={course.id}
              className="glass-panel"
              style={{ display: 'flex', flexDirection: 'column', opacity: isCourseBlocked(course) ? 0.65 : 1, filter: isCourseBlocked(course) ? 'grayscale(0.25)' : 'none' }}
            >
              <div style={{ padding: '1.5rem', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--accent-primary)', borderRadius: '0' }}>
                    <BookOpen size={24} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '0.25rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: '0' }}>
                    {getDeptName(course.department)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                    {course.title}
                  </h3>
                  {isCourseBlocked(course) && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Bloqué
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {course.volumeHoraire}
                </p>
                
                {/* Progress bar (mock) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '0', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '0%', backgroundColor: 'var(--accent-primary)', borderRadius: '0' }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>0%</span>
                </div>
              </div>
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'transparent' }}>
                <button
                  onClick={() => navigate(`/course/${course.id}`)}
                  className="btn btn-primary"
                  disabled={isCourseBlocked(course)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isCourseBlocked(course) ? 0.7 : 1 }}
                >
                  <PlayCircle size={18} />
                  Commencer le cours
                </button>
              </div>
            </div>
          ))}
          
          {filteredCourses.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)' }}>
              Aucun cours ne correspond à votre recherche.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
