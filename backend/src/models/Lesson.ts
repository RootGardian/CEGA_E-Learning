import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';
import Module from './Module';

class Lesson extends Model {
  declare id: number;
  declare title: string;
  declare order: number;
  declare content: any; // JSONB
  declare moduleId: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Lesson.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    content: {
      type: DataTypes.JSONB, // Using JSONB to store an array of blocks
      allowNull: false,
      defaultValue: [],
    },
    moduleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Modules',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'Lessons',
  }
);

// Associations
Module.hasMany(Lesson, { foreignKey: 'moduleId', as: 'lessons' });
Lesson.belongsTo(Module, { foreignKey: 'moduleId', as: 'module' });

export default Lesson;
