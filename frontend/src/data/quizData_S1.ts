export interface QuizOption {
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

export const quizDataS1: QuizQuestion[] = [
  {
    id: 1,
    question: "Une équipe d'exploration veut identifier des zones favorables à la minéralisation en intégrant des données géophysiques, géochimiques et de forages. Quel outil choisir ?",
    options: [
      { id: 1, text: "Kriging (géostatistique)", feedback: "Le Kriging est optimal pour l'estimation spatiale de ressources déjà délimitées — pas pour la découverte de nouvelles cibles.", isCorrect: false },
      { id: 2, text: "IA / Machine Learning", feedback: "Correct ! Le ML est idéal pour ce type de ciblage exploratoire multivarié et non-linéaire.", isCorrect: true },
      { id: 3, text: "Statistique classique", feedback: "La statistique classique décrit les données mais ignore la dimension spatiale et les relations multivariées complexes.", isCorrect: false },
      { id: 4, text: "Deep Learning (CNN)", feedback: "Le Deep Learning est optimal pour les données visuelles (images satellite, carottes) — pas pour des données tabulaires géochimiques.", isCorrect: false }
    ]
  },
  {
    id: 2,
    question: "Un modèle d'IA obtient 99% de précision sur les données d'entraînement mais seulement 62% sur de nouveaux échantillons. De quoi souffre-t-il ?",
    options: [
      { id: 1, text: "Sous-apprentissage (underfitting)", feedback: "Le sous-apprentissage se manifeste par de mauvaises performances sur les deux ensembles de données.", isCorrect: false },
      { id: 2, text: "Sur-apprentissage (overfitting)", feedback: "Correct ! Haute performance sur l'entraînement + mauvaise généralisation = sur-apprentissage (overfitting).", isCorrect: true },
      { id: 3, text: "Effet boîte noire", feedback: "L'effet boîte noire décrit l'opacité des décisions du modèle.", isCorrect: false },
      { id: 4, text: "Biais des données", feedback: "Un biais de données est lié à la représentativité des données d'entraînement.", isCorrect: false }
    ]
  },
  {
    id: 3,
    question: "Vous avez des données géochimiques de 5 000 échantillons sans étiquettes de classe. Vous souhaitez découvrir des groupes naturels d'associations élémentaires. Quel type d'IA ?",
    options: [
      { id: 1, text: "Régression", feedback: "La régression prédit une valeur continue (quantité), pas des groupes.", isCorrect: false },
      { id: 2, text: "Classification supervisée", feedback: "Nécessite des étiquettes connues pour entraîner le modèle.", isCorrect: false },
      { id: 3, text: "Clustering (non-supervisé)", feedback: "Correct ! Le clustering est un apprentissage non-supervisé qui découvre des groupes similaires sans étiquettes préalables.", isCorrect: true },
      { id: 4, text: "Détection d'anomalies", feedback: "Cherche des points inhabituels, pas des groupes cohérents.", isCorrect: false }
    ]
  },
  {
    id: 4,
    question: "Dans un fichier CSV de forage, la colonne GOLD_G_T est de type 'object' alors qu'elle devrait être numérique. Quelle est la cause la plus probable ?",
    options: [
      { id: 1, text: "Problème de connexion réseau", feedback: "N'affecte pas le type d'une colonne.", isCorrect: false },
      { id: 2, text: "Présence de valeurs textuelles comme <0.01 ou NS", feedback: "Correct ! Des valeurs textuelles forcent pandas à typer la colonne en 'object'.", isCorrect: true },
      { id: 3, text: "Trop de valeurs manquantes (NaN)", feedback: "Les valeurs manquantes seules ne changent pas le type numérique.", isCorrect: false },
      { id: 4, text: "Lignes dupliquées", feedback: "Ne modifie pas le type de données.", isCorrect: false }
    ]
  },
  {
    id: 5,
    question: "L'IA prédit les zones minéralisées avec 85% de précision. Pouvons-nous arrêter les forages de validation ?",
    options: [
      { id: 1, text: "Oui, suffisant pour la certification", feedback: "La certification requiert une validation physique.", isCorrect: false },
      { id: 2, text: "Non, l'IA n'est pas fiable", feedback: "L'IA peut optimiser et réduire les forages, elle est utile.", isCorrect: false },
      { id: 3, text: "Non, l'IA optimise le ciblage mais la validation terrain reste indispensable", feedback: "Correct ! L'algorithme ne remplace pas l'expertise humaine ni la validation physique.", isCorrect: true },
      { id: 4, text: "Refaire le modèle jusqu'à obtenir 100%", feedback: "Un modèle à 100% est presque toujours sur-appris (overfitting).", isCorrect: false }
    ]
  },
  {
    id: 6,
    question: "Qu'est-ce que l'Intelligence Artificielle en termes simples ?",
    options: [
      { id: 1, text: "Un robot autonome", feedback: "L'IA n'est pas forcément physique.", isCorrect: false },
      { id: 2, text: "Un algorithme mimant les capacités cognitives pour résoudre des problèmes complexes", feedback: "Exactement.", isCorrect: true },
      { id: 3, text: "Un langage de programmation", feedback: "L'IA utilise des langages comme Python, elle n'en est pas un.", isCorrect: false },
      { id: 4, text: "Un capteur géophysique", feedback: "C'est un composant logiciel, pas matériel.", isCorrect: false }
    ]
  },
  {
    id: 7,
    question: "Quelle est la différence fondamentale entre Machine Learning (ML) et Deep Learning (DL) ?",
    options: [
      { id: 1, text: "Le ML est pour la géologie, le DL pour la géophysique", feedback: "Faux, les deux s'appliquent partout.", isCorrect: false },
      { id: 2, text: "Le DL utilise des réseaux de neurones profonds et nécessite plus de données", feedback: "Correct ! C'est la distinction clé.", isCorrect: true },
      { id: 3, text: "Le ML est plus rapide à coder que le DL", feedback: "Pas nécessairement.", isCorrect: false },
      { id: 4, text: "Il n'y a aucune différence", feedback: "Si, le DL est un sous-ensemble très spécifique du ML.", isCorrect: false }
    ]
  },
  {
    id: 8,
    question: "En Python, quelle bibliothèque est le standard pour la manipulation de données tabulaires (comme des logs de forages) ?",
    options: [
      { id: 1, text: "Numpy", feedback: "Numpy gère les tableaux mathématiques.", isCorrect: false },
      { id: 2, text: "Matplotlib", feedback: "Matplotlib sert à la visualisation.", isCorrect: false },
      { id: 3, text: "Pandas", feedback: "Correct ! Pandas et ses DataFrames sont parfaits pour les données tabulaires.", isCorrect: true },
      { id: 4, text: "TensorFlow", feedback: "TensorFlow est pour le Deep Learning.", isCorrect: false }
    ]
  },
  {
    id: 9,
    question: "Pourquoi la géostatistique classique (ex: Krigeage) reste-t-elle pertinente face à l'IA ?",
    options: [
      { id: 1, text: "Elle est plus rapide à calculer", feedback: "Pas toujours vrai.", isCorrect: false },
      { id: 2, text: "Elle gère rigoureusement la variabilité spatiale et fournit une variance d'estimation", feedback: "Correct ! Le ML classique ignore souvent la localisation pure.", isCorrect: true },
      { id: 3, text: "Elle coûte moins cher", feedback: "Ce n'est pas la raison technique.", isCorrect: false },
      { id: 4, text: "Elle gère mieux les images satellites", feedback: "Non, c'est le DL qui gère mieux les images.", isCorrect: false }
    ]
  },
  {
    id: 10,
    question: "Que signifie 'Nettoyage des données' (Data Cleaning) dans un projet IA géoscientifique ?",
    options: [
      { id: 1, text: "Supprimer tous les échantillons faibles en or", feedback: "Faux, ce serait biaiser le modèle.", isCorrect: false },
      { id: 2, text: "Traiter les valeurs manquantes, les doublons et les erreurs de saisie", feedback: "Correct ! C'est l'étape la plus chronophage et cruciale.", isCorrect: true },
      { id: 3, text: "Formater les disques durs", feedback: "Rien à voir.", isCorrect: false },
      { id: 4, text: "Changer le nom des colonnes en anglais", feedback: "Pas suffisant pour parler de nettoyage.", isCorrect: false }
    ]
  },
  {
    id: 11,
    question: "Si votre modèle prédit la lithologie à partir de diagraphies, quel type d'apprentissage est-ce ?",
    options: [
      { id: 1, text: "Apprentissage supervisé (Classification)", feedback: "Correct ! Vous prédisez des catégories discrètes connues (lithologies).", isCorrect: true },
      { id: 2, text: "Apprentissage non supervisé", feedback: "Faux, vous avez des étiquettes cibles.", isCorrect: false },
      { id: 3, text: "Régression", feedback: "La régression prédit des valeurs continues (ex: teneur), pas des classes.", isCorrect: false },
      { id: 4, text: "Apprentissage par renforcement", feedback: "Non pertinent ici.", isCorrect: false }
    ]
  },
  {
    id: 12,
    question: "L'estimation de la porosité continue à partir d'impédance acoustique est un problème de :",
    options: [
      { id: 1, text: "Classification", feedback: "La porosité est une valeur continue.", isCorrect: false },
      { id: 2, text: "Régression", feedback: "Correct ! La prédiction de valeurs continues s'appelle régression.", isCorrect: true },
      { id: 3, text: "Clustering", feedback: "Non supervisé.", isCorrect: false },
      { id: 4, text: "Réseaux convolutifs purs", feedback: "Possible, mais conceptuellement c'est une régression.", isCorrect: false }
    ]
  },
  {
    id: 13,
    question: "Quel est le risque de supprimer toutes les valeurs 'NaN' (manquantes) d'une base de sondages ?",
    options: [
      { id: 1, text: "Aucun risque", feedback: "Très dangereux en géologie.", isCorrect: false },
      { id: 2, text: "Biais d'échantillonnage et perte d'information géologique précieuse", feedback: "Correct ! Un NaN en prospection peut signifier 'non échantillonné car roche stérile'.", isCorrect: true },
      { id: 3, text: "Planter l'ordinateur", feedback: "Non.", isCorrect: false },
      { id: 4, text: "Augmenter la taille du fichier", feedback: "La suppression diminue la taille.", isCorrect: false }
    ]
  },
  {
    id: 14,
    question: "Qu'est-ce qu'une 'feature' en Machine Learning ?",
    options: [
      { id: 1, text: "La variable cible à prédire", feedback: "C'est le 'target' ou le 'label'.", isCorrect: false },
      { id: 2, text: "Un bug dans l'algorithme", feedback: "Non.", isCorrect: false },
      { id: 3, text: "Une variable d'entrée ou attribut descriptif (ex: teneur Cu, densité)", feedback: "Correct !", isCorrect: true },
      { id: 4, text: "Le nom du modèle", feedback: "Non.", isCorrect: false }
    ]
  },
  {
    id: 15,
    question: "Qu'est-ce que l'Effet Boîte Noire en Deep Learning ?",
    options: [
      { id: 1, text: "L'écran s'éteint", feedback: "Non.", isCorrect: false },
      { id: 2, text: "La difficulté de comprendre comment le modèle a pris sa décision", feedback: "Correct ! L'explicabilité est un défi majeur en DL géoscientifique.", isCorrect: true },
      { id: 3, text: "L'ordinateur surchauffe", feedback: "Non.", isCorrect: false },
      { id: 4, text: "La perte des données d'entraînement", feedback: "Non.", isCorrect: false }
    ]
  },
  {
    id: 16,
    question: "Question sur [Pandas] : Quelle affirmation est correcte pour l'analyse de données (Q16) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 17,
    question: "Question sur [Scikit-Learn] : Quelle affirmation est correcte pour l'analyse de données (Q17) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 18,
    question: "Question sur [Géostatistique vs ML] : Quelle affirmation est correcte pour l'analyse de données (Q18) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 19,
    question: "Question sur [Nettoyage de données] : Quelle affirmation est correcte pour l'analyse de données (Q19) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 20,
    question: "Question sur [Deep Learning] : Quelle affirmation est correcte pour l'analyse de données (Q20) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 21,
    question: "Question sur [Exploration Minérale] : Quelle affirmation est correcte pour l'analyse de données (Q21) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 22,
    question: "Question sur [Python] : Quelle affirmation est correcte pour l'analyse de données (Q22) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 23,
    question: "Question sur [Pandas] : Quelle affirmation est correcte pour l'analyse de données (Q23) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 24,
    question: "Question sur [Scikit-Learn] : Quelle affirmation est correcte pour l'analyse de données (Q24) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 25,
    question: "Question sur [Géostatistique vs ML] : Quelle affirmation est correcte pour l'analyse de données (Q25) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 26,
    question: "Question sur [Nettoyage de données] : Quelle affirmation est correcte pour l'analyse de données (Q26) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 27,
    question: "Question sur [Deep Learning] : Quelle affirmation est correcte pour l'analyse de données (Q27) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 28,
    question: "Question sur [Exploration Minérale] : Quelle affirmation est correcte pour l'analyse de données (Q28) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 29,
    question: "Question sur [Python] : Quelle affirmation est correcte pour l'analyse de données (Q29) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 30,
    question: "Question sur [Pandas] : Quelle affirmation est correcte pour l'analyse de données (Q30) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 31,
    question: "Question sur [Scikit-Learn] : Quelle affirmation est correcte pour l'analyse de données (Q31) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 32,
    question: "Question sur [Géostatistique vs ML] : Quelle affirmation est correcte pour l'analyse de données (Q32) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 33,
    question: "Question sur [Nettoyage de données] : Quelle affirmation est correcte pour l'analyse de données (Q33) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 34,
    question: "Question sur [Deep Learning] : Quelle affirmation est correcte pour l'analyse de données (Q34) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 35,
    question: "Question sur [Exploration Minérale] : Quelle affirmation est correcte pour l'analyse de données (Q35) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 36,
    question: "Question sur [Python] : Quelle affirmation est correcte pour l'analyse de données (Q36) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 37,
    question: "Question sur [Pandas] : Quelle affirmation est correcte pour l'analyse de données (Q37) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 38,
    question: "Question sur [Scikit-Learn] : Quelle affirmation est correcte pour l'analyse de données (Q38) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 39,
    question: "Question sur [Géostatistique vs ML] : Quelle affirmation est correcte pour l'analyse de données (Q39) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 40,
    question: "Question sur [Nettoyage de données] : Quelle affirmation est correcte pour l'analyse de données (Q40) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 41,
    question: "Question sur [Deep Learning] : Quelle affirmation est correcte pour l'analyse de données (Q41) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 42,
    question: "Question sur [Exploration Minérale] : Quelle affirmation est correcte pour l'analyse de données (Q42) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 43,
    question: "Question sur [Python] : Quelle affirmation est correcte pour l'analyse de données (Q43) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 44,
    question: "Question sur [Pandas] : Quelle affirmation est correcte pour l'analyse de données (Q44) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 45,
    question: "Question sur [Scikit-Learn] : Quelle affirmation est correcte pour l'analyse de données (Q45) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 46,
    question: "Question sur [Géostatistique vs ML] : Quelle affirmation est correcte pour l'analyse de données (Q46) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 47,
    question: "Question sur [Nettoyage de données] : Quelle affirmation est correcte pour l'analyse de données (Q47) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 48,
    question: "Question sur [Deep Learning] : Quelle affirmation est correcte pour l'analyse de données (Q48) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 49,
    question: "Question sur [Exploration Minérale] : Quelle affirmation est correcte pour l'analyse de données (Q49) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  },
  {
    id: 50,
    question: "Question sur [Python] : Quelle affirmation est correcte pour l'analyse de données (Q50) ?",
    options: [
      { id: 1, text: "Les données manquantes ne posent jamais problème.", feedback: "Faux.", isCorrect: false },
      { id: 2, text: "La qualité des données dicte la qualité du modèle (Garbage in, Garbage out).", feedback: "Correct ! Principe universel en Data Science.", isCorrect: true },
      { id: 3, text: "Le modèle corrige de lui-même les fausses coordonnées.", feedback: "Faux, le modèle apprend ce qu'on lui donne.", isCorrect: false },
      { id: 4, text: "Une précision de 100% garantit un modèle parfait sur le terrain.", feedback: "Faux, c'est de l'overfitting.", isCorrect: false }
    ]
  }
];
