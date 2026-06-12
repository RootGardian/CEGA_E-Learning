import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { usePopup } from '../contexts/PopupContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { showAlert } = usePopup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Pour une vraie application, l'URL de l'API devrait être dans une variable d'environnement
      const response = await axios.post('/api/auth/login', { 
        email: email.trim(), 
        password: password.trim()
      }, {
        withCredentials: true // Important pour envoyer/recevoir le cookie HTTP-Only
      });
      
      if (response.status === 200) {
        const userRole = response.data.user?.role;
        if (userRole === 'enseignant') {
          navigate('/teacher/dashboard');
        } else if (userRole === 'admin' || userRole === 'directeur_formation') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard'); // Rediriger vers le tableau de bord en cas de succès
        }
      }
    } catch (error: unknown) {
      console.error('Erreur de connexion:', error);
      if (axios.isAxiosError(error) && error.response?.data?.require2FA) {
        // Logique à implémenter pour demander le token 2FA
        showAlert("Ce compte nécessite la Double Authentification. (Non implémenté dans l'UI)", 'warning');
      } else if (axios.isAxiosError(error) && error.response) {
        showAlert("Erreur de connexion : " + (error.response?.data?.message || "Identifiants invalides"), 'error');
      } else {
        showAlert("Erreur de connexion : Serveur indisponible. Veuillez vérifier votre connexion ou réessayer plus tard.", 'error');
      }
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-container glass-panel animate-slide-up">
        <div className="auth-header">
          <img src="/logo_cega.jpeg" alt="Logo CEGA" style={{ width: '96px', height: '96px', objectFit: 'contain', borderRadius: '16px', marginBottom: '1rem' }} />
          <h1 className="gradient-text">CEGA E-Learning</h1>
          <p>Bienvenue. Connectez-vous à votre espace.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Adresse Email</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', top: '12px', left: '12px', color: '#94A3B8' }} size={20} />
              <input
                id="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="prenom.nom@cega.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Mot de Passe</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', top: '12px', left: '12px', color: '#94A3B8' }} size={20} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <Link to="/forgot-password" className="link" style={{ fontSize: '0.85rem' }}>Mot de passe oublié ?</Link>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" translate="no">
            <LogIn size={20} style={{ marginRight: '0.5rem' }} />
            Se connecter
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Vous êtes un nouvel étudiant ? <Link to="/register" className="link">S'inscrire</Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
