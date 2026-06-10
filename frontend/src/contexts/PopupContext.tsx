import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

type PopupType = 'success' | 'error' | 'info' | 'warning';

interface AlertState {
  id: string;
  message: string;
  type: PopupType;
}

interface ConfirmState {
  message: string;
  resolve: (value: boolean) => void;
}

interface PopupContextType {
  showAlert: (message: string, type?: PopupType) => void;
  showConfirm: (message: string) => Promise<boolean>;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};

export const PopupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertState[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const showAlert = useCallback((message: string, type: PopupType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlerts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 5000);
  }, []);

  const showConfirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ message, resolve });
    });
  }, []);

  const handleConfirmAction = (result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  const getAlertIcon = (type: PopupType) => {
    switch (type) {
      case 'success': return <CheckCircle size={24} color="var(--success)" />;
      case 'error': return <XCircle size={24} color="var(--error)" />;
      case 'warning': return <AlertTriangle size={24} color="#F59E0B" />;
      case 'info':
      default: return <Info size={24} color="var(--accent-primary)" />;
    }
  };

  return (
    <PopupContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {/* Toast Alerts Container */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '1rem', pointerEvents: 'none' }}>
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            className="animate-slide-up"
            style={{ 
              pointerEvents: 'auto',
              backgroundColor: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '12px', 
              padding: '1rem 1.5rem', 
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              minWidth: '300px',
              maxWidth: '450px'
            }}
          >
            {getAlertIcon(alert.type)}
            <span style={{ color: 'var(--text-primary)', flex: 1, fontWeight: 500 }}>{alert.message}</span>
            <button 
              onClick={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirmState && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-slide-up" style={{ width: 'calc(100% - 2rem)', maxWidth: '400px', padding: '2rem', textAlign: 'center', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)' }}>
                <AlertTriangle size={32} />
              </div>
            </div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1rem', margin: 0 }}>Confirmation</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>{confirmState.message}</p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => handleConfirmAction(false)} style={{ flex: 1 }}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={() => handleConfirmAction(true)} style={{ flex: 1, backgroundColor: 'var(--error)', border: 'none' }}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </PopupContext.Provider>
  );
};
