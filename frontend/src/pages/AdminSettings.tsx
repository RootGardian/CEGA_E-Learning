import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'CEGA E-Learning',
    supportEmail: 'support@cega.edu',
    theme: 'dark',
    maintenanceMode: 'false',
    formationPrice: '500',
    exportFormat: 'PDF',
    modulePassGrade: '10'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/admin/settings', { withCredentials: true });
        setSettings(prev => ({ ...prev, ...res.data }));
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      await axios.put('/api/admin/settings', settings, { withCredentials: true });
      setSuccessMsg('Paramètres mis à jour avec succès !');
      
      // Appliquer immédiatement le thème sélectionné
      if (settings.theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      } else if (settings.theme === 'light') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      } else {
        localStorage.removeItem('theme');
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
        }
      }
      
    } catch (err) {
      console.error(err);
      setErrorMsg('Erreur lors de la sauvegarde des paramètres.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Chargement des paramètres...</div>;

  return (
    <div className="dashboard-content animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 6vw, 2.2rem)', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.2 }}>Paramètres & Configuration</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Configurez le prix de la formation, les notes minimales de passage et les formats d'exportation.</p>
      </div>
      
      {successMsg && (
        <div style={{ padding: '1rem', marginBottom: '2rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={20} /> {successMsg}
        </div>
      )}
      
      {errorMsg && (
        <div style={{ padding: '1rem', marginBottom: '2rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} /> {errorMsg}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Paramètres Généraux</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Nom du Site</label>
              <input 
                type="text" 
                name="siteName"
                className="form-input" 
                value={settings.siteName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Email de Support</label>
              <input 
                type="email" 
                name="supportEmail"
                className="form-input" 
                value={settings.supportEmail}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Système & Affichage</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Thème par défaut</label>
              <select 
                name="theme"
                className="form-input" 
                value={settings.theme}
                onChange={handleChange}
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <option value="dark">Sombre (Dark Mode)</option>
                <option value="light">Clair (Light Mode)</option>
                <option value="system">Système (Auto)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Mode Maintenance</label>
              <select 
                name="maintenanceMode"
                className="form-input" 
                value={settings.maintenanceMode}
                onChange={handleChange}
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <option value="false">Désactivé (Site en ligne)</option>
                <option value="true">Activé (Accès restreint)</option>
              </select>
            </div>
          </div>

          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Scolarité & Paiements</h2>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Prix de la formation à l'inscription (en GNF/EUR)</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Ce montant sera utilisé pour générer dynamiquement les paiements Stripe.</p>
            <input 
              type="number" 
              name="formationPrice"
              className="form-input" 
              value={settings.formationPrice}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Note minimale requise (/20)</label>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Score à atteindre pour débloquer le module suivant.</p>
              <input 
                type="number" 
                name="modulePassGrade"
                className="form-input" 
                value={settings.modulePassGrade}
                onChange={handleChange}
                required
                min="0"
                max="20"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Format d'exportation des bulletins</label>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Format par défaut pour les relevés de notes.</p>
              <select 
                name="exportFormat"
                className="form-input" 
                value={settings.exportFormat}
                onChange={handleChange}
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <option value="PDF">Document PDF (.pdf)</option>
                <option value="CSV">Fichier Texte (.csv)</option>
                <option value="EXCEL">Tableur Excel (.xlsx)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={20} style={{ marginRight: '0.5rem' }} />
            {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
