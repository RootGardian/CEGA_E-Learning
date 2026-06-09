import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BookOpen,
  LogOut,
  TrendingUp,
  Briefcase,
  ShieldAlert
} from 'lucide-react';
import { getDeptName } from '../utils/departments';

export interface TeacherProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  phone?: string;
  bio?: string;
  profilePicture?: string;
  role: 'enseignant';
}

const TeacherSidebarLayout: React.FC = () => {
  const [user, setUser] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await axios.get('/api/auth/me', { withCredentials: true });
        if (profileRes.data.role !== 'enseignant') {
          navigate('/dashboard'); // Redirige les étudiants
        } else {
          setUser(profileRes.data);
        }
      } catch (err: unknown) {
        console.error('Erreur de chargement profil:', err);
        setError('Impossible de charger votre profil.');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      navigate('/login');
    } catch (err) {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', fontWeight: 500 }}>Chargement de l'espace enseignant...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--error)', fontSize: '1.2rem', marginBottom: '1rem' }}>{error || 'Profil introuvable.'}</div>
        <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ maxWidth: '200px' }}>Retour à la connexion</button>
      </div>
    );
  }

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '0.85rem 1rem',
    borderRadius: '0',
    backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
    border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
    borderLeft: isActive ? '4px solid var(--accent-primary)' : '4px solid transparent',
    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
    textDecoration: 'none',
    fontWeight: isActive ? 600 : 500,
    marginBottom: '0.5rem',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar Ergonomique */}
      <aside style={{
        width: '280px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        <div style={{ marginBottom: '3rem' }}>
          <img src="/logo_cega.jpeg" alt="Logo CEGA" style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: '12px', marginBottom: '0.75rem' }} />
          <h2 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Espace Formateur</h2>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            <Briefcase size={14} style={{ marginRight: '0.4rem' }} />
            {getDeptName(user.department)}
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <NavLink to="/teacher/dashboard" style={navLinkStyle}>
                <TrendingUp size={20} style={{ marginRight: '0.75rem' }} /> Vue d'ensemble
              </NavLink>
            </li>
            <li>
              <NavLink to="/teacher/courses" style={navLinkStyle}>
                <BookOpen size={20} style={{ marginRight: '0.75rem' }} /> Gestion des Cours
              </NavLink>
            </li>
            <li>
              <NavLink to="/teacher/access" style={navLinkStyle}>
                <ShieldAlert size={20} style={{ marginRight: '0.75rem' }} /> Contrôle d'Accès
              </NavLink>
            </li>
          </ul>
        </nav>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '0', color: 'var(--error)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 500, textAlign: 'left' }}>
                <LogOut size={20} style={{ marginRight: '0.75rem' }} /> Déconnexion
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Zone de contenu pour les sous-pages */}
      <main style={{ flex: 1, padding: '3rem 4rem', overflowY: 'auto', position: 'relative' }}>
        <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.firstName} {user.lastName} <span style={{fontSize: '0.8rem', color: 'var(--accent-primary)', marginLeft: '0.5rem'}}>(Formateur)</span></span>
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Avatar" style={{ width: '45px', height: '45px', borderRadius: '0', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
              ) : (
                <div style={{ width: '45px', height: '45px', borderRadius: '0', backgroundColor: 'var(--accent-secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* L'Outlet rendra le contenu de la page active et lui passera l'objet user */}
        <Outlet context={{ user, setUser }} />
      </main>
    </div>
  );
};

export default TeacherSidebarLayout;
