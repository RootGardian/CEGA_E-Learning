import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';
import Etudiant from './Etudiant';
import Lesson from './Lesson';
import Course from './Course';

class StudentProgress extends Model {
  declare id: number;
  declare etudiantId: number;
  declare lessonId: number;
  declare courseId: number;
  declare isCompleted: boolean;
  declare quizScore: number | null;
  declare progressData: any; // JSONB for storing internal states like maxUnlockedTabIndex

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

StudentProgress.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    quizScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    progressData: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: 'student_progress',
    indexes: [
      {
        unique: true,
        fields: ['etudiantId', 'lessonId'],
      },
    ],
  }
);

// Associations
Etudiant.hasMany(StudentProgress, { foreignKey: 'etudiantId', as: 'progresses' });
StudentProgress.belongsTo(Etudiant, { foreignKey: 'etudiantId', as: 'etudiant' });

Lesson.hasMany(StudentProgress, { foreignKey: 'lessonId', as: 'studentProgresses' });
StudentProgress.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

Course.hasMany(StudentProgress, { foreignKey: 'courseId', as: 'studentProgresses' });
StudentProgress.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

export default StudentProgress;
