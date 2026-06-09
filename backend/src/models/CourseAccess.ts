import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';
import Course from './Course';
import Etudiant from './Etudiant';
import Intervenant from './Intervenant';

class CourseAccess extends Model {
  declare id: number;
  declare courseId: number;
  declare etudiantId: number | null;
  declare department: string | null;
  declare isUnlocked: boolean;
  declare unlockedBy: number | null;
  declare scheduledDate: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

CourseAccess.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    etudiantId: {
      type: DataTypes.INTEGER,
      allowNull: true, // null means it applies to a department/global
      references: {
        model: 'etudiants',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true, // If etudiantId is null and department is set, unlocks for department
    },
    isUnlocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    unlockedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'intervenants',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'course_access',
  }
);

// Associations
Course.hasMany(CourseAccess, { foreignKey: 'courseId', as: 'accessRules' });
CourseAccess.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

Etudiant.hasMany(CourseAccess, { foreignKey: 'etudiantId', as: 'courseAccesses' });
CourseAccess.belongsTo(Etudiant, { foreignKey: 'etudiantId', as: 'etudiant' });

Intervenant.hasMany(CourseAccess, { foreignKey: 'unlockedBy', as: 'unlockedAccesses' });
CourseAccess.belongsTo(Intervenant, { foreignKey: 'unlockedBy', as: 'intervenant' });

export default CourseAccess;
