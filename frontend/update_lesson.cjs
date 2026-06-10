const fs = require('fs');

const lessonFile = 'C:/Users/alber/Documents/GitHub/CEGA_E_Learning/frontend/src/components/LessonIA_Geo_S1.tsx';
let content = fs.readFileSync(lessonFile, 'utf8');

const newImports = `import React, { useState } from 'react';
import { ChevronRight, RotateCcw, LayoutGrid } from 'lucide-react';
import './LessonIA.css';`;

const quizDataCode = `
const quizData = [
  {
    id: 1,
    question: "1. Une équipe d'exploration veut identifier des zones favorables à la minéralisation en intégrant des données géophysiques, géochimiques et de forages. Quel outil choisir ?",
    options: [
      { id: 1, text: "Kriging (géostatistique)", feedback: "Le Kriging est optimal pour l'estimation spatiale de ressources déjà délimitées — pas pour la découverte de nouvelles cibles.", isCorrect: false },
      { id: 2, text: "IA / Machine Learning", feedback: "Correct ! Le ML est idéal pour ce type de ciblage exploratoire multivarié et non-linéaire. C'est exactement ce que font KoBold Metals et GoldSpot Discoveries.", isCorrect: true },
      { id: 3, text: "Statistique classique", feedback: "La statistique classique décrit les données mais ignore la dimension spatiale et les relations multivariées complexes.", isCorrect: false },
      { id: 4, text: "Deep Learning (CNN)", feedback: "Le Deep Learning est optimal pour les données visuelles (images satellite, carottes) — pas pour des données tabulaires géochimiques.", isCorrect: false }
    ]
  },
  {
    id: 2,
    question: "2. Un modèle d'IA obtient 99% de précision sur les données d'entraînement mais seulement 62% sur de nouveaux échantillons. De quoi souffre-t-il ?",
    options: [
      { id: 1, text: "Sous-apprentissage (underfitting)", feedback: "Le sous-apprentissage se manifeste par de mauvaises performances sur les deux ensembles de données.", isCorrect: false },
      { id: 2, text: "Sur-apprentissage (overfitting)", feedback: "Correct ! Haute performance sur l'entraînement + mauvaise généralisation = sur-apprentissage (overfitting). Le modèle a mémorisé les données au lieu d'apprendre les patterns généraux.", isCorrect: true },
      { id: 3, text: "Effet boîte noire", feedback: "L'effet boîte noire décrit l'opacité des décisions du modèle, pas la différence de performance entraînement/test.", isCorrect: false },
      { id: 4, text: "Biais des données", feedback: "Un biais de données est lié à la représentativité des données d'entraînement, pas à cet écart de performance.", isCorrect: false }
    ]
  },
  {
    id: 3,
    question: "3. Vous avez des données géochimiques de 5 000 échantillons sans étiquettes de classe. Vous souhaitez découvrir des groupes naturels d'associations élémentaires. Quel type d'IA ?",
    options: [
      { id: 1, text: "Régression", feedback: "La régression prédit une valeur continue (quantité), pas des groupes.", isCorrect: false },
      { id: 2, text: "Classification supervisée", feedback: "La classification supervisée nécessite des étiquettes connues pour entraîner le modèle — ce que vous n'avez pas ici.", isCorrect: false },
      { id: 3, text: "Clustering (non-supervisé)", feedback: "Correct ! Le clustering (K-Means, DBSCAN) est un apprentissage non-supervisé qui découvre des groupes similaires sans étiquettes préalables — idéal pour les familles géochimiques.", isCorrect: true },
      { id: 4, text: "Détection d'anomalies", feedback: "La détection d'anomalies cherche des points inhabituels, pas des groupes cohérents.", isCorrect: false }
    ]
  },
  {
    id: 4,
    question: "4. Dans un fichier CSV de forage, la colonne GOLD_G_T est de type 'object' alors qu'elle devrait être numérique. Quelle est la cause la plus probable ?",
    options: [
      { id: 1, text: "Problème de connexion réseau lors de l'import", feedback: "Une mauvaise connexion n'affecte pas le type d'une colonne dans un fichier CSV déjà enregistré.", isCorrect: false },
      { id: 2, text: "Présence de valeurs textuelles comme <0.01 ou NS", feedback: "Correct ! Des valeurs textuelles comme <0.01 (sous le seuil de détection) ou NS (Non Spécifié) forcent pandas à typer toute la colonne en 'object'. C'est un problème classique de données brutes de laboratoire.", isCorrect: true },
      { id: 3, text: "Trop de valeurs manquantes (NaN)", feedback: "Les valeurs manquantes (NaN) seules ne changent pas le type d'une colonne numérique en object.", isCorrect: false },
      { id: 4, text: "Lignes dupliquées dans le fichier", feedback: "Les doublons ne modifient pas le type d'une colonne.", isCorrect: false }
    ]
  },
  {
    id: 5,
    question: "5. Un collègue vous dit : 'Nous avons entraîné un modèle IA qui prédit les zones minéralisées avec 85% de précision — nous pouvons arrêter les forages de validation.' Quelle est votre réponse ?",
    options: [
      { id: 1, text: "D'accord, 85% c'est suffisant pour la certification JORC", feedback: "La certification JORC requiert une validation physique des ressources — un modèle IA seul ne suffit pas réglementairement, et ce n'est pas la réponse complète.", isCorrect: false },
      { id: 2, text: "Refuser — l'IA n'est pas fiable pour l'exploration", feedback: "Refuser totalement serait une mauvaise compréhension — l'IA peut fortement optimiser et réduire le nombre de forages nécessaires.", isCorrect: false },
      { id: 3, text: "L'IA optimise le ciblage mais la validation terrain reste indispensable", feedback: "Correct ! L'IA optimise le ciblage et réduit le nombre de forages nécessaires, mais ne les remplace pas. La validation terrain reste indispensable : l'algorithme ne signe pas le rapport.", isCorrect: true },
      { id: 4, text: "Refaire le modèle jusqu'à obtenir 100%", feedback: "Remettre en question le modèle sans raison précise n'est pas constructif — 85% peut être un excellent résultat selon le contexte.", isCorrect: false }
    ]
  }
];
`;

