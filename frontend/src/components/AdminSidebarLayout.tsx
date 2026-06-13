import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LogOut,
  TrendingUp,
  Users,
  CreditCard,
  Settings,
  Menu,
  X,
  User as UserIcon,
  Bell,
  Check,
  GraduationCap,
  FileText,
  Video,
  ArrowLeft,
  HelpCircle,
  BookOpen
} from 'lucide-react';

export interface AdminProfile {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  photo_url?: string;
  notificationPreferences?: any;
}

const AdminSidebarLayout: React.FC = () => {
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState<any[]>([]);
  const [unreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
        if (profileRes.data.role !== 'admin' && profileRes.data.role !== 'directeur_formation') {
          navigate('/dashboard'); 
        } else {
          setUser(profileRes.data);
        }
      } catch (err: unknown) {
        console.error('Erreur de chargement profil admin:', err);
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

  const handleMarkAllAsRead = () => {};
  const handleMarkAsRead = () => {};

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', fontWeight: 500 }}>Chargement de l'espace Administrateur...</div>
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

  const renderNotificationBell = (isMobile = false) => {
    if (user.notificationPreferences?.inAppAlerts === false) return null;
    
    return (
      <div ref={notificationRef} style={{ position: 'relative' }}>
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
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
              {unreadCount > 0 && (
                <button onClick={handleMarkAllAsRead} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Check size={14} /> Tout lu
                </button>
              )}
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {notifications.length === 0 ? (
                <p style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Aucune notification.</p>
              ) : (
                notifications.map((notif: any, index: number) => (
                  <div 
                    key={notif.id || index} 
                    onClick={() => !notif.isRead && handleMarkAsRead()}
                    style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: notif.isRead ? 'transparent' : 'rgba(var(--accent-primary-rgb), 0.05)', cursor: notif.isRead ? 'default' : 'pointer', display: 'flex', gap: '1rem' }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0 0 0.25rem 0', fontWeight: notif.isRead ? 500 : 600 }}>{notif.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>{notif.message}</p>
                      {(() => {
                        const dStr = notif.createdAt || notif.created_at;
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
    );
  };

  return (
    <div className="app-container">
      {/* Mobile Topbar */}
      <div className="mobile-topbar hidden-desktop">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo1_cega.jpeg" alt="Logo" style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '8px', marginRight: '0.75rem' }} />
          <h2 className="gradient-text" style={{ fontSize: '1.3rem', margin: 0 }}>Admin</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {renderNotificationBell(true)}
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
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>Directeur</div>
            </div>
          </div>
          <button className="hidden-desktop" onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', position: 'absolute', right: '-0.5rem', top: '-0.5rem' }}>
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <NavLink to="/admin/dashboard" style={navLinkStyle} onClick={() => setIsSidebarOpen(false)}>
                <TrendingUp size={20} style={{ marginRight: '0.75rem' }} /> Vue d'ensemble
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/students" style={navLinkStyle} onClick={() => setIsSidebarOpen(false)}>
                <Users size={20} style={{ marginRight: '0.75rem' }} /> Gestion des Étudiants
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/formateurs" style={navLinkStyle} onClick={() => setIsSidebarOpen(false)}>
                <GraduationCap size={20} style={{ marginRight: '0.75rem' }} /> Gestion des Formateurs
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/evaluations" style={navLinkStyle} onClick={() => setIsSidebarOpen(false)}>
                <BookOpen size={20} style={{ marginRight: '0.75rem' }} /> Cours Communs
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/grades" style={navLinkStyle} onClick={() => setIsSidebarOpen(false)}>
                <FileText size={20} style={{ marginRight: '0.75rem' }} /> Notes & Résultats
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/enrollments" style={navLinkStyle} onClick={() => setIsSidebarOpen(false)}>
                <CreditCard size={20} style={{ marginRight: '0.75rem' }} /> Inscriptions & Paiements
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/resources" style={navLinkStyle} onClick={() => setIsSidebarOpen(false)}>
                <Video size={20} style={{ marginRight: '0.75rem' }} /> Ressources
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/settings" style={navLinkStyle} onClick={() => setIsSidebarOpen(false)}>
                <Settings size={20} style={{ marginRight: '0.75rem' }} /> Paramètres
              </NavLink>
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <NavLink to="/admin/support" style={navLinkStyle} onClick={() => setIsSidebarOpen(false)}>
                <HelpCircle size={20} style={{ marginRight: '0.75rem' }} /> <span translate="no">Support</span>
              </NavLink>
            </li>
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
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Espace Administration</span>
            {renderNotificationBell(false)}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{user.prenom} {user.nom}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 500 }}>Directeur de Formation</span>
            </div>
            {user.photo_url ? (
              <img src={user.photo_url} alt="Avatar" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
            ) : (
              <div translate="no" style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}>
                {user.prenom ? user.prenom.charAt(0) : ''}{user.nom ? user.nom.charAt(0) : ''}
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

export default AdminSidebarLayout;
