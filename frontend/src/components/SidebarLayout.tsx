import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import socket from '../utils/socket';
import { 
  BookOpen, 
  Award, 
  User, 
  Settings, 
  LogOut,
  TrendingUp,
  Briefcase,
  Bell,
  Check
} from 'lucide-react';

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  numero_etudiant?: string;
  cohorte_id?: number;
  isTwoFactorEnabled?: boolean;
  phone?: string;
  bio?: string;
  profilePicture?: string;
  subscriptionStatus?: 'active' | 'expired' | 'pending';
  accessExpirationDate?: string;
  updatedAt?: string;
  notificationPreferences?: {
    inAppAlerts: boolean;
    newCourse: boolean;
    examReminders: boolean;
    examResults: boolean;
  };
}

import { getDeptName } from '../utils/departments';

const SidebarLayout: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await axios.get('/api/auth/me', { withCredentials: true });
        setUser(profileRes.data);
      } catch (err: unknown) {
        console.error('Erreur de chargement profil:', err);
        if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 404)) {
          navigate('/login');
        } else {
          setError('Impossible de charger votre espace.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    if (!user || !user.notificationPreferences?.inAppAlerts) return;

    const loadNotifications = async () => {
      try {
        const res = await axios.get('/api/notifications', { withCredentials: true });
        setNotifications(res.data);
      } catch (err) {
        console.error('Erreur notifications', err);
      }
    };
    
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Polling every 30s
    
    socket.on('new_notification', () => {
      console.log('New notification received, fetching...');
      loadNotifications();
    });

    return () => {
      clearInterval(interval);
      socket.off('new_notification');
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: number) => {
    try {
      await axios.put(`/api/notifications/${id}/read`, {}, { withCredentials: true });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all', {}, { withCredentials: true });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login'); // Force navigate anyway
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', fontWeight: 500 }}>Chargement de votre espace...</div>
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
          <h2 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>CEGA E-Learning</h2>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            <Briefcase size={14} style={{ marginRight: '0.4rem' }} />
            {getDeptName(user.department)}
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <NavLink to="/dashboard" style={navLinkStyle}>
                <TrendingUp size={20} style={{ marginRight: '0.75rem' }} /> Tableau de bord
              </NavLink>
            </li>
            <li>
              <NavLink to="/my-courses" style={navLinkStyle}>
                <BookOpen size={20} style={{ marginRight: '0.75rem' }} /> Mes Cours
              </NavLink>
            </li>
            <li>
              <NavLink to="/evaluations" style={navLinkStyle}>
                <Award size={20} style={{ marginRight: '0.75rem' }} /> Évaluations
              </NavLink>
            </li>
          </ul>
        </nav>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <NavLink to="/profile" style={navLinkStyle}>
                <User size={20} style={{ marginRight: '0.75rem' }} /> Mon Profil
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings" style={navLinkStyle}>
                <Settings size={20} style={{ marginRight: '0.75rem' }} /> Paramètres
              </NavLink>
            </li>
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
            
            {/* Cloche de notifications */}
            {user.notificationPreferences?.inAppAlerts !== false && (
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}
                >
                  <Bell size={24} color="var(--text-secondary)" />
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '0px', right: '0px', backgroundColor: 'var(--error)', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div style={{ position: 'absolute', top: '100%', right: '0', width: '350px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', flexDirection: 'column', maxHeight: '400px' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllAsRead} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Check size={14} /> Tout marquer comme lu
                        </button>
                      )}
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                      {notifications.length === 0 ? (
                        <p style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Aucune notification.</p>
                      ) : (
                        notifications.map((notif: any) => (
                          <div 
                            key={notif.id} 
                            onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                            style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: notif.isRead ? 'transparent' : 'rgba(16, 185, 129, 0.05)', cursor: notif.isRead ? 'default' : 'pointer', display: 'flex', gap: '1rem' }}
                          >
                            <div style={{ flex: 1 }}>
                              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0 0 0.25rem 0', fontWeight: notif.isRead ? 500 : 600 }}>{notif.title}</h4>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>{notif.message}</p>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(notif.createdAt).toLocaleDateString('fr-FR')} à {new Date(notif.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            {!notif.isRead && (
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', marginTop: '0.4rem' }} />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.firstName} {user.lastName}</span>
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Avatar" style={{ width: '45px', height: '45px', borderRadius: '0', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
              ) : (
                <div style={{ width: '45px', height: '45px', borderRadius: '0', backgroundColor: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
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

export default SidebarLayout;
