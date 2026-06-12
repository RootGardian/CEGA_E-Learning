"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
class Etudiant extends sequelize_1.Model {
}
Etudiant.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    firstName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    department: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    numero_etudiant: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    cohorte_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    twoFactorSecret: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    isTwoFactorEnabled: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    resetPasswordToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    resetPasswordExpires: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    bio: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    profilePicture: {
        type: sequelize_1.DataTypes.TEXT, // Using TEXT for base64 or long URLs
        allowNull: true,
    },
    subscriptionStatus: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
    },
    accessExpirationDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    notificationPreferences: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        defaultValue: {
            inAppAlerts: true,
            newCourse: true,
            examReminders: true,
            examResults: true
        }
    },
    is_active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    studyTime: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    formationType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'e-learning',
    },
}, {
    sequelize: db_1.default,
    tableName: 'etudiants',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
exports.default = Etudiant;
