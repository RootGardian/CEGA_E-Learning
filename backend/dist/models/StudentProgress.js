"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
const Etudiant_1 = __importDefault(require("./Etudiant"));
const Lesson_1 = __importDefault(require("./Lesson"));
const Course_1 = __importDefault(require("./Course"));
class StudentProgress extends sequelize_1.Model {
}
StudentProgress.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
    lessonId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Lessons',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    courseId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Courses',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    isCompleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    quizScore: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    progressData: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
    },
}, {
    sequelize: db_1.default,
    tableName: 'student_progress',
    indexes: [
        {
            unique: true,
            fields: ['etudiantId', 'lessonId'],
        },
    ],
});
// Associations
Etudiant_1.default.hasMany(StudentProgress, { foreignKey: 'etudiantId', as: 'progresses' });
StudentProgress.belongsTo(Etudiant_1.default, { foreignKey: 'etudiantId', as: 'etudiant' });
Lesson_1.default.hasMany(StudentProgress, { foreignKey: 'lessonId', as: 'studentProgresses' });
StudentProgress.belongsTo(Lesson_1.default, { foreignKey: 'lessonId', as: 'lesson' });
Course_1.default.hasMany(StudentProgress, { foreignKey: 'courseId', as: 'studentProgresses' });
StudentProgress.belongsTo(Course_1.default, { foreignKey: 'courseId', as: 'course' });
exports.default = StudentProgress;
