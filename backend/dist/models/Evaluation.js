"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
const Course_1 = __importDefault(require("./Course"));
const Intervenant_1 = __importDefault(require("./Intervenant"));
const Etudiant_1 = __importDefault(require("./Etudiant"));
class Evaluation extends sequelize_1.Model {
}
Evaluation.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    duration: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    documentLink: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    courseId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    intervenantId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'intervenants',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    isGlobal: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    targetStudentId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'etudiants',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    qcmQuestions: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    modelName: 'Evaluation',
    tableName: 'course_evaluations',
    timestamps: true,
});
// Associations
Course_1.default.hasMany(Evaluation, { foreignKey: 'courseId', as: 'evaluations' });
Evaluation.belongsTo(Course_1.default, { foreignKey: 'courseId', as: 'course' });
Intervenant_1.default.hasMany(Evaluation, { foreignKey: 'intervenantId', as: 'evaluations' });
Evaluation.belongsTo(Intervenant_1.default, { foreignKey: 'intervenantId', as: 'intervenant' });
Etudiant_1.default.hasMany(Evaluation, { foreignKey: 'targetStudentId', as: 'specificEvaluations' });
Evaluation.belongsTo(Etudiant_1.default, { foreignKey: 'targetStudentId', as: 'targetStudent' });
exports.default = Evaluation;
