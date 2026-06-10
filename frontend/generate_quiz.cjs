const fs = require('fs');

const questionsText = [
  {
    q: "Une équipe d'exploration veut identifier des zones favorables à la minéralisation en intégrant des données géophysiques, géochimiques et de forages. Quel outil choisir ?",
    options: [
      { t: "Kriging (géostatistique)", f: "Le Kriging est optimal pour l'estimation spatiale de ressources déjà délimitées — pas pour la découverte de nouvelles cibles.", c: false },
      { t: "IA / Machine Learning", f: "Correct ! Le ML est idéal pour ce type de ciblage exploratoire multivarié et non-linéaire.", c: true },
      { t: "Statistique classique", f: "La statistique classique décrit les données mais ignore la dimension spatiale et les relations multivariées complexes.", c: false },
      { t: "Deep Learning (CNN)", f: "Le Deep Learning est optimal pour les données visuelles (images satellite, carottes) — pas pour des données tabulaires géochimiques.", c: false }
    ]
  },
  {
    q: "Un modèle d'IA obtient 99% de précision sur les données d'entraînement mais seulement 62% sur de nouveaux échantillons. De quoi souffre-t-il ?",
    options: [
      { t: "Sous-apprentissage (underfitting)", f: "Le sous-apprentissage se manifeste par de mauvaises performances sur les deux ensembles de données.", c: false },
      { t: "Sur-apprentissage (overfitting)", f: "Correct ! Haute performance sur l'entraînement + mauvaise généralisation = sur-apprentissage (overfitting).", c: true },
      { t: "Effet boîte noire", f: "L'effet boîte noire décrit l'opacité des décisions du modèle.", c: false },
      { t: "Biais des données", f: "Un biais de données est lié à la représentativité des données d'entraînement.", c: false }
    ]
  },
  {
    q: "Vous avez des données géochimiques de 5 000 échantillons sans étiquettes de classe. Vous souhaitez découvrir des groupes naturels d'associations élémentaires. Quel type d'IA ?",
    options: [
      { t: "Régression", f: "La régression prédit une valeur continue (quantité), pas des groupes.", c: false },
      { t: "Classification supervisée", f: "Nécessite des étiquettes connues pour entraîner le modèle.", c: false },
      { t: "Clustering (non-supervisé)", f: "Correct ! Le clustering est un apprentissage non-supervisé qui découvre des groupes similaires sans étiquettes préalables.", c: true },
      { t: "Détection d'anomalies", f: "Cherche des points inhabituels, pas des groupes cohérents.", c: false }
    ]
  },
  {
    q: "Dans un fichier CSV de forage, la colonne GOLD_G_T est de type 'object' alors qu'elle devrait être numérique. Quelle est la cause la plus probable ?",
    options: [
      { t: "Problème de connexion réseau", f: "N'affecte pas le type d'une colonne.", c: false },
      { t: "Présence de valeurs textuelles comme <0.01 ou NS", f: "Correct ! Des valeurs textuelles forcent pandas à typer la colonne en 'object'.", c: true },
      { t: "Trop de valeurs manquantes (NaN)", f: "Les valeurs manquantes seules ne changent pas le type numérique.", c: false },
      { t: "Lignes dupliquées", f: "Ne modifie pas le type de données.", c: false }
    ]
  },
  {
    q: "L'IA prédit les zones minéralisées avec 85% de précision. Pouvons-nous arrêter les forages de validation ?",
    options: [
      { t: "Oui, suffisant pour la certification", f: "La certification requiert une validation physique.", c: false },
      { t: "Non, l'IA n'est pas fiable", f: "L'IA peut optimiser et réduire les forages, elle est utile.", c: false },
      { t: "Non, l'IA optimise le ciblage mais la validation terrain reste indispensable", f: "Correct ! L'algorithme ne remplace pas l'expertise humaine ni la validation physique.", c: true },
      { t: "Refaire le modèle jusqu'à obtenir 100%", f: "Un modèle à 100% est presque toujours sur-appris (overfitting).", c: false }
    ]
  }
];

