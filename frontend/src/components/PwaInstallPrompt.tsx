import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isManualInstall, setIsManualInstall] = useState(false);

  useEffect(() => {
    // Check if dismissed
    const dismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissed === 'true') return;

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone);
    if (isStandalone) return;

    let promptFired = false;

    const handler = (e: Event) => {
      e.preventDefault();
      promptFired = true;
      setDeferredPrompt(e);
      setIsVisible(true);
      setIsManualInstall(false);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    });

    const timeout = setTimeout(() => {
      if (!promptFired && !isStandalone) {
        setIsVisible(true);
        setIsManualInstall(true);
      }
    }, 2500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timeout);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setIsVisible(false);
    } else {
      handleDismiss();
    }
  };

  if (!isVisible) return null;

  const getManualInstallInstruction = () => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      return "Sur iOS, appuyez sur l'icône Partage puis sur 'Sur l'écran d'accueil'.";
    } else if (/mac os/.test(ua) && /safari/.test(ua) && !/chrome/.test(ua)) {
      return "Sur Safari Mac, allez dans le menu Fichier > Ajouter au Dock.";
    } else if (/firefox/.test(ua)) {
      return "Sur Firefox, allez dans le menu et sélectionnez 'Installer' ou 'Ajouter à l'écran d'accueil'.";
    } else if (/edg/.test(ua)) {
      return "Sur Edge, cliquez sur l'icône 'Application disponible' (trois carrés et un plus) dans la barre d'adresse en haut à droite.";
    } else if (/chrome/.test(ua)) {
      return "Sur Chrome, cliquez sur l'icône d'installation (un écran avec une flèche vers le bas) située à droite dans votre barre d'adresse.";
    }
    return "Ouvrez le menu de votre navigateur et sélectionnez 'Ajouter à l'écran d'accueil' ou 'Installer l'application'.";
  };

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
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Installer CEGA
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {isManualInstall 
            ? getManualInstallInstruction() 
            : "Installez l'application sur votre PC pour un accès plus rapide et une meilleure expérience."}
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {!isManualInstall && (
          <button 
            onClick={handleInstallClick}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
          >
            <Download size={16} /> Installer
          </button>
        )}
        <button 
          onClick={handleDismiss}
          className="btn btn-secondary"
          style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', whiteSpace: 'nowrap', backgroundColor: isManualInstall ? 'var(--accent-primary)' : 'transparent', color: isManualInstall ? 'white' : 'inherit', border: isManualInstall ? 'none' : '1px solid var(--border-color)' }}
        >
          {isManualInstall ? "J'ai compris" : <><X size={16} /> Ignorer</>}
        </button>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
