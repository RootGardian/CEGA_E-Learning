import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Shield, Bell, Key, Smartphone } from 'lucide-react';
import type { UserProfile } from '../components/SidebarLayout';

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Inconnue';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const Settings: React.FC = () => {
  const { user, setUser } = useOutletContext<{ user: UserProfile, setUser: React.Dispatch<React.SetStateAction<UserProfile | null>> }>();
  const [loading2FA, setLoading2FA] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [setupError, setSetupError] = useState('');
  const [setupSuccess, setSetupSuccess] = useState('');
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [preferences, setPreferences] = useState(
    user.notificationPreferences || {
      inAppAlerts: true,
      newCourse: true,
      examReminders: true,
      examResults: true
    }
  );
  
  const handleTogglePreference = async (key: keyof typeof preferences) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPreferences);
    
    try {
      const res = await axios.put('/api/auth/me', { notificationPreferences: newPreferences }, { withCredentials: true });
      setUser(res.data);
    } catch (err) {
      console.error('Erreur lors de la mise à jour des préférences', err);
      setPreferences(preferences); // Revert
    }
  };

  const handleEnable2FA = async () => {
    setLoading2FA(true);
    setSetupError('');
    try {
      const response = await axios.post('/api/auth/enable-2fa', {}, { withCredentials: true });
      setQrCode(response.data.qrCodeDataUrl);
    } catch {
      setSetupError('Erreur lors de la génération du QR Code.');
    } finally {
      setLoading2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    setSetupError('');
    try {
      await axios.post('/api/auth/verify-2fa', { token: twoFactorToken }, { withCredentials: true });
      setSetupSuccess('Double authentification activée avec succès !');
      setQrCode(null);
    } catch {
      setSetupError('Code invalide. Veuillez réessayer.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit faire au moins 6 caractères.');
      return;
    }

    setLoadingPassword(true);
    try {
      await axios.put('/api/auth/password', {
        currentPassword,
        newPassword
      }, { withCredentials: true });
      setPasswordSuccess('Mot de passe mis à jour avec succès.');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe.');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="dashboard-content animate-fade-in">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Paramètres</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Gérez vos préférences et la sécurité de votre compte.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', maxWidth: '800px' }}>
        
        {/* Sécurité */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <Shield size={24} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Sécurité du compte</h2>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={18} /> Mot de passe
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Dernière modification : {formatDate(user.updatedAt)}
              </p>
            </div>
            {!isChangingPassword && (
              <button onClick={() => setIsChangingPassword(true)} className="btn btn-secondary" style={{ width: 'auto' }}>Modifier</button>
            )}
          </div>

          {isChangingPassword && (
            <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', marginBottom: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Changer de mot de passe</h4>
              <form onSubmit={handleChangePassword}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Mot de passe actuel</label>
                    <input 
                      type="password" 
                      className="input-field" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Nouveau mot de passe</label>
                    <input 
                      type="password" 
                      className="input-field" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Confirmer le nouveau mot de passe</label>
                    <input 
                      type="password" 
                      className="input-field" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  {passwordError && <p style={{ color: 'var(--error)', fontSize: '0.9rem' }}>{passwordError}</p>}
                  
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setIsChangingPassword(false)} className="btn btn-secondary" style={{ width: 'auto' }}>
                      Annuler
                    </button>
                    <button type="submit" disabled={loadingPassword} className="btn btn-primary" style={{ width: 'auto' }}>
                      {loadingPassword ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {passwordSuccess && (
            <div style={{ padding: '1rem', backgroundColor: 'transparent', border: '1px solid var(--success)', color: 'var(--success)', marginBottom: '1.5rem' }}>
              {passwordSuccess}
            </div>
          )}

          <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Smartphone size={18} /> Double Authentification (2FA)
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Sécurisez votre compte avec une application comme Google Authenticator.</p>
              </div>
              {!user.isTwoFactorEnabled && !qrCode && (
                <button onClick={handleEnable2FA} disabled={loading2FA} className="btn btn-primary" style={{ width: 'auto' }}>
                  {loading2FA ? 'Chargement...' : 'Configurer'}
                </button>
              )}
              {user.isTwoFactorEnabled && (
                <span style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', border: '1px solid var(--success)', color: 'var(--success)', fontWeight: 600 }}>
                  Activé
                </span>
              )}
            </div>

            {qrCode && (
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border-color)' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>1. Scannez ce QR Code</h4>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <img src={qrCode} alt="QR Code 2FA" style={{ border: '4px solid white', borderRadius: '4px' }} />
                </div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>2. Entrez le code généré</h4>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    type="text" 
                    placeholder="Ex: 123456" 
                    value={twoFactorToken}
                    onChange={(e) => setTwoFactorToken(e.target.value)}
                    className="input-field"
                    style={{ flex: 1, letterSpacing: '0.2rem', textAlign: 'center', fontSize: '1.2rem' }}
                    maxLength={6}
                  />
                  <button onClick={handleVerify2FA} className="btn btn-primary" style={{ width: 'auto' }}>Vérifier</button>
                </div>
                {setupError && <p style={{ color: 'var(--error)', marginTop: '1rem', fontSize: '0.9rem' }}>{setupError}</p>}
              </div>
            )}
            
            {setupSuccess && <p style={{ color: 'var(--success)', marginTop: '1rem', fontSize: '0.9rem', fontWeight: 500 }}>{setupSuccess}</p>}
          </div>
        </div>

        {/* Préférences */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <Bell size={24} color="var(--accent-secondary)" />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Préférences</h2>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Alertes notifications in-app</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Afficher une cloche de notification dans l'application.</p>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" checked={preferences.inAppAlerts} onChange={() => handleTogglePreference('inAppAlerts')} style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }} />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Nouveau cours débloqué</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Être averti lors du déblocage d'un nouveau cours par l'enseignant.</p>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" checked={preferences.newCourse} onChange={() => handleTogglePreference('newCourse')} style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }} />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Rappels automatiques d'examen</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Recevoir des rappels avant une date d'examen (J-7, J-3, J-1).</p>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" checked={preferences.examReminders} onChange={() => handleTogglePreference('examReminders')} style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }} />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Publication des résultats</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Notification de publication des résultats d'évaluation.</p>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" checked={preferences.examResults} onChange={() => handleTogglePreference('examResults')} style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }} />
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