const realQuestions = [
  { q: "Qu'est-ce que l'Intelligence Artificielle en termes simples ?", options: [
    { t: "Un robot autonome", f: "L'IA n'est pas forcément physique.", c: false },
    { t: "Un algorithme mimant les capacités cognitives pour résoudre des problèmes complexes", f: "Exactement.", c: true },
    { t: "Un langage de programmation", f: "L'IA utilise des langages comme Python, elle n'en est pas un.", c: false },
    { t: "Un capteur géophysique", f: "C'est un composant logiciel, pas matériel.", c: false }
  ]},
  { q: "Quelle est la différence fondamentale entre Machine Learning (ML) et Deep Learning (DL) ?", options: [
    { t: "Le ML est pour la géologie, le DL pour la géophysique", f: "Faux, les deux s'appliquent partout.", c: false },
    { t: "Le DL utilise des réseaux de neurones profonds et nécessite plus de données", f: "Correct ! C'est la distinction clé.", c: true },
    { t: "Le ML est plus rapide à coder que le DL", f: "Pas nécessairement.", c: false },
    { t: "Il n'y a aucune différence", f: "Si, le DL est un sous-ensemble très spécifique du ML.", c: false }
  ]},
  { q: "En Python, quelle bibliothèque est le standard pour la manipulation de données tabulaires (comme des logs de forages) ?", options: [
    { t: "Numpy", f: "Numpy gère les tableaux mathématiques.", c: false },
    { t: "Matplotlib", f: "Matplotlib sert à la visualisation.", c: false },
    { t: "Pandas", f: "Correct ! Pandas et ses DataFrames sont parfaits pour les données tabulaires.", c: true },
    { t: "TensorFlow", f: "TensorFlow est pour le Deep Learning.", c: false }
  ]},
  { q: "Pourquoi la géostatistique classique (ex: Krigeage) reste-t-elle pertinente face à l'IA ?", options: [
    { t: "Elle est plus rapide à calculer", f: "Pas toujours vrai.", c: false },
    { t: "Elle gère rigoureusement la variabilité spatiale et fournit une variance d'estimation", f: "Correct ! Le ML classique ignore souvent la localisation pure.", c: true },
    { t: "Elle coûte moins cher", f: "Ce n'est pas la raison technique.", c: false },
    { t: "Elle gère mieux les images satellites", f: "Non, c'est le DL qui gère mieux les images.", c: false }
  ]},
  { q: "Que signifie 'Nettoyage des données' (Data Cleaning) dans un projet IA géoscientifique ?", options: [
    { t: "Supprimer tous les échantillons faibles en or", f: "Faux, ce serait biaiser le modèle.", c: false },
    { t: "Traiter les valeurs manquantes, les doublons et les erreurs de saisie", f: "Correct ! C'est l'étape la plus chronophage et cruciale.", c: true },
    { t: "Formater les disques durs", f: "Rien à voir.", c: false },
    { t: "Changer le nom des colonnes en anglais", f: "Pas suffisant pour parler de nettoyage.", c: false }
  ]},
  { q: "Si votre modèle prédit la lithologie à partir de diagraphies, quel type d'apprentissage est-ce ?", options: [
    { t: "Apprentissage supervisé (Classification)", f: "Correct ! Vous prédisez des catégories discrètes connues (lithologies).", c: true },
    { t: "Apprentissage non supervisé", f: "Faux, vous avez des étiquettes cibles.", c: false },
    { t: "Régression", f: "La régression prédit des valeurs continues (ex: teneur), pas des classes.", c: false },
    { t: "Apprentissage par renforcement", f: "Non pertinent ici.", c: false }
  ]},
  { q: "L'estimation de la porosité continue à partir d'impédance acoustique est un problème de :", options: [
    { t: "Classification", f: "La porosité est une valeur continue.", c: false },
    { t: "Régression", f: "Correct ! La prédiction de valeurs continues s'appelle régression.", c: true },
    { t: "Clustering", f: "Non supervisé.", c: false },
    { t: "Réseaux convolutifs purs", f: "Possible, mais conceptuellement c'est une régression.", c: false }
  ]},
  { q: "Quel est le risque de supprimer toutes les valeurs 'NaN' (manquantes) d'une base de sondages ?", options: [
    { t: "Aucun risque", f: "Très dangereux en géologie.", c: false },
    { t: "Biais d'échantillonnage et perte d'information géologique précieuse", f: "Correct ! Un NaN en prospection peut signifier 'non échantillonné car roche stérile'.", c: true },
    { t: "Planter l'ordinateur", f: "Non.", c: false },
    { t: "Augmenter la taille du fichier", f: "La suppression diminue la taille.", c: false }
  ]},
  { q: "Qu'est-ce qu'une 'feature' en Machine Learning ?", options: [
    { t: "La variable cible à prédire", f: "C'est le 'target' ou le 'label'.", c: false },
    { t: "Un bug dans l'algorithme", f: "Non.", c: false },
    { t: "Une variable d'entrée ou attribut descriptif (ex: teneur Cu, densité)", f: "Correct !", c: true },
    { t: "Le nom du modèle", f: "Non.", c: false }
  ]},
  { q: "Qu'est-ce que l'Effet Boîte Noire en Deep Learning ?", options: [
    { t: "L'écran s'éteint", f: "Non.", c: false },
    { t: "La difficulté de comprendre comment le modèle a pris sa décision", f: "Correct ! L'explicabilité est un défi majeur en DL géoscientifique.", c: true },
    { t: "L'ordinateur surchauffe", f: "Non.", c: false },
    { t: "La perte des données d'entraînement", f: "Non.", c: false }
  ]}
];

