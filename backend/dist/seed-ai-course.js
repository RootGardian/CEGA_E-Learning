"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = __importDefault(require("./utils/db"));
const Course_1 = __importDefault(require("./models/Course"));
const Module_1 = __importDefault(require("./models/Module"));
const Lesson_1 = __importDefault(require("./models/Lesson"));
const seedCourse = async () => {
    try {
        await db_1.default.sync({ alter: true });
        // Check if course already exists
        let course = await Course_1.default.findOne({ where: { title: 'INTELLIGENCE ARTIFICIELLE APPLIQUÉE AUX GÉOSCIENCES' } });
        if (course) {
            console.log('Course already exists. Deleting existing content to recreate...');
            await Module_1.default.destroy({ where: { courseId: course.id } });
        }
        else {
            course = await Course_1.default.create({
                title: 'INTELLIGENCE ARTIFICIELLE APPLIQUÉE AUX GÉOSCIENCES',
                description: 'Ce cours vise à introduire et appliquer l’Intelligence Artificielle (IA) comme outil transversal au service des géosciences. Il met l’accent sur l’exploitation intelligente des bases de données géoscientifiques, l’analyse des données d’échantillonnage et la modélisation géologique et minière.',
                department: 'geosciences',
                volumeHoraire: '35 heures (16 séances de 2h + 3h TP)',
                imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            });
        }
        // Module 1
        const m1 = await Module_1.default.create({ title: 'Fondamentaux de l’IA appliquée aux Géosciences', order: 1, courseId: course.id });
        await Lesson_1.default.create({ title: 'Séance 1 : Introduction & démystification', order: 1, moduleId: m1.id, content: [
                { type: 'text', content: 'L\'IA en géosciences permet de traiter d\'immenses volumes de données...' },
                { type: 'definition', title: 'Intelligence Artificielle', content: 'Simulation des processus d\'intelligence humaine par des machines.' }
            ] });
        await Lesson_1.default.create({ title: 'Séance 2 : Analyse exploratoire de données (EDA) & nettoyage', order: 2, moduleId: m1.id, content: [] });
        await Lesson_1.default.create({ title: 'Séance 3 : De la base de données à la carte (SIG–Python)', order: 3, moduleId: m1.id, content: [] });
        // Module 2
        const m2 = await Module_1.default.create({ title: 'Exploration & Apprentissage Non Supervisé', order: 2, courseId: course.id });
        await Lesson_1.default.create({ title: 'Séance 4 : Clustering géochimique', order: 1, moduleId: m2.id, content: [] });
        await Lesson_1.default.create({ title: 'Séance 5 : Détection d’anomalies', order: 2, moduleId: m2.id, content: [] });
        await Lesson_1.default.create({ title: 'Séance 6 : Réduction de dimension (PCA)', order: 3, moduleId: m2.id, content: [] });
        // Module 3
        const m3 = await Module_1.default.create({ title: 'Modélisation & Apprentissage Supervisé', order: 3, courseId: course.id });
        await Lesson_1.default.create({ title: 'Séance 7 : Classification (cartographie prédictive)', order: 1, moduleId: m3.id, content: [] });
        await Lesson_1.default.create({ title: 'Séance 8 : Régression (estimation de teneurs)', order: 2, moduleId: m3.id, content: [] });
        await Lesson_1.default.create({ title: 'Séance 9 : Validation & robustesse (QA/QC)', order: 3, moduleId: m3.id, content: [] });
        await Lesson_1.default.create({ title: 'Séance 10 : Interpolation spatiale par IA', order: 4, moduleId: m3.id, content: [] });
        // Module 4
        const m4 = await Module_1.default.create({ title: 'Imagerie & Deep Learning', order: 4, courseId: course.id });
        await Lesson_1.default.create({ title: 'Séance 11 : Vision par ordinateur', order: 1, moduleId: m4.id, content: [] });
        await Lesson_1.default.create({ title: 'Séance 12 : Analyse automatique de carottes', order: 2, moduleId: m4.id, content: [] });
        await Lesson_1.default.create({ title: 'Séance 13 : Télédétection & IA', order: 3, moduleId: m4.id, content: [] });
        // Module 5
        const m5 = await Module_1.default.create({ title: 'Intégration & Décision', order: 5, courseId: course.id });
        await Lesson_1.default.create({ title: 'Séance 14 : Optimisation de l’échantillonnage', order: 1, moduleId: m5.id, content: [] });
        // Module 6
        const m6 = await Module_1.default.create({ title: 'Projet appliqué transversal', order: 6, courseId: course.id });
        await Lesson_1.default.create({ title: 'Séance 15 : Atelier projet (lancement)', order: 1, moduleId: m6.id, content: [] });
        await Lesson_1.default.create({ title: 'Séance 16 : Atelier projet (finalisation)', order: 2, moduleId: m6.id, content: [] });
        console.log('Seed completed successfully!');
        process.exit(0);
    }
    catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
};
seedCourse();
