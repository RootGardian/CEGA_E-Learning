import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Briefcase, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    department: 'mining'
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/register', formData, {
        withCredentials: true
      });
      
      if (response.status === 201) {
        // Rediriger vers la page de paiement après succès
        navigate('/payment-gateway');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        alert("Erreur d'inscription : " + error.response.data.message);
      } else {
        alert("Erreur d'inscription : Serveur indisponible");
      }
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-container glass-panel animate-slide-up">
        <div className="auth-header">
          <img src="/logo_cega.jpeg" alt="Logo CEGA" style={{ width: '96px', height: '96px', objectFit: 'contain', borderRadius: '16px', marginBottom: '1rem' }} />
          <h1 className="gradient-text">Rejoignez le CEGA</h1>
          <p>Créez votre compte étudiant.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">Prénom</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', top: '12px', left: '12px', color: '#94A3B8' }} size={20} />
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Jean"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lastName">Nom</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="form-input"
                placeholder="Dupont"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Adresse Email</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', top: '12px', left: '12px', color: '#94A3B8' }} size={20} />
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="jean.dupont@cega.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="department">Filière</label>
            <div style={{ position: 'relative' }}>
              <Briefcase style={{ position: 'absolute', top: '12px', left: '12px', color: '#94A3B8' }} size={20} />
              <select
                id="department"
                name="department"
                className="form-input"
                style={{ paddingLeft: '2.5rem', appearance: 'none', backgroundColor: 'rgba(255,255,255,0.03)' }}
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="mining" style={{ color: '#000' }}>Ingénierie Minière</option>
                <option value="geosciences" style={{ color: '#000' }}>Géosciences</option>
                <option value="topography" style={{ color: '#000' }}>Topographie</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Mot de Passe</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', top: '12px', left: '12px', color: '#94A3B8' }} size={20} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
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
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            <UserPlus size={20} style={{ marginRight: '0.5rem' }} />
            S'inscrire et Payer
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Vous avez déjà un compte ? <Link to="/login" className="link">Se connecter</Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
