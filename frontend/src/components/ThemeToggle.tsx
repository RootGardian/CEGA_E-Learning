import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    // Check local storage, default to light
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return false; // Default to light
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', marginBottom: '1.5rem' }}>
      <div>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Thème de l'application</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Basculer entre le mode clair et le mode sombre.</p>
      </div>
      <button
        onClick={() => setIsDark(!isDark)}
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          transition: 'all 0.2s ease'
        }}
        title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--border-color)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-card)';
        }}
      >
        {isDark ? <Sun size={24} /> : <Moon size={24} />}
      </button>
    </div>
  );
};

export default ThemeToggle;
