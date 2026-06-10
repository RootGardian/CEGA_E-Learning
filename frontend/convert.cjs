const fs = require('fs');

try {
  let raw = fs.readFileSync('C:/Users/alber/Downloads/cours_ia_geosciences_s1_1.html', 'utf8');

  function extractSection(id) {
    const startStr = '<div id="' + id + '"';
    const startIndex = raw.indexOf(startStr);
    if (startIndex === -1) return '';
    
    let depth = 0;
    let endIndex = -1;
    let i = startIndex;
    while (i < raw.length) {
      if (raw.substring(i, i + 4) === '<div') {
        depth++;
        i += 4;
      } else if (raw.substring(i, i + 6) === '</div>') {
        depth--;
        if (depth === 0) {
          endIndex = i + 6;
          break;
        }
        i += 6;
      } else {
        i++;
      }
    }
    return raw.substring(startIndex, endIndex);
  }

  const intro = extractSection('intro');
  const def = extractSection('def');
  const iageo = extractSection('ia-geo');
  const concepts = extractSection('concepts');
  const vocab = extractSection('vocab');
  const quiz = extractSection('quiz');

  function cleanJSX(html) {
    if (!html) return '';
    let cleaned = html.replace(/class=/g, 'className=');
    cleaned = cleaned.replace(/className="section active"/g, 'className="lesson-section"');
    cleaned = cleaned.replace(/className="section"/g, 'className="lesson-section"');
    
    // Remove style attributes
    cleaned = cleaned.replace(/style="[^"]*"/g, '');
    
    // Replace inline handlers
    cleaned = cleaned.replace(/onclick=/g, 'onClick=');
    
    // Close self-closing tags
    cleaned = cleaned.replace(/<br>/g, '<br />');
    cleaned = cleaned.replace(/<hr>/g, '<hr />');
    cleaned = cleaned.replace(/<img([^>]*[^/])>/g, '<img$1 />');
    cleaned = cleaned.replace(/<input([^>]*[^/])>/g, '<input$1 />');
    
    return cleaned;
  }

  const finalCode = `import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import './LessonIA.css';

const LessonIA_Geo_S1: React.FC = () => {
  const [activeTab, setActiveTab] = useState('intro');
  
  const tabs = [
    { id: 'intro', title: 'Introduction' },
    { id: 'def', title: 'Définitions clés' },
    { id: 'ia-geo', title: 'IA & Géosciences' },
    { id: 'concepts', title: 'Concepts ML/DL' },
    { id: 'vocab', title: 'Vocabulaire' },
    { id: 'quiz', title: 'Auto-évaluation' }
  ];

  return (
    <div className="interactive-lesson animate-fade-in">
      {/* Top Tabs Navigation */}
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
        {activeTab === 'intro' && (
          <div className="animate-slide-up">
            ${cleanJSX(intro)}
          </div>
        )}
        
        {activeTab === 'def' && (
          <div className="animate-slide-up">
            ${cleanJSX(def)}
          </div>
        )}

        {activeTab === 'ia-geo' && (
          <div className="animate-slide-up">
            ${cleanJSX(iageo)}
          </div>
        )}

        {activeTab === 'concepts' && (
          <div className="animate-slide-up">
            ${cleanJSX(concepts)}
          </div>
        )}

        {activeTab === 'vocab' && (
          <div className="animate-slide-up">
            ${cleanJSX(vocab)}
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="animate-slide-up">
            ${cleanJSX(quiz)}
          </div>
        )}
      </div>
      
      {/* Footer Navigation */}
      <div className="lesson-footer-nav" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
        <button 
          className="btn btn-secondary"
          onClick={() => {
            const idx = tabs.findIndex(t => t.id === activeTab);
            if (idx > 0) setActiveTab(tabs[idx - 1].id);
          }}
          disabled={activeTab === 'intro'}
        >
          Précédent
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => {
            const idx = tabs.findIndex(t => t.id === activeTab);
            if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
          }}
          disabled={activeTab === 'quiz'}
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
  console.log('Component generated!');
} catch (e) {
  console.error(e);
}
