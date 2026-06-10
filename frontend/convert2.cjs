const fs = require('fs');
const cheerio = require('cheerio');

try {
  let raw = fs.readFileSync('C:/Users/alber/Downloads/cours_ia_geosciences_s1_1.html', 'utf8');
  const $ = cheerio.load(raw);

  function getSectionHTML(id) {
    const section = $(`#${id}`);
    if (!section.length) return '';
    return section.html();
  }

  const sections = {
    s1: getSectionHTML('s1'),
    s2: getSectionHTML('s2'),
    s3: getSectionHTML('s3'),
    s4: getSectionHTML('s4'),
    s5: getSectionHTML('s5'),
    s6: getSectionHTML('s6'),
    s7: getSectionHTML('s7')
  };

  function cleanHTML(html) {
    if (!html) return '';
    
    let cleaned = html;
    
    // Remove onclick since we can't easily execute inline JS in React this way
    cleaned = cleaned.replace(/onclick="[^"]*"/gi, '');
    
    // Remove style attributes to let CSS take over completely
    cleaned = cleaned.replace(/style="[^"]*"/gi, '');
    
    // Remove the navigation buttons inside the HTML since we provide our own
    cleaned = cleaned.replace(/<div class="nav-buttons">[\s\S]*?<\/div>/gi, '');
    
    return cleaned;
  }

  const finalCode = `import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import './LessonIA.css';

const LessonIA_Geo_S1: React.FC = () => {
  const [activeTab, setActiveTab] = useState('s1');
  
  const tabs = [
    { id: 's1', title: 'Introduction' },
    { id: 's2', title: "Pourquoi l'IA ?" },
    { id: 's3', title: 'IA vs ML vs DL' },
    { id: 's4', title: 'IA vs Géostatistique' },
    { id: 's5', title: 'Boîte à outils' },
    { id: 's6', title: 'Python & TP' },
    { id: 's7', title: 'Quiz & Bilan' }
  ];

  return (
    <div className="interactive-lesson animate-fade-in">
      <div className="lesson-tabs-container">
        <div className="lesson-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={\`lesson-tab \${activeTab === tab.id ? 'active' : ''}\`}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>

      <div className="lesson-content-area" style={{ padding: '2rem 0' }}>
        {activeTab === 's1' && (
          <div className="animate-slide-up" dangerouslySetInnerHTML={{ __html: \`${cleanHTML(sections.s1).replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }} />
        )}
        
        {activeTab === 's2' && (
          <div className="animate-slide-up" dangerouslySetInnerHTML={{ __html: \`${cleanHTML(sections.s2).replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }} />
        )}

        {activeTab === 's3' && (
          <div className="animate-slide-up" dangerouslySetInnerHTML={{ __html: \`${cleanHTML(sections.s3).replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }} />
        )}

        {activeTab === 's4' && (
          <div className="animate-slide-up" dangerouslySetInnerHTML={{ __html: \`${cleanHTML(sections.s4).replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }} />
        )}

        {activeTab === 's5' && (
          <div className="animate-slide-up" dangerouslySetInnerHTML={{ __html: \`${cleanHTML(sections.s5).replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }} />
        )}

        {activeTab === 's6' && (
          <div className="animate-slide-up" dangerouslySetInnerHTML={{ __html: \`${cleanHTML(sections.s6).replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }} />
        )}

        {activeTab === 's7' && (
          <div className="animate-slide-up" dangerouslySetInnerHTML={{ __html: \`${cleanHTML(sections.s7).replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }} />
        )}
      </div>
      
      <div className="lesson-footer-nav" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
        <button 
          className="btn btn-secondary"
          onClick={() => {
            const idx = tabs.findIndex(t => t.id === activeTab);
            if (idx > 0) setActiveTab(tabs[idx - 1].id);
          }}
          disabled={activeTab === 's1'}
        >
          Précédent
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => {
            const idx = tabs.findIndex(t => t.id === activeTab);
            if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
          }}
          disabled={activeTab === 's7'}
        >
          Suivant <ChevronRight size={18} style={{ marginLeft: '8px' }} />
        </button>
      </div>
    </div>
  );
};

export default LessonIA_Geo_S1;
`;

  fs.writeFileSync('C:/Users/alber/Documents/GitHub/CEGA_E_Learning/frontend/src/components/LessonIA_Geo_S1.tsx', finalCode);
  console.log('Component generated perfectly!');
} catch (e) {
  console.error(e);
}
