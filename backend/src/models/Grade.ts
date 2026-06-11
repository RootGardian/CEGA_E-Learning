import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';
import Evaluation from './Evaluation';
import Etudiant from './Etudiant';

class Grade extends Model {
  declare id: number;
  declare evaluationId: number;
  declare etudiantId: number;
  declare score: number | null;
  declare feedback: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Grade.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    evaluationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'course_evaluations',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    etudiantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'etudiants',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Grade',
    tableName: 'grades',
    timestamps: true,
  }
);

// Associations
Evaluation.hasMany(Grade, { foreignKey: 'evaluationId', as: 'grades' });
Grade.belongsTo(Evaluation, { foreignKey: 'evaluationId', as: 'evaluation' });

Etudiant.hasMany(Grade, { foreignKey: 'etudiantId', as: 'grades' });
Grade.belongsTo(Etudiant, { foreignKey: 'etudiantId', as: 'etudiant' });

export default Grade;
