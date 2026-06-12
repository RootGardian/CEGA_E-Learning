import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, ChevronsUp, Settings } from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    const scrollContainer = document.querySelector('.auth-layout') || window;
    scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{ marginTop: 'auto', paddingTop: '4rem', width: '100%', fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>

      {/* Banner Supérieure */}
      <div style={{ backgroundColor: '#95aca8', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: '1400px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <h2 style={{ color: '#ffffff', fontSize: '2.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Besoin de conseils pour le cours ?</h2>
          <button style={{
            backgroundColor: 'transparent',
            color: '#ffffff',
            border: '1px solid #ffffff',
            borderRadius: '50px',
            padding: '0.8rem 2rem',
            fontSize: '1.1rem',
            fontWeight: 400,
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.color = '#95aca8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#ffffff';
            }}>
            Laissez-nous vous aider !
          </button>
        </div>
      </div>

      {/* Section Principale */}
      <div style={{ backgroundColor: '#0C2B35', color: '#8ea3a6', padding: '4.5rem 2rem 5rem 2rem', position: 'relative', overflow: 'hidden' }}>

        {/* Watermark Cerveau/Réseau Neuronal */}
        <div style={{
          position: 'absolute',
          right: '-5%',
          top: '-10%',
          width: '50%',
          height: '120%',
          backgroundImage: 'url(/brain_watermark.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right center',
          opacity: 0.04,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div className="footer-grid" style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Colonne 1: À propos */}
          <div>
            <h3 style={{ color: '#ffffff', fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700 }}>À propos de CEGA</h3>
            <p style={{ marginBottom: '1.5rem', lineHeight: 2, fontSize: '1rem' }}>
              CEGA est un institut privé de formation continue, de perfectionnement professionnel et d'assistance technique dans le domaine des géosciences.
            </p>
            <p style={{ lineHeight: 2, fontSize: '1rem' }}>
              Le CEGA vise à contribuer à la réduction du chômage des diplômés des écoles minières et géologiques en Guinée. Il comble le manque de compétences pratiques requises par les entreprises minières et d'exploration ainsi que par les bureaux d'études pour répondre aux besoins de l'industrie minière en Guinée et dans les pays de la CEDEAO.
            </p>
          </div>

          {/* Colonne 2: Liens utiles */}
          <div>
            <h3 style={{ color: '#ffffff', fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700 }}>Liens utiles</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { name: 'Accueil', url: 'https://www.cegaguinee.com/' },
                { name: 'À propos de nous', url: 'https://www.cegaguinee.com/about-us/' },
                { name: 'Accréditation', url: 'https://www.cegaguinee.com/accreditations/' },
                { name: 'Certification', url: 'https://www.cegaguinee.com/course-category/cours-certificates/?tutor-course-filter-category=60' },
                { name: 'Notre Équipe', url: 'https://www.cegaguinee.com/cega-staff/' },
                { name: 'Contact', url: 'https://www.cegaguinee.com/contact/' }
              ].map((link, idx) => (
                <li key={idx}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: '#8ea3a6', textDecoration: 'none', transition: 'color 0.2s', fontSize: '1rem', fontWeight: 400 }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#8ea3a6'}>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3: Nos cours */}
          <div>
            <h3 style={{ color: '#ffffff', fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700 }}>Notre cours</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                "Certificat professionnel en SIG et gestion de bases de données géoscientifiques.",
                "Certificat Professionnel en Cartographie Géologique et Structurale.",
                "Certificat Professionnel en Techniques d'échantillonnage en exploration et en exploitation Minière.",
                "Certificat Professionnel en Géologie Appliquée (géophysique, géotechnique et hydrogéologie).",
                "Certificat Professionnel en Modélisation Géologique et Estimation des Ressources Minérales."
              ].map((course, idx) => (
                <li key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#8ea3a6" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginTop: '0.2rem' }}>
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.89c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                  </svg>
                  <span style={{ fontSize: '1rem', lineHeight: 1.8 }}>{course}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4: Contact */}
          <div>
            <h3 style={{ color: '#ffffff', fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700 }}>Get in Touch</h3>
            <p style={{ color: '#8ea3a6', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>CENTRE D'EXCELLENCE EN GEOSCIENCE APPLIQUEE (CEGA)</p>
            <p style={{ marginBottom: '2.5rem', lineHeight: 1.8, fontSize: '1rem' }}>
              Immeuble Doumbouya, 2eme Étage; Soumabossia, Rond-point Enco 5, Commune de Lambayi, Conakry/République de Guinée
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <svg width="20" height="20" viewBox="0 0 448 512" fill="#8ea3a6" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                  <path d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-16.4 342.6c-5 13.9-19.6 22.3-34.6 19.3-43.6-8.7-86.5-26.4-124.6-52.7-41-28.1-75.1-66.2-98.8-111-19.6-37.1-32.2-78.6-36.9-121.5-1.9-17.4 11-32.9 28.5-32.9h40.3c14.2 0 26.5 10.4 28.6 24.5 2.5 16.5 7.1 32.5 13.6 47.7 3.3 7.8 1.4 16.9-4.8 23.1l-24.1 24.1c18.3 35.6 47.1 64.3 82.6 82.6l24.1-24.1c6.2-6.2 15.3-8.1 23.1-4.8 15.2 6.5 31.2 11.1 47.7 13.6 14.1 2.1 24.5 14.4 24.5 28.6v40.3c.1 14.4-11.4 27.2-28.7 29.3z"/>
                </svg>
                <a href="tel:+224620888896" style={{ fontSize: '1rem', color: '#8ea3a6', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#8ea3a6'}>+224 620 888 896</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <svg width="20" height="20" viewBox="0 0 512 512" fill="#8ea3a6" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                  <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/>
                </svg>
                <a href="mailto:info@cegaguinee.com" style={{ fontSize: '1rem', color: '#8ea3a6', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#8ea3a6'}>info@cegaguinee.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-footer gris clair */}
      <div className="footer-sub" style={{ backgroundColor: '#d1d5db', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <img src="/logo_cega_remove.png" alt="CEGA Logo" style={{ height: '48px', objectFit: 'contain' }} />

        <p style={{ color: '#4b5563', fontSize: '0.9rem', margin: 0, textAlign: 'center', flex: '1 1 auto', fontWeight: 500 }}>
          © 2025 | Tous droits Réservés | Site Web Hébergé par Wao Host
        </p>

        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 1000,
            width: '56px',
            height: '56px',
            backgroundColor: '#0C5244',
            border: 'none',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            transition: 'background-color 0.2s, transform 0.2s',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#08443b';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#08443b';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <ChevronsUp size={32} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
