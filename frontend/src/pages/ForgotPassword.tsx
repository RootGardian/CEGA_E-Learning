import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import axios from 'axios';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setIsSubmitted(true);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Une erreur s'est produite");
      } else {
        setError("Une erreur s'est produite");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-container glass-panel animate-slide-up">
        <Link to="/login" className="link" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
          Retour à la connexion
        </Link>

        <div className="auth-header">
          <h1 className="gradient-text">Mot de passe oublié</h1>
          <p>Saisissez votre email pour recevoir un lien de réinitialisation.</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', borderRadius: '0', color: 'var(--error)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {!isSubmitted ? (
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

            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ marginTop: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}>
              <Send size={20} style={{ marginRight: '0.5rem' }} />
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0', border: '1px solid rgba(16, 185, 129, 0.3)' }} className="animate-fade-in">
            <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Email envoyé !</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Si un compte existe avec cette adresse, vous recevrez un email contenant les instructions pour réinitialiser votre mot de passe.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
