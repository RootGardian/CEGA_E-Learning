import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI to notify the user they can add to home screen
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      // Hide the app-provided install promotion
      setIsVisible(false);
      // Clear the deferredPrompt so it can be garbage collected
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="glass-panel animate-slide-up" style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      padding: '1.25rem',
      borderRadius: '12px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      maxWidth: '400px',
      border: '1px solid var(--border-color)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
    }}>
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Installer CEGA</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Installez l'application sur votre PC pour un accès plus rapide et une meilleure expérience.
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button 
          onClick={handleInstallClick}
          className="btn btn-primary"
          style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
        >
          <Download size={16} /> Installer
        </button>
        <button 
          onClick={() => setIsVisible(false)}
          className="btn btn-secondary"
          style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', whiteSpace: 'nowrap', backgroundColor: 'transparent', border: 'none' }}
        >
          <X size={16} /> Ignorer
        </button>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