const quizStateCode = `
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleSelectOption = (questionId: number, optionId: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const calculateScore = () => {
    let score = 0;
    quizData.forEach(q => {
      const selectedOption = q.options.find(o => o.id === quizAnswers[q.id]);
      if (selectedOption && selectedOption.isCorrect) score++;
    });
    return score;
  };
`;

const dynamicFooterCode = `
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
        {activeTab === 's6' ? (
          <button 
            className="btn btn-primary"
            onClick={() => setActiveTab('s7')}
          >
            Passer le quiz <ChevronRight size={18} style={{ marginLeft: '8px' }} />
          </button>
        ) : activeTab === 's7' ? (
          <button 
            className="btn btn-primary"
            onClick={() => {
              if (quizSubmitted) {
                // If submitted, maybe scroll to top? Or just do nothing, the result is above
                window.scrollTo(0,0);
              } else {
                setQuizSubmitted(true);
                window.scrollTo(0, document.body.scrollHeight);
              }
            }}
            disabled={quizSubmitted}
          >
            {quizSubmitted ? "Quiz terminé" : "Terminer et soumettre le quiz"}
          </button>
        ) : (
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
        )}
      </div>
`;

const interactiveQuizRender = `
        {activeTab === 's7' && (
          <div className="animate-slide-up">
            <div className="hero">
              <div className="eyebrow">Validation des acquis</div>
              <h2>Quiz final — Séance 1</h2>
              <p className="lead">5 questions pour valider vos acquis. Chaque question porte sur un module de la séance.</p>
            </div>

            <div className="quiz-wrap">
              {quizData.map(q => (
                <div key={q.id} className="quiz-q" style={{ marginBottom: '20px' }}>
                  <div className="q-text" style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '14px', fontWeight: 500 }}>{q.question}</div>
                  <div className="quiz-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {q.options.map(opt => {
                      const isSelected = quizAnswers[q.id] === opt.id;
                      let optionStyle = {
                        padding: '10px 14px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius)',
                        fontSize: '13px',
                        cursor: quizSubmitted ? 'default' : 'pointer',
                        transition: 'all 0.15s',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)'
                      };
                      
                      if (!quizSubmitted) {
                        if (isSelected) {
                          optionStyle.border = '1px solid var(--accent-primary)';
                          optionStyle.background = 'rgba(32, 93, 77, 0.1)';
                          optionStyle.color = 'var(--accent-primary)';
                        }
                      } else {
                        // Submitted
                        if (opt.isCorrect) {
                          optionStyle.border = '1px solid var(--accent-primary)';
                          optionStyle.background = 'rgba(32, 93, 77, 0.1)';
                          optionStyle.color = 'var(--accent-primary)';
                        } else if (isSelected && !opt.isCorrect) {
                          optionStyle.border = '1px solid var(--error)';
                          optionStyle.background = 'rgba(239, 68, 68, 0.1)';
                          optionStyle.color = 'var(--error)';
                        } else {
                          optionStyle.opacity = '0.5';
                        }
                      }

                      return (
                        <div 
                          key={opt.id} 
                          style={optionStyle}
                          onClick={() => handleSelectOption(q.id, opt.id)}
                        >
                          {opt.text}
                        </div>
                      );
                    })}
                  </div>
                  {quizSubmitted && quizAnswers[q.id] && (
                    <div className="quiz-feedback animate-fade-in" style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {q.options.find(o => o.id === quizAnswers[q.id])?.feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {quizSubmitted && (
              <div className="quiz-result animate-fade-in" style={{ marginTop: '30px', padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '10px' }}>Résultat du Quiz</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '20px' }}>
                  {calculateScore()} / 5
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button className="btn btn-secondary" onClick={() => {
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                    window.scrollTo(0,0);
                  }}>
                    <RotateCcw size={18} style={{ marginRight: '8px' }} />
                    Reprendre le quiz
                  </button>
                  <button className="btn btn-primary" onClick={() => {
                    window.location.reload();
                  }}>
                    <LayoutGrid size={18} style={{ marginRight: '8px' }} />
                    Retour aux modules
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
`;

// Replace imports
content = content.replace(/import React, { useState } from 'react';\nimport { ChevronRight } from 'lucide-react';\nimport '.\/LessonIA.css';/, newImports + '\n' + quizDataCode);

// Insert quiz state
content = content.replace(/const \[activeTab, setActiveTab\] = useState\('s1'\);/, "const [activeTab, setActiveTab] = useState('s1');\n" + quizStateCode);

// Replace footer
content = content.replace(/<div className="lesson-footer-nav"[\s\S]*?<\/div>\n    <\/div>/, dynamicFooterCode + '\n    </div>');

// Replace s7 block
content = content.replace(/{activeTab === 's7' && \([\s\S]*?\)}\n      <\/div>/, interactiveQuizRender + '\n      </div>');

fs.writeFileSync(lessonFile, content);
console.log('Update success');
