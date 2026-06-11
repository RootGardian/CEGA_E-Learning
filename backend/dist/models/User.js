"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
class User extends sequelize_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password_hash: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    nom: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    prenom: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    role: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'etudiant', // ou 'directeur_formation'
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: 'actif',
    },
    is_active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    telephone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    photo_url: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    derniere_connexion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    last_login: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    reset_password_token: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    reset_password_expires: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    created_by: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    tableName: 'users',
    timestamps: true,
    paranoid: true, // Pour deleted_at
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
});
exports.default = User;
