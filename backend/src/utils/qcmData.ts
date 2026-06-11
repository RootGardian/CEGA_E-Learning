export interface QCMOption {
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

export const qcmBank: QCMQuestion[] = [
  {
    "id": 1,
    "text": "Question Vrai/Faux 1 : L'Intelligence Artificielle est massivement utilisée dans l'exploration minière moderne.",
    "type": "VRAI_FAUX",
    "points": 1,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Vrai",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Faux",
          "isCorrect": false
        }
      ]
    }
  },
  {
    "id": 2,
    "text": "Question Vrai/Faux 2 : L'Intelligence Artificielle est massivement utilisée dans l'exploration minière moderne.",
    "type": "VRAI_FAUX",
    "points": 1,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Vrai",
          "isCorrect": false
        },
        {
          "id": "opt2",
          "text": "Faux",
          "isCorrect": true
        }
      ]
    }
  },
  {
    "id": 3,
    "text": "Question Vrai/Faux 3 : L'Intelligence Artificielle est massivement utilisée dans l'exploration minière moderne.",
    "type": "VRAI_FAUX",
    "points": 1,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Vrai",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Faux",
          "isCorrect": false
        }
      ]
    }
  },
  {
    "id": 4,
    "text": "Question Vrai/Faux 4 : L'Intelligence Artificielle est massivement utilisée dans l'exploration minière moderne.",
    "type": "VRAI_FAUX",
    "points": 1,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Vrai",
          "isCorrect": false
        },
        {
          "id": "opt2",
          "text": "Faux",
          "isCorrect": true
        }
      ]
    }
  },
  {
    "id": 5,
    "text": "Question Vrai/Faux 5 : L'Intelligence Artificielle est massivement utilisée dans l'exploration minière moderne.",
    "type": "VRAI_FAUX",
    "points": 1,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Vrai",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Faux",
          "isCorrect": false
        }
      ]
    }
  },
  {
    "id": 6,
    "text": "Question Vrai/Faux 6 : L'Intelligence Artificielle est massivement utilisée dans l'exploration minière moderne.",
    "type": "VRAI_FAUX",
    "points": 1,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Vrai",
          "isCorrect": false
        },
        {
          "id": "opt2",
          "text": "Faux",
          "isCorrect": true
        }
      ]
    }
  },
  {
    "id": 7,
    "text": "Question Vrai/Faux 7 : L'Intelligence Artificielle est massivement utilisée dans l'exploration minière moderne.",
    "type": "VRAI_FAUX",
    "points": 1,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Vrai",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Faux",
          "isCorrect": false
        }
      ]
    }
  },
  {
    "id": 8,
    "text": "Question Vrai/Faux 8 : L'Intelligence Artificielle est massivement utilisée dans l'exploration minière moderne.",
    "type": "VRAI_FAUX",
    "points": 1,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Vrai",
          "isCorrect": false
        },
        {
          "id": "opt2",
          "text": "Faux",
          "isCorrect": true
        }
      ]
    }
  },
  {
    "id": 9,
    "text": "Question Vrai/Faux 9 : L'Intelligence Artificielle est massivement utilisée dans l'exploration minière moderne.",
    "type": "VRAI_FAUX",
    "points": 1,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Vrai",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Faux",
          "isCorrect": false
        }
      ]
    }
  },
  {
    "id": 10,
    "text": "Question Vrai/Faux 10 : L'Intelligence Artificielle est massivement utilisée dans l'exploration minière moderne.",
    "type": "VRAI_FAUX",
    "points": 1,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Vrai",
          "isCorrect": false
        },
        {
          "id": "opt2",
          "text": "Faux",
          "isCorrect": true
        }
      ]
    }
  },
  {
    "id": 11,
    "text": "Question QCU 1 : Quel algorithme est le plus adapté pour la classification d'images sismiques ?",
    "type": "QCU",
    "points": 1,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Réseaux de neurones convolutifs (CNN)",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Régression linéaire",
          "isCorrect": false
        },
        {
          "id": "opt3",
          "text": "K-Means",
          "isCorrect": false
        },
        {
          "id": "opt4",
          "text": "Arbres de décision simples",
          "isCorrect": false
        }
      ]
    }
  },
  {
    "id": 12,
    "text": "Question QCU 2 : Quel algorithme est le plus adapté pour la classification d'images sismiques ?",
    "type": "QCU",
    "points": 1,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Réseaux de neurones convolutifs (CNN)",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Régression linéaire",
          "isCorrect": false
        },
        {
          "id": "opt3",
          "text": "K-Means",
          "isCorrect": false
        },
        {
          "id": "opt4",
          "text": "Arbres de décision simples",
          "isCorrect": false
        }
      ]
    }
  },
  {
    "id": 13,
    "text": "Question QCU 3 : Quel algorithme est le plus adapté pour la classification d'images sismiques ?",
    "type": "QCU",
    "points": 1,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Réseaux de neurones convolutifs (CNN)",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Régression linéaire",
          "isCorrect": false
        },
        {
          "id": "opt3",
          "text": "K-Means",
          "isCorrect": false
        },
        {
          "id": "opt4",
          "text": "Arbres de décision simples",
          "isCorrect": false
        }
      ]
    }
  },
  {
    "id": 14,
    "text": "Question QCU 4 : Quel algorithme est le plus adapté pour la classification d'images sismiques ?",
    "type": "QCU",
    "points": 1,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Réseaux de neurones convolutifs (CNN)",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Régression linéaire",
          "isCorrect": false
        },
        {
          "id": "opt3",
          "text": "K-Means",
          "isCorrect": false
        },
        {
          "id": "opt4",
          "text": "Arbres de décision simples",
          "isCorrect": false
        }
      ]
    }
  },
  {
    "id": 15,
    "text": "Question QCU 5 : Quel algorithme est le plus adapté pour la classification d'images sismiques ?",
    "type": "QCU",
    "points": 1,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Réseaux de neurones convolutifs (CNN)",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Régression linéaire",
          "isCorrect": false
        },
        {
          "id": "opt3",
          "text": "K-Means",
          "isCorrect": false
        },
        {
          "id": "opt4",
          "text": "Arbres de décision simples",
          "isCorrect": false
        }
      ]
    }
  },
  {
    "id": 16,
    "text": "Question QCU 6 : Quel algorithme est le plus adapté pour la classification d'images sismiques ?",
    "type": "QCU",
    "points": 1,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Réseaux de neurones convolutifs (CNN)",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Régression linéaire",
          "isCorrect": false
        },
        {
          "id": "opt3",
          "text": "K-Means",
          "isCorrect": false
        },
        {
          "id": "opt4",
          "text": "Arbres de décision simples",
          "isCorrect": false
        }
      ]
    }
  },
  {
    "id": 17,
    "text": "Question QCU 7 : Quel algorithme est le plus adapté pour la classification d'images sismiques ?",
    "type": "QCU",
    "points": 1,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Réseaux de neurones convolutifs (CNN)",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Régression linéaire",
          "isCorrect": false
        },
        {
          "id": "opt3",
          "text": "K-Means",
          "isCorrect": false
        },
        {
          "id": "opt4",
          "text": "Arbres de décision simples",
          "isCorrect": false
        }
      ]
    }
  },
  {
    "id": 18,
    "text": "Question QCU 8 : Quel algorithme est le plus adapté pour la classification d'images sismiques ?",
    "type": "QCU",
    "points": 1,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Réseaux de neurones convolutifs (CNN)",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Régression linéaire",
          "isCorrect": false
        },
        {
          "id": "opt3",
          "text": "K-Means",
          "isCorrect": false
        },
        {
          "id": "opt4",
          "text": "Arbres de décision simples",
          "isCorrect": false
        }
      ]
    }
  },
  {
    "id": 19,
    "text": "Question QCU 9 : Quel algorithme est le plus adapté pour la classification d'images sismiques ?",
    "type": "QCU",
    "points": 1,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Réseaux de neurones convolutifs (CNN)",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Régression linéaire",
          "isCorrect": false
        },
        {
          "id": "opt3",
          "text": "K-Means",
          "isCorrect": false
        },
        {
          "id": "opt4",
          "text": "Arbres de décision simples",
          "isCorrect": false
        }
      ]
    }
  },
  {
    "id": 20,
    "text": "Question QCU 10 : Quel algorithme est le plus adapté pour la classification d'images sismiques ?",
    "type": "QCU",
    "points": 1,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Réseaux de neurones convolutifs (CNN)",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Régression linéaire",
          "isCorrect": false
        },
        {
          "id": "opt3",
          "text": "K-Means",
          "isCorrect": false
        },
        {
          "id": "opt4",
          "text": "Arbres de décision simples",
          "isCorrect": false
        }
      ]
    }
  },
  {
    "id": 21,
    "text": "Question QCM 1 : Quelles données géospatiales peuvent être analysées par le Deep Learning ?",
    "type": "QCM",
    "points": 2,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Images satellites multicapteurs",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Données gravimétriques",
          "isCorrect": true
        },
        {
          "id": "opt3",
          "text": "Bruit thermique aléatoire non calibré",
          "isCorrect": false
        },
        {
          "id": "opt4",
          "text": "Séries temporelles sismiques",
          "isCorrect": true
        }
      ]
    }
  },
  {
    "id": 22,
    "text": "Question QCM 2 : Quelles données géospatiales peuvent être analysées par le Deep Learning ?",
    "type": "QCM",
    "points": 2,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Images satellites multicapteurs",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Données gravimétriques",
          "isCorrect": true
        },
        {
          "id": "opt3",
          "text": "Bruit thermique aléatoire non calibré",
          "isCorrect": false
        },
        {
          "id": "opt4",
          "text": "Séries temporelles sismiques",
          "isCorrect": true
        }
      ]
    }
  },
  {
    "id": 23,
    "text": "Question QCM 3 : Quelles données géospatiales peuvent être analysées par le Deep Learning ?",
    "type": "QCM",
    "points": 2,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Images satellites multicapteurs",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Données gravimétriques",
          "isCorrect": true
        },
        {
          "id": "opt3",
          "text": "Bruit thermique aléatoire non calibré",
          "isCorrect": false
        },
        {
          "id": "opt4",
          "text": "Séries temporelles sismiques",
          "isCorrect": true
        }
      ]
    }
  },
  {
    "id": 24,
    "text": "Question QCM 4 : Quelles données géospatiales peuvent être analysées par le Deep Learning ?",
    "type": "QCM",
    "points": 2,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Images satellites multicapteurs",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Données gravimétriques",
          "isCorrect": true
        },
        {
          "id": "opt3",
          "text": "Bruit thermique aléatoire non calibré",
          "isCorrect": false
        },
        {
          "id": "opt4",
          "text": "Séries temporelles sismiques",
          "isCorrect": true
        }
      ]
    }
  },
  {
    "id": 25,
    "text": "Question QCM 5 : Quelles données géospatiales peuvent être analysées par le Deep Learning ?",
    "type": "QCM",
    "points": 2,
    "gradingType": "BINARY",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Images satellites multicapteurs",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Données gravimétriques",
          "isCorrect": true
        },
        {
          "id": "opt3",
          "text": "Bruit thermique aléatoire non calibré",
          "isCorrect": false
        },
        {
          "id": "opt4",
          "text": "Séries temporelles sismiques",
          "isCorrect": true
        }
      ]
    }
  },
  {
    "id": 26,
    "text": "Question QCM 6 : Quelles données géospatiales peuvent être analysées par le Deep Learning ?",
    "type": "QCM",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Images satellites multicapteurs",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Données gravimétriques",
          "isCorrect": true
        },
        {
          "id": "opt3",
          "text": "Bruit thermique aléatoire non calibré",
          "isCorrect": false
        },
        {
          "id": "opt4",
          "text": "Séries temporelles sismiques",
          "isCorrect": true
        }
      ]
    }
  },
  {
    "id": 27,
    "text": "Question QCM 7 : Quelles données géospatiales peuvent être analysées par le Deep Learning ?",
    "type": "QCM",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Images satellites multicapteurs",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Données gravimétriques",
          "isCorrect": true
        },
        {
          "id": "opt3",
          "text": "Bruit thermique aléatoire non calibré",
          "isCorrect": false
        },
        {
          "id": "opt4",
          "text": "Séries temporelles sismiques",
          "isCorrect": true
        }
      ]
    }
  },
  {
    "id": 28,
    "text": "Question QCM 8 : Quelles données géospatiales peuvent être analysées par le Deep Learning ?",
    "type": "QCM",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Images satellites multicapteurs",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Données gravimétriques",
          "isCorrect": true
        },
        {
          "id": "opt3",
          "text": "Bruit thermique aléatoire non calibré",
          "isCorrect": false
        },
        {
          "id": "opt4",
          "text": "Séries temporelles sismiques",
          "isCorrect": true
        }
      ]
    }
  },
  {
    "id": 29,
    "text": "Question QCM 9 : Quelles données géospatiales peuvent être analysées par le Deep Learning ?",
    "type": "QCM",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Images satellites multicapteurs",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Données gravimétriques",
          "isCorrect": true
        },
        {
          "id": "opt3",
          "text": "Bruit thermique aléatoire non calibré",
          "isCorrect": false
        },
        {
          "id": "opt4",
          "text": "Séries temporelles sismiques",
          "isCorrect": true
        }
      ]
    }
  },
  {
    "id": 30,
    "text": "Question QCM 10 : Quelles données géospatiales peuvent être analysées par le Deep Learning ?",
    "type": "QCM",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "options": [
        {
          "id": "opt1",
          "text": "Images satellites multicapteurs",
          "isCorrect": true
        },
        {
          "id": "opt2",
          "text": "Données gravimétriques",
          "isCorrect": true
        },
        {
          "id": "opt3",
          "text": "Bruit thermique aléatoire non calibré",
          "isCorrect": false
        },
        {
          "id": "opt4",
          "text": "Séries temporelles sismiques",
          "isCorrect": true
        }
      ]
    }
  },
  {
    "id": 31,
    "text": "Question Appariement 1 : Reliez chaque concept d'IA à son application en Géosciences.",
    "type": "APPARIEMENT",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "pairs": [
        {
          "left": "Computer Vision",
          "right": "Analyse de carottes de forage"
        },
        {
          "left": "NLP (Traitement du langage)",
          "right": "Extraction d'infos des rapports géologiques"
        },
        {
          "left": "Reinforcement Learning",
          "right": "Optimisation des trajectoires de forage"
        },
        {
          "left": "Clustering",
          "right": "Zonage géochimique non supervisé"
        }
      ]
    }
  },
  {
    "id": 32,
    "text": "Question Appariement 2 : Reliez chaque concept d'IA à son application en Géosciences.",
    "type": "APPARIEMENT",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "pairs": [
        {
          "left": "Computer Vision",
          "right": "Analyse de carottes de forage"
        },
        {
          "left": "NLP (Traitement du langage)",
          "right": "Extraction d'infos des rapports géologiques"
        },
        {
          "left": "Reinforcement Learning",
          "right": "Optimisation des trajectoires de forage"
        },
        {
          "left": "Clustering",
          "right": "Zonage géochimique non supervisé"
        }
      ]
    }
  },
  {
    "id": 33,
    "text": "Question Appariement 3 : Reliez chaque concept d'IA à son application en Géosciences.",
    "type": "APPARIEMENT",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "pairs": [
        {
          "left": "Computer Vision",
          "right": "Analyse de carottes de forage"
        },
        {
          "left": "NLP (Traitement du langage)",
          "right": "Extraction d'infos des rapports géologiques"
        },
        {
          "left": "Reinforcement Learning",
          "right": "Optimisation des trajectoires de forage"
        },
        {
          "left": "Clustering",
          "right": "Zonage géochimique non supervisé"
        }
      ]
    }
  },
  {
    "id": 34,
    "text": "Question Appariement 4 : Reliez chaque concept d'IA à son application en Géosciences.",
    "type": "APPARIEMENT",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "pairs": [
        {
          "left": "Computer Vision",
          "right": "Analyse de carottes de forage"
        },
        {
          "left": "NLP (Traitement du langage)",
          "right": "Extraction d'infos des rapports géologiques"
        },
        {
          "left": "Reinforcement Learning",
          "right": "Optimisation des trajectoires de forage"
        },
        {
          "left": "Clustering",
          "right": "Zonage géochimique non supervisé"
        }
      ]
    }
  },
  {
    "id": 35,
    "text": "Question Appariement 5 : Reliez chaque concept d'IA à son application en Géosciences.",
    "type": "APPARIEMENT",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "pairs": [
        {
          "left": "Computer Vision",
          "right": "Analyse de carottes de forage"
        },
        {
          "left": "NLP (Traitement du langage)",
          "right": "Extraction d'infos des rapports géologiques"
        },
        {
          "left": "Reinforcement Learning",
          "right": "Optimisation des trajectoires de forage"
        },
        {
          "left": "Clustering",
          "right": "Zonage géochimique non supervisé"
        }
      ]
    }
  },
  {
    "id": 36,
    "text": "Question Appariement 6 : Reliez chaque concept d'IA à son application en Géosciences.",
    "type": "APPARIEMENT",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "pairs": [
        {
          "left": "Computer Vision",
          "right": "Analyse de carottes de forage"
        },
        {
          "left": "NLP (Traitement du langage)",
          "right": "Extraction d'infos des rapports géologiques"
        },
        {
          "left": "Reinforcement Learning",
          "right": "Optimisation des trajectoires de forage"
        },
        {
          "left": "Clustering",
          "right": "Zonage géochimique non supervisé"
        }
      ]
    }
  },
  {
    "id": 37,
    "text": "Question Appariement 7 : Reliez chaque concept d'IA à son application en Géosciences.",
    "type": "APPARIEMENT",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "pairs": [
        {
          "left": "Computer Vision",
          "right": "Analyse de carottes de forage"
        },
        {
          "left": "NLP (Traitement du langage)",
          "right": "Extraction d'infos des rapports géologiques"
        },
        {
          "left": "Reinforcement Learning",
          "right": "Optimisation des trajectoires de forage"
        },
        {
          "left": "Clustering",
          "right": "Zonage géochimique non supervisé"
        }
      ]
    }
  },
  {
    "id": 38,
    "text": "Question Appariement 8 : Reliez chaque concept d'IA à son application en Géosciences.",
    "type": "APPARIEMENT",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "pairs": [
        {
          "left": "Computer Vision",
          "right": "Analyse de carottes de forage"
        },
        {
          "left": "NLP (Traitement du langage)",
          "right": "Extraction d'infos des rapports géologiques"
        },
        {
          "left": "Reinforcement Learning",
          "right": "Optimisation des trajectoires de forage"
        },
        {
          "left": "Clustering",
          "right": "Zonage géochimique non supervisé"
        }
      ]
    }
  },
  {
    "id": 39,
    "text": "Question Appariement 9 : Reliez chaque concept d'IA à son application en Géosciences.",
    "type": "APPARIEMENT",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "pairs": [
        {
          "left": "Computer Vision",
          "right": "Analyse de carottes de forage"
        },
        {
          "left": "NLP (Traitement du langage)",
          "right": "Extraction d'infos des rapports géologiques"
        },
        {
          "left": "Reinforcement Learning",
          "right": "Optimisation des trajectoires de forage"
        },
        {
          "left": "Clustering",
          "right": "Zonage géochimique non supervisé"
        }
      ]
    }
  },
  {
    "id": 40,
    "text": "Question Appariement 10 : Reliez chaque concept d'IA à son application en Géosciences.",
    "type": "APPARIEMENT",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "pairs": [
        {
          "left": "Computer Vision",
          "right": "Analyse de carottes de forage"
        },
        {
          "left": "NLP (Traitement du langage)",
          "right": "Extraction d'infos des rapports géologiques"
        },
        {
          "left": "Reinforcement Learning",
          "right": "Optimisation des trajectoires de forage"
        },
        {
          "left": "Clustering",
          "right": "Zonage géochimique non supervisé"
        }
      ]
    }
  },
  {
    "id": 41,
    "text": "Question Ordonnancement 1 : Remettez dans l'ordre les étapes d'un pipeline Machine Learning en Géosciences.",
    "type": "ORDONNANCEMENT",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "items": [
        {
          "id": "item1",
          "text": "Acquisition des données géophysiques",
          "correctOrder": 1
        },
        {
          "id": "item2",
          "text": "Prétraitement et nettoyage des données",
          "correctOrder": 2
        },
        {
          "id": "item3",
          "text": "Extraction des caractéristiques (Feature Engineering)",
          "correctOrder": 3
        },
        {
          "id": "item4",
          "text": "Entraînement du modèle prédictif",
          "correctOrder": 4
        },
        {
          "id": "item5",
          "text": "Évaluation et déploiement du modèle",
          "correctOrder": 5
        }
      ]
    }
  },
  {
    "id": 42,
    "text": "Question Ordonnancement 2 : Remettez dans l'ordre les étapes d'un pipeline Machine Learning en Géosciences.",
    "type": "ORDONNANCEMENT",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "items": [
        {
          "id": "item1",
          "text": "Acquisition des données géophysiques",
          "correctOrder": 1
        },
        {
          "id": "item2",
          "text": "Prétraitement et nettoyage des données",
          "correctOrder": 2
        },
        {
          "id": "item3",
          "text": "Extraction des caractéristiques (Feature Engineering)",
          "correctOrder": 3
        },
        {
          "id": "item4",
          "text": "Entraînement du modèle prédictif",
          "correctOrder": 4
        },
        {
          "id": "item5",
          "text": "Évaluation et déploiement du modèle",
          "correctOrder": 5
        }
      ]
    }
  },
  {
    "id": 43,
    "text": "Question Ordonnancement 3 : Remettez dans l'ordre les étapes d'un pipeline Machine Learning en Géosciences.",
    "type": "ORDONNANCEMENT",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "items": [
        {
          "id": "item1",
          "text": "Acquisition des données géophysiques",
          "correctOrder": 1
        },
        {
          "id": "item2",
          "text": "Prétraitement et nettoyage des données",
          "correctOrder": 2
        },
        {
          "id": "item3",
          "text": "Extraction des caractéristiques (Feature Engineering)",
          "correctOrder": 3
        },
        {
          "id": "item4",
          "text": "Entraînement du modèle prédictif",
          "correctOrder": 4
        },
        {
          "id": "item5",
          "text": "Évaluation et déploiement du modèle",
          "correctOrder": 5
        }
      ]
    }
  },
  {
    "id": 44,
    "text": "Question Ordonnancement 4 : Remettez dans l'ordre les étapes d'un pipeline Machine Learning en Géosciences.",
    "type": "ORDONNANCEMENT",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "items": [
        {
          "id": "item1",
          "text": "Acquisition des données géophysiques",
          "correctOrder": 1
        },
        {
          "id": "item2",
          "text": "Prétraitement et nettoyage des données",
          "correctOrder": 2
        },
        {
          "id": "item3",
          "text": "Extraction des caractéristiques (Feature Engineering)",
          "correctOrder": 3
        },
        {
          "id": "item4",
          "text": "Entraînement du modèle prédictif",
          "correctOrder": 4
        },
        {
          "id": "item5",
          "text": "Évaluation et déploiement du modèle",
          "correctOrder": 5
        }
      ]
    }
  },
  {
    "id": 45,
    "text": "Question Ordonnancement 5 : Remettez dans l'ordre les étapes d'un pipeline Machine Learning en Géosciences.",
    "type": "ORDONNANCEMENT",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "items": [
        {
          "id": "item1",
          "text": "Acquisition des données géophysiques",
          "correctOrder": 1
        },
        {
          "id": "item2",
          "text": "Prétraitement et nettoyage des données",
          "correctOrder": 2
        },
        {
          "id": "item3",
          "text": "Extraction des caractéristiques (Feature Engineering)",
          "correctOrder": 3
        },
        {
          "id": "item4",
          "text": "Entraînement du modèle prédictif",
          "correctOrder": 4
        },
        {
          "id": "item5",
          "text": "Évaluation et déploiement du modèle",
          "correctOrder": 5
        }
      ]
    }
  },
  {
    "id": 46,
    "text": "Question Ordonnancement 6 : Remettez dans l'ordre les étapes d'un pipeline Machine Learning en Géosciences.",
    "type": "ORDONNANCEMENT",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "items": [
        {
          "id": "item1",
          "text": "Acquisition des données géophysiques",
          "correctOrder": 1
        },
        {
          "id": "item2",
          "text": "Prétraitement et nettoyage des données",
          "correctOrder": 2
        },
        {
          "id": "item3",
          "text": "Extraction des caractéristiques (Feature Engineering)",
          "correctOrder": 3
        },
        {
          "id": "item4",
          "text": "Entraînement du modèle prédictif",
          "correctOrder": 4
        },
        {
          "id": "item5",
          "text": "Évaluation et déploiement du modèle",
          "correctOrder": 5
        }
      ]
    }
  },
  {
    "id": 47,
    "text": "Question Ordonnancement 7 : Remettez dans l'ordre les étapes d'un pipeline Machine Learning en Géosciences.",
    "type": "ORDONNANCEMENT",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "items": [
        {
          "id": "item1",
          "text": "Acquisition des données géophysiques",
          "correctOrder": 1
        },
        {
          "id": "item2",
          "text": "Prétraitement et nettoyage des données",
          "correctOrder": 2
        },
        {
          "id": "item3",
          "text": "Extraction des caractéristiques (Feature Engineering)",
          "correctOrder": 3
        },
        {
          "id": "item4",
          "text": "Entraînement du modèle prédictif",
          "correctOrder": 4
        },
        {
          "id": "item5",
          "text": "Évaluation et déploiement du modèle",
          "correctOrder": 5
        }
      ]
    }
  },
  {
    "id": 48,
    "text": "Question Ordonnancement 8 : Remettez dans l'ordre les étapes d'un pipeline Machine Learning en Géosciences.",
    "type": "ORDONNANCEMENT",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "items": [
        {
          "id": "item1",
          "text": "Acquisition des données géophysiques",
          "correctOrder": 1
        },
        {
          "id": "item2",
          "text": "Prétraitement et nettoyage des données",
          "correctOrder": 2
        },
        {
          "id": "item3",
          "text": "Extraction des caractéristiques (Feature Engineering)",
          "correctOrder": 3
        },
        {
          "id": "item4",
          "text": "Entraînement du modèle prédictif",
          "correctOrder": 4
        },
        {
          "id": "item5",
          "text": "Évaluation et déploiement du modèle",
          "correctOrder": 5
        }
      ]
    }
  },
  {
    "id": 49,
    "text": "Question Ordonnancement 9 : Remettez dans l'ordre les étapes d'un pipeline Machine Learning en Géosciences.",
    "type": "ORDONNANCEMENT",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "items": [
        {
          "id": "item1",
          "text": "Acquisition des données géophysiques",
          "correctOrder": 1
        },
        {
          "id": "item2",
          "text": "Prétraitement et nettoyage des données",
          "correctOrder": 2
        },
        {
          "id": "item3",
          "text": "Extraction des caractéristiques (Feature Engineering)",
          "correctOrder": 3
        },
        {
          "id": "item4",
          "text": "Entraînement du modèle prédictif",
          "correctOrder": 4
        },
        {
          "id": "item5",
          "text": "Évaluation et déploiement du modèle",
          "correctOrder": 5
        }
      ]
    }
  },
  {
    "id": 50,
    "text": "Question Ordonnancement 10 : Remettez dans l'ordre les étapes d'un pipeline Machine Learning en Géosciences.",
    "type": "ORDONNANCEMENT",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "items": [
        {
          "id": "item1",
          "text": "Acquisition des données géophysiques",
          "correctOrder": 1
        },
        {
          "id": "item2",
          "text": "Prétraitement et nettoyage des données",
          "correctOrder": 2
        },
        {
          "id": "item3",
          "text": "Extraction des caractéristiques (Feature Engineering)",
          "correctOrder": 3
        },
        {
          "id": "item4",
          "text": "Entraînement du modèle prédictif",
          "correctOrder": 4
        },
        {
          "id": "item5",
          "text": "Évaluation et déploiement du modèle",
          "correctOrder": 5
        }
      ]
    }
  },
  {
    "id": 51,
    "text": "Question Texte à Trous 1 : Complétez le paragraphe suivant sur la modélisation géologique.",
    "type": "TEXTE_A_TROUS",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "text": "Pour construire un modèle géologique 3D, on utilise souvent des algorithmes de [trou1] pour extrapoler les données manquantes. L'évaluation de l'incertitude repose généralement sur des méthodes géostatistiques comme le [trou2]. L'IA apporte une nouvelle dimension avec les réseaux de neurones de type [trou3].",
      "blanks": {
        "trou1": {
          "correctAnswer": "krigeage",
          "options": [
            "krigeage",
            "triage",
            "lissage"
          ]
        },
        "trou2": {
          "correctAnswer": "kriging stochastique",
          "options": [
            "kriging stochastique",
            "bootstrap",
            "filtrage de Kalman"
          ]
        },
        "trou3": {
          "correctAnswer": "GANs (Réseaux Antagonistes)",
          "options": [
            "GANs (Réseaux Antagonistes)",
            "RNNs simples",
            "Perceptrons multicouches"
          ]
        }
      }
    }
  },
  {
    "id": 52,
    "text": "Question Texte à Trous 2 : Complétez le paragraphe suivant sur la modélisation géologique.",
    "type": "TEXTE_A_TROUS",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "text": "Pour construire un modèle géologique 3D, on utilise souvent des algorithmes de [trou1] pour extrapoler les données manquantes. L'évaluation de l'incertitude repose généralement sur des méthodes géostatistiques comme le [trou2]. L'IA apporte une nouvelle dimension avec les réseaux de neurones de type [trou3].",
      "blanks": {
        "trou1": {
          "correctAnswer": "krigeage",
          "options": [
            "krigeage",
            "triage",
            "lissage"
          ]
        },
        "trou2": {
          "correctAnswer": "kriging stochastique",
          "options": [
            "kriging stochastique",
            "bootstrap",
            "filtrage de Kalman"
          ]
        },
        "trou3": {
          "correctAnswer": "GANs (Réseaux Antagonistes)",
          "options": [
            "GANs (Réseaux Antagonistes)",
            "RNNs simples",
            "Perceptrons multicouches"
          ]
        }
      }
    }
  },
  {
    "id": 53,
    "text": "Question Texte à Trous 3 : Complétez le paragraphe suivant sur la modélisation géologique.",
    "type": "TEXTE_A_TROUS",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "text": "Pour construire un modèle géologique 3D, on utilise souvent des algorithmes de [trou1] pour extrapoler les données manquantes. L'évaluation de l'incertitude repose généralement sur des méthodes géostatistiques comme le [trou2]. L'IA apporte une nouvelle dimension avec les réseaux de neurones de type [trou3].",
      "blanks": {
        "trou1": {
          "correctAnswer": "krigeage",
          "options": [
            "krigeage",
            "triage",
            "lissage"
          ]
        },
        "trou2": {
          "correctAnswer": "kriging stochastique",
          "options": [
            "kriging stochastique",
            "bootstrap",
            "filtrage de Kalman"
          ]
        },
        "trou3": {
          "correctAnswer": "GANs (Réseaux Antagonistes)",
          "options": [
            "GANs (Réseaux Antagonistes)",
            "RNNs simples",
            "Perceptrons multicouches"
          ]
        }
      }
    }
  },
  {
    "id": 54,
    "text": "Question Texte à Trous 4 : Complétez le paragraphe suivant sur la modélisation géologique.",
    "type": "TEXTE_A_TROUS",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "text": "Pour construire un modèle géologique 3D, on utilise souvent des algorithmes de [trou1] pour extrapoler les données manquantes. L'évaluation de l'incertitude repose généralement sur des méthodes géostatistiques comme le [trou2]. L'IA apporte une nouvelle dimension avec les réseaux de neurones de type [trou3].",
      "blanks": {
        "trou1": {
          "correctAnswer": "krigeage",
          "options": [
            "krigeage",
            "triage",
            "lissage"
          ]
        },
        "trou2": {
          "correctAnswer": "kriging stochastique",
          "options": [
            "kriging stochastique",
            "bootstrap",
            "filtrage de Kalman"
          ]
        },
        "trou3": {
          "correctAnswer": "GANs (Réseaux Antagonistes)",
          "options": [
            "GANs (Réseaux Antagonistes)",
            "RNNs simples",
            "Perceptrons multicouches"
          ]
        }
      }
    }
  },
  {
    "id": 55,
    "text": "Question Texte à Trous 5 : Complétez le paragraphe suivant sur la modélisation géologique.",
    "type": "TEXTE_A_TROUS",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "text": "Pour construire un modèle géologique 3D, on utilise souvent des algorithmes de [trou1] pour extrapoler les données manquantes. L'évaluation de l'incertitude repose généralement sur des méthodes géostatistiques comme le [trou2]. L'IA apporte une nouvelle dimension avec les réseaux de neurones de type [trou3].",
      "blanks": {
        "trou1": {
          "correctAnswer": "krigeage",
          "options": [
            "krigeage",
            "triage",
            "lissage"
          ]
        },
        "trou2": {
          "correctAnswer": "kriging stochastique",
          "options": [
            "kriging stochastique",
            "bootstrap",
            "filtrage de Kalman"
          ]
        },
        "trou3": {
          "correctAnswer": "GANs (Réseaux Antagonistes)",
          "options": [
            "GANs (Réseaux Antagonistes)",
            "RNNs simples",
            "Perceptrons multicouches"
          ]
        }
      }
    }
  },
  {
    "id": 56,
    "text": "Question Texte à Trous 6 : Complétez le paragraphe suivant sur la modélisation géologique.",
    "type": "TEXTE_A_TROUS",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "text": "Pour construire un modèle géologique 3D, on utilise souvent des algorithmes de [trou1] pour extrapoler les données manquantes. L'évaluation de l'incertitude repose généralement sur des méthodes géostatistiques comme le [trou2]. L'IA apporte une nouvelle dimension avec les réseaux de neurones de type [trou3].",
      "blanks": {
        "trou1": {
          "correctAnswer": "krigeage",
          "options": [
            "krigeage",
            "triage",
            "lissage"
          ]
        },
        "trou2": {
          "correctAnswer": "kriging stochastique",
          "options": [
            "kriging stochastique",
            "bootstrap",
            "filtrage de Kalman"
          ]
        },
        "trou3": {
          "correctAnswer": "GANs (Réseaux Antagonistes)",
          "options": [
            "GANs (Réseaux Antagonistes)",
            "RNNs simples",
            "Perceptrons multicouches"
          ]
        }
      }
    }
  },
  {
    "id": 57,
    "text": "Question Texte à Trous 7 : Complétez le paragraphe suivant sur la modélisation géologique.",
    "type": "TEXTE_A_TROUS",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "text": "Pour construire un modèle géologique 3D, on utilise souvent des algorithmes de [trou1] pour extrapoler les données manquantes. L'évaluation de l'incertitude repose généralement sur des méthodes géostatistiques comme le [trou2]. L'IA apporte une nouvelle dimension avec les réseaux de neurones de type [trou3].",
      "blanks": {
        "trou1": {
          "correctAnswer": "krigeage",
          "options": [
            "krigeage",
            "triage",
            "lissage"
          ]
        },
        "trou2": {
          "correctAnswer": "kriging stochastique",
          "options": [
            "kriging stochastique",
            "bootstrap",
            "filtrage de Kalman"
          ]
        },
        "trou3": {
          "correctAnswer": "GANs (Réseaux Antagonistes)",
          "options": [
            "GANs (Réseaux Antagonistes)",
            "RNNs simples",
            "Perceptrons multicouches"
          ]
        }
      }
    }
  },
  {
    "id": 58,
    "text": "Question Texte à Trous 8 : Complétez le paragraphe suivant sur la modélisation géologique.",
    "type": "TEXTE_A_TROUS",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "text": "Pour construire un modèle géologique 3D, on utilise souvent des algorithmes de [trou1] pour extrapoler les données manquantes. L'évaluation de l'incertitude repose généralement sur des méthodes géostatistiques comme le [trou2]. L'IA apporte une nouvelle dimension avec les réseaux de neurones de type [trou3].",
      "blanks": {
        "trou1": {
          "correctAnswer": "krigeage",
          "options": [
            "krigeage",
            "triage",
            "lissage"
          ]
        },
        "trou2": {
          "correctAnswer": "kriging stochastique",
          "options": [
            "kriging stochastique",
            "bootstrap",
            "filtrage de Kalman"
          ]
        },
        "trou3": {
          "correctAnswer": "GANs (Réseaux Antagonistes)",
          "options": [
            "GANs (Réseaux Antagonistes)",
            "RNNs simples",
            "Perceptrons multicouches"
          ]
        }
      }
    }
  },
  {
    "id": 59,
    "text": "Question Texte à Trous 9 : Complétez le paragraphe suivant sur la modélisation géologique.",
    "type": "TEXTE_A_TROUS",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "text": "Pour construire un modèle géologique 3D, on utilise souvent des algorithmes de [trou1] pour extrapoler les données manquantes. L'évaluation de l'incertitude repose généralement sur des méthodes géostatistiques comme le [trou2]. L'IA apporte une nouvelle dimension avec les réseaux de neurones de type [trou3].",
      "blanks": {
        "trou1": {
          "correctAnswer": "krigeage",
          "options": [
            "krigeage",
            "triage",
            "lissage"
          ]
        },
        "trou2": {
          "correctAnswer": "kriging stochastique",
          "options": [
            "kriging stochastique",
            "bootstrap",
            "filtrage de Kalman"
          ]
        },
        "trou3": {
          "correctAnswer": "GANs (Réseaux Antagonistes)",
          "options": [
            "GANs (Réseaux Antagonistes)",
            "RNNs simples",
            "Perceptrons multicouches"
          ]
        }
      }
    }
  },
  {
    "id": 60,
    "text": "Question Texte à Trous 10 : Complétez le paragraphe suivant sur la modélisation géologique.",
    "type": "TEXTE_A_TROUS",
    "points": 2,
    "gradingType": "PRORATA",
    "content": {
      "text": "Pour construire un modèle géologique 3D, on utilise souvent des algorithmes de [trou1] pour extrapoler les données manquantes. L'évaluation de l'incertitude repose généralement sur des méthodes géostatistiques comme le [trou2]. L'IA apporte une nouvelle dimension avec les réseaux de neurones de type [trou3].",
      "blanks": {
        "trou1": {
          "correctAnswer": "krigeage",
          "options": [
            "krigeage",
            "triage",
            "lissage"
          ]
        },
        "trou2": {
          "correctAnswer": "kriging stochastique",
          "options": [
            "kriging stochastique",
            "bootstrap",
            "filtrage de Kalman"
          ]
        },
        "trou3": {
          "correctAnswer": "GANs (Réseaux Antagonistes)",
          "options": [
            "GANs (Réseaux Antagonistes)",
            "RNNs simples",
            "Perceptrons multicouches"
          ]
        }
      }
    }
  }
];
