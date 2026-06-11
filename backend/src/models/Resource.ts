import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';
import Lesson from './Lesson';

class Resource extends Model {
  declare id: number;
  declare title: string;
  declare url: string;
  declare lessonId: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Resource.init(
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
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lessonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Lessons',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'Resources',
  }
);

// Associations
Lesson.hasMany(Resource, { foreignKey: 'lessonId', as: 'resources' });
Resource.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

export default Resource;
