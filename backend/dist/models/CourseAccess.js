"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
const Course_1 = __importDefault(require("./Course"));
const Etudiant_1 = __importDefault(require("./Etudiant"));
const Intervenant_1 = __importDefault(require("./Intervenant"));
class CourseAccess extends sequelize_1.Model {
}
CourseAccess.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
    etudiantId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true, // null means it applies to a department/global
        references: {
            model: 'etudiants',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    department: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true, // If etudiantId is null and department is set, unlocks for department
    },
    isUnlocked: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    unlockedBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'intervenants',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    scheduledDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    tableName: 'course_access',
});
// Associations
Course_1.default.hasMany(CourseAccess, { foreignKey: 'courseId', as: 'accessRules' });
CourseAccess.belongsTo(Course_1.default, { foreignKey: 'courseId', as: 'course' });
Etudiant_1.default.hasMany(CourseAccess, { foreignKey: 'etudiantId', as: 'courseAccesses' });
CourseAccess.belongsTo(Etudiant_1.default, { foreignKey: 'etudiantId', as: 'etudiant' });
Intervenant_1.default.hasMany(CourseAccess, { foreignKey: 'unlockedBy', as: 'unlockedAccesses' });
CourseAccess.belongsTo(Intervenant_1.default, { foreignKey: 'unlockedBy', as: 'intervenant' });
exports.default = CourseAccess;
