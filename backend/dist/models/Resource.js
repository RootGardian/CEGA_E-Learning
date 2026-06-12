"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
const Lesson_1 = __importDefault(require("./Lesson"));
class Resource extends sequelize_1.Model {
}
Resource.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    url: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
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
}, {
    sequelize: db_1.default,
    tableName: 'Resources',
});
// Associations
Lesson_1.default.hasMany(Resource, { foreignKey: 'lessonId', as: 'resources' });
Resource.belongsTo(Lesson_1.default, { foreignKey: 'lessonId', as: 'lesson' });
exports.default = Resource;
