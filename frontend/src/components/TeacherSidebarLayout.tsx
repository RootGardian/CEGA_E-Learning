import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BookOpen,
  LogOut,
  TrendingUp,
  Briefcase,
  ShieldAlert,
  Menu,
  X,
  User,
  Settings
} from 'lucide-react';
import { getDeptName } from '../utils/departments';
import socket from '../utils/socket';
import { usePopup } from '../contexts/PopupContext';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { showAlert } = usePopup();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await axios.get('/api/auth/me', { withCredentials: true });
        if (profileRes.data.role !== 'enseignant') {
          navigate('/dashboard'); // Redirige les étudiants
        } else {
          setUser(profileRes.data);
          if (!socket.connected) socket.connect();
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

  useEffect(() => {
    socket.on('force_logout', async () => {
      showAlert("Votre compte a été bloqué par l'administration. Vous allez être déconnecté.", 'error');
      try {
        await axios.post('/api/auth/logout', {}, { withCredentials: true });
      } catch (err) {}
      navigate('/login');
    });

    return () => {
      socket.off('force_logout');
    };
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
    <div className="app-container">
      {/* Mobile Topbar */}
      <div className="mobile-topbar hidden-desktop">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo1_cega.jpeg" alt="Logo" style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '8px', marginRight: '0.75rem' }} />
          <h2 className="gradient-text" style={{ fontSize: '1.3rem', margin: 0 }}>Formateur</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={toggleSidebar} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '0.5rem' }}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'is-visible' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Sidebar Ergonomique */}
      <aside className={`sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <img src="/logo_cega.jpeg" alt="Logo CEGA" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '12px', marginBottom: '1rem' }} />
            <h2 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Espace Formateur</h2>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              <Briefcase size={14} style={{ marginRight: '0.4rem' }} />
              {getDeptName(user.department)}
            </div>
          </div>
          <button className="hidden-desktop" onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <NavLink to="/teacher/dashboard" style={navLinkStyle} onClick={() => setIsSidebarOpen(false)}>
                <TrendingUp size={20} style={{ marginRight: '0.75rem' }} /> Vue d'ensemble
              </NavLink>
            </li>
            <li>
              <NavLink to="/teacher/courses" style={navLinkStyle} onClick={() => setIsSidebarOpen(false)}>
                <BookOpen size={20} style={{ marginRight: '0.75rem' }} /> Gestion des Cours
              </NavLink>
            </li>
            <li>
              <NavLink to="/teacher/access" style={navLinkStyle} onClick={() => setIsSidebarOpen(false)}>
                <ShieldAlert size={20} style={{ marginRight: '0.75rem' }} /> Contrôle d'Accès
              </NavLink>
            </li>
          </ul>
        </nav>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <NavLink to="/teacher/profile" style={navLinkStyle} onClick={() => setIsSidebarOpen(false)}>
                <User size={20} style={{ marginRight: '0.75rem' }} /> Mon Profil
              </NavLink>
            </li>
            <li>
              <NavLink to="/teacher/settings" style={navLinkStyle} onClick={() => setIsSidebarOpen(false)}>
                <Settings size={20} style={{ marginRight: '0.75rem' }} /> Paramètres
              </NavLink>
            </li>
          </ul>
        </div>

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
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '2rem' }} className="hidden-mobile">
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
