import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Phone } from 'lucide-react';

const Support: React.FC = () => {
  const [settings, setSettings] = useState({
    supportEmail: 'support@cega.sn',
    supportPhone: '+221 77 000 00 00',
    supportDescription: "Notre équipe est là pour vous aider. N'hésitez pas à nous contacter si vous rencontrez des problèmes ou si vous avez des questions.",
    supportFormEnabled: 'true'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings', { withCredentials: true });
        setSettings(prev => ({ ...prev, ...res.data }));
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Chargement du support...</div>;
  }

  return (
    <div className="dashboard-content animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }} translate="no">Support & Assistance</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          {settings.supportDescription}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.2s', cursor: 'default' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(var(--accent-primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Mail size={32} color="var(--accent-primary)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Email</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1 }}>Pour toute demande générale ou technique.</p>
          <a href={`mailto:${settings.supportEmail}`} style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600, fontSize: '1.05rem' }}>{settings.supportEmail}</a>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.2s', cursor: 'default' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(var(--accent-primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Phone size={32} color="var(--accent-primary)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Téléphone</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1 }}>Assistance téléphonique de 8h à 18h.</p>
          <a href={`tel:${settings.supportPhone.replace(/\s+/g, '')}`} style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600, fontSize: '1.05rem' }}>{settings.supportPhone}</a>
        </div>

      </div>


    </div>
  );
};

export default Support;
