import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';

class Course extends Model {
  declare id: number;
  declare title: string;
  declare description: string;
  declare department: string;
  declare imageUrl: string | null;
  declare volumeHoraire: string | null;
  declare isLocked: boolean;
  declare scheduledUnlockDate: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Course.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING, // e.g., 'geosciences', 'mining', 'topography'
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    volumeHoraire: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isLocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    scheduledUnlockDate: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  },
  {
    sequelize,
    tableName: 'Courses',
  }
);

export default Course;
