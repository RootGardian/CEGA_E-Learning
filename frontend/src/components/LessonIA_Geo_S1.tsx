import React, { useState, useEffect } from 'react';
import { ChevronRight, RotateCcw, LayoutGrid } from 'lucide-react';
import './LessonIA.css';
import { quizDataS1 } from '../data/quizData_S1';
import type { QuizQuestion } from '../data/quizData_S1';


interface LessonProps {
  initialProgress?: any;
  onComplete?: (score: number, progressData: any) => void;
  onProgress?: (progressData: any) => void;
}

const LessonIA_Geo_S1: React.FC<LessonProps> = ({ initialProgress, onComplete, onProgress }) => {
  const [activeTab, setActiveTab] = useState('s1');

  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([]);
  const [maxUnlockedTabIndex, setMaxUnlockedTabIndex] = useState(() => {
    return initialProgress?.maxUnlockedTabIndex || 0;
  });

  useEffect(() => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex > maxUnlockedTabIndex) {
      setMaxUnlockedTabIndex(currentIndex);
      if (onProgress) {
        onProgress({ maxUnlockedTabIndex: currentIndex });
      }
    }
  }, [activeTab, maxUnlockedTabIndex, onProgress]);

  useEffect(() => {
    if (activeTab === 's7' && currentQuiz.length === 0) {
      const shuffled = [...quizDataS1].sort(() => 0.5 - Math.random());
      setCurrentQuiz(shuffled.slice(0, 5));
    }
  }, [activeTab, currentQuiz.length]);

  const restartQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    const shuffled = [...quizDataS1].sort(() => 0.5 - Math.random());
    setCurrentQuiz(shuffled.slice(0, 5));
    document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOption = (questionId: number, optionId: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const calculateScore = () => {
    let score = 0;
    currentQuiz.forEach(q => {
      const selectedOption = q.options.find(o => o.id === quizAnswers[q.id]);
      if (selectedOption && selectedOption.isCorrect) score++;
    });
    return score;
  };

  useEffect(() => {
    document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' });

    // Auto-wrap tables for mobile scrolling
    const tables = document.querySelectorAll('.comp-table, .vocab-table');
    tables.forEach(table => {
      if (table.parentElement && !table.parentElement.classList.contains('table-wrap')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrap';
        table.parentElement.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });
  }, [activeTab]);

  // Expose showVenn to the global window object for the inline onclick handlers
  useEffect(() => {
    (window as any).showVenn = (type: string) => {
      const vennData: Record<string, { title: string; text: string }> = {
        ia: {
          title: 'Intelligence Artificielle',
          text: "Discipline informatique visant à reproduire les capacités cognitives humaines. Domaine englobant — tout ce qui simule de l'intelligence entre ici. En géosciences : systèmes experts, optimisation, reconnaissance de formes."
        },
        ml: {
          title: 'Machine Learning',
          text: "Sous-domaine de l'IA. Le modèle apprend automatiquement des patterns depuis les données, sans règles explicites programmées. En géosciences : prédiction de teneurs, classification lithologique, détection d'anomalies géochimiques. Algorithmes : Random Forest, XGBoost, SVM."
        },
        dl: {
          title: 'Deep Learning',
          text: "Branche du ML utilisant des réseaux neuronaux profonds (10+ couches). Excelle sur les données visuelles volumineuses. En géosciences : analyse d'images satellite, reconnaissance de patterns sur carottes, interprétation de données sismiques 3D. Nécessite GPU et grandes quantités de données."
        }
      };

      const d = vennData[type];
      const infoEl = document.getElementById('vennInfo');
      if (infoEl) {
        infoEl.innerHTML = '<h4>' + d.title + '</h4><p>' + d.text + '</p>';
      }

      ['ia', 'ml', 'dl'].forEach(t => document.getElementById('vc-' + t)?.classList.remove('selected'));
      document.getElementById('vc-' + type)?.classList.add('selected');
    };

    return () => {
      delete (window as any).showVenn;
    };
  }, []);


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
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => {
                if (index <= maxUnlockedTabIndex) {
                  setActiveTab(tab.id);
                }
              }}
              disabled={index > maxUnlockedTabIndex}
              title={index > maxUnlockedTabIndex ? "Terminez la page précédente pour débloquer" : ""}
              className={`lesson-tab ${activeTab === tab.id ? 'active' : ''} ${index > maxUnlockedTabIndex ? 'locked' : ''}`}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>

      <div className="lesson-content-area" style={{ padding: '2rem 0' }}>
        {activeTab === 's1' && (
          <div className="animate-slide-up" dangerouslySetInnerHTML={{
            __html: `
    <div class="hero">
      <div class="eyebrow">Module 1 — Fondations &amp; Démystification</div>
      <h2>Introduction à <span>l'IA</span> en géosciences</h2>
      <p class="lead">
        Ce cours vous donne les bases conceptuelles et pratiques pour intégrer l'intelligence artificielle dans votre travail de géoscientifique — sans remplacer votre expertise, en la multipliant.
      </p>
    </div>

    <h3 class="section-subheading">Objectifs de la séance</h3>
    <div class="objectives-grid">
      <div class="obj-card">
        <div class="obj-num">01</div>
        <h4>Comprendre la valeur de l'IA</h4>
        <p>Découvrir pourquoi l'IA est devenue incontournable dans les géosciences modernes.</p>
      </div>
      <div class="obj-card">
        <div class="obj-num">02</div>
        <h4>Distinguer IA, ML et DL</h4>
        <p>Clarifier les concepts fondamentaux et leur hiérarchie.</p>
      </div>
      <div class="obj-card">
        <div class="obj-num">03</div>
        <h4>Choisir le bon outil</h4>
        <p>Positionner l'IA face aux méthodes géostatistiques traditionnelles.</p>
      </div>
      <div class="obj-card">
        <div class="obj-num">04</div>
        <h4>Identifier les problèmes</h4>
        <p>Formuler des questions géologiques sous forme de problèmes IA.</p>
      </div>
      <div class="obj-card">
        <div class="obj-num">05</div>
        <h4>Démarrer avec Python</h4>
        <p>Mettre en place un environnement de travail professionnel.</p>
      </div>
      <div class="obj-card">
        <div class="obj-num">06</div>
        <h4>Réaliser un audit de données</h4>
        <p>Effectuer un premier audit de données de forage en pratique.</p>
      </div>
    </div>

    <div class="key-box green">
      <div class="kb-label">Message fondateur</div>
      <p>L'IA n'est pas un remplacement du géologue. Elle agit comme un partenaire analytique, capable de traiter des volumes massifs de données pour révéler des tendances et des corrélations inaccessibles autrement.</p>
    </div>

    <div class="divider"></div>

    <h3 class="section-subheading">Prérequis</h3>
    <p class="prose">Pour suivre ce cours, vous avez besoin d'un <strong>compte Google actif</strong> et d'un navigateur web (Chrome recommandé). Tous les exercices pratiques s'exécutent sur <strong>Google Colab</strong> — aucune installation locale n'est requise.</p>

    <div class="key-box">
      <div class="kb-label">Accès Google Colab</div>
      <p>👉 <a href="https://colab.research.google.com" target="_blank" >https://colab.research.google.com</a></p>
    </div>

    
  ` }} />
        )}

        {activeTab === 's2' && (
          <div className="animate-slide-up" dangerouslySetInnerHTML={{
            __html: `
    <div class="hero">
      <div class="eyebrow">Partie I</div>
      <h2>Pourquoi parler d'IA en géosciences ?</h2>
    </div>

    <h3 class="section-subheading">1.1 — L'ère du Big Data minier</h3>
    <p class="prose">Il y a vingt ans, la géologie s'appuyait principalement sur des cartes papier. Aujourd'hui, nous traitons des <strong>téraoctets de données</strong>. Cette évolution transforme radicalement notre approche.</p>

    <div class="tri-grid">
      <div class="tri-card">
        <div class="tc-icon">⛏</div>
        <h4>Forages</h4>
        <p>Des dizaines de milliers d'intervalles — logs, teneurs, lithologies.</p>
      </div>
      <div class="tri-card">
        <div class="tc-icon">🧪</div>
        <h4>Géochimie</h4>
        <p>20 à 50 éléments analysés par échantillon.</p>
      </div>
      <div class="tri-card">
        <div class="tc-icon">📡</div>
        <h4>Géophysique</h4>
        <p>Grilles raster haute résolution couvrant des milliers de km².</p>
      </div>
      <div class="tri-card">
        <div class="tc-icon">🛰</div>
        <h4>Imagerie</h4>
        <p>Satellites Sentinel, drones, Modèles Numériques de Terrain (MNT).</p>
      </div>
    </div>

    <div class="warn-box">
      <strong>Le défi :</strong> Ces volumes et cette diversité de données sont impossibles à traiter manuellement ou avec des outils comme Excel. L'échelle a changé — les méthodes traditionnelles sont insuffisantes.
    </div>

    <div class="divider"></div>

    <h3 class="section-subheading">1.2 — Les contraintes métiers réelles</h3>
    <p class="prose">En géosciences, les décisions sont prises sous des pressions intenses. L'IA offre des solutions concrètes face à trois défis majeurs.</p>

    <div class="tri-grid">
      <div class="tri-card">
        <div class="tc-icon">💰</div>
        <h4>Coût élevé des forages</h4>
        <p>Un forage mal placé représente une dépense colossale. L'IA améliore le ciblage des zones prometteuses.</p>
      </div>
      <div class="tri-card">
        <div class="tc-icon">🔍</div>
        <h4>Incertitude du sous-sol</h4>
        <p>Le sous-sol reste partiellement observable. L'IA aide à quantifier la probabilité de succès et transforme l'incertitude en risque gérable.</p>
      </div>
      <div class="tri-card">
        <div class="tc-icon">⏱</div>
        <h4>Pression des délais</h4>
        <p>Les investisseurs attendent des retours rapides. L'IA accélère les processus d'analyse et de décision sans sacrifier la qualité.</p>
      </div>
    </div>

    <div class="divider"></div>

    <h3 class="section-subheading">1.3 — Cas concrets : l'IA qui a trouvé des gisements</h3>
    <div class="case-grid">
      <div class="case-card">
        <div class="cc-tag">Cas réel · 2024</div>
        <h4>KoBold Metals — Zambie</h4>
        <p>L'entreprise a confirmé en 2024 la découverte du gisement de cuivre de Mingomba en réinterprétant des données historiques à l'aide de l'IA, démontrant la valeur de l'intégration multi-sources.</p>
      </div>
      <div class="case-card">
        <div class="cc-tag">Cas réel · Canada</div>
        <h4>GoldSpot Discoveries — Projet Queensway</h4>
        <p>L'approche de ciblage par IA a permis d'identifier des zones prioritaires. Un sondage a intercepté 19 m à 92,86 g/t d'or, validant la pertinence de l'approche prédictive.</p>
      </div>
    </div>

    <div class="divider"></div>

    <h3 class="section-subheading">1.4 — Applications concrètes</h3>
    <div class="app-grid">
      <div class="app-card">
        <div class="ac-dot"></div>
        <h4>Exploration minière</h4>
        <p>Détection automatique de cibles potentielles par analyse géophysique et géochimique.</p>
      </div>
      <div class="app-card">
        <div class="ac-dot" ></div>
        <h4>Cartographie géologique</h4>
        <p>Analyse automatisée d'images satellite multibandes par CNN pour cartographie rapide.</p>
      </div>
      <div class="app-card">
        <div class="ac-dot" ></div>
        <h4>Modélisation géophysique</h4>
        <p>Inversion gravimétrique accélérée par réseaux neuronaux — de jours à minutes.</p>
      </div>
      <div class="app-card">
        <div class="ac-dot" ></div>
        <h4>Surveillance environnementale</h4>
        <p>Détection précoce de risques géologiques (glissements, subsidences) par analyse prédictive.</p>
      </div>
    </div>

    <div class="divider"></div>

    <h3 class="section-subheading">1.5 — Limites de l'IA : ce qu'il ne faut pas oublier</h3>
    <div class="limit-grid">
      <div class="limit-card">
        <h4>Biais des données</h4>
        <p>Les modèles reflètent les biais présents dans les données d'entraînement et peuvent mener à des interprétations erronées.</p>
      </div>
      <div class="limit-card">
        <h4>Effet "boîte noire"</h4>
        <p>La complexité de certains modèles rend difficile la compréhension de leurs décisions internes.</p>
      </div>
      <div class="limit-card">
        <h4>Garbage In = Garbage Out</h4>
        <p>L'IA est aussi performante que les données sur lesquelles elle est formée. Des données mauvaises donnent de mauvais résultats.</p>
      </div>
      <div class="limit-card">
        <h4>L'expertise reste centrale</h4>
        <p>L'IA est un outil puissant, mais elle ne remplace pas l'interprétation critique du géologue sur le terrain.</p>
      </div>
    </div>

    
  ` }} />
        )}

        {activeTab === 's3' && (
          <div className="animate-slide-up" dangerouslySetInnerHTML={{
            __html: `
    <div class="hero">
      <div class="eyebrow">Partie II</div>
      <h2>Démystification des concepts fondamentaux</h2>
    </div>

    <p class="prose">Les mots <strong>IA</strong>, <strong>Machine Learning</strong> et <strong>Deep Learning</strong> sont souvent utilisés de manière interchangeable — alors qu'ils désignent des réalités bien distinctes. Voici comment les distinguer.</p>

    <h3 class="section-subheading">2.1 — La hiérarchie : les poupées russes</h3>
    <p class="prose">Cliquez sur chaque cercle pour voir la définition et un exemple géoscientifique concret.</p>

    <div class="venn-wrap">
      <div class="venn-label">Diagramme interactif</div>
      <div style="position: relative; height: 170px; max-width: 340px; margin: 0 auto 20px;">
        <div class="venn-circle vc-ia" id="vc-ia" onclick="window.showVenn('ia')">
          <span style="position:absolute; left:14px; top:14px; font-size:11px; color: #79C0FF;">IA</span>
        </div>
        <div class="venn-circle vc-ml" id="vc-ml" onclick="window.showVenn('ml')">
          <span style="position:absolute; left:20px; top:20px; font-size:11px; color: #7EE787;">ML</span>
        </div>
        <div class="venn-circle vc-dl" id="vc-dl" onclick="window.showVenn('dl')">
          <span style="position:absolute; left:26px; top:30px; font-size:11px; color: #D2A8FF;">DL</span>
        </div>
      </div>
      <div class="venn-info" id="vennInfo">
        <h4>Sélectionnez un cercle</h4>
        <p>Cliquez sur IA, ML ou Deep Learning pour afficher sa définition et des exemples géoscientifiques.</p>
      </div>
    </div>

    <div class="divider"></div>

    <h3 class="section-subheading">2.2 — Machine Learning : ce qu'il fait en géosciences</h3>
    <p class="prose">Le ML est indispensable pour les <strong>données tabulaires</strong> (forages, géochimie, logs). Il capture des relations non-linéaires que les statistiques classiques ne voient pas.</p>

    <div class="tri-grid">
      <div class="tri-card">
        <h4>Prédiction de teneur</h4>
        <p>Estimer la concentration en Au à partir de données géochimiques et géophysiques.</p>
      </div>
      <div class="tri-card">
        <h4>Classification lithologique</h4>
        <p>Identifier automatiquement les types de roches à partir de logs de forage.</p>
      </div>
      <div class="tri-card">
        <h4>Détection d'anomalies</h4>
        <p>Repérer des signatures inhabituelles indiquant une minéralisation potentielle.</p>
      </div>
    </div>

    <div class="divider"></div>

    <h3 class="section-subheading">2.3 — Deep Learning : quand l'image est au cœur du problème</h3>
    <p class="prose">Le Deep Learning utilise des réseaux neuronaux profonds. Il excelle sur les <strong>données visuelles</strong> — à utiliser quand les images sont au cœur du problème.</p>

    <div class="tri-grid">
      <div class="tri-card">
        <h4>Images satellites</h4>
        <p>Cartographie des ressources, détection de changements, surveillance environnementale.</p>
      </div>
      <div class="tri-card">
        <h4>Photos de carottes</h4>
        <p>Identification automatisée des lithologies, textures et altérations.</p>
      </div>
      <div class="tri-card">
        <h4>Grilles géophysiques 3D</h4>
        <p>Interprétation de données sismiques et gravimétriques.</p>
      </div>
    </div>

    <div class="warn-box">
      <strong>Points d'attention :</strong> Le Deep Learning requiert d'énormes volumes de données annotées, une puissance GPU significative, et ses décisions sont moins interprétables (effet boîte noire plus prononcé).
    </div>

    <div class="divider"></div>

    <h3 class="section-subheading">2.4 — Comment fonctionne un modèle ? Y = f(X)</h3>
    <div class="steps">
      <div class="step">
        <div class="step-num-col">
          <div class="step-num">1</div>
          <div class="step-line"></div>
        </div>
        <div class="step-body">
          <h4>Entraînement</h4>
          <p>Le modèle apprend des patterns à partir d'un ensemble de données étiquetées. Il ajuste ses paramètres internes. En géosciences : le modèle apprend sur des sondages et échantillons déjà connus.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num-col">
          <div class="step-num">2</div>
          <div class="step-line"></div>
        </div>
        <div class="step-body">
          <h4>Validation</h4>
          <p>Évaluation des performances sur un ensemble de données indépendant. Permet d'éviter le <strong>sur-apprentissage (overfitting)</strong> — quand un modèle mémorise l'entraînement au lieu d'apprendre à généraliser.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num-col">
          <div class="step-num">3</div>
        </div>
        <div class="step-body">
          <h4>Prédiction</h4>
          <p>Application du modèle à de nouvelles données — zones non forées, échantillons non analysés. C'est l'objectif final : prédire l'inconnu.</p>
        </div>
      </div>
    </div>

    <div class="key-box amber">
      <div class="kb-label">Règle d'or</div>
      <p>Un bon modèle est celui qui prédit l'inconnu avec précision, et non celui qui se contente de reproduire le passé.</p>
    </div>

    <div class="divider"></div>

    <h3 class="section-subheading">2.5 — Vocabulaire essentiel : Data ↔ Géosciences</h3>
    <table class="vocab-table">
      <thead>
        <tr>
          <th>Terme Data Science</th>
          <th>Équivalent géoscientifique</th>
          <th>Exemple concret</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Instance / Observation</td>
          <td>Échantillon / intervalle</td>
          <td>Une ligne du fichier — un intervalle de forage, un point sol</td>
        </tr>
        <tr>
          <td>Feature</td>
          <td>Variable explicative (entrée)</td>
          <td>As, Sb, lithologie, X, Y, altitude, intensité magnétique</td>
        </tr>
        <tr>
          <td>Label / Target</td>
          <td>Objectif à prédire (sortie)</td>
          <td>Teneur Au manquante, lithologie, "minéralisé : oui/non"</td>
        </tr>
        <tr>
          <td>Training</td>
          <td>Calibrage du modèle</td>
          <td>Le modèle apprend sur des sondages/échantillons déjà connus</td>
        </tr>
        <tr>
          <td>Prediction / Inference</td>
          <td>Estimation / extrapolation</td>
          <td>Application dans des zones non forées ou non échantillonnées</td>
        </tr>
      </tbody>
    </table>

    
  ` }} />
        )}

        {activeTab === 's4' && (
          <div className="animate-slide-up" dangerouslySetInnerHTML={{
            __html: `
    <div class="hero">
      <div class="eyebrow">Partie III</div>
      <h2>IA vs Géostatistique — choisir le bon outil</h2>
    </div>

    <div class="key-box green">
      <div class="kb-label">Message central</div>
      <p>L'IA ne remplace pas le Krigeage. Ce sont trois outils distincts pour trois usages différents : <strong>décrire</strong>, <strong>estimer avec incertitude spatiale</strong>, et <strong>prédire avec de multiples variables</strong>.</p>
    </div>

    <h3 class="section-subheading">3.1 — Les trois approches</h3>

    <table class="comp-table">
      <thead>
        <tr>
          <th>Méthode</th>
          <th>Ce qu'elle fait</th>
          <th>Quand l'utiliser</th>
          <th>Algorithmes typiques</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Statistique classique</td>
          <td>Décrire les données — moyenne, histogramme, corrélation.</td>
          <td>EDA, contrôle qualité, première exploration.</td>
          <td><span class="tag-pill">Python / pandas</span></td>
        </tr>
        <tr>
          <td>Géostatistique (Kriging)</td>
          <td>Estimer des valeurs avec <strong>continuité spatiale</strong>. Standard industrie.</td>
          <td>Modèles de blocs, certification ressources JORC.</td>
          <td><span class="tag-pill">Kriging</span> <span class="tag-pill">Variogramme</span></td>
        </tr>
        <tr>
          <td>IA / Machine Learning</td>
          <td>Prédire des phénomènes <strong>multivariés et non-linéaires</strong>.</td>
          <td>Ciblage exploratoire, classification automatique.</td>
          <td><span class="tag-pill">Random Forest</span> <span class="tag-pill">XGBoost</span></td>
        </tr>
      </tbody>
    </table>

    <div class="divider"></div>

    <h3 class="section-subheading">3.2 — Sélecteur interactif : quel outil pour mon problème ?</h3>
    <p class="prose">Sélectionnez votre situation pour voir l'outil recommandé.</p>

    <div class="tool-selector">
      <div class="ts-buttons" id="toolBtns">
        <button class="ts-btn" >Estimer des ressources minières</button>
        <button class="ts-btn" >Cibler des zones d'exploration</button>
        <button class="ts-btn" >Analyser des images de carottes</button>
        <button class="ts-btn" >Vérifier la qualité des données</button>
        <button class="ts-btn" >Classifier des lithologies depuis des logs</button>
      </div>
      <div class="ts-result" id="toolResult">
        <div class="ts-tool" id="toolName"></div>
        <div class="ts-why" id="toolWhy"></div>
      </div>
    </div>

    
  ` }} />
        )}

        {activeTab === 's5' && (
          <div className="animate-slide-up" dangerouslySetInnerHTML={{
            __html: `
    <div class="hero">
      <div class="eyebrow">Partie IV</div>
      <h2>La boîte à outils — types de problèmes IA</h2>
    </div>

    <p class="prose">La première étape cruciale est de <strong>diagnostiquer le type de problème</strong> avant de penser au code ou aux algorithmes. Chaque question métier correspond à un type d'IA précis.</p>

    <div class="key-box purple">
      <div class="kb-label">Règle d'or</div>
      <p>Poser la bonne question = choisir le bon algorithme. Un problème mal formulé donne un modèle inutile même si le code est parfait.</p>
    </div>

    <h3 class="section-subheading">Les 5 familles de problèmes</h3>

    <table class="comp-table">
      <thead>
        <tr>
          <th>Question</th>
          <th>Type de problème</th>
          <th>Exemple géoscientifique</th>
          <th>Algorithmes typiques</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Combien ?</td>
          <td>Régression</td>
          <td>Estimer la teneur en Au à partir de la géochimie</td>
          <td><span class="tag-pill">Random Forest</span> <span class="tag-pill">XGBoost</span></td>
        </tr>
        <tr>
          <td>Quoi ?</td>
          <td>Classification</td>
          <td>Identifier la lithologie depuis des logs de forage</td>
          <td><span class="tag-pill">SVM</span> <span class="tag-pill">Random Forest</span></td>
        </tr>
        <tr>
          <td>Qui se ressemble ?</td>
          <td>Clustering</td>
          <td>Regrouper des familles géochimiques similaires</td>
          <td><span class="tag-pill">K-Means</span> <span class="tag-pill">DBSCAN</span></td>
        </tr>
        <tr>
          <td>Qui est l'intrus ?</td>
          <td>Détection d'anomalies</td>
          <td>Détecter une pépite ou une erreur de labo</td>
          <td><span class="tag-pill">Isolation Forest</span></td>
        </tr>
        <tr>
          <td>Que vois-tu ?</td>
          <td>Vision par ordinateur</td>
          <td>Analyser une image satellite ou une carotte</td>
          <td><span class="tag-pill">CNN</span> <span class="tag-pill">ResNet</span></td>
        </tr>
      </tbody>
    </table>

    <div class="divider"></div>

    <h3 class="section-subheading">Types de données géoscientifiques pour l'IA</h3>
    <div class="tri-grid">
      <div class="tri-card">
        <h4>📊 Données tabulaires</h4>
        <p>Lignes et colonnes — assays, collars, surveys, géochimie, logs de forage.<br><strong >Modèles :</strong> Random Forest, XGBoost, KNN.</p>
      </div>
      <div class="tri-card">
        <h4>🗺 Données raster</h4>
        <p>Grilles de pixels — cartes magnétiques, imagerie satellite, photos de carottes.<br><strong >Modèles :</strong> CNN (Deep Learning).</p>
      </div>
      <div class="tri-card">
        <h4>📍 Données vectorielles</h4>
        <p>Points, lignes, polygones — failles, contacts géologiques, périmètres de permis.<br><strong >Traitement :</strong> Conversion en raster ou attributs tabulaires.</p>
      </div>
    </div>

    <div class="warn-box">
      <strong>Attention :</strong> Une erreur de formatage ou un géoréférencement (CRS) incorrect peut invalider l'ensemble d'un modèle, quelle que soit sa sophistication.
    </div>

    
  ` }} />
        )}

        {activeTab === 's6' && (
          <div className="animate-slide-up" dangerouslySetInnerHTML={{
            __html: `
    <div class="hero">
      <div class="eyebrow">Partie VI — Pratique</div>
      <h2>Python &amp; Audit de données de forage</h2>
    </div>

    <h3 class="section-subheading">6.1 — Excel vs Python</h3>

    <div class="py-compare">
      <div class="py-col bad">
        <h4>❌ Limites d'Excel</h4>
        <ul>
          <li>Limite de 1 048 576 lignes</li>
          <li>Performances dégradées sur gros volumes</li>
          <li>Manipulations manuelles non traçables</li>
          <li>Résultats non auditables ni reproductibles</li>
          <li>Difficile à automatiser</li>
        </ul>
      </div>
      <div class="py-col good">
        <h4>✅ Pourquoi Python</h4>
        <ul>
          <li>Traçabilité : chaque étape est du code documenté</li>
          <li>Reproductibilité : résultats identiques à chaque exécution</li>
          <li>Auditabilité : la logique est vérifiable ligne par ligne</li>
          <li>Automatisation des tâches répétitives</li>
          <li>Standard de l'industrie IA/data science</li>
        </ul>
      </div>
    </div>

    <div class="key-box amber">
      <div class="kb-label">À retenir</div>
      <p><strong>Excel = Outil</strong> &nbsp;·&nbsp; <strong>Python = Méthode Scientifique</strong></p>
    </div>

    <div class="divider"></div>

    <h3 class="section-subheading">6.2 — Les 3 piliers Python pour les géosciences</h3>
    <div class="tri-grid">
      <div class="tri-card">
        <h4>🐼 Pandas</h4>
        <p>Gère les tableaux de données structurées (DataFrames). Idéal pour le nettoyage, la transformation et l'analyse de données tabulaires — logs, assays, géochimie.</p>
      </div>
      <div class="tri-card">
        <h4>🔢 NumPy</h4>
        <p>Calculs numériques et manipulation de tableaux multidimensionnels (arrays). Fondamental pour tous les algorithmes d'IA en arrière-plan.</p>
      </div>
      <div class="tri-card">
        <h4>📈 Matplotlib</h4>
        <p>Bibliothèque de base pour créer des visualisations — histogrammes, cartes de chaleur, nuages de points. Premier outil pour explorer vos données.</p>
      </div>
    </div>

    <div class="divider"></div>

    <h3 class="section-subheading">6.3 — TP : Audit d'un fichier de forage brut</h3>
    <p class="prose">Vous travaillez sur un fichier <code >sondages_bruts.csv</code> contenant des données de forage imparfaites. Votre mission : identifier les problèmes avant toute modélisation.</p>

    <h4 class="section-subheading" >Étape 1 — Charger et inspecter les données</h4>
    <div class="code-block">
      <div class="code-header">
        <span class="code-lang">Python</span>
        <button class="copy-btn" >Copier</button>
      </div>
      <pre><span class="c-pink">import</span> pandas <span class="c-pink">as</span> pd
<span class="c-pink">import</span> numpy <span class="c-pink">as</span> np
<span class="c-pink">import</span> matplotlib.pyplot <span class="c-pink">as</span> plt

<span class="c-gray"># Charger le fichier</span>
df = pd.<span class="c-blue">read_csv</span>(<span class="c-green">'sondages_bruts.csv'</span>)

<span class="c-gray"># Vue d'ensemble : dimensions, types, valeurs manquantes</span>
<span class="c-blue">print</span>(df.<span class="c-blue">info</span>())
<span class="c-blue">print</span>(df.<span class="c-blue">head</span>())</pre>
    </div>

    <div class="key-box">
      <div class="kb-label">Ce que vous allez découvrir</div>
      <p>La colonne <code >GOLD_G_T</code> est de type <code >object</code> au lieu de <code >float64</code> — car elle contient des valeurs textuelles comme <code >&lt;0.01</code> et <code >NS</code> (Non Spécifié). C'est "le choc" typique d'un audit réel.</p>
    </div>

    <h4 class="section-subheading" >Étape 2 — Contrôles QA/QC essentiels</h4>
    <div class="code-block">
      <div class="code-header">
        <span class="code-lang">Python</span>
        <button class="copy-btn" >Copier</button>
      </div>
      <pre><span class="c-gray"># 1. Valeurs manquantes par colonne</span>
<span class="c-blue">print</span>(<span class="c-green">"Valeurs manquantes :"</span>)
<span class="c-blue">print</span>(df.<span class="c-blue">isnull</span>().<span class="c-blue">sum</span>())

<span class="c-gray"># 2. Incohérences de profondeur (DEPTH_FROM &gt;= DEPTH_TO)</span>
incoherences = df[df[<span class="c-green">'DEPTH_FROM'</span>] &gt;= df[<span class="c-green">'DEPTH_TO'</span>]]
<span class="c-blue">print</span>(<span class="c-orange">f</span><span class="c-green">"\nIncohérences de profondeur : </span><span class="c-orange">{</span><span class="c-blue">len</span>(incoherences)<span class="c-orange">}</span><span class="c-green"> lignes"</span>)

<span class="c-gray"># 3. Doublons</span>
doublons = df.<span class="c-blue">duplicated</span>().<span class="c-blue">sum</span>()
<span class="c-blue">print</span>(<span class="c-orange">f</span><span class="c-green">"Doublons : </span><span class="c-orange">{</span>doublons<span class="c-orange">}</span><span class="c-green"> lignes"</span>)

<span class="c-gray"># 4. Valeurs uniques de ROCK_TYPE (vérifier orthographe)</span>
<span class="c-blue">print</span>(<span class="c-green">"\nTypes de roches :"</span>)
<span class="c-blue">print</span>(df[<span class="c-green">'ROCK_TYPE'</span>].<span class="c-blue">value_counts</span>())</pre>
    </div>

    <h4 class="section-subheading" >Étape 3 — Conversion et visualisation</h4>
    <div class="code-block">
      <div class="code-header">
        <span class="code-lang">Python</span>
        <button class="copy-btn" >Copier</button>
      </div>
      <pre><span class="c-gray"># Forcer la conversion numérique (les erreurs deviennent NaN)</span>
df[<span class="c-green">'GOLD_G_T'</span>] = pd.<span class="c-blue">to_numeric</span>(df[<span class="c-green">'GOLD_G_T'</span>], errors=<span class="c-green">'coerce'</span>)

<span class="c-gray"># Supprimer les lignes sans teneur après conversion</span>
df_clean = df.<span class="c-blue">dropna</span>(subset=[<span class="c-green">'GOLD_G_T'</span>])

<span class="c-gray"># Histogramme de distribution</span>
plt.<span class="c-blue">figure</span>(figsize=(<span class="c-yellow">10</span>, <span class="c-yellow">6</span>))
df_clean[<span class="c-green">'GOLD_G_T'</span>].<span class="c-blue">hist</span>(bins=<span class="c-yellow">50</span>, color=<span class="c-green">'#4F8EF7'</span>)
plt.<span class="c-blue">title</span>(<span class="c-green">'Distribution de la teneur en or (g/t)'</span>)
plt.<span class="c-blue">xlabel</span>(<span class="c-green">'Teneur (g/t)'</span>)
plt.<span class="c-blue">ylabel</span>(<span class="c-green">'Fréquence'</span>)
plt.<span class="c-blue">show</span>()</pre>
    </div>

    <h4 class="section-subheading" >Étape 4 — Export des livrables</h4>
    <div class="code-block">
      <div class="code-header">
        <span class="code-lang">Python</span>
        <button class="copy-btn" >Copier</button>
      </div>
      <pre><span class="c-gray"># Livrable 1 : données nettoyées</span>
df_clean.<span class="c-blue">to_csv</span>(<span class="c-green">'quick_clean.csv'</span>, index=<span class="c-pink">False</span>)

<span class="c-gray"># Livrable 2 : rapport d'erreurs pour investigation</span>
erreurs = df[df[<span class="c-green">'DEPTH_FROM'</span>] &gt;= df[<span class="c-green">'DEPTH_TO'</span>]]
erreurs.<span class="c-blue">to_csv</span>(<span class="c-green">'rapport_erreurs_labo.csv'</span>, index=<span class="c-pink">False</span>)

<span class="c-blue">print</span>(<span class="c-green">"✅ Audit terminé. Deux fichiers exportés."</span>)
<span class="c-blue">print</span>(<span class="c-orange">f</span><span class="c-green">"   - quick_clean.csv : </span><span class="c-orange">{</span><span class="c-blue">len</span>(df_clean)<span class="c-orange">}</span><span class="c-green"> lignes valides"</span>)
<span class="c-blue">print</span>(<span class="c-orange">f</span><span class="c-green">"   - rapport_erreurs_labo.csv : </span><span class="c-orange">{</span><span class="c-blue">len</span>(erreurs)<span class="c-orange">}</span><span class="c-green"> erreurs à investiguer"</span>)</pre>
    </div>

    <div class="warn-box">
      <strong>À retenir :</strong> L'objectif final n'est pas le modèle, c'est la décision. Des données propres et bien comprises sont le préalable indispensable à tout projet d'IA fiable.
    </div>

    <div class="divider"></div>
    <h3 class="section-subheading">Responsabilité du géoscientifique</h3>
    <div class="limit-grid">
      <div class="limit-card" >
        <h4 >Audit des données</h4>
        <p>Vérifier la provenance, la qualité et la pertinence avant toute modélisation.</p>
      </div>
      <div class="limit-card" >
        <h4 >Validation terrain</h4>
        <p>Confronter les prédictions du modèle à la réalité du terrain.</p>
      </div>
      <div class="limit-card" >
        <h4 >Traçabilité</h4>
        <p>Documenter chaque étape, chaque décision, chaque version de données.</p>
      </div>
      <div class="limit-card" >
        <h4 >Décision finale</h4>
        <p>L'algorithme ne signe pas le rapport. La responsabilité reste humaine.</p>
      </div>
    </div>

    
  ` }} />
        )}


        {activeTab === 's7' && (
          <div className="animate-slide-up">
            <div className="hero">
              <div className="eyebrow">Validation des acquis</div>
              <h2>Quiz final — Séance 1</h2>
              <p className="lead">5 questions pour valider vos acquis. Chaque question porte sur un module de la séance.</p>
            </div>

            <div className="quiz-wrap">
              {currentQuiz.map(q => (
                <div key={q.id} className="quiz-q" style={{ marginBottom: '20px' }}>
                  <div className="q-text" style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '14px', fontWeight: 500 }}>{q.question}</div>
                  <div className="quiz-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {q.options.map(opt => {
                      const isSelected = quizAnswers[q.id] === opt.id;
                      let optionStyle: React.CSSProperties = {
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
                          optionStyle.border = '1px solid var(--lesson-accent)';
                          optionStyle.background = 'rgba(52, 211, 153, 0.1)';
                          optionStyle.color = 'var(--lesson-accent)';
                        }
                      } else {
                        // Submitted
                        if (opt.isCorrect) {
                          optionStyle.border = '1px solid var(--lesson-accent)';
                          optionStyle.background = 'rgba(52, 211, 153, 0.1)';
                          optionStyle.color = 'var(--lesson-accent)';
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
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--lesson-accent)', marginBottom: '10px' }}>
                  {calculateScore()} / 5
                </div>
                <p style={{ color: 'var(--accent-primary)', marginBottom: '20px', fontWeight: 600 }}>
                  Vous avez terminé la séance. La suite est désormais débloquée !
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button className="btn btn-secondary" onClick={() => {
                    restartQuiz();
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
              if (!quizSubmitted) {
                setQuizSubmitted(true);
                if (onComplete) {
                  onComplete(calculateScore(), { maxUnlockedTabIndex });
                }
                setTimeout(() => {
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }, 100);
              }
            }}
            disabled={quizSubmitted || Object.keys(quizAnswers).length < currentQuiz.length}
            title={Object.keys(quizAnswers).length < currentQuiz.length ? "Répondez à toutes les questions pour valider" : ""}
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

    </div>
  );
};

export default LessonIA_Geo_S1;
