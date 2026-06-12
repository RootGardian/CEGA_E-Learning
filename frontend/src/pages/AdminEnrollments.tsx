import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, FileText } from 'lucide-react';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';
import { usePopup } from '../contexts/PopupContext';

const AdminEnrollments: React.FC = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = usePopup();

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await axios.get('/api/admin/enrollments', { withCredentials: true });
        setEnrollments(res.data);
      } catch (err) {
        console.error("Failed to fetch enrollments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const handleExportCSV = () => {
    if (enrollments.length === 0) {
      showAlert("Aucune donnée à exporter.", 'warning');
      return;
    }
    const exportData = enrollments.map(txn => ({
      "Date": !isNaN(new Date(txn.createdAt).getTime()) ? new Date(txn.createdAt).toLocaleDateString('fr-FR') : 'Inconnue',
      "Étudiant": txn.Etudiant ? `${txn.Etudiant.firstName} ${txn.Etudiant.lastName}` : 'Inconnu',
      "Email": txn.Etudiant?.email || '',
      "Département": txn.Etudiant?.department || '',
      "Montant": txn.amount,
      "Devise": txn.currency,
      "Statut": txn.status,
      "Réf Stripe": txn.stripePaymentIntentId || ''
    }));
    exportToCSV(exportData, `inscriptions_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportPDF = () => {
    if (enrollments.length === 0) {
      showAlert("Aucune donnée à exporter.", 'warning');
      return;
    }
    const headers = ["Date", "Étudiant", "Email", "Montant", "Statut"];
    const exportData = enrollments.map(txn => [
      !isNaN(new Date(txn.createdAt).getTime()) ? new Date(txn.createdAt).toLocaleDateString('fr-FR') : 'Inconnue',
      txn.Etudiant ? `${txn.Etudiant.firstName} ${txn.Etudiant.lastName}` : 'Inconnu',
      txn.Etudiant?.email || '',
      `${txn.amount} ${txn.currency}`,
      txn.status
    ]);
    exportToPDF(headers, exportData, `inscriptions_${new Date().toISOString().split('T')[0]}`, 'Transactions & Inscriptions');
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'succeeded': return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: 'rgba(var(--accent-primary-rgb), 0.1)', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>Réussi</span>;
      case 'pending': return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#D97706', fontSize: '0.8rem', fontWeight: 600 }}>En attente</span>;
      case 'failed': return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', fontSize: '0.8rem', fontWeight: 600 }}>Échoué</span>;
      default: return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: 'rgba(148, 163, 184, 0.1)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>{status}</span>;
    }
  };

  return (
    <div className="dashboard-content animate-fade-in">
      <div className="responsive-header">
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.2 }}>Inscriptions & Paiements</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Gérez les transactions et les statuts des inscriptions.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV} style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> CSV
          </button>
          <button className="btn btn-secondary" onClick={handleExportPDF} style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--accent-primary)', color: 'white', borderColor: 'var(--accent-primary)' }}>
            <FileText size={18} /> PDF
          </button>
        </div>
      </div>
      
      <div className="glass-panel table-responsive">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Chargement des transactions...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Date</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Étudiant</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Montant</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Devise</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Statut</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Réf. Stripe</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Aucune transaction trouvée.</td>
                </tr>
              ) : (
                enrollments.map(txn => (
                  <tr key={txn.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {(() => {
                        const d = new Date(txn.createdAt);
                        return isNaN(d.getTime()) ? 'Date inconnue' : `${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}`;
                      })()}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                      {txn.Etudiant ? `${txn.Etudiant.firstName} ${txn.Etudiant.lastName}` : 'Étudiant Inconnu'}
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{txn.Etudiant?.email}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{txn.amount}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>{txn.currency}</td>
                    <td style={{ padding: '1rem' }}>{getStatusBadge(txn.status)}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                      {txn.stripePaymentIntentId || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminEnrollments;
