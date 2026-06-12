import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { TeacherProfile } from '../components/TeacherSidebarLayout';
import { BookOpen, Users, ShieldAlert } from 'lucide-react';
import axios from 'axios';

const TeacherDashboard: React.FC = () => {
  const { user } = useOutletContext<{ user: TeacherProfile }>();
  const [stats, setStats] = useState<{ courses: string | number; students: string | number; alerts: string | number; recentActions?: { id: string; type: string; title: string; description: string; date: string }[] }>({ courses: '-', students: '-', alerts: '-' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/teacher/dashboard-stats', { withCredentials: true });
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard-content animate-fade-in">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Bienvenue, {user.firstName}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Voici l'aperçu de vos activités pour le département {user.department}.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ backgroundColor: 'rgba(var(--accent-primary-rgb), 0.1)', padding: '1rem', borderRadius: '0' }}>
            <BookOpen size={32} color="var(--accent-primary)" />
          </div>
          <div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 500 }}>Mes Cours</h3>
            <p style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 700, margin: 0 }}>{stats.courses}</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem', borderLeft: '4px solid var(--accent-secondary)' }}>
          <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '0' }}>
            <Users size={32} color="var(--accent-secondary)" />
          </div>
          <div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 500 }}>Étudiants</h3>
            <p style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 700, margin: 0 }}>{stats.students}</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem', borderLeft: '4px solid var(--error)' }}>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '0' }}>
            <ShieldAlert size={32} color="var(--error)" />
          </div>
          <div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 500 }}>Alertes</h3>
            <p style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 700, margin: 0 }}>{stats.alerts}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Dernières Actions</h2>
        
        {stats.recentActions && stats.recentActions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.recentActions.map(action => (
              <div key={action.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: `4px solid ${action.type === 'alert' ? 'var(--error)' : 'var(--accent-primary)'}` }}>
                {action.type === 'alert' ? <ShieldAlert size={20} color="var(--error)" /> : <BookOpen size={20} color="var(--accent-primary)" />}
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>{action.title}</h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{action.description}</p>
                </div>
                <div style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  {new Date(action.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>Aucune action récente.</p>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
