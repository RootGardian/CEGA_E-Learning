"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
const Evaluation_1 = __importDefault(require("./Evaluation"));
const Etudiant_1 = __importDefault(require("./Etudiant"));
class Grade extends sequelize_1.Model {
}
Grade.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    evaluationId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'course_evaluations',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    etudiantId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'etudiants',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    score: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    feedback: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    modelName: 'Grade',
    tableName: 'grades',
    timestamps: true,
});
// Associations
Evaluation_1.default.hasMany(Grade, { foreignKey: 'evaluationId', as: 'grades' });
Grade.belongsTo(Evaluation_1.default, { foreignKey: 'evaluationId', as: 'evaluation' });
Etudiant_1.default.hasMany(Grade, { foreignKey: 'etudiantId', as: 'grades' });
Grade.belongsTo(Etudiant_1.default, { foreignKey: 'etudiantId', as: 'etudiant' });
exports.default = Grade;
