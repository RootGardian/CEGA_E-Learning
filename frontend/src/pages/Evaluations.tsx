import React from 'react';
import { Award, Clock, FileText } from 'lucide-react';

const upcomingEvals = [
  { id: 1, course: 'Introduction aux Géosciences', type: 'Examen Final', date: '15 Juin 2026', time: '10:00 - 12:00', duration: '2h', status: 'À venir' },
  { id: 2, course: 'Cartographie Numérique', type: 'Projet Pratique', date: '22 Juin 2026', time: '23:59', duration: 'N/A', status: 'En cours' },
];

const pastEvals = [
  { id: 3, course: 'Cristallographie et Minéralogie', type: 'QCM', date: '01 Mai 2026', score: '16/20', status: 'Validé' },
  { id: 4, course: 'Sédimentologie', type: 'Examen Partiel', date: '15 Avril 2026', score: '14.5/20', status: 'Validé' },
];

const Evaluations: React.FC = () => {
  return (
    <div className="dashboard-content animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Mes Évaluations</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Consultez vos examens à venir et vos résultats passés.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Évaluations à venir */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Clock size={24} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>À venir</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {upcomingEvals.map(ev => (
              <div key={ev.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-secondary)', padding: '0.25rem 0.5rem', border: '1px solid var(--accent-secondary)' }}>
                    {ev.type}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{ev.date}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{ev.course}</h3>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <span>Horaire : {ev.time}</span>
                  {ev.duration !== 'N/A' && <span>Durée : {ev.duration}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Historique des résultats */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Award size={24} color="var(--accent-secondary)" />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Résultats récents</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pastEvals.map(ev => (
              <div key={ev.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{ev.course}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{ev.type} • {ev.date}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{ev.score}</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>{ev.status}</span>
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} /> Télécharger le relevé de notes
          </button>
        </section>

      </div>
    </div>
  );
};

export default Evaluations;
