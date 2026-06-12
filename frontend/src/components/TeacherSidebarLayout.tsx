import React, { useState, useEffect, useRef } from 'react';
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
  Settings,
  Calendar,
  ArrowLeft,
  Bell,
  HelpCircle
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
  notificationPreferences?: {
    inAppAlerts: boolean;
  };
}

const TeacherSidebarLayout: React.FC = () => {
  const [user, setUser] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { showAlert } = usePopup();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const loadNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications', { withCredentials: true });
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await axios.get('/api/auth/me', { withCredentials: true });
        if (profileRes.data.role !== 'enseignant') {
          navigate('/dashboard'); // Redirige les étudiants
        } else {
          setUser(profileRes.data);
          if (!socket.connected) socket.connect();
          loadNotifications();
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

    // Setup socket listeners
    const playNotificationSound = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
      } catch (err) {
        console.error("Erreur son de notification:", err);
      }
    };

    socket.on('new_notification', (data: any) => {
      loadNotifications();
      playNotificationSound();
      
      if ('Notification' in window && Notification.permission === 'granted') {
        const title = (data && data.title) ? data.title : 'Nouvelle notification';
        const message = (data && data.message) ? data.message : 'Vous avez du nouveau sur la plateforme CEGA.';
        
        new Notification(title, {
          body: message,
          icon: '/logo1_cega.jpeg'
        });
      }
    });

    return () => {
      socket.off('new_notification');
    };
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
        <button className="btn-back" onClick={() => navigate('/login')}><ArrowLeft size={16} /> Retour</button>
      </div>
    );
  }

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '0.85rem 1rem',
    borderRadius: '10px',
    backgroundColor: isActive ? 'var(--accent-secondary)' : 'transparent',
    border: 'none',
    color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
    textDecoration: 'none',
    fontWeight: 500,
    marginBottom: '0.4rem',
    transition: 'all 0.2s ease'
  });

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

  const renderNotificationBell = (isMobile = false) => {
    if (user.notificationPreferences?.inAppAlerts === false) return null;
    
    return (
      <div ref={notificationRef} style={{ position: 'relative' }}>
        <button 
          onClick={() => {
            if ('Notification' in window && Notification.permission === 'default') {
              Notification.requestPermission();
            }
            if (!showNotifications && unreadCount > 0) {
              handleMarkAllAsRead();
            }
            setShowNotifications(!showNotifications);
          }}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}
        >
          <Bell size={24} color={isMobile ? "var(--text-primary)" : "var(--text-secondary)"} />
          {unreadCount > 0 && (
            <span style={{ position: 'absolute', top: '0px', right: '0px', backgroundColor: 'var(--error)', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div style={{ position: 'absolute', top: '100%', ...(isMobile ? { right: '0', left: 'auto' } : { left: '0', right: 'auto' }), width: 'min(350px, 90vw)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', flexDirection: 'column', maxHeight: '400px' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>Notifications</h3>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Aucune notification pour le moment.
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} onClick={() => { if(!n.isRead) handleMarkAsRead(n.id) }} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: n.isRead ? 'var(--bg-primary)' : 'rgba(var(--accent-primary-rgb), 0.05)', cursor: 'pointer', transition: 'background-color 0.2s', display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: n.isRead ? 500 : 600 }}>{n.title}</h4>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{n.message}</p>
                      {(() => {
                        const dStr = n.createdAt || n.created_at;
                        if (!dStr) return null;
                        const d = new Date(dStr);
                        if (isNaN(d.getTime())) return null;
                        return (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {d.toLocaleDateString('fr-FR')} à {d.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        );
                      })()}
                    </div>
                    {!n.isRead && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', marginTop: '0.4rem' }} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Mobile Topbar */}
      <div className="mobile-topbar hidden-desktop">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <img src="/logo1_cega.jpeg" alt="CEGA Logo" style={{ height: '30px' }} />
          {renderNotificationBell(true)}
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
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', position: 'relative' }}>
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <img src="/logo1_cega.jpeg" alt="Logo CEGA" style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '8px', marginRight: '0.75rem' }} />
              <h2 className="gradient-text" style={{ fontSize: '1.2rem', margin: 0 }}>CEGA</h2>
            </div>
            
            <div style={{ backgroundColor: 'rgba(150, 150, 150, 0.1)', padding: '0.85rem 1rem', borderRadius: '10px', width: '100%' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Espace</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>Formateur</div>
            </div>
          </div>
          <button className="hidden-desktop" onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', position: 'absolute', right: '-0.5rem', top: '-0.5rem' }}>
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
            <li>
              <NavLink to="/teacher/evaluations" style={navLinkStyle} onClick={() => setIsSidebarOpen(false)}>
                <Calendar size={20} style={{ marginRight: '0.75rem' }} /> Évaluations
              </NavLink>
            </li>
            <li>
              <NavLink to="/teacher/alerts" style={navLinkStyle} onClick={() => setIsSidebarOpen(false)}>
                <ShieldAlert size={20} style={{ marginRight: '0.75rem', color: '#ef4444' }} /> Alertes
              </NavLink>
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <NavLink to="/teacher/profile" style={navLinkStyle} onClick={() => setIsSidebarOpen(false)}>
                <User size={20} style={{ marginRight: '0.75rem' }} /> Mon Profil
              </NavLink>
            </li>
            <li>
              <NavLink to="/teacher/support" style={navLinkStyle} onClick={() => setIsSidebarOpen(false)}>
                <HelpCircle size={20} style={{ marginRight: '0.75rem' }} /> <span translate="no">Support</span>
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
              <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '10px', color: 'var(--text-primary)', backgroundColor: 'rgba(150, 150, 150, 0.1)', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500, textAlign: 'left', marginTop: '0.5rem', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(150, 150, 150, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(150, 150, 150, 0.1)'}>
                <LogOut size={20} style={{ marginRight: '0.75rem' }} /> Déconnexion
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Zone de contenu pour les sous-pages */}
      <main className="main-content">
        <header className="hidden-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0 1rem 0', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Espace Formateur</span>
            {renderNotificationBell(false)}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{user.firstName} {user.lastName}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 500 }}>Enseignant • {getDeptName(user.department)}</span>
            </div>
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Avatar" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
            ) : (
              <div translate="no" style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}>
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
            )}
          </div>
        </header>
        
        {/* L'Outlet rendra le contenu de la page active et lui passera l'objet user */}
        <Outlet context={{ user, setUser }} />
      </main>
    </div>
  );
};

export default TeacherSidebarLayout;
