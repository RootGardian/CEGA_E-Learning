import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Edit2, CheckCircle, XCircle, Trash2, MoreVertical } from 'lucide-react';
import { usePopup } from '../contexts/PopupContext';

const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showAlert, showConfirm } = usePopup();
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ firstName: '', lastName: '', email: '', password: '', department: 'mining' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown State
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/admin/students', { withCredentials: true });
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('/api/admin/students', newStudent, { withCredentials: true });
      setShowAddModal(false);
      setNewStudent({ firstName: '', lastName: '', email: '', password: '', department: 'mining' });
      fetchStudents();
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'Erreur lors de la création', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await axios.patch(`/api/admin/students/${id}/status`, { status }, { withCredentials: true });
      setActiveDropdown(null);
      fetchStudents();
    } catch (err) {
      showAlert('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleToggleBlock = async (id: number, currentIsActive: boolean) => {
    try {
      await axios.patch(`/api/admin/students/${id}/block`, { is_active: !currentIsActive }, { withCredentials: true });
      setActiveDropdown(null);
      fetchStudents();
    } catch (err) {
      showAlert('Erreur lors de la mise à jour du statut', 'error');
    }
  };

  const handleDeleteStudent = async (id: number) => {
    const confirmed = await showConfirm("Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action est irréversible.");
    if (confirmed) {
      try {
        await axios.delete(`/api/admin/students/${id}`, { withCredentials: true });
        setActiveDropdown(null);
        fetchStudents();
      } catch (err) {
        showAlert("Erreur lors de la suppression de l'étudiant.", 'error');
      }
    }
  };

  const openEditModal = (student: any) => {
    setEditingStudent(student);
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.put(`/api/admin/students/${editingStudent.id}`, editingStudent, { withCredentials: true });
      setShowEditModal(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'Erreur lors de la modification', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (student: any) => {
    if (student.is_active === false) {
      return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', fontSize: '0.8rem', fontWeight: 600 }}>Bloqué</span>;
    }
    switch(student.subscriptionStatus) {
      case 'active': return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>Actif</span>;
      case 'pending': return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#D97706', fontSize: '0.8rem', fontWeight: 600 }}>En attente</span>;
      case 'expired': return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', fontSize: '0.8rem', fontWeight: 600 }}>Expiré</span>;
      default: return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: 'rgba(148, 163, 184, 0.1)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>{student.subscriptionStatus}</span>;
    }
  };

  const handleExportCSV = () => {
    if (students.length === 0) {
      showAlert("Aucune donnée à exporter.", 'warning');
      return;
    }

    const headers = ['Nom', 'Prénom', 'Email', 'Département', 'Statut', 'Expiration'];
    
    const csvRows = students.map(student => {
      const nom = student.lastName;
      const prenom = student.firstName;
      const email = student.email;
      const dept = student.department;
      const status = student.subscriptionStatus;
      const exp = student.accessExpirationDate ? new Date(student.accessExpirationDate).toLocaleDateString('fr-FR') : '';

      return [nom, prenom, email, dept, status, exp]
        .map(field => `"${String(field || '').replace(/"/g, '""')}"`)
        .join(';');
    });

    const csvContent = [headers.join(';'), ...csvRows].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `etudiants_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-content animate-fade-in">
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Gestion des Étudiants</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Créez, modifiez ou suspendez les comptes étudiants.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV} style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Exporter
          </button>
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowAddModal(true)}>+ Nouvel Étudiant</button>
        </div>
      </div>
      
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Chargement des étudiants...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Nom / Prénom</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Email</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Département</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Statut d'Accès</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Expiration</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Aucun étudiant trouvé.</td>
                </tr>
              ) : (
                students.map(student => (
                  <tr key={student.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: 'var(--accent-secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{student.firstName} {student.lastName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{student.email}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{student.department}</td>
                    <td style={{ padding: '1rem' }}>{getStatusBadge(student)}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {student.accessExpirationDate ? new Date(student.accessExpirationDate).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td style={{ padding: '1rem', position: 'relative', textAlign: 'right' }}>
                      <button 
                        onClick={() => setActiveDropdown(student.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      >
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: 'calc(100% - 2rem)', maxWidth: '450px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', color: 'var(--text-primary)', margin: 0 }}>Créer un Étudiant</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>
            <form onSubmit={handleCreateStudent}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Prénom</label>
                  <input type="text" className="form-input" required value={newStudent.firstName} onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Nom</label>
                  <input type="text" className="form-input" required value={newStudent.lastName} onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Email</label>
                <input type="email" className="form-input" required value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Mot de passe provisoire</label>
                <input type="password" className="form-input" required value={newStudent.password} onChange={(e) => setNewStudent({...newStudent, password: e.target.value})} />
              </div>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Département</label>
                <select className="form-input" required value={newStudent.department} onChange={(e) => setNewStudent({...newStudent, department: e.target.value})}>
                  <option value="mining" style={{ color: '#000', backgroundColor: '#FFF' }}>Mines (Exploitation & Traitement)</option>
                  <option value="geosciences" style={{ color: '#000', backgroundColor: '#FFF' }}>Géosciences (Géologie & Exploration)</option>
                  <option value="topography" style={{ color: '#000', backgroundColor: '#FFF' }}>Topographie & Cartographie</option>
                  <option value="hse" style={{ color: '#000', backgroundColor: '#FFF' }}>HSE (Hygiène, Sécurité, Environnement)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary" style={{ width: 'auto' }}>Annuler</button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Création...' : 'Créer le compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingStudent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: 'calc(100% - 2rem)', maxWidth: '450px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', color: 'var(--text-primary)', margin: 0 }}>Modifier l'Étudiant</h2>
              <button onClick={() => { setShowEditModal(false); setEditingStudent(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Prénom</label>
                  <input type="text" className="form-input" required value={editingStudent.firstName} onChange={(e) => setEditingStudent({...editingStudent, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Nom</label>
                  <input type="text" className="form-input" required value={editingStudent.lastName} onChange={(e) => setEditingStudent({...editingStudent, lastName: e.target.value})} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Email</label>
                <input type="email" className="form-input" required value={editingStudent.email} onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})} />
              </div>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Département</label>
                <select className="form-input" required value={editingStudent.department} onChange={(e) => setEditingStudent({...editingStudent, department: e.target.value})}>
                  <option value="mining" style={{ color: '#000', backgroundColor: '#FFF' }}>Mines (Exploitation & Traitement)</option>
                  <option value="geosciences" style={{ color: '#000', backgroundColor: '#FFF' }}>Géosciences (Géologie & Exploration)</option>
                  <option value="topography" style={{ color: '#000', backgroundColor: '#FFF' }}>Topographie & Cartographie</option>
                  <option value="hse" style={{ color: '#000', backgroundColor: '#FFF' }}>HSE (Hygiène, Sécurité, Environnement)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowEditModal(false); setEditingStudent(null); }} className="btn btn-secondary" style={{ width: 'auto' }}>Annuler</button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Sauvegarde...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Modal (Centered Menu) */}
      {activeDropdown && students.find(s => s.id === activeDropdown) && (() => {
        const activeStudent = students.find(s => s.id === activeDropdown);
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
            <div className="glass-panel animate-slide-up" style={{ width: 'calc(100% - 2rem)', maxWidth: '380px', padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0 }}>Options de l'étudiant</h2>
                <button onClick={() => setActiveDropdown(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
              </div>
              
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{activeStudent.firstName} {activeStudent.lastName}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{activeStudent.email}</div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button 
                  className="dropdown-item"
                  style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                  onClick={() => openEditModal(activeStudent)}
                >
                  <Edit2 size={18} /> Modifier le profil
                </button>
                
                <button 
                  className="dropdown-item success"
                  style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                  onClick={() => handleUpdateStatus(activeStudent.id, 'active')}
                >
                  <CheckCircle size={18} /> Activer l'accès
                </button>

                <button 
                  className="dropdown-item warning"
                  style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                  onClick={() => handleToggleBlock(activeStudent.id, activeStudent.is_active)}
                >
                  <XCircle size={18} /> {activeStudent.is_active === false ? "Débloquer l'accès" : "Bloquer l'accès"}
                </button>

                <button 
                  className="dropdown-item danger"
                  style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                  onClick={() => handleDeleteStudent(activeStudent.id)}
                >
                  <Trash2 size={18} /> Supprimer l'étudiant
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AdminStudents;
