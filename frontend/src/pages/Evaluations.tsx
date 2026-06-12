import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Award, Clock, FileText, Calendar, Play } from 'lucide-react';
import { usePopup } from '../contexts/PopupContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Evaluation {
  id: number;
  title: string;
  type: string;
  date: string;
  duration: string | null;
  documentLink: string | null;
  course?: { id: number; title: string };
  studentGrade?: { score: number | null, feedback: string | null };
  classAverage?: string | null;
}

const Evaluations: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = usePopup();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvals = async () => {
      try {
        const res = await axios.get('/api/evaluations', { withCredentials: true });
        setEvaluations(res.data);
      } catch (err) {
        console.error('Erreur chargement évaluations:', err);
        showAlert('Erreur lors du chargement des évaluations.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchEvals();
  }, [showAlert]);

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Chargement...</div>;
  }

  const sortedEvals = [...evaluations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const pendingEvals = sortedEvals.filter(ev => !ev.studentGrade);
  const pastEvals = sortedEvals.filter(ev => ev.studentGrade);

  const parseDurationMs = (durationStr: string | null) => {
    if (!durationStr) return 0;
    const str = durationStr.toLowerCase().trim();
    let hours = 0;
    let minutes = 0;
    if (str.includes('h')) {
      const parts = str.split('h');
      hours = parseInt(parts[0], 10) || 0;
      minutes = parseInt(parts[1], 10) || 0;
    } else if (str.includes(':')) {
      const parts = str.split(':');
      hours = parseInt(parts[0], 10) || 0;
      minutes = parseInt(parts[1], 10) || 0;
    } else {
      hours = parseFloat(str) || 0;
    }
    return (hours * 60 + minutes) * 60 * 1000;
  };

  const generatePDF = () => {
    if (pastEvals.length === 0) {
      showAlert('Aucun résultat disponible pour générer un relevé.', 'info');
      return;
    }

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(22);
    doc.setTextColor(46, 125, 50); // Vert CEGA
    doc.text('CEGA E-Learning', 14, 20);
    
    // Subtitle
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Relevé de Notes Officiel', 14, 30);
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date de génération : ${new Date().toLocaleDateString('fr-FR')}`, 14, 38);

    const tableColumn = ["Cours / Matière", "Type", "Date", "Note /20", "Moy. Classe", "Appréciation"];
    const tableRows: any[] = [];

    pastEvals.forEach(ev => {
      const evalDate = new Date(ev.date).toLocaleDateString('fr-FR');
      const courseName = ev.course?.title || ev.title;
      const score = ev.studentGrade?.score !== null && ev.studentGrade?.score !== undefined ? ev.studentGrade.score.toString() : 'En attente';
      const avg = ev.classAverage ? ev.classAverage.toString() : '-';
      const feedback = ev.studentGrade?.feedback || '-';
      
      tableRows.push([
        courseName,
        ev.type,
        evalDate,
        score,
        avg,
        feedback
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [24, 76, 56] }, // Dark green for header
      styles: { fontSize: 10, cellPadding: 4 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save('Releve_de_Notes_CEGA.pdf');
  };

  return (
    <div className="dashboard-content animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2rem)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Mes Évaluations</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Consultez vos examens à venir et vos résultats passés.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'stretch' }}>
        
        {/* Évaluations à venir */}
        <section style={{ flex: '1 1 min(100%, 300px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Clock size={24} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>À venir</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingEvals.length === 0 ? (
              <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Aucune évaluation prévue ou en attente.
              </div>
            ) : (
              pendingEvals.map(ev => {
                const evalDate = new Date(ev.date);
                const dateString = evalDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                const timeString = evalDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={ev.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-secondary)', padding: '0.25rem 0.5rem', border: '1px solid var(--accent-secondary)' }}>
                        {ev.type}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{dateString}</span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem', wordBreak: 'break-word' }}>
                      {ev.course?.title || ev.title}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{ev.title}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {timeString}</span>
                      {ev.duration && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} /> Durée : {ev.duration}</span>}
                    </div>
                    {(() => {
                      const now = new Date();
                      const durationMs = parseDurationMs(ev.duration);
                      // Si pas de durée définie, on donne une tolérance de 24h par défaut
                      const effectiveDurationMs = durationMs > 0 ? durationMs : 24 * 60 * 60 * 1000;
                      const endDate = new Date(evalDate.getTime() + effectiveDurationMs);
                      const isPassed = now > endDate;
                      const isNotYetOpen = now < evalDate;

                      if (isPassed) {
                        return (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', padding: '0.6rem 1.2rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600 }}>
                            Date passée (Examen fermé)
                          </div>
                        );
                      }

                      if (isNotYetOpen) {
                        return (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', padding: '0.6rem 1.2rem', backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600 }}>
                            <Clock size={16} /> Ouverture le {timeString}
                          </div>
                        );
                      }

                      if (ev.type === "QCM (En ligne sur l'application)") {
                        return (
                          <button 
                            onClick={() => navigate(`/exam-room/${ev.id}`)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', padding: '0.6rem 1.2rem', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
                          >
                            <Play size={16} /> Démarrer l'examen
                          </button>
                        );
                      }

                      if (ev.documentLink) {
                        return (
                          <a href={ev.documentLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: 'rgba(var(--accent-primary-rgb), 0.1)', color: 'var(--accent-primary)', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                            <FileText size={16} /> Accéder aux ressources de l'examen
                          </a>
                        );
                      }

                      return null;
                    })()}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Historique des résultats */}
        <section style={{ flex: '1 1 min(100%, 300px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Award size={24} color="var(--accent-secondary)" />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Résultats récents</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pastEvals.length === 0 ? (
              <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Aucun résultat disponible.
              </div>
            ) : (
              pastEvals.map(ev => {
                const evalDate = new Date(ev.date);
                const dateString = evalDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                return (
                  <div key={ev.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: '1 1 min(100%, 150px)' }}>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.2rem', wordBreak: 'break-word' }}>{ev.course?.title || ev.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{ev.type} • {dateString}</p>
                      {ev.studentGrade?.feedback && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.5rem' }}>
                          "{ev.studentGrade.feedback}"
                        </p>
                      )}
                      {ev.documentLink && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <a href={ev.documentLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>
                            <FileText size={14} /> Voir le sujet
                          </a>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        {ev.studentGrade?.score !== null && ev.studentGrade?.score !== undefined ? `${ev.studentGrade.score}/20` : 'En attente'}
                      </div>
                      {ev.classAverage && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          Moy. Classe: {ev.classAverage}/20
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button onClick={generatePDF} className="btn btn-secondary" style={{ width: '100%', marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} /> Télécharger le relevé de notes
          </button>
        </section>

      </div>
    </div>
  );
};

export default Evaluations;
