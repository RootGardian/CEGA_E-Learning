import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';
import Course from './Course';
import Intervenant from './Intervenant';
import Etudiant from './Etudiant';

class Evaluation extends Model {
  declare id: number;
  declare title: string;
  declare type: string;
  declare description: string | null;
  declare date: Date;
  declare duration: string | null;
  declare documentLink: string | null;
  declare courseId: number;
  declare intervenantId: number;
  declare isGlobal: boolean;
  declare targetStudentId: number | null;
  declare qcmQuestions: any | null;
  declare status: string; // 'draft', 'published', 'validated'

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Evaluation.init(
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    documentLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    intervenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'intervenants',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    isGlobal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    targetStudentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'etudiants',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    qcmQuestions: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'published',
    },
  },
  {
    sequelize,
    modelName: 'Evaluation',
    tableName: 'course_evaluations',
    timestamps: true,
  }
);

// Associations
Course.hasMany(Evaluation, { foreignKey: 'courseId', as: 'evaluations' });
Evaluation.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

Intervenant.hasMany(Evaluation, { foreignKey: 'intervenantId', as: 'evaluations' });
Evaluation.belongsTo(Intervenant, { foreignKey: 'intervenantId', as: 'intervenant' });

Etudiant.hasMany(Evaluation, { foreignKey: 'targetStudentId', as: 'specificEvaluations' });
Evaluation.belongsTo(Etudiant, { foreignKey: 'targetStudentId', as: 'targetStudent' });

export default Evaluation;
