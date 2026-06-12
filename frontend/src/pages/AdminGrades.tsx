import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Download, FileText, CheckCircle, XCircle } from 'lucide-react';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';

const AdminGrades: React.FC = () => {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterEvaluation, setFilterEvaluation] = useState('all');

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await axios.get('/api/admin/grades', { withCredentials: true });
        setGrades(res.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des notes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  // Unique lists for dropdowns
  const departments = Array.from(new Set(grades.map(g => g.etudiant?.department).filter(Boolean)));
  const evaluations = Array.from(new Set(grades.map(g => g.evaluation?.title).filter(Boolean)));

  // Filtered grades
  const filteredGrades = grades.filter(g => {
    const studentName = `${g.etudiant?.firstName || ''} ${g.etudiant?.lastName || ''}`.toLowerCase();
    const email = (g.etudiant?.email || '').toLowerCase();
    const matchesSearch = studentName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    const matchesDept = filterDepartment === 'all' || g.etudiant?.department === filterDepartment;
    const matchesEval = filterEvaluation === 'all' || g.evaluation?.title === filterEvaluation;
    
    return matchesSearch && matchesDept && matchesEval;
  });

  const handleExportCSV = () => {
    const exportData = filteredGrades.map(g => ({
      "Date": new Date(g.createdAt).toLocaleDateString('fr-FR'),
      "Étudiant": `${g.etudiant?.firstName || ''} ${g.etudiant?.lastName || ''}`,
      "Email": g.etudiant?.email || '',
      "Filière": g.etudiant?.department || 'Non défini',
      "Évaluation": g.evaluation?.title || 'Inconnu',
      "Note": g.score !== null ? `${g.score}/20` : 'En attente',
      "Statut": g.score !== null ? (g.score >= 10 ? 'Réussi' : 'Échoué') : '-'
    }));
    exportToCSV(exportData, 'rapport_notes_etudiants');
  };

  const handleExportPDF = () => {
    const headers = ["Date", "Étudiant", "Filière", "Évaluation", "Note", "Statut"];
    const exportData = filteredGrades.map(g => [
      new Date(g.createdAt).toLocaleDateString('fr-FR'),
      `${g.etudiant?.firstName || ''} ${g.etudiant?.lastName || ''}`,
      g.etudiant?.department || 'Non défini',
      g.evaluation?.title || 'Inconnu',
      g.score !== null ? `${g.score}/20` : 'En attente',
      g.score !== null ? (g.score >= 10 ? 'Réussi' : 'Échoué') : '-'
    ]);
    exportToPDF(headers, exportData, 'rapport_notes_etudiants', 'Rapport Global des Notes');
  };

  if (loading) {
    return (
      <div className="dashboard-content animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Chargement des notes...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-content animate-fade-in">
      <div className="responsive-header">
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Notes & Résultats</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Consultez et exportez les notes de tous les étudiants, par filière et par évaluation.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%', justifyContent: 'flex-end' }}>
          <button 
            onClick={handleExportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, width: 'auto' }}
          >
            <Download size={18} />
            CSV
          </button>
          <button 
            onClick={handleExportPDF}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--accent-primary)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 600, width: 'auto' }}
          >
            <FileText size={18} />
            PDF
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Rechercher un étudiant</label>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
              <input 
                type="text" 
                placeholder="Nom, prénom ou email..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Filière</label>
            <div style={{ position: 'relative' }}>
              <Filter style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
              <select 
                value={filterDepartment}
                onChange={e => setFilterDepartment(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', appearance: 'none' }}
              >
                <option value="all">Toutes les filières</option>
                {departments.map((dept: any, i) => (
                  <option key={i} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ flex: '1 1 250px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Évaluation</label>
            <div style={{ position: 'relative' }}>
              <Filter style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
              <select 
                value={filterEvaluation}
                onChange={e => setFilterEvaluation(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', appearance: 'none' }}
              >
                <option value="all">Toutes les évaluations</option>
                {evaluations.map((evalTitle: any, i) => (
                  <option key={i} value={evalTitle}>{evalTitle}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Étudiant</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Filière</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Évaluation</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Note</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrades.length > 0 ? (
                filteredGrades.map((g) => (
                  <tr key={g.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="table-row-hover">
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)' }}>
                      <div style={{ fontWeight: 500 }}>{g.etudiant?.firstName} {g.etudiant?.lastName}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{g.etudiant?.email}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                      {g.etudiant?.department || '-'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {g.evaluation?.title || 'Inconnu'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: 'bold',
                        color: g.score !== null ? (g.score >= 10 ? 'var(--accent-primary)' : '#EF4444') : 'var(--text-secondary)' 
                      }}>
                        {g.score !== null ? `${g.score}/20` : '-'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {new Date(g.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {g.score !== null ? (
                        g.score >= 10 ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', backgroundColor: 'rgba(var(--accent-primary-rgb), 0.1)', color: 'var(--accent-primary)', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600 }}>
                            <CheckCircle size={14} /> Réussi
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600 }}>
                            <XCircle size={14} /> Échoué
                          </span>
                        )
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>En attente</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Aucune note ne correspond à vos filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </div>
    </div>
  );
};

export default AdminGrades;
