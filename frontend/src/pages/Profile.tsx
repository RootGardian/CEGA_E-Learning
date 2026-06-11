import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Mail, Briefcase, Hash, Calendar, Phone, Edit2, Check, X, CreditCard, Download, Image as ImageIcon } from 'lucide-react';
import { getDeptName } from '../utils/departments';
import type { UserProfile } from '../components/SidebarLayout';
import { usePopup } from '../contexts/PopupContext';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Transaction {
  id: number;
  amount: number;
  currency: string;
  status: string;
  description: string;
  createdAt: string;
}

const Profile: React.FC = () => {
  const { user, setUser } = useOutletContext<{ user: UserProfile, setUser: React.Dispatch<React.SetStateAction<UserProfile | null>> }>();
  const { showAlert } = usePopup();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || '',
    bio: user.bio || '',
    profilePicture: user.profilePicture || ''
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (user.role !== 'etudiant') return;
      
      try {
        const res = await axios.get('/api/payments/history', { withCredentials: true });
        setTransactions(res.data);
      } catch (err) {
        console.error('Erreur lors du chargement des transactions:', err);
      }
    };
    fetchTransactions();
  }, [user.role]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.put('/api/auth/me', formData, { withCredentials: true });
      setUser(res.data); // Update global context
      setIsEditing(false);
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      showAlert('Erreur lors de la sauvegarde.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateInvoice = (transaction: Transaction) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // Accent primary
    doc.text('CEGA E-Learning', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Facture', 14, 30);
    
    // Info
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Date : ${new Date(transaction.createdAt).toLocaleDateString('fr-FR')}`, 14, 45);
    doc.text(`Numéro de Transaction : #${transaction.id}`, 14, 52);
    doc.text(`Client : ${user.firstName} ${user.lastName}`, 14, 59);
    doc.text(`Email : ${user.email}`, 14, 66);
    
    // Table
    autoTable(doc, {
      startY: 80,
      head: [['Description', 'Statut', 'Montant']],
      body: [
        [transaction.description || 'Paiement', transaction.status, `${transaction.amount} ${transaction.currency.toUpperCase()}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });
    
    doc.save(`Facture_${transaction.id}_CEGA.pdf`);
  };

  return (
    <div className="dashboard-content animate-fade-in">
      <div className="responsive-header">
        <div style={{ flex: '1 1 min(100%, 300px)' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2rem)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Mon Profil</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Vos informations personnelles et académiques.</p>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: 'auto', minWidth: '160px' }}>
            <Edit2 size={18} /> Modifier le profil
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%', justifyContent: 'flex-end' }}>
            <button onClick={() => { setIsEditing(false); setFormData({ firstName: user.firstName, lastName: user.lastName, phone: user.phone || '', bio: user.bio || '', profilePicture: user.profilePicture || '' }); }} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: 'auto', minWidth: '120px' }}>
              <X size={18} /> Annuler
            </button>
            <button onClick={handleSave} disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: 'auto', minWidth: '140px' }}>
              <Check size={18} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'stretch' }}>
        
        {/* Colonne de gauche */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: '1 1 min(100%, 300px)', width: '100%' }}>
          
          {/* Carte d'identité visuelle */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              {formData.profilePicture ? (
                <img 
                  src={formData.profilePicture} 
                  alt="Profile" 
                  style={{ width: '120px', height: '120px', objectFit: 'cover', border: '2px solid var(--accent-primary)' }} 
                />
              ) : (
                <div style={{ width: '120px', height: '120px', backgroundColor: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold' }}>
                  {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                </div>
              )}
              {isEditing && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: 'var(--bg-primary)', padding: '0.5rem', border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ImageIcon size={18} color="var(--text-primary)" />
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                </div>
              )}
            </div>
            
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              {formData.firstName} {formData.lastName}
            </h2>
            <p style={{ color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '1.5rem' }}>{user.role === 'enseignant' ? 'Formateur' : 'Étudiant'}</p>
            
            <div style={{ width: '100%', textAlign: 'left' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Dernière connexion</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>Aujourd'hui</p>
            </div>
          </div>

          {/* Abonnement / Accès (Uniquement pour les étudiants) */}
          {user.role !== 'enseignant' && (
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={18} /> Mon Abonnement
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Statut</span>
                {user.subscriptionStatus === 'active' ? (
                  <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>Actif</span>
                ) : (
                  <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', fontSize: '0.85rem', fontWeight: 600 }}>Expiré / Inactif</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Expiration</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {user.accessExpirationDate ? new Date(user.accessExpirationDate).toLocaleDateString('fr-FR') : 'Non défini'}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Colonne de droite */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: '2 1 min(100%, 400px)', width: '100%', minWidth: 0 }}>
          
          <div className="glass-panel" style={{ padding: 'clamp(1.5rem, 4vw, 2rem)' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Informations Personnelles
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  <User size={16} /> Prénom
                </label>
                {isEditing ? (
                  <input type="text" className="input-field" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                ) : (
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{user.firstName}</div>
                )}
              </div>
              
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  <User size={16} /> Nom
                </label>
                {isEditing ? (
                  <input type="text" className="input-field" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                ) : (
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{user.lastName}</div>
                )}
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  <Mail size={16} /> Email
                </label>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}>{user.email}</div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  <Phone size={16} /> Téléphone
                </label>
                {isEditing ? (
                  <input type="text" className="input-field" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+224..." />
                ) : (
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{user.phone || 'Non renseigné'}</div>
                )}
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  <User size={16} /> Biographie / Présentation
                </label>
                {isEditing ? (
                  <textarea 
                    className="input-field" 
                    value={formData.bio} 
                    onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                    rows={4}
                    placeholder="Présentez-vous brièvement..."
                    style={{ resize: 'vertical' }}
                  />
                ) : (
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', minHeight: '80px', whiteSpace: 'pre-wrap' }}>
                    {user.bio || 'Aucune biographie renseignée.'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dossier Académique (Uniquement pour les étudiants) */}
          {user.role !== 'enseignant' && (
            <div className="glass-panel" style={{ padding: 'clamp(1.5rem, 4vw, 2rem)' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Dossier Académique
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    <Briefcase size={16} /> Filière
                  </label>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{getDeptName(user.department)}</div>
                </div>
                
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    <Hash size={16} /> Numéro Étudiant (INE)
                  </label>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{user.numero_etudiant || 'Non défini'}</div>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    <Calendar size={16} /> Cohorte
                  </label>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{user.cohorte_id ? `Cohorte ${user.cohorte_id}` : 'Non définie'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Historique des Transactions (Uniquement pour les étudiants) */}
          {user.role !== 'enseignant' && (
            <div className="glass-panel" style={{ padding: 'clamp(1.5rem, 4vw, 2rem)' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Historique des Transactions
              </h3>
              
              {transactions.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Aucune transaction trouvée.</p>
              ) : (
                <div className="table-responsive">
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Date</th>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Description</th>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Montant</th>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Statut</th>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Facture</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</td>
                          <td style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{tx.description || 'Paiement CEGA'}</td>
                          <td style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>{tx.amount} {tx.currency.toUpperCase()}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ 
                              padding: '0.25rem 0.5rem', 
                              backgroundColor: tx.status === 'succeeded' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                              color: tx.status === 'succeeded' ? 'var(--success)' : 'var(--error)', 
                              fontSize: '0.8rem', 
                              fontWeight: 600 
                            }}>
                              {tx.status === 'succeeded' ? 'Payé' : 'Échoué'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {tx.status === 'succeeded' && (
                              <button onClick={() => generateInvoice(tx)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto', fontSize: '0.85rem' }}>
                                <Download size={14} /> PDF
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Profile;
