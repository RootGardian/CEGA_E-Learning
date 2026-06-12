import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, RefreshCw, CheckCircle, Search, AlertTriangle, Calendar, Bell } from 'lucide-react';
import { usePopup } from '../contexts/PopupContext';
import socket from '../utils/socket';

interface Etudiant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Evaluation {
  id: number;
  title: string;
}

interface FraudAlert {
  id: number;
  evaluationId: number;
  etudiantId: number;
  score: number | null;
  feedback: string;
  createdAt: string;
  evaluation?: Evaluation;
  etudiant?: Etudiant;
}

const TeacherAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showAlert, showConfirm } = usePopup();

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('/api/evaluations/alerts/frauds', { withCredentials: true });
      setAlerts(res.data);
    } catch (err) {
      console.error("Erreur de récupération des alertes:", err);
      showAlert("Impossible de charger les alertes.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Notifications en temps réel : avertissement de fraude niveau 2
    const handleFraudWarning = (data: { studentName: string; examTitle: string; warning: number; reason: string; timestamp: string }) => {
      showAlert(`🚨 Alerte : ${data.studentName} a déclenché un avertissement sur l'examen "${data.examTitle}".\nMotif : ${data.reason}`, 'error');
      // Rafraîchir la liste pour voir si une 3ème infraction a créé une alerte
      fetchAlerts();
    };

    socket.on('student_fraud_warning', handleFraudWarning);
    return () => {
      socket.off('student_fraud_warning', handleFraudWarning);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAuthorizeRetake = async (evaluationId: number, etudiantId: number, etudiantName: string) => {
    const confirm = await showConfirm(`Voulez-vous autoriser ${etudiantName} à recommencer cet examen ? Cette action annulera sa note de 0 pour fraude.`);
    if (!confirm) return;

    try {
      await axios.delete(`/api/evaluations/${evaluationId}/grades/${etudiantId}`, { withCredentials: true });
      showAlert("L'étudiant a été autorisé à recommencer l'examen.", "success");
      // Mettre à jour la liste localement
      setAlerts(prev => prev.filter(a => !(a.evaluationId === evaluationId && a.etudiantId === etudiantId)));
    } catch (err) {
      console.error("Erreur d'autorisation:", err);
      showAlert("Une erreur est survenue lors de l'autorisation.", "error");
    }
  };

  const filteredAlerts = alerts.filter(a => {
    const studentName = `${a.etudiant?.firstName} ${a.etudiant?.lastName}`.toLowerCase();
    const evalTitle = a.evaluation?.title?.toLowerCase() || '';
    const term = searchTerm.toLowerCase();
    return studentName.includes(term) || evalTitle.includes(term) || a.feedback.toLowerCase().includes(term);
  });

  return (
    <div className="dashboard-content animate-fade-in">
      <div style={{ marginBottom: '3rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldAlert size={32} color="#ef4444" />
          Alertes de Fraudes
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Surveillez et gérez les incidents de triche détectés lors des examens.</p>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Rechercher par étudiant, examen ou motif..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
          />
        </div>
        <button onClick={fetchAlerts} className="btn" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
          <RefreshCw size={20} />
          Rafraîchir
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--accent-primary)' }}>
          <RefreshCw size={32} className="animate-spin" />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
          <CheckCircle size={48} color="var(--accent-primary)" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Aucune fraude détectée</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Tout est en ordre pour le moment.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {filteredAlerts.map(alert => {
            const fraudReason = alert.feedback.replace('FRAUDE DÉTECTÉE :', '').trim();
            const date = new Date(alert.createdAt).toLocaleString('fr-FR', {
              day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <div key={alert.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>{alert.etudiant?.firstName} {alert.etudiant?.lastName}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{alert.etudiant?.email}</div>
                  </div>
                  <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 'bold' }}>
                    Note: 0/20
                  </span>
                </div>

                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '0.5rem', fontWeight: 600 }}>
                    <AlertTriangle size={16} /> Motif
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{fraudReason}</div>
                </div>

                <div style={{ flex: 1, marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ display: 'inline-block', width: '20px', textAlign: 'center' }}>📝</span> 
                    {alert.evaluation?.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ display: 'inline-block', width: '20px', textAlign: 'center' }}><Calendar size={14} /></span> 
                    {date}
                  </div>
                </div>

                <button 
                  onClick={() => handleAuthorizeRetake(alert.evaluationId, alert.etudiantId, `${alert.etudiant?.firstName} ${alert.etudiant?.lastName}`)}
                  className="btn"
                  style={{ width: '100%', backgroundColor: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', fontWeight: 600, padding: '0.75rem' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'white'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
                >
                  Autoriser à recommencer
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherAlerts;