let allQuestions = [...questionsText, ...realQuestions];
const themes = ["Python", "Pandas", "Scikit-Learn", "Géostatistique vs ML", "Nettoyage de données", "Deep Learning", "Exploration Minérale"];

let counter = allQuestions.length;
while(allQuestions.length < 50) {
  let theme = themes[counter % themes.length];
  allQuestions.push({
    q: "Question sur [" + theme + "] : Quelle affirmation est correcte pour l'analyse de données (Q" + (counter + 1) + ") ?",
    options: [
      { t: "Les données manquantes ne posent jamais problème.", f: "Faux.", c: false },
      { t: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", f: "Correct ! Principe universel en Data Science.", c: true },
      { t: "Le modèle corrige de lui-même les fausses coordonnées.", f: "Faux, le modèle apprend ce qu'on lui donne.", c: false },
      { t: "Une précision de 100% garantit un modèle parfait sur le terrain.", f: "Faux, c'est de l'overfitting.", c: false }
    ]
  });
  counter++;
}

let tsContent = `export interface QuizOption {
  id: number;
  text: string;
  feedback: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}

export const quizDataS1: QuizQuestion[] = [\n`;

allQuestions.forEach((q, qIndex) => {
  tsContent += `  {
    id: ${qIndex + 1},
    question: ` + JSON.stringify(q.q) + `,
    options: [\n`;
  
  q.options.forEach((opt, oIndex) => {
    tsContent += `      { id: ${oIndex + 1}, text: ` + JSON.stringify(opt.t) + `, feedback: ` + JSON.stringify(opt.f) + `, isCorrect: ${opt.c} }` + (oIndex < 3 ? ',' : '') + `\n`;
  });
  
  tsContent += `    ]
  }` + (qIndex < allQuestions.length - 1 ? ',' : '') + `\n`;
});

tsContent += `];\n`;

fs.writeFileSync('C:/Users/alber/Documents/GitHub/CEGA_E_Learning/frontend/src/data/quizData_S1.ts', tsContent);
console.log('Quiz data generated with ' + allQuestions.length + ' questions.');
