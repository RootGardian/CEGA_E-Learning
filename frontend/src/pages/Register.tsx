import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Briefcase, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { usePopup } from '../contexts/PopupContext';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    department: 'mining',
    formationType: 'e-learning'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formations, setFormations] = useState<any[]>([]);
  const navigate = useNavigate();
  const { showAlert } = usePopup();

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const res = await axios.get('/api/auth/public/formations');
        setFormations(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, department: res.data[0].code_formation }));
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des formations", err);
      }
    };
    fetchFormations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const lowerEmail = formData.email.toLowerCase().trim();
      const submissionData = { ...formData, email: lowerEmail };

      await axios.post('/api/auth/verify-email', { email: lowerEmail });
      
      // Navigate to payment and pass registration data in state
      navigate('/payment-gateway', { state: { registrationData: submissionData } });
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        showAlert(error.response.data.message, 'error');
      } else {
        showAlert("Erreur : Serveur indisponible", 'error');
      }
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-container glass-panel animate-slide-up" style={{ maxWidth: '650px', width: '100%' }}>
        <div className="auth-header">
          <img src="/logo_cega.jpeg" alt="Logo CEGA" style={{ width: '96px', height: '96px', objectFit: 'contain', borderRadius: '16px', marginBottom: '1rem' }} />
          <h1 className="gradient-text">Rejoignez le CEGA</h1>
          <p>Créez votre compte étudiant.</p>
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(var(--accent-primary-rgb), 0.05)', border: '1px solid var(--accent-primary)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <strong>Bienvenue !</strong> À la CEGA, nous proposons deux formats d'apprentissage : 
            une <strong>formation en présentiel</strong> dans nos locaux, et une <strong>formation 100% en ligne (E-learning)</strong>. 
            Veuillez choisir l'option qui vous convient ci-dessous.
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
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
                {formations.length === 0 ? (
                  <option value="mining" style={{ color: '#000' }}>Chargement...</option>
                ) : (
                  formations.map(f => (
                    <option key={f.id} value={f.code_formation} style={{ color: '#000' }}>
                      {f.titre}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="formationType">Type de Formation</label>
            <div style={{ position: 'relative' }}>
              <select
                id="formationType"
                name="formationType"
                className="form-input"
                style={{ appearance: 'none', backgroundColor: 'rgba(255,255,255,0.03)' }}
                value={formData.formationType}
                onChange={handleChange}
                required
              >
                <option value="e-learning" style={{ color: '#000' }}>Formation 100% en ligne (E-learning)</option>
                <option value="presentielle" style={{ color: '#000' }}>Formation en présentiel</option>
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
          Vous avez déjà un compte ? <Link to="/login" className="link" translate="no">Se connecter</Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
