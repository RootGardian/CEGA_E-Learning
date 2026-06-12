"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
const Module_1 = __importDefault(require("./Module"));
class Comment extends sequelize_1.Model {
}
Comment.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    moduleId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Module_1.default,
            key: 'id',
        },
    },
    authorId: {
        type: sequelize_1.DataTypes.STRING, // Can be string(UUID) for enseignant or string(Integer) for etudiant
        allowNull: false,
    },
    authorType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    authorName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    parentId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    tableName: 'comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
Module_1.default.hasMany(Comment, { foreignKey: 'moduleId', onDelete: 'CASCADE' });
Comment.belongsTo(Module_1.default, { foreignKey: 'moduleId' });
Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parentId', onDelete: 'CASCADE' });
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentId' });
exports.default = Comment;
