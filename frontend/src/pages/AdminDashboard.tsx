import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserCheck, CreditCard, DollarSign } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/admin/stats', { withCredentials: true });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-content animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Chargement des statistiques...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-content animate-fade-in">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Vue d'ensemble</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Bienvenue dans l'espace d'administration du Directeur de Formation.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {/* Card 1: Total Students */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Étudiants</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats?.totalStudents || 0}</div>
          </div>
        </div>

        {/* Card 2: Active Students */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(var(--accent-primary-rgb), 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Comptes Actifs</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats?.activeStudents || 0}</div>
          </div>
        </div>

        {/* Card 3: Payments */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Paiements Réussis</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats?.successfulPayments || 0}</div>
          </div>
        </div>

        {/* Card 4: Revenue */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Revenus (GNF)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats?.totalRevenue?.toLocaleString('fr-FR') || 0}</div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Répartition par Département</h2>
        {stats?.studentsByDepartment && stats.studentsByDepartment.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {stats.studentsByDepartment.map((dept: any, index: number) => {
              const count = parseInt(dept.count, 10);
              const percentage = stats.totalStudents > 0 ? Math.round((count / stats.totalStudents) * 100) : 0;
              return (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '150px', fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {dept.department || 'Non défini'}
                  </div>
                  <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: 'var(--accent-primary)', borderRadius: '4px' }}></div>
                  </div>
                  <div style={{ width: '40px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>Aucune donnée disponible.</div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
