const fs = require('fs');

const generateQuestions = () => {
  let idCounter = 1;
  const questions = [];

  // 1. VRAI_FAUX (10 questions)
  for (let i = 1; i <= 10; i++) {
    questions.push({
      id: idCounter++,
      text: `Question Vrai/Faux ${i} : L'Intelligence Artificielle est massivement utilisée dans l'exploration minière moderne.`,
      type: 'VRAI_FAUX',
      points: 1,
      gradingType: 'BINARY',
      content: {
        options: [
          { id: 'opt1', text: 'Vrai', isCorrect: i % 2 !== 0 },
          { id: 'opt2', text: 'Faux', isCorrect: i % 2 === 0 }
        ]
      }
    });
  }

  // 2. QCU (10 questions)
  for (let i = 1; i <= 10; i++) {
    questions.push({
      id: idCounter++,
      text: `Question QCU ${i} : Quel algorithme est le plus adapté pour la classification d'images sismiques ?`,
      type: 'QCU',
      points: 1,
      gradingType: 'BINARY',
      content: {
        options: [
          { id: 'opt1', text: 'Réseaux de neurones convolutifs (CNN)', isCorrect: true },
          { id: 'opt2', text: 'Régression linéaire', isCorrect: false },
          { id: 'opt3', text: 'K-Means', isCorrect: false },
          { id: 'opt4', text: 'Arbres de décision simples', isCorrect: false }
        ]
      }
    });
  }

  // 3. QCM (10 questions) - 5 BINARY, 5 PRORATA
  for (let i = 1; i <= 10; i++) {
    questions.push({
      id: idCounter++,
      text: `Question QCM ${i} : Quelles données géospatiales peuvent être analysées par le Deep Learning ?`,
      type: 'QCM',
      points: 2,
      gradingType: i <= 5 ? 'BINARY' : 'PRORATA',
      content: {
        options: [
          { id: 'opt1', text: 'Images satellites multicapteurs', isCorrect: true },
          { id: 'opt2', text: 'Données gravimétriques', isCorrect: true },
          { id: 'opt3', text: 'Bruit thermique aléatoire non calibré', isCorrect: false },
          { id: 'opt4', text: 'Séries temporelles sismiques', isCorrect: true }
        ]
      }
    });
  }

  // 4. APPARIEMENT (10 questions)
  for (let i = 1; i <= 10; i++) {
    questions.push({
      id: idCounter++,
      text: `Question Appariement ${i} : Reliez chaque concept d'IA à son application en Géosciences.`,
      type: 'APPARIEMENT',
      points: 2,
      gradingType: 'PRORATA',
      content: {
        pairs: [
          { left: 'Computer Vision', right: 'Analyse de carottes de forage' },
          { left: 'NLP (Traitement du langage)', right: 'Extraction d\'infos des rapports géologiques' },
          { left: 'Reinforcement Learning', right: 'Optimisation des trajectoires de forage' },
          { left: 'Clustering', right: 'Zonage géochimique non supervisé' }
        ]
      }
    });
  }

  // 5. ORDONNANCEMENT (10 questions)
  for (let i = 1; i <= 10; i++) {
    questions.push({
      id: idCounter++,
      text: `Question Ordonnancement ${i} : Remettez dans l'ordre les étapes d'un pipeline Machine Learning en Géosciences.`,
      type: 'ORDONNANCEMENT',
      points: 2,
      gradingType: 'PRORATA',
      content: {
        items: [
          { id: 'item1', text: 'Acquisition des données géophysiques', correctOrder: 1 },
          { id: 'item2', text: 'Prétraitement et nettoyage des données', correctOrder: 2 },
          { id: 'item3', text: 'Extraction des caractéristiques (Feature Engineering)', correctOrder: 3 },
          { id: 'item4', text: 'Entraînement du modèle prédictif', correctOrder: 4 },
          { id: 'item5', text: 'Évaluation et déploiement du modèle', correctOrder: 5 }
        ]
      }
    });
  }

  // 6. TEXTE_A_TROUS (10 questions)
  for (let i = 1; i <= 10; i++) {
    questions.push({
      id: idCounter++,
      text: `Question Texte à Trous ${i} : Complétez le paragraphe suivant sur la modélisation géologique.`,
      type: 'TEXTE_A_TROUS',
      points: 2,
      gradingType: 'PRORATA',
      content: {
        text: 'Pour construire un modèle géologique 3D, on utilise souvent des algorithmes de [trou1] pour extrapoler les données manquantes. L\'évaluation de l\'incertitude repose généralement sur des méthodes géostatistiques comme le [trou2]. L\'IA apporte une nouvelle dimension avec les réseaux de neurones de type [trou3].',
        blanks: {
          'trou1': {
            correctAnswer: 'krigeage',
            options: ['krigeage', 'triage', 'lissage']
          },
          'trou2': {
            correctAnswer: 'kriging stochastique',
            options: ['kriging stochastique', 'bootstrap', 'filtrage de Kalman']
          },
          'trou3': {
            correctAnswer: 'GANs (Réseaux Antagonistes)',
            options: ['GANs (Réseaux Antagonistes)', 'RNNs simples', 'Perceptrons multicouches']
          }
        }
      }
    });
  }

  const fileContent = `export interface QCMOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface QCMPair {
  left: string;
  right: string;
}

export interface QCMSequenceItem {
  id: string;
  text: string;
  correctOrder?: number;
}

export interface QCMBlank {
  correctAnswer?: string;
  options: string[];
}

export interface QCMQuestion {
  id: number;
  text: string;
  type: 'VRAI_FAUX' | 'QCU' | 'QCM' | 'APPARIEMENT' | 'ORDONNANCEMENT' | 'TEXTE_A_TROUS';
  points: number;
  gradingType: 'BINARY' | 'PRORATA';
  content: {
    options?: QCMOption[];
    pairs?: QCMPair[];
    items?: QCMSequenceItem[];
    text?: string;
    blanks?: Record<string, QCMBlank>;
  };
}

export const qcmBank: QCMQuestion[] = ${JSON.stringify(questions, null, 2)};
`;

  fs.writeFileSync('../frontend/src/data/qcmData.ts', fileContent);
  fs.writeFileSync('../backend/src/utils/qcmData.ts', fileContent);
  console.log("QCM Data generated successfully!");
};

generateQuestions();
