import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Download, Edit2, Trash2, MoreVertical, BookOpen, X } from 'lucide-react';
import { usePopup } from '../contexts/PopupContext';

const AdminFormateurs: React.FC = () => {
  const [formateurs, setFormateurs] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert, showConfirm } = usePopup();

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [activeAction, setActiveAction] = useState<number | null>(null);

  // Form states
  const [newFormateur, setNewFormateur] = useState({ firstName: '', lastName: '', email: '', password: '', department: 'mining' });
  const [editingFormateur, setEditingFormateur] = useState<any>(null);
  const [assignTarget, setAssignTarget] = useState<any>(null);
  const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFormateurs = async () => {
    try {
      const res = await axios.get('/api/admin/formateurs', { withCredentials: true });
      setFormateurs(res.data);
    } catch (err) {
      console.error('Failed to fetch formateurs', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/api/admin/courses', { withCredentials: true });
      setCourses(res.data);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    }
  };

  useEffect(() => {
    fetchFormateurs();
    fetchCourses();
  }, []);

  const handleCreateFormateur = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('/api/admin/formateurs', newFormateur, { withCredentials: true });
      setShowAddModal(false);
      setNewFormateur({ firstName: '', lastName: '', email: '', password: '', department: 'mining' });
      fetchFormateurs();
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'Erreur lors de la création', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.put(`/api/admin/formateurs/${editingFormateur.id}`, editingFormateur, { withCredentials: true });
      setShowEditModal(false);
      setEditingFormateur(null);
      fetchFormateurs();
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'Erreur lors de la modification', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFormateur = async (id: number) => {
    const confirmed = await showConfirm('Êtes-vous sûr de vouloir supprimer ce formateur ? Cette action est irréversible.');
    if (confirmed) {
      try {
        await axios.delete(`/api/admin/formateurs/${id}`, { withCredentials: true });
        setActiveAction(null);
        fetchFormateurs();
      } catch (err) {
        showAlert("Erreur lors de la suppression du formateur.", 'error');
      }
    }
  };

  const handleToggleBlock = async (id: number, currentIsActive: boolean) => {
    try {
      await axios.patch(`/api/admin/formateurs/${id}/block`, { is_active: !currentIsActive }, { withCredentials: true });
      setActiveAction(null);
      fetchFormateurs();
    } catch (err) {
      showAlert('Erreur lors de la mise à jour du statut', 'error');
    }
  };

  const openEditModal = (formateur: any) => {
    setEditingFormateur({ ...formateur });
    setShowEditModal(true);
    setActiveAction(null);
  };

  const openAssignModal = async (formateur: any) => {
    setAssignTarget(formateur);
    setActiveAction(null);
    try {
      const res = await axios.get(`/api/admin/formateurs/${formateur.id}/courses`, { withCredentials: true });
      setAssignedCourses(res.data);
    } catch (err) {
      setAssignedCourses([]);
    }
    setShowAssignModal(true);
  };

  const handleAssignCourse = async () => {
    if (!selectedCourseId || !assignTarget) return;
    try {
      await axios.post('/api/admin/formateurs/assign-course', { formateurId: assignTarget.id, courseId: parseInt(selectedCourseId, 10) }, { withCredentials: true });
      const res = await axios.get(`/api/admin/formateurs/${assignTarget.id}/courses`, { withCredentials: true });
      setAssignedCourses(res.data);
      setSelectedCourseId('');
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'Erreur', 'error');
    }
  };

  const handleUnassignCourse = async (courseId: number) => {
    if (!assignTarget) return;
    try {
      await axios.post('/api/admin/formateurs/unassign-course', { formateurId: assignTarget.id, courseId }, { withCredentials: true });
      const res = await axios.get(`/api/admin/formateurs/${assignTarget.id}/courses`, { withCredentials: true });
      setAssignedCourses(res.data);
    } catch (err) {
      showAlert("Erreur lors du retrait du cours.", 'error');
    }
  };

  const handleExportCSV = () => {
    if (formateurs.length === 0) { showAlert("Aucune donnée à exporter.", 'warning'); return; }
    const headers = ['Prénom', 'Nom', 'Email', 'Département'];
    const csvRows = formateurs.map(f => [f.firstName, f.lastName, f.email, f.department].map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(';'));
    const csvContent = [headers.join(';'), ...csvRows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `formateurs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDeptLabel = (dept: string) => {
    switch (dept) {
      case 'mining': return 'Mines';
      case 'geosciences': return 'Géosciences';
      case 'topography': return 'Topographie';
      case 'hse': return 'HSE';
      default: return dept;
    }
  };

  const filteredFormateurs = formateurs.filter(f => {
    const term = searchTerm.toLowerCase();
    return f.firstName?.toLowerCase().includes(term) || f.lastName?.toLowerCase().includes(term) || f.email?.toLowerCase().includes(term);
  });

  return (
    <div className="dashboard-content animate-fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.2 }}>Gestion des Formateurs</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Créez, modifiez et assignez des matières aux enseignants.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV} style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Exporter
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Ajouter
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Rechercher un formateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Chargement...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Formateur</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Email</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Département</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Statut</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFormateurs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Aucun formateur trouvé.</td>
                </tr>
              ) : (
                filteredFormateurs.map((formateur, index) => (
                  <tr key={`${formateur.id ?? 'formateur'}-${formateur.email ?? index}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formateur.firstName} {formateur.lastName}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{formateur.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: 'rgba(32, 93, 77, 0.1)', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                        {getDeptLabel(formateur.department)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {formateur.is_active === false ? (
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', fontSize: '0.8rem', fontWeight: 600 }}>Bloqué</span>
                      ) : (
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>Actif</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => setActiveAction(formateur.id)}
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

      {/* Action Modal (Centered) */}
      {activeAction && formateurs.find(f => f.id === activeAction) && (() => {
        const af = formateurs.find(f => f.id === activeAction);
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
            <div className="glass-panel animate-slide-up" style={{ width: 'calc(100% - 2rem)', maxWidth: '380px', padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0 }}>Options du formateur</h2>
                <button onClick={() => setActiveAction(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
              </div>

              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{af.firstName} {af.lastName}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{af.email}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  className="dropdown-item"
                  style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                  onClick={() => openEditModal(af)}
                >
                  <Edit2 size={18} /> Modifier le profil
                </button>

                <button
                  className="dropdown-item success"
                  style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                  onClick={() => openAssignModal(af)}
                >
                  <BookOpen size={18} /> Gérer les matières
                </button>

                <button
                  className="dropdown-item warning"
                  style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                  onClick={() => handleToggleBlock(af.id, af.is_active)}
                >
                  <X size={18} /> {af.is_active === false ? "Débloquer l'accès" : "Bloquer l'accès"}
                </button>

                <button
                  className="dropdown-item danger"
                  style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                  onClick={() => handleDeleteFormateur(af.id)}
                >
                  <Trash2 size={18} /> Supprimer le formateur
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: 'calc(100% - 2rem)', maxWidth: '450px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', color: 'var(--text-primary)', margin: 0 }}>Créer un Formateur</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>
            <form onSubmit={handleCreateFormateur}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Prénom</label>
                  <input type="text" className="form-input" required value={newFormateur.firstName} onChange={(e) => setNewFormateur({ ...newFormateur, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Nom</label>
                  <input type="text" className="form-input" required value={newFormateur.lastName} onChange={(e) => setNewFormateur({ ...newFormateur, lastName: e.target.value })} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Email</label>
                <input type="email" className="form-input" required value={newFormateur.email} onChange={(e) => setNewFormateur({ ...newFormateur, email: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Mot de passe provisoire</label>
                <input type="password" className="form-input" required value={newFormateur.password} onChange={(e) => setNewFormateur({ ...newFormateur, password: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Département</label>
                <select className="form-input" required value={newFormateur.department} onChange={(e) => setNewFormateur({ ...newFormateur, department: e.target.value })}>
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
      {showEditModal && editingFormateur && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: 'calc(100% - 2rem)', maxWidth: '450px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', color: 'var(--text-primary)', margin: 0 }}>Modifier le Formateur</h2>
              <button onClick={() => { setShowEditModal(false); setEditingFormateur(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Prénom</label>
                  <input type="text" className="form-input" required value={editingFormateur.firstName} onChange={(e) => setEditingFormateur({ ...editingFormateur, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Nom</label>
                  <input type="text" className="form-input" required value={editingFormateur.lastName} onChange={(e) => setEditingFormateur({ ...editingFormateur, lastName: e.target.value })} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Email</label>
                <input type="email" className="form-input" required value={editingFormateur.email} onChange={(e) => setEditingFormateur({ ...editingFormateur, email: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Département</label>
                <select className="form-input" required value={editingFormateur.department} onChange={(e) => setEditingFormateur({ ...editingFormateur, department: e.target.value })}>
                  <option value="mining" style={{ color: '#000', backgroundColor: '#FFF' }}>Mines (Exploitation & Traitement)</option>
                  <option value="geosciences" style={{ color: '#000', backgroundColor: '#FFF' }}>Géosciences (Géologie & Exploration)</option>
                  <option value="topography" style={{ color: '#000', backgroundColor: '#FFF' }}>Topographie & Cartographie</option>
                  <option value="hse" style={{ color: '#000', backgroundColor: '#FFF' }}>HSE (Hygiène, Sécurité, Environnement)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowEditModal(false); setEditingFormateur(null); }} className="btn btn-secondary" style={{ width: 'auto' }}>Annuler</button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Sauvegarde...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Courses Modal */}
      {showAssignModal && assignTarget && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: 'calc(100% - 2rem)', maxWidth: '500px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', color: 'var(--text-primary)', margin: 0 }}>Matières assignées</h2>
              <button onClick={() => { setShowAssignModal(false); setAssignTarget(null); setAssignedCourses([]); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>

            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{assignTarget.firstName} {assignTarget.lastName}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{getDeptLabel(assignTarget.department)}</div>
            </div>

            {/* Assigned courses list */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Cours actuels ({assignedCourses.length})</h3>
              {assignedCourses.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                  Aucun cours assigné pour le moment.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {assignedCourses.map((course: any, index: number) => (
                    <div key={`${course.id ?? 'course'}-${course.title ?? 'title'}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{course.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{getDeptLabel(course.department)}</div>
                      </div>
                      <button
                        onClick={() => handleUnassignCourse(course.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '0.3rem' }}
                        title="Retirer ce cours"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add new course */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Assigner un nouveau cours</h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <select
                  className="form-input"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="" style={{ color: '#000', backgroundColor: '#FFF' }}>-- Choisir un cours --</option>
                  {courses
                    .filter(c => !assignedCourses.some(ac => ac.id === c.id))
                    .map((course, index) => (
                      <option key={`${course.id ?? 'course'}-${course.title ?? 'title'}-${index}`} value={course.id} style={{ color: '#000', backgroundColor: '#FFF' }}>
                        {course.title} ({getDeptLabel(course.department)})
                      </option>
                    ))
                  }
                </select>
                <button
                  className="btn btn-primary"
                  style={{ width: 'auto', whiteSpace: 'nowrap' }}
                  onClick={handleAssignCourse}
                  disabled={!selectedCourseId}
                >
                  Assigner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFormateurs;
